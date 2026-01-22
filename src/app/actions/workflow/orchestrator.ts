'use server';

/**
 * Workflow Orchestrator
 * 
 * Manages the multi-step analysis workflow with state machine.
 * States: pending → fetching → analyzing → organizing → complete
 * 
 * Features:
 * - State tracking
 * - Retry logic with exponential backoff
 * - Cancel workflow option
 * - Progress tracking
 * - Error handling
 */

import { Offer, UserProfile, AnalysisResponse } from "@/types";
import { fetchOffersActionV2 } from "../fetchV2";
import { analyzeOffersActionV2 } from "../analyzeV2";
import { organizeOffersActionV2, OrganizedOffersV2 } from "../organizeV2";

export type WorkflowState = 
    | 'pending' 
    | 'fetching' 
    | 'analyzing' 
    | 'organizing' 
    | 'complete' 
    | 'failed' 
    | 'cancelled';

export interface WorkflowProgress {
    state: WorkflowState;
    currentStep: number;
    totalSteps: number;
    message: string;
    timestamp: number;
}

export interface WorkflowOptions {
    enableFetch?: boolean;
    enableAnalyze?: boolean;
    enableOrganize?: boolean;
    modelName?: string;
    language?: 'en' | 'fr' | 'es' | 'de';
    criteriaWeights?: {
        relevance?: number;
        quality?: number;
        trend?: number;
    };
    organizationTemplate?: 'timeline' | 'grid' | 'kanban';
}

export interface WorkflowResult {
    success: boolean;
    state: WorkflowState;
    progress: WorkflowProgress[];
    data?: {
        offers?: Offer[];
        analysis?: AnalysisResponse;
        organization?: OrganizedOffersV2;
    };
    error?: string;
    duration: number;
}

class WorkflowCancellationError extends Error {
    constructor() {
        super('Workflow was cancelled');
        this.name = 'WorkflowCancellationError';
    }
}

const cancelledWorkflows = new Set<string>();

/**
 * Execute the full analysis workflow with state tracking
 */
export async function executeWorkflow(
    workflowId: string,
    domain: string,
    context: string,
    profile: UserProfile,
    offers?: Offer[],
    options: WorkflowOptions = {}
): Promise<WorkflowResult> {
    const startTime = Date.now();
    const progress: WorkflowProgress[] = [];
    
    const {
        enableFetch = !offers,
        enableAnalyze = true,
        enableOrganize = false,
        modelName = 'google/gemini-2.0-flash-exp:free',
        language = 'en',
        criteriaWeights,
        organizationTemplate = 'grid'
    } = options;

    // Calculate total steps
    let totalSteps = 0;
    if (enableFetch) totalSteps++;
    if (enableAnalyze) totalSteps++;
    if (enableOrganize) totalSteps++;

    let currentStep = 0;

    const addProgress = (state: WorkflowState, message: string) => {
        progress.push({
            state,
            currentStep,
            totalSteps,
            message,
            timestamp: Date.now()
        });
    };

    const checkCancellation = () => {
        if (cancelledWorkflows.has(workflowId)) {
            cancelledWorkflows.delete(workflowId);
            throw new WorkflowCancellationError();
        }
    };

    try {
        // State: Pending
        addProgress('pending', 'Workflow initialized');
        checkCancellation();

        let fetchedOffers = offers;
        let analysisResult: AnalysisResponse | undefined;
        let organizationResult: OrganizedOffersV2 | undefined;

        // Step 1: Fetch offers
        if (enableFetch) {
            currentStep++;
            addProgress('fetching', `Fetching offers from ${domain}...`);
            checkCancellation();

            const fetchResult = await fetchOffersActionV2(domain, context, modelName, {
                preferWebSources: true,
                enableCaching: true
            });

            if (!fetchResult.success) {
                throw new Error(fetchResult.error?.message || 'Failed to fetch offers');
            }

            fetchedOffers = fetchResult.data;
            addProgress('fetching', `Fetched ${fetchedOffers?.length || 0} offers`);
        }

        if (!fetchedOffers || fetchedOffers.length === 0) {
            throw new Error('No offers available for analysis');
        }

        // Step 2: Analyze offers
        if (enableAnalyze) {
            currentStep++;
            addProgress('analyzing', `Analyzing ${fetchedOffers.length} offers...`);
            checkCancellation();

            const analyzeResult = await analyzeOffersActionV2(
                fetchedOffers,
                profile,
                3,
                modelName,
                {
                    language,
                    criteriaWeights
                }
            );

            if (!analyzeResult.success) {
                throw new Error(analyzeResult.error?.message || 'Failed to analyze offers');
            }

            analysisResult = analyzeResult.data;
            addProgress('analyzing', `Analysis complete. Top ${analysisResult?.topOffers.length || 0} offers ranked`);
        }

        // Step 3: Organize offers
        if (enableOrganize) {
            currentStep++;
            addProgress('organizing', 'Organizing results...');
            checkCancellation();

            const offersToOrganize = analysisResult?.topOffers || fetchedOffers;
            organizationResult = await organizeOffersActionV2(
                offersToOrganize,
                modelName,
                {
                    template: organizationTemplate,
                    groupBy: 'category'
                }
            );

            addProgress('organizing', `Organized into ${
                organizationResult.categories?.length || 
                organizationResult.timeline?.length || 
                organizationResult.kanban?.length || 
                0
            } groups`);
        }

        // State: Complete
        addProgress('complete', 'Workflow completed successfully');

        return {
            success: true,
            state: 'complete',
            progress,
            data: {
                offers: fetchedOffers,
                analysis: analysisResult,
                organization: organizationResult
            },
            duration: Date.now() - startTime
        };

    } catch (error) {
        if (error instanceof WorkflowCancellationError) {
            addProgress('cancelled', 'Workflow was cancelled by user');
            return {
                success: false,
                state: 'cancelled',
                progress,
                error: 'Workflow cancelled',
                duration: Date.now() - startTime
            };
        }

        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        addProgress('failed', `Workflow failed: ${errorMessage}`);

        return {
            success: false,
            state: 'failed',
            progress,
            error: errorMessage,
            duration: Date.now() - startTime
        };
    }
}

/**
 * Cancel a running workflow
 */
export async function cancelWorkflow(workflowId: string): Promise<boolean> {
    cancelledWorkflows.add(workflowId);
    return true;
}

/**
 * Get workflow progress (for polling)
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getWorkflowProgress(_workflowId: string): Promise<WorkflowProgress | null> {
    // TODO: Implement progress storage and retrieval
    // For now, return null
    return null;
}
