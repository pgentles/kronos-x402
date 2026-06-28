import { Symbol, Regime, MarketState, SignalFeature } from '../types/index.js';
export declare function getPrice(symbol: Symbol): number;
export declare function getPriceChange24h(symbol: Symbol): number;
export declare function getVolumeChange24h(symbol: Symbol): number;
export declare function getVolatility(symbol: Symbol): number;
export declare function getRegime(symbol: Symbol): Regime;
export declare function getMarketState(symbol: Symbol): MarketState;
export declare function getSignalStrength(features: SignalFeature): string;
export declare function getCooldown(symbol: Symbol): number;
export declare function getDecisionConfidence(): number;
export declare function auditDecision(initialPrice: number, direction: 'upward' | 'downward' | 'neutral', windowHours: number): {
    held: boolean;
    pnlPct: number;
    verdict: string;
};
export declare function resetPrices(): void;
