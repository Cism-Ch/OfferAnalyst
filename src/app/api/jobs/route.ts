import { NextRequest, NextResponse } from 'next/server';
import { getQStashReceiver, isJobAlreadyProcessed, JobPayload } from '@/lib/qstash';
import { sendWebhook } from '@/lib/webhooks';
import { log } from '@/lib/logger';
import { Resend } from 'resend';

/**
 * Background Job Worker Handler (Upstash QStash Webhook Endpoint)
 * 
 * Verifies QStash signature, guarantees idempotency, and executes async background tasks.
 * Conforms to Rule 5 of Agent.md.
 */
export async function POST(request: NextRequest) {
    try {
        const rawBody = await request.text();
        const signature = request.headers.get('upstash-signature');
        const receiver = getQStashReceiver();

        // 1. Cryptographic Signature Verification
        if (!signature) {
            log.error('Rejecting QStash job: Missing upstash-signature header');
            return NextResponse.json({ error: 'Missing signature header' }, { status: 401 });
        }

        if (!receiver) {
            if (process.env.NODE_ENV === 'production') {
                log.error('Rejecting QStash job: QStash receiver signing keys are not configured in production');
                return NextResponse.json({ error: 'Worker unconfigured' }, { status: 503 });
            }
            log.warn('Development mode: QStash signature header detected, but receiver signing keys are not configured');
        } else {
            const isValid = await receiver.verify({
                signature,
                body: rawBody,
            }).catch((err) => {
                log.error('Error during QStash signature verification', err);
                return false;
            });

            if (!isValid) {
                log.error('Rejecting QStash job: Invalid cryptographic signature');
                return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
            }
        }

        // 2. Parse Job Payload
        let payload: JobPayload;
        try {
            payload = JSON.parse(rawBody);
        } catch {
            return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
        }

        if (!payload || !payload.id || !payload.type) {
            return NextResponse.json({ error: 'Invalid job schema' }, { status: 400 });
        }

        // 3. Idempotency Check (Guard against duplicate QStash redeliveries)
        if (isJobAlreadyProcessed(payload.id)) {
            log.info('QStash job skipped (already processed / idempotent)', { jobId: payload.id });
            return NextResponse.json({
                success: true,
                message: 'Job already processed',
                jobId: payload.id,
            }, { status: 200 });
        }

        // 4. Dispatch Job by Type
        log.info('Processing asynchronous QStash job', { jobId: payload.id, jobType: payload.type });

        switch (payload.type) {
            case 'send_email': {
                const resendApiKey = process.env.RESEND_API_KEY;
                if (resendApiKey) {
                    const resend = new Resend(resendApiKey);
                    await resend.emails.send({
                        from: 'OfferAnalyst <notifications@offeranalyst.com>',
                        to: payload.to,
                        subject: payload.subject,
                        html: payload.html,
                        text: payload.text,
                    });
                    log.info('Email dispatched via Resend in background worker', { to: payload.to });
                } else {
                    log.info('Development fallback: Email processed asynchronously', {
                        to: payload.to,
                        subject: payload.subject,
                    });
                }
                break;
            }

            case 'webhook_retry': {
                await sendWebhook(
                    payload.webhookUrl,
                    {
                        event: 'offer.analysis.retry',
                        timestamp: new Date().toISOString(),
                        data: payload.payload,
                    },
                    {
                        secret: payload.secret,
                        maxRetries: 1, // Single attempt since QStash manages the retry queue
                    }
                );
                log.info('Webhook retry executed in background worker', { url: payload.webhookUrl });
                break;
            }

            default: {
                log.info('Generic job completed', { payload });
                break;
            }
        }

        return NextResponse.json({
            success: true,
            jobId: payload.id,
            executedAt: new Date().toISOString(),
        }, { status: 200 });

    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Internal job worker error';
        log.error('Error handling QStash job execution', error);
        return NextResponse.json({ error: errorMsg }, { status: 500 });
    }
}
