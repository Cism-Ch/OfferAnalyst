'use client';

/**
 * AnalysisContext - Global SSOT for AI Analysis, Real-time LLM State, and Error Diagnostics
 * 
 * Centralizes the entire search & analysis workflow across all application routes.
 * Ensures the user is NEVER blind to:
 * - Current LLM inference phase & state
 * - Elapsed execution seconds
 * - Detailed error root cause & actionable 1-click remedies
 */

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { AnalysisResponse, Offer, ProviderErrorState, UserProfile } from '@/types';
import { DEFAULT_MODEL_ID, getModelOption } from '@/lib/ai-models';
import { DUMMY_OFFERS } from '@/lib/data/dummy-offers';
import { fetchOffersAction } from '@/app/actions/fetch';
import { analyzeOffersAction } from '@/app/actions/analyze';
import { useTemporaryApiKeys } from '@/hooks/use-temporary-api-keys';
import { useSearchHistory } from '@/hooks/use-search-history';
import { useToast } from '@/components/ui/toast';

const DASHBOARD_STATE_KEY = "offeranalyst_dashboard_state";

export type LLMExecutionStatus =
  | 'idle'
  | 'initializing'
  | 'fetching'
  | 'analyzing'
  | 'completed'
  | 'error';

interface AnalysisContextValue {
  // Config & Inputs
  domain: string;
  setDomain: (val: string) => void;
  explicitCriteria: string;
  setExplicitCriteria: (val: string) => void;
  implicitContext: string;
  setImplicitContext: (val: string) => void;
  offersInput: string;
  setOffersInput: (val: string) => void;
  autoFetch: boolean;
  setAutoFetch: (val: boolean) => void;
  limit: string;
  setLimit: (val: string) => void;
  model: string;
  setModel: (val: string) => void;

  // Real-time LLM Execution Status
  status: LLMExecutionStatus;
  stepMessage: string;
  elapsedSeconds: number;
  loading: boolean;
  fetching: boolean;

  // Outputs & Errors
  results: AnalysisResponse | null;
  setResults: (res: AnalysisResponse | null) => void;
  providerError: ProviderErrorState | null;
  setProviderError: (err: ProviderErrorState | null) => void;

  // Control Actions
  startAnalysis: () => Promise<boolean>;
  retryAnalysis: () => Promise<boolean>;
  switchModelAndRetry: (newModelId: string) => Promise<boolean>;
  cancelAnalysis: () => void;
  clearError: () => void;
}

const AnalysisContext = createContext<AnalysisContextValue | undefined>(undefined);

