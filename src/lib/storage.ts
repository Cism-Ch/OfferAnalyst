/**
 * Tigris S3-compatible Object Storage Client
 * 
 * Provides persistent cloud document storage and presigned URL generation.
 * Follows Rule 4 of Agent.md:
 * - Use signed URLs (S3-compatible)
 * - Support cloud document uploads and downloads with 15-minute expirations
 */

import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { log } from '@/lib/logger';

const globalForStorage = globalThis as unknown as {
    s3Client: S3Client | undefined;
};

/**
 * Returns the S3Client singleton for Tigris Object Storage.
 */
export function getStorageClient(): S3Client | null {
    const accessKeyId = process.env.TIGRIS_STORAGE_ACCESS_KEY_ID;
    const secretAccessKey = process.env.TIGRIS_STORAGE_SECRET_ACCESS_KEY;
    const endpoint = process.env.TIGRIS_STORAGE_ENDPOINT || 'https://t3.storage.dev';

    if (!accessKeyId || !secretAccessKey) {
        return null;
    }

    if (!globalForStorage.s3Client) {
        globalForStorage.s3Client = new S3Client({
            endpoint,
            region: process.env.AWS_REGION || 'auto',
            credentials: {
                accessKeyId,
                secretAccessKey,
            },
            forcePathStyle: false,
        });
    }

    return globalForStorage.s3Client;
}

export function getBucketName(): string {
    return process.env.TIGRIS_BUCKET_NAME || 'offeranalyst-exports';
}

export interface UploadResult {
    success: boolean;
    key?: string;
    bucket?: string;
    error?: string;
}

export interface PresignedUrlResult {
    success: boolean;
    url?: string;
    expiresIn?: number;
    error?: string;
}

/**
 * Uploads a document (CSV, PDF, JSON) to Tigris S3 storage.
 */
export async function uploadExportDocument(
    fileName: string,
    content: string | Buffer,
    contentType: string = 'application/octet-stream'
): Promise<UploadResult> {
    const client = getStorageClient();
    const bucket = getBucketName();
    const timestamp = Date.now();
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const objectKey = `exports/${timestamp}-${sanitizedName}`;

    if (!client) {
        log.info('Tigris storage credentials not configured. Simulating cloud upload in local mode', {
            fileName,
            objectKey,
        });
        return {
            success: true,
            key: objectKey,
            bucket: 'local-simulated-bucket',
        };
    }

    try {
        const bodyBuffer = typeof content === 'string' ? Buffer.from(content, 'utf-8') : content;

        await client.send(
            new PutObjectCommand({
                Bucket: bucket,
                Key: objectKey,
                Body: bodyBuffer,
                ContentType: contentType,
            })
        );

        log.info('File successfully uploaded to Tigris S3 storage', {
            bucket,
            key: objectKey,
            sizeBytes: bodyBuffer.length,
        });

        return {
            success: true,
            key: objectKey,
            bucket,
        };
    } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown S3 upload error';
        log.error('Failed to upload document to Tigris S3', err, { key: objectKey });
        return {
            success: false,
            error: errorMsg,
        };
    }
}

/**
 * Generates a presigned GET URL for downloading an object from Tigris S3.
 * Default expiration is 900 seconds (15 minutes).
 */
export async function getPresignedDownloadUrl(
    fileKey: string,
    expiresInSeconds: number = 900
): Promise<PresignedUrlResult> {
    const client = getStorageClient();
    const bucket = getBucketName();

    if (!client) {
        // Fallback simulated URL for development/local testing
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        return {
            success: true,
            url: `${appUrl}/api/downloads/mock?key=${encodeURIComponent(fileKey)}`,
            expiresIn: expiresInSeconds,
        };
    }

    try {
        const command = new GetObjectCommand({
            Bucket: bucket,
            Key: fileKey,
        });

        const presignedUrl = await getSignedUrl(client, command, {
            expiresIn: expiresInSeconds,
        });

        log.info('Generated presigned download URL for Tigris S3', {
            key: fileKey,
            expiresInSeconds,
        });

        return {
            success: true,
            url: presignedUrl,
            expiresIn: expiresInSeconds,
        };
    } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to generate presigned download URL';
        log.error('Error creating presigned URL for Tigris S3', err, { key: fileKey });
        return {
            success: false,
            error: errorMsg,
        };
    }
}
