// src/api/market-intelligence.ts
import { v4 as uuidv4 } from 'uuid';
import {
  Symbol, MarketContext, Decision, Audit, Forecast, RiskAssessment,
  AnomalyReview, SignalFeature, normalizeSymbol
} from '../types/index.js';
import {
  getPrice, getPriceChange24h, getVolumeChange24h, getVolatility,
  getRegime, getMarketState, getSignalStrength, getCooldown,
  getDecisionConfidence, auditDecision
} from '../data/market-sim.js';

// In-memory decision store for audit trail
const DECISION_STORE: Map<string, { decision: Decision; initialPrice: number }> = new Map();

export function checkTradePreflight(symbolInput: string): {
  allowed: boolean;
  symbol: string;
  market_state: string;
  signal_strength: string;
  regime: string;
  cooldown_remaining_seconds: number;
  price?: number;
  price_change_24h?: number;
  reason?: string;
} {
  const symbol = normalizeSymbol(symbolInput);
  const state = getMarketState(symbol);
  const cooldown = getCooldown(symbol);
  const price = getPrice(symbol);
  const change = getPriceChange24h(symbol);

  if (state === 'HIGH_RISK') {
    return {
      allowed: false,
      symbol,
      market_state: state,
      signal_strength: 'weak_or_mixed',
      regime: getRegime(symbol),
      cooldown_remaining_seconds: cooldown,
      price,
      price_change_24h: change,
      reason: 'Market in HIGH_RISK state. Wait for normalization.',
    };
  }

  if (cooldown > 0) {
    return {
      allowed: false,
      symbol,
      market_state: state,
      signal_strength: 'weak_or_mixed',
      regime: getRegime(symbol),
      cooldown_remaining_seconds: cooldown,
      price,
      price_change_24h: change,
      reason: `Cooldown active. Wait ${cooldown}s before next check.`,
    };
  }

  return {
    allowed: true,
    symbol,
    market_state: state,
    signal_strength: getSignalStrength({
      price_change: change,
      volume_change: getVolumeChange24h(symbol),
      volatility: getVolatility(symbol),
      signal_confidence: 50,
      risk_score: 30,
    }),
    regime: getRegime(symbol),
    cooldown_remaining_seconds: 0,
    price,
    price_change_24h: change,
  };
}

export function getDecision(symbolInput: string): Decision {
  const symbol = normalizeSymbol(symbolInput);
  const price = getPrice(symbol);
  const change = getPriceChange24h(symbol);
  const vol = getVolatility(symbol);
  const regime = getRegime(symbol);
  const confidence = getDecisionConfidence();

  const bias: 'upward' | 'downward' | 'neutral' =
    change > 1 ? 'upward' : change < -1 ? 'downward' : 'neutral';

  const decision: Decision = {
    symbol,
    directionalBias: bias,
    confidence,
    complianceMode: 'market_intelligence_only',
    regime,
    decisionId: uuidv4(),
    directionalEdge: 'none_demonstrated',
    whyNotHigh: [
      'Directional confidence is capped by observed historical accuracy, not boosted by signal magnitude.',
    ],
    nextStep: 'Call audit_trade_decision with this decision_id after 1h using window=1h',
    price,
    riskState: getMarketState(symbol),
    modelContext: change > 2 ? 'bullish momentum' : change < -2 ? 'bearish pressure' : 'mixed / range',
    dataFreshness: 'real-time',
  };

  // Store for later audit
  DECISION_STORE.set(decision.decisionId, { decision, initialPrice: price });

  return decision;
}

export function auditTradeDecision(decisionId: string, windowHours: number = 1): Audit & { status?: string } {
  const stored = DECISION_STORE.get(decisionId);
  if (!stored) {
    return {
      decisionId,
      directionHeld: false,
      pnlPct: 0,
      verdict: 'NO_ACTION_TAKEN',
      initialPrice: 0,
      finalPrice: 0,
      windowHours,
      auditedAt: new Date().toISOString(),
      status: 'DECISION_NOT_FOUND',
    };
  }

  const { decision, initialPrice } = stored;
  const result = auditDecision(
    initialPrice,
    decision.directionalBias,
    windowHours
  );

  return {
    decisionId,
    directionHeld: result.held,
    pnlPct: result.pnlPct,
    verdict: result.verdict as any,
    initialPrice,
    finalPrice: getPrice(decision.symbol),
    windowHours,
    auditedAt: new Date().toISOString(),
    nextReviewHint: `Audit again in ${windowHours}h for extended evaluation.`,
  };
}