export function AnalysisProvider({ children }: { children: React.ReactNode }) {
  const isInitialLoad = useRef(true);
  const tempKeys = useTemporaryApiKeys();
  const { addToHistory } = useSearchHistory();
  const toast = useToast();

  // Inputs
  const [domain, setDomain] = useState("Jobs");
  const [explicitCriteria, setExplicitCriteria] = useState("Salary > 100k, Remote or Hybrid");
  const [implicitContext, setImplicitContext] = useState("Looking for good work-life balance, startup culture");
  const [offersInput, setOffersInput] = useState(JSON.stringify(DUMMY_OFFERS, null, 2));
  const [autoFetch, setAutoFetch] = useState(true);
  const [limit, setLimit] = useState("3");
  const [model, setModel] = useState(DEFAULT_MODEL_ID);

  // Execution states
  const [status, setStatus] = useState<LLMExecutionStatus>('idle');
  const [stepMessage, setStepMessage] = useState<string>('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [results, setResults] = useState<AnalysisResponse | null>(null);
  const [providerError, setProviderError] = useState<ProviderErrorState | null>(null);

  // Timer reference for elapsed seconds
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const abortRef = useRef<boolean>(false);

  // Load persisted inputs from localStorage once on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const timer = setTimeout(() => {
      try {
        const stored = window.localStorage.getItem(DASHBOARD_STATE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.domain) setDomain(parsed.domain);
          if (parsed.explicitCriteria) setExplicitCriteria(parsed.explicitCriteria);
          if (parsed.implicitContext) setImplicitContext(parsed.implicitContext);
          if (parsed.offersInput) setOffersInput(parsed.offersInput);
          if (parsed.autoFetch !== undefined) setAutoFetch(parsed.autoFetch);
          if (parsed.limit) setLimit(parsed.limit);
          if (parsed.model) setModel(parsed.model);
        }

        // Restore search if navigated from History page
        const restoreData = window.sessionStorage.getItem('restore_search');
        if (restoreData) {
          try {
            const item = JSON.parse(restoreData);
            if (item?.inputs) {
              if (item.inputs.domain) setDomain(item.inputs.domain);
              if (item.inputs.criteria) setExplicitCriteria(item.inputs.criteria);
              if (item.inputs.context) setImplicitContext(item.inputs.context);
            }
            if (item?.results && item.results.topOffers && item.results.topOffers.length > 0) {
              setResults(item.results);
              const offersFromResults = item.results.topOffers.map((offer: { id: string; title: string; description: string; price: string | number; location: string; category: string }) => ({
                id: offer.id,
                title: offer.title,
                description: offer.description,
                price: offer.price,
                location: offer.location,
                category: offer.category,
              }));
              setOffersInput(JSON.stringify(offersFromResults, null, 2));
            }
            window.sessionStorage.removeItem('restore_search');
            toast.success('Search restored from history');
          } catch (restoreErr) {
            console.error('[AnalysisContext] Failed to parse restore_search:', restoreErr);
            window.sessionStorage.removeItem('restore_search');
          }
        }
      } catch (e) {
        console.error("[AnalysisContext] Failed to load from localStorage", e);
      } finally {
        isInitialLoad.current = false;
      }
    }, 0);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save inputs to localStorage whenever they change
  useEffect(() => {
    if (isInitialLoad.current || typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(
        DASHBOARD_STATE_KEY,
        JSON.stringify({ domain, explicitCriteria, implicitContext, offersInput, autoFetch, limit, model })
      );
    } catch (e) {
      console.error("[AnalysisContext] Failed to save to localStorage", e);
    }
  }, [domain, explicitCriteria, implicitContext, offersInput, autoFetch, limit, model]);

  // Elapsed seconds timer handler
  useEffect(() => {
    if (status !== 'idle' && status !== 'completed' && status !== 'error') {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [status]);

  const clearError = useCallback(() => {
    setProviderError(null);
  }, []);

  const cancelAnalysis = useCallback(() => {
    abortRef.current = true;
    setStatus('idle');
    setStepMessage('Opération annulée.');
    setElapsedSeconds(0);
    toast.info('Analyse annulée', 'Le traitement en cours a été interrompu.');
  }, [toast]);

  // Main orchestration function
  const executeAnalysis = useCallback(
    async (targetModel: string): Promise<boolean> => {
      abortRef.current = false;
      setElapsedSeconds(0);
      setProviderError(null);
      setResults(null);

      const modelMeta = getModelOption(targetModel);

      // Étape 1 : Initialisation
      setStatus('initializing');
      setStepMessage(`Connexion au moteur IA ${modelMeta.label}...`);

      try {
        let currentOffers: Offer[] = [];

        // Étape 2 : Auto-Fetch des offres si activé
        if (autoFetch) {
          if (abortRef.current) return false;
          setStatus('fetching');
          setStepMessage(`Recherche d'offres en direct sur le web via ${modelMeta.label}...`);

          const clientKey = tempKeys.getKey('openrouter') || 
                            tempKeys.getKey(modelMeta.provider.toLowerCase()) || 
                            tempKeys.getKey(targetModel.split('/')[0]?.toLowerCase()) || 
                            undefined;
          const fetchResult = await fetchOffersAction(
            domain,
            `${explicitCriteria} ${implicitContext}`,
            targetModel,
            clientKey
          );

          if (abortRef.current) return false;

          if (!fetchResult.success) {
            const errState: ProviderErrorState = {
              ...fetchResult.error,
              phase: 'fetch',
              timestamp: Date.now(),
              model: targetModel
            };
            setProviderError(errState);
            setStatus('error');
            setStepMessage(`Échec de la collecte : ${fetchResult.error.message}`);
            toast.error(
              `Erreur lors de la collecte (${fetchResult.error.code})`,
              fetchResult.error.message
            );
            return false;
          }

          if (!fetchResult.data || fetchResult.data.length === 0) {
            const errState: ProviderErrorState = {
              code: 'EMPTY_OFFERS',
              message: `Aucune offre trouvée pour le domaine "${domain}". Essayez d'élargir vos critères.`,
              phase: 'fetch',
              timestamp: Date.now(),
              model: targetModel,
              remedy: {
                type: 'adjust_criteria',
                label: 'Ajuster les critères de recherche'
              }
            };
            setProviderError(errState);
            setStatus('error');
            setStepMessage("Aucune offre trouvée.");
            toast.warning('Aucune offre trouvée', 'Veuillez élargir ou simplifier vos critères.');
            return false;
          }

          currentOffers = fetchResult.data;
          setOffersInput(JSON.stringify(fetchResult.data, null, 2));
        } else {
          // Parsing JSON manuel
          try {
            currentOffers = JSON.parse(offersInput);
            if (!Array.isArray(currentOffers) || currentOffers.length === 0) {
              throw new Error("Le JSON doit être une liste non vide d'offres.");
            }
          } catch (jsonErr) {
            const errState: ProviderErrorState = {
              code: 'INVALID_JSON',
              message: jsonErr instanceof Error ? jsonErr.message : 'JSON invalide dans la saisie manuelle.',
              phase: 'analyze',
              timestamp: Date.now(),
              model: targetModel,
              remedy: {
                type: 'adjust_criteria',
                label: 'Vérifier le format JSON'
              }
            };
            setProviderError(errState);
            setStatus('error');
            setStepMessage('Format JSON invalide.');
            toast.error('Format JSON invalide', 'Vérifiez la structure de votre tableau d\'offres.');
            return false;
          }
        }

        // Étape 3 : Analyse sémantique & classement
        if (abortRef.current) return false;
        setStatus('analyzing');
        setStepMessage(`Analyse sémantique, scoring et classement de ${currentOffers.length} offres par ${modelMeta.label}...`);

        const profile: UserProfile = {
          domain,
          explicitCriteria,
          implicitContext
        };

        const clientKey = tempKeys.getKey('openrouter') || 
                          tempKeys.getKey(modelMeta.provider.toLowerCase()) || 
                          tempKeys.getKey(targetModel.split('/')[0]?.toLowerCase()) || 
                          undefined;
        const analysisResult = await analyzeOffersAction(
          currentOffers,
          profile,
          parseInt(limit) || 3,
          targetModel,
          clientKey
        );

        if (abortRef.current) return false;

        if (!analysisResult.success) {
          const errState: ProviderErrorState = {
            ...analysisResult.error,
            phase: 'analyze',
            timestamp: Date.now(),
            model: targetModel
          };
          setProviderError(errState);
          setStatus('error');
          setStepMessage(`Échec de l'analyse : ${analysisResult.error.message}`);
          toast.error(
            `Erreur d'analyse (${analysisResult.error.code})`,
            analysisResult.error.message
          );
          return false;
        }

        // Succès
        setStatus('completed');
        setStepMessage('Analyse terminée avec succès !');
        setResults(analysisResult.data);
        setProviderError(null);

        // Sauvegarde dans l'historique
        addToHistory(
          { domain, criteria: explicitCriteria, context: implicitContext },
          analysisResult.data,
          targetModel
        );

        toast.success(
          'Analyse terminée !',
          `${analysisResult.data.topOffers.length} offres classées avec succès par ${modelMeta.label}.`
        );
        return true;
      } catch (unexpectedError) {
        if (abortRef.current) return false;
        const msg = unexpectedError instanceof Error ? unexpectedError.message : 'Erreur inattendue';
        const errState: ProviderErrorState = {
          code: 'API_ERROR',
          message: msg,
          phase: 'analyze',
          timestamp: Date.now(),
          model: targetModel,
          remedy: {
            type: 'retry',
            label: 'Réessayer'
          }
        };
        setProviderError(errState);
        setStatus('error');
        setStepMessage(`Erreur : ${msg}`);
        toast.error('Erreur inattendue', msg);
        return false;
      }
    },
    [autoFetch, domain, explicitCriteria, implicitContext, limit, offersInput, tempKeys, addToHistory, toast]
  );

  const startAnalysis = useCallback(async (): Promise<boolean> => {
    return executeAnalysis(model);
  }, [executeAnalysis, model]);

  const retryAnalysis = useCallback(async (): Promise<boolean> => {
    return executeAnalysis(model);
  }, [executeAnalysis, model]);

  const switchModelAndRetry = useCallback(
    async (newModelId: string): Promise<boolean> => {
      setModel(newModelId);
      return executeAnalysis(newModelId);
    },
    [executeAnalysis]
  );

  const loading = status === 'initializing' || status === 'fetching' || status === 'analyzing';
  const fetching = status === 'fetching';

  return (
    <AnalysisContext.Provider
      value={{
        domain,
        setDomain,
        explicitCriteria,
        setExplicitCriteria,
        implicitContext,
        setImplicitContext,
        offersInput,
        setOffersInput,
        autoFetch,
        setAutoFetch,
        limit,
        setLimit,
        model,
        setModel,
        status,
        stepMessage,
        elapsedSeconds,
        loading,
        fetching,
        results,
        setResults,
        providerError,
        setProviderError,
        startAnalysis,
        retryAnalysis,
        switchModelAndRetry,
        cancelAnalysis,
        clearError
      }}
    >
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysis() {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error('useAnalysis must be used within an AnalysisProvider');
  }
  return context;
}
