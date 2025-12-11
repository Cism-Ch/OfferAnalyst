import React, { useState } from 'react';
import InputSection from './components/InputSection';
import ResultCard from './components/ResultCard';
import { Offer, UserProfile, AnalysisResponse } from './types';
import { analyzeOffers } from './services/geminiService';

const App: React.FC = () => {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (offers: Offer[], profile: UserProfile) => {
    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);
    
    try {
      const result = await analyzeOffers(offers, profile);
      setAnalysisResult(result);
    } catch (err: any) {
      console.error(err);
      setError("Analysis failed. Please check your API key or data format. " + (err.message || ""));
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 rounded-lg p-1.5">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-indigo-500">
              OfferAnalyst <span className="text-xs font-normal text-slate-400 bg-slate-100 px-1 py-0.5 rounded border">AI Powered</span>
            </h1>
          </div>
          <div className="text-sm text-slate-500 hidden sm:block">
            Gemini 2.5 Flash + Search Grounding
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        
        {/* Intro / Context */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
            Smarter Decisions, Faster.
          </h2>
          <p className="mt-3 text-lg text-slate-500">
            Don't just filter by price. Analyze context, web reputation, and market trends instantly.
          </p>
        </div>

        {/* Input Section */}
        <InputSection onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Results Section */}
        {analysisResult && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="flex flex-col border-b border-slate-200 pb-4">
               <div className="flex flex-col md:flex-row justify-between items-end">
                  <div>
                      <h2 className="text-2xl font-bold text-slate-800">Top Recommendations</h2>
                      <p className="text-slate-500 text-sm mt-1 max-w-2xl">
                        {analysisResult.marketSummary}
                      </p>
                  </div>
                  <div className="mt-2 md:mt-0">
                      <span className="text-xs text-slate-400">Based on multi-factor analysis</span>
                  </div>
               </div>
               
               {/* Search Sources / Grounding */}
               {analysisResult.searchSources && analysisResult.searchSources.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Verified Sources</p>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.searchSources.map((source, idx) => (
                        <a 
                          key={idx} 
                          href={source.uri} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded hover:bg-indigo-100 transition-colors"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                          <span className="truncate max-w-[200px]">{source.title}</span>
                        </a>
                      ))}
                    </div>
                  </div>
               )}
            </div>

            <div className="grid grid-cols-1 gap-6">
              {analysisResult.topOffers.map((offer, index) => (
                <ResultCard 
                  key={offer.id} 
                  offer={offer} 
                  isTop={index === 0} 
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;