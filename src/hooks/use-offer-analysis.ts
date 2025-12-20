import { analyzeOffersAction } from '@/app/actions/analyze';
import { fetchOffersAction } from '@/app/actions/fetch';
import { AnalysisResponse, Offer, ProviderErrorState, UserProfile } from '@/types';

/**
 * Custom hook for handling offer analysis workflow
 * 
 * This hook encapsulates the business logic for analyzing offers,
 * including auto-fetching from web sources and AI-powered analysis.
 * 
 * @param {Object} params - Hook parameters
 * @param {Function} params.setLoading - Function to set loading state
 * @param {Function} params.setFetching - Function to set fetching state
 * @param {Function} params.setResults - Function to set analysis results
 * @param {Function} params.setOffersInput - Function to update offers input
 * @param {Function} params.addToHistory - Function to save search to history
 * @returns {Object} Analysis handler function
 */
export function useOfferAnalysis({
    setLoading,
    setFetching,
    setResults,
    setOffersInput,
    addToHistory,
    selectedModel,
    setProviderError
}: {
    setLoading: (loading: boolean) => void;
    setFetching: (fetching: boolean) => void;
    setResults: (results: AnalysisResponse | null) => void;
    setOffersInput: (input: string) => void;
    addToHistory: (inputs: { domain: string; criteria: string; context: string }, results: AnalysisResponse) => void;
    selectedModel: string;
    setProviderError: (error: ProviderErrorState | null) => void;
}) {
    /**
     * Handles the complete offer analysis workflow
     * 
     * This function orchestrates two phases:
     * 1. Optional auto-fetch: Retrieves offers from web sources using AI
     * 2. Analysis: Scores and ranks offers based on user profile
     * 
     * @param {Object} params - Analysis parameters
     * @param {boolean} params.autoFetch - Whether to auto-fetch offers from web
     * @param {string} params.offersInput - JSON string of offers to analyze
     * @param {string} params.domain - Domain/category of offers (e.g., "Jobs")
     * @param {string} params.explicitCriteria - Explicit user requirements
     * @param {string} params.implicitContext - Implicit user preferences
     * @param {string} params.limit - Maximum number of top offers to return
     */
    const handleAnalyze = async ({
        autoFetch,
        offersInput,
        domain,
        explicitCriteria,
        implicitContext,
        limit
    }: {
        autoFetch: boolean;
        offersInput: string;
        domain: string;
        explicitCriteria: string;
        implicitContext: string;
        limit: string;
    }) => {
        setLoading(true);
        setResults(null);
        setProviderError(null);

        try {
            let currentOffers: Offer[] = [];

            // Phase 1: Auto-Fetch (if enabled)
            if (autoFetch) {
                setFetching(true);
                try {
                    const fetchResult = await fetchOffersAction(domain, explicitCriteria + " " + implicitContext, selectedModel);
                    if (!fetchResult.success) {
                        setProviderError({
                            ...fetchResult.error,
                            phase: 'fetch',
                            timestamp: Date.now(),
                            model: selectedModel
                        });
                        setLoading(false);
                        setFetching(false);
                        return;
                    }
                    currentOffers = fetchResult.data;
                    setOffersInput(JSON.stringify(fetchResult.data, null, 2));
                } catch (err) {
                    console.error("Fetch failed", err);
                    setProviderError({
                        message: err instanceof Error ? err.message : 'Auto-fetch failed',
                        code: 'API_ERROR',
                        phase: 'fetch',
                        timestamp: Date.now(),
                        model: selectedModel
                    });
                    setLoading(false);
                    setFetching(false);
                    return;
                }
                setFetching(false);
            } else {
                try {
                    currentOffers = JSON.parse(offersInput);
                } catch {
                    alert("Invalid JSON for offers");
                    setLoading(false);
                    return;
                }
            }

            // Phase 2: Analyze
            const profile: UserProfile = {
                domain,
                explicitCriteria,
                implicitContext
            };

            const analysisResult = await analyzeOffersAction(currentOffers, profile, parseInt(limit), selectedModel);
            if (!analysisResult.success) {
                setProviderError({
                    ...analysisResult.error,
                    phase: 'analyze',
                    timestamp: Date.now(),
                    model: selectedModel
                });
                setLoading(false);
                return;
            }

            setResults(analysisResult.data);
            setProviderError(null);

            // Save to history
            addToHistory(
                { domain, criteria: explicitCriteria, context: implicitContext },
                analysisResult.data
            );

        } catch (error) {
            console.error(error);
            setProviderError({
                message: error instanceof Error ? error.message : 'Analysis failed',
                code: 'API_ERROR',
                phase: 'analyze',
                timestamp: Date.now(),
                model: selectedModel
            });
        } finally {
            setLoading(false);
            setFetching(false);
        }
    };

    return { handleAnalyze };
}
