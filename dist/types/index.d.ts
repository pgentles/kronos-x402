export type Severity = 'p1' | 'p2' | 'p3' | 'p4';
export type MarketState = 'NORMAL' | 'VOLATILE' | 'LOW_LIQUIDITY' | 'HIGH_RISK' | 'COOLDOWN';
export type Regime = 'TREND' | 'RANGE' | 'REVERSAL' | 'ACCUMULATION';
export type AuditVerdict = 'GOOD_DECISION' | 'BAD_DIRECTION' | 'NOISE' | 'NO_ACTION_TAKEN' | 'PENDING';
export type ReviewLabel = 'normal_review' | 'review' | 'elevated_review' | 'critical_review';
export declare const SYMBOLS: readonly ["BTC/USD", "ETH/USD", "SOL/USD", "XRP/USD", "ADA/USD", "DOGE/USD", "AVAX/USD", "LINK/USD", "DOT/USD", "MATIC/USD"];
export type Symbol = typeof SYMBOLS[number];
export declare const SYMBOL_MAP: Record<string, Symbol>;
export declare function normalizeSymbol(input: string): Symbol;
export interface MarketContext {
    symbol: Symbol;
    marketState: MarketState;
    signalStrength: 'weak' | 'moderate' | 'strong' | 'mixed' | 'weak_or_mixed';
    regime: Regime;
    cooldownRemainingSeconds: number;
    price: number;
    priceChange24h: number;
    volumeChange24h: number;
    volatility24h: number;
    timestamp: number;
}
export interface Decision {
    symbol: Symbol;
    directionalBias: 'upward' | 'downward' | 'neutral';
    confidence: number;
    complianceMode: 'market_intelligence_only';
    regime: Regime;
    decisionId: string;
    directionalEdge: 'none_demonstrated';
    whyNotHigh: string[];
    nextStep: string;
    price: number;
    riskState: string;
    modelContext: string;
    dataFreshness: string;
}
export interface Audit {
    decisionId: string;
    directionHeld: boolean;
    pnlPct: number;
    verdict: AuditVerdict;
    initialPrice: number;
    finalPrice: number;
    windowHours: number;
    auditedAt: string;
    nextReviewHint?: string;
}
export interface Forecast {
    symbol: Symbol;
    forecast80Low: number;
    forecast80High: number;
    pointEstimate: number;
    empiricalCoverage: number;
    validUntil: string;
}
export interface RiskAssessment {
    symbol: Symbol;
    riskScore: number;
    marketState: MarketState;
    cooldownRemainingSeconds: number;
    riskFactors: string[];
}
export interface SignalFeature {
    price_change: number;
    volume_change: number;
    volatility: number;
    signal_confidence: number;
    risk_score: number;
}
export interface AnomalyReview {
    symbol: Symbol;
    window: string;
    reviewLabel: ReviewLabel;
    score: number;
    drivers: string[];
    components: Partial<SignalFeature>;
}
export interface AgentAutomation {
    slug: string;
    category: string;
    title: string;
    summary: string;
    prompt: string;
    workflow: string[];
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    estimatedSetupMin: number;
}
