import React from 'react';
import { Offer } from './types';

// Sample data for initial load/reset
export const sampleRealEstateOffers: Offer[] = [
  {
    id: "1",
    title: "Charming Apartment Le Marais",
    description: "2 bedroom flat, 65m2, historic building, 3rd floor no elevator. Needs refreshment.",
    price: "820,000 EUR",
    location: "Paris, 3rd Arrondissement",
    category: "Apartment"
  },
  {
    id: "2",
    title: "Modern Duplex Batignolles",
    description: "3 bedrooms, 85m2, recent building with elevator and parking. Near park.",
    price: "880,000 EUR",
    location: "Paris, 17th Arrondissement",
    category: "Apartment"
  },
  {
    id: "3",
    title: "Family Loft Belleville",
    description: "Large open space, 100m2, ground floor. Lively neighborhood.",
    price: "790,000 EUR",
    location: "Paris, 20th Arrondissement",
    category: "Loft"
  },
  {
    id: "4",
    title: "Luxury Flat 16th Arr.",
    description: "2 bedrooms, 70m2, high-end finishings, view on Eiffel Tower partial.",
    price: "950,000 EUR",
    location: "Paris, 16th Arrondissement",
    category: "Apartment"
  },
  {
    id: "5",
    title: "Suburban House Montreuil",
    description: "4 bedrooms, garden, 10 mins from metro. Great potential.",
    price: "810,000 EUR",
    location: "Montreuil",
    category: "House"
  }
];

export const ScoreBadge = ({ score }: { score: number }) => {
  let colorClass = "bg-red-100 text-red-800 border-red-200";
  if (score >= 85) colorClass = "bg-green-100 text-green-800 border-green-200";
  else if (score >= 70) colorClass = "bg-blue-100 text-blue-800 border-blue-200";
  else if (score >= 50) colorClass = "bg-yellow-100 text-yellow-800 border-yellow-200";

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-bold border ${colorClass}`}>
      {score}/100
    </span>
  );
};
