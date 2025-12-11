import React from 'react';
import { ScoredOffer } from '../types';
import { ScoreBadge } from '../constants';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ResultCardProps {
  offer: ScoredOffer;
  isTop: boolean;
}

const ResultCard: React.FC<ResultCardProps> = ({ offer, isTop }) => {
  const chartData = [
    { name: 'Rel', value: offer.breakdown.relevance, color: '#6366f1' }, // Indigo
    { name: 'Qual', value: offer.breakdown.quality, color: '#ec4899' },  // Pink
    { name: 'Trend', value: offer.breakdown.trend, color: '#10b981' },   // Emerald
  ];

  return (
    <div className={`relative bg-white rounded-xl shadow-sm border p-6 transition-all duration-300 hover:shadow-md ${isTop ? 'border-indigo-500 ring-2 ring-indigo-500 ring-opacity-10' : 'border-slate-200'}`}>
      {isTop && (
        <div className="absolute -top-3 left-6 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
          #{offer.rank} Top Pick
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Main Info */}
        <div className="md:col-span-7 space-y-3">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-bold text-slate-800">{offer.title}</h3>
          </div>
          <div className="flex flex-wrap gap-2 text-sm text-slate-500">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              {offer.location}
            </span>
            <span className="flex items-center gap-1 font-semibold text-slate-700">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {offer.price}
            </span>
          </div>
          <p className="text-sm text-slate-600 line-clamp-2">{offer.description}</p>
          
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <p className="text-sm font-medium text-slate-700 italic">" {offer.justification} "</p>
          </div>
        </div>

        {/* Analytics & Insights */}
        <div className="md:col-span-5 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-2">
                <div className="text-xs font-semibold uppercase text-slate-400">Analysis Score</div>
                <ScoreBadge score={offer.finalScore} />
            </div>
            
            {/* Mini Chart */}
            <div className="h-24 w-full mb-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <XAxis type="number" hide domain={[0, 100]} />
                  <YAxis type="category" dataKey="name" width={30} tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{fontSize: '12px', borderRadius: '4px'}} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={12}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Web Insights - Pills */}
            <div className="flex flex-wrap gap-1">
                {offer.webInsights.map((insight, idx) => (
                    <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                        <svg className="mr-1 h-2 w-2" fill="currentColor" viewBox="0 0 8 8"><circle cx="4" cy="4" r="3" /></svg>
                        {insight}
                    </span>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;
