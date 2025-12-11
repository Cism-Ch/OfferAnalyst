import React, { useState } from 'react';
import { Offer, UserProfile } from '../types';
import { sampleRealEstateOffers } from '../constants'; // We will define this later or use inline if needed

interface InputSectionProps {
  onAnalyze: (offers: Offer[], profile: UserProfile) => void;
  isAnalyzing: boolean;
}

const InputSection: React.FC<InputSectionProps> = ({ onAnalyze, isAnalyzing }) => {
  const [domain, setDomain] = useState('Real Estate');
  const [explicitCriteria, setExplicitCriteria] = useState('Looking for a 3-bedroom apartment in Paris, budget around 850k.');
  const [implicitContext, setImplicitContext] = useState('Family with 2 kids, need good schools nearby. Safe neighborhood is a priority.');
  
  // Default sample data string
  const [offersJson, setOffersJson] = useState<string>(JSON.stringify(sampleRealEstateOffers, null, 2));

  const handleAnalyzeClick = () => {
    try {
      const parsedOffers = JSON.parse(offersJson);
      if (!Array.isArray(parsedOffers)) {
        alert("Offers must be a JSON array.");
        return;
      }
      onAnalyze(
        parsedOffers,
        { explicitCriteria, implicitContext, domain }
      );
    } catch (e) {
      alert("Invalid JSON in Offers field. Please check format.");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-100">
      <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
        Analysis Setup
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: User Profile */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Domain</label>
            <select 
              value={domain} 
              onChange={(e) => setDomain(e.target.value)}
              className="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2 bg-slate-50"
            >
              <option>Real Estate</option>
              <option>Job Market</option>
              <option>Vehicle Purchase</option>
              <option>Freelance Services</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Explicit Criteria (Filters)</label>
            <textarea
              rows={3}
              value={explicitCriteria}
              onChange={(e) => setExplicitCriteria(e.target.value)}
              className="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2 text-sm"
              placeholder="e.g. Budget max $1000, Downtown location..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Implicit Context (The "Vibe")</label>
            <textarea
              rows={3}
              value={implicitContext}
              onChange={(e) => setImplicitContext(e.target.value)}
              className="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2 text-sm"
              placeholder="e.g. Safe for kids, quiet area, prestige is important..."
            />
          </div>
        </div>

        {/* Right Column: Data Input */}
        <div className="flex flex-col h-full">
          <label className="block text-sm font-medium text-slate-700 mb-1 flex justify-between">
            <span>Offers Dataset (JSON)</span>
            <button 
              onClick={() => setOffersJson(JSON.stringify(sampleRealEstateOffers, null, 2))}
              className="text-xs text-indigo-600 hover:text-indigo-800 underline"
            >
              Reset Sample Data
            </button>
          </label>
          <textarea
            value={offersJson}
            onChange={(e) => setOffersJson(e.target.value)}
            className="flex-1 w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2 font-mono text-xs bg-slate-900 text-green-400"
            spellCheck={false}
          />
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={handleAnalyzeClick}
          disabled={isAnalyzing}
          className={`w-full py-3 px-6 rounded-lg font-bold text-white shadow-md transition-all flex justify-center items-center gap-2
            ${isAnalyzing 
              ? 'bg-slate-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 hover:shadow-lg transform hover:-translate-y-0.5'
            }`}
        >
          {isAnalyzing ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing & Searching Web...
            </>
          ) : (
            <>
              Run Deep Analysis
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default InputSection;
