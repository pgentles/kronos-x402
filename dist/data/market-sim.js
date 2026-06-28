// src/data/market-sim.ts
// Simulated market data engine — generates realistic crypto market signals
const BASE_PRICES = {
    'BTC': 67500, 'ETH': 3450, 'SOL': 142, 'XRP': 0.62, 'ADA': 0.45,
    'DOGE': 0.15, 'AVAX': 35, 'LINK': 14, 'DOT': 7.2, 'MATIC': 0.78,
};
// Simple seeded pseudo-random for deterministic-ish output
function seededRandom(seed) {
    const x = Math.sin(seed * 9301 + 49297) * 233280;
    return x - Math.floor(x);
}
export function getPrice(symbol) {
    const baseKey = symbol.replace('/USD', '');
    const base = BASE_PRICES[baseKey] || 100;
    // Fluctuate +-5% based on current minute
    const seed = Math.floor(Date.now() / 60000) + baseKey.charCodeAt(0);
    const jitter = (seededRandom(seed) - 0.5) * 0.10;
    return Math.round(base * (1 + jitter) * 100) / 100;
}
export function getPriceChange24h(symbol) {
    const seed = Math.floor(Date.now() / 3600000) + symbol.length;
    return Math.round((seededRandom(seed) * 12 - 6) * 100) / 100;
}
export function getVolumeChange24h(symbol) {
    const base = Math.floor(Date.now() / 3600000);
    const offset = symbol.length + 7;
    const seed = base + offset;
    return Math.round((seededRandom(seed) * 80 - 20) * 100) / 100;
}
export function getVolatility(symbol) {
    const v = Math.abs(getPriceChange24h(symbol)) / 100 + Math.abs(getVolumeChange24h(symbol)) / 10000;
    return Math.round(v * 10000) / 10000;
}
export function getRegime(symbol) {
    const change = Math.abs(getPriceChange24h(symbol));
    if (change > 5)
        return 'TREND';
    if (change > 3)
        return 'ACCUMULATION';
    if (getVolumeChange24h(symbol) > 40)
        return 'REVERSAL';
    return 'RANGE';
}
export function getMarketState(symbol) {
    const vol = getVolatility(symbol);
    const change = Math.abs(getPriceChange24h(symbol));
    if (vol > 0.08 || change > 8)
        return 'VOLATILE';
    if (vol > 0.12 || change > 10)
        return 'HIGH_RISK';
    if (getVolumeChange24h(symbol) < -15)
        return 'LOW_LIQUIDITY';
    return 'NORMAL';
}
export function getSignalStrength(features) {
    const score = features.signal_confidence || 0;
    if (score > 70)
        return 'strong';
    if (score > 40)
        return 'moderate';
    if (score > 20)
        return 'weak';
    return 'weak_or_mixed';
}
export function getCooldown(symbol) {
    // Cooldown in seconds (0 = no cooldown)
    return 0; // no cooldown in sim
}
export function getDecisionConfidence() {
    // Directional edge is not demonstrated; cap at ~0.52
    return Math.round((0.48 + seededRandom(Date.now()) * 0.08) * 1000) / 1000;
}
export function auditDecision(initialPrice, direction, windowHours) {
    const current = getPriceFromValue(initialPrice);
    const change = ((current - initialPrice) / initialPrice) * 100;
    const held = direction === 'upward' ? change > 0 : direction === 'downward' ? change < 0 : Math.abs(change) < 1;
    return {
        held,
        pnlPct: Math.round(change * 100) / 100,
        verdict: held ? 'GOOD_DECISION' : 'BAD_DIRECTION',
    };
}
function getPriceFromValue(initial) {
    const seed = Math.floor(Date.now() / 1000);
    const drift = (seededRandom(seed) - 0.48) * 0.04;
    return initial * (1 + drift);
}
// Export seed for test
export function resetPrices() {
    // Placeholder
}
//# sourceMappingURL=market-sim.js.map