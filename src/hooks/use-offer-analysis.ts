import { analyzeOffersAction } from '@/app/actions/analyze';
import { fetchOffersAction } from '@/app/actions/fetch';
import { Offer, UserProfile } from '@/types';

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
    addToHistory
}: {
    setLoading: (loading: boolean) => void;
    setFetching: (fetching: boolean) => void;
    setResults: (results: any) => void;
    setOffersInput: (input: string) => void;
    addToHistory: (inputs: any, results: any) => void;
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

        try {
            let currentOffers: Offer[] = [];

            // Phase 1: Auto-Fetch (if enabled)
            if (autoFetch) {
                setFetching(true);
                try {
                    const fetchedOffers = await fetchOffersAction(domain, explicitCriteria + " " + implicitContext);
                    currentOffers = fetchedOffers;
                    setOffersInput(JSON.stringify(fetchedOffers, null, 2));
                } catch (err) {
                    console.error("Fetch failed", err);
                    alert("Auto-fetch failed. Please check offers input.");
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

            const data = await analyzeOffersAction(currentOffers, profile, parseInt(limit));
            setResults(data);

            // Save to history
            addToHistory(
                { domain, criteria: explicitCriteria, context: implicitContext },
                data
            );

        } catch (error) {
            console.error(error);
            alert("Analysis failed. See console.");
        } finally {
            setLoading(false);
            setFetching(false);
        }
    };

    return { handleAnalyze };
}