export function getCryptoSignals(symbolInput: string): {
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
} {
  const symbol = normalizeSymbol(symbolInput);
  return {
    symbol,
    price: getPrice(symbol),
    change_24h: getPriceChange24h(symbol),
    volume_change_24h: getVolumeChange24h(symbol),
    volatility: getVolatility(symbol),
    regime: getRegime(symbol),
    market_state: getMarketState(symbol),
    directional_bias: getPriceChange24h(symbol) > 0 ? 'UP' : 'DOWN',
    signal_strength: 'moderate',
    data_freshness: 'real-time',
  };
}

export function getCryptoForecast(symbolInput: string): Forecast {
  const symbol = normalizeSymbol(symbolInput);
  const price = getPrice(symbol);
  const vol = getVolatility(symbol);
  const range = price * vol * 2; // ~80% CI estimate
  return {
    symbol,
    forecast80Low: Math.round((price - range) * 100) / 100,
    forecast80High: Math.round((price + range) * 100) / 100,
    pointEstimate: price,
    empiricalCoverage: 0.80,
    validUntil: new Date(Date.now() + 3600000).toISOString(),
  };
}

export function getCryptoRisk(symbolInput: string): RiskAssessment {
  const symbol = normalizeSymbol(symbolInput);
  const vol = getVolatility(symbol);
  const change = Math.abs(getPriceChange24h(symbol));
  const volumeChange = getVolumeChange24h(symbol);
  const riskScore = Math.min(100, Math.round(vol * 500 + change * 5 + Math.abs(volumeChange) * 0.5));
  const factors: string[] = [];
  if (riskScore > 70) factors.push('Elevated volatility regime');
  if (Math.abs(change) > 5) factors.push('Significant 24h price movement');
  if (volumeChange < -20) factors.push('Declining volume');
  if (riskScore < 30) factors.push('Stable conditions');

  return {
    symbol,
    riskScore,
    marketState: getMarketState(symbol),
    cooldownRemainingSeconds: getCooldown(symbol),
    riskFactors: factors.length > 0 ? factors : ['Normal risk environment'],
  };
}

export function getSignalHistory(symbolInput: string, hours: number = 24): Array<{
  timestamp: string;
  price: number;
  volume: number;
  regime: string;
}> {
  const symbol = normalizeSymbol(symbolInput);
  const now = Date.now();
  const result = [];
  const currentPrice = getPrice(symbol);
  for (let i = Math.min(hours, 24); i >= 0; i--) {
    const t = now - i * 3600000;
    const seed = t + symbol.charCodeAt(0);
    const jitter = (Math.sin(seed) * 0.03);
    result.push({
      timestamp: new Date(t).toISOString(),
      price: Math.round(currentPrice * (1 + jitter) * 100) / 100,
      volume: Math.round((1 + jitter * 2) * 100),
      regime: getRegime(symbol),
    });
  }
  return result;
}

export function reviewSignalAnomaly(
  symbolInput: string,
  window: string = '24h',
  features?: SignalFeature
): AnomalyReview {
  const symbol = normalizeSymbol(symbolInput);
  const defaults: SignalFeature = features || {
    price_change: getPriceChange24h(symbol),
    volume_change: getVolumeChange24h(symbol),
    volatility: getVolatility(symbol),
    signal_confidence: 50,
    risk_score: getCryptoRisk(symbol).riskScore,
  };
  
  const score = Math.round(
    (Math.abs(defaults.price_change) * 2) +
    (Math.abs(defaults.volume_change) * 0.1) +
    (defaults.volatility * 100) +
    (defaults.risk_score * 0.3)
  );

  let reviewLabel: AnomalyReview['reviewLabel'] = 'normal_review';
  if (score > 150) reviewLabel = 'critical_review';
  else if (score > 100) reviewLabel = 'elevated_review';
  else if (score > 50) reviewLabel = 'review';

  const drivers: string[] = [];
  if (Math.abs(defaults.price_change) > 5) drivers.push('Extreme price movement');
  if (Math.abs(defaults.volume_change) > 50) drivers.push('Abnormal volume activity');
  if (defaults.volatility > 0.05) drivers.push('High volatility regime');
  if (defaults.risk_score > 60) drivers.push('Elevated risk environment');

  return {
    symbol,
    window,
    reviewLabel,
    score,
    drivers: drivers.length > 0 ? drivers : ['Normal market conditions'],
    components: defaults,
  };
}
