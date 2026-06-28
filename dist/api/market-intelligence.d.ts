import { Decision, Audit, Forecast, RiskAssessment, AnomalyReview, SignalFeature } from '../types/index.js';
export declare function checkTradePreflight(symbolInput: string): {
    allowed: boolean;
    symbol: string;
    market_state: string;
    signal_strength: string;
    regime: string;
    cooldown_remaining_seconds: number;
    price?: number;
    price_change_24h?: number;
    reason?: string;
};
export declare function getDecision(symbolInput: string): Decision;
export declare function auditTradeDecision(decisionId: string, windowHours?: number): Audit & {
    status?: string;
};
export declare function getCryptoSignals(symbolInput: string): {
    symbol: string;
    price: number;
    change_24h: number;
    volume_change_24h: number;
    volatility: number;
    regime: string;
    market_state: string;
    directional_bias: string;
    signal_strength: string;
    data_freshness: string;
};
export declare function getCryptoForecast(symbolInput: string): Forecast;
export declare function getCryptoRisk(symbolInput: string): RiskAssessment;
export declare function getSignalHistory(symbolInput: string, hours?: number): Array<{
    timestamp: string;
    price: number;
    volume: number;
    regime: string;
}>;
export declare function reviewSignalAnomaly(symbolInput: string, window?: string, features?: SignalFeature): AnomalyReview;
