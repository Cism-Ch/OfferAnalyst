"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export type NeonColor = 'yellow' | 'green' | 'cyan' | 'purple';

interface NeonContextType {
  neonColor: NeonColor;
  setNeonColor: (color: NeonColor) => void;
}

const NeonContext = createContext<NeonContextType | undefined>(undefined);

const neonColors: Record<NeonColor, string> = {
  yellow: '#D4FF00',
  green: '#00FF00',
  cyan: '#00FFFF',
  purple: '#BF00FF',
};

const neonRgbValues: Record<NeonColor, string> = {
  yellow: '212, 255, 0',
  green: '0, 255, 0',
  cyan: '0, 255, 255',
  purple: '191, 0, 255',
};

/**
 * NeonProvider - Manages neon color theme throughout the application.
 * 
 * Provides:
 * - Current neon color state
 * - Function to change neon color
 * - CSS custom properties for dynamic theming
 */
export function NeonProvider({ children }: { children: React.ReactNode }) {
  const [neonColor, setNeonColorState] = useState<NeonColor>('yellow');

  const setNeonColor = (color: NeonColor) => {
    setNeonColorState(color);
    localStorage.setItem('neonColor', color);
  };

  useEffect(() => {
    // Load saved color from localStorage
    const savedColor = localStorage.getItem('neonColor') as NeonColor;
    if (savedColor && ['yellow', 'green', 'cyan', 'purple'].includes(savedColor)) {
      setNeonColorState(savedColor);
    }
  }, []);

  useEffect(() => {
    // Update CSS custom properties when neon color changes
    const root = document.documentElement;
    const color = neonColors[neonColor];
    const rgbValue = neonRgbValues[neonColor];
    
    root.style.setProperty('--neon', color);
    root.style.setProperty('--neon-rgb', rgbValue);
    
    // Add data attribute for potential CSS targeting
    root.setAttribute('data-neon', neonColor);
  }, [neonColor]);

  return (
    <NeonContext.Provider value={{ neonColor, setNeonColor }}>
      {children}
    </NeonContext.Provider>
  );
}

/**
 * Hook to access neon color context
 */
export function useNeon() {
  const context = useContext(NeonContext);
  if (context === undefined) {
    throw new Error('useNeon must be used within a NeonProvider');
  }
  return context;
}