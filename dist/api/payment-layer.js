// src/api/payment-layer.ts
// Simulated x402 micropayment layer
// In production, this integrates with @x402/core for real USDC payments on Base
const PRICING = {
    check_trade_preflight: 0.05,
    get_crypto_decision: 0.15,
    audit_trade_decision: 0.07,
    get_crypto_signals: 0.05,
    get_crypto_signal_history: 0.05,
    get_crypto_forecast: 0.05,
    review_signal_anomaly: 0.07,
    get_crypto_risk: 0.02,
    search_agent_automations: 0.01,
    get_agent_automation: 0.01,
    list_automation_categories: 0.005,
};
export function getPrice(toolName) {
    return PRICING[toolName] || 0.05;
}
export function processPayment(toolName) {
    const price = getPrice(toolName);
    // Simulate payment (in production: sign EIP-3009 authorization)
    return {
        allowed_tool: toolName,
        price,
        paid: true,
        tx_hash: `0x${generateFakeTxHash()}`,
        wallet: '0xDEADBEEF...kronos',
    };
}
function generateFakeTxHash() {
    const chars = '0123456789abcdef';
    let hash = '';
    for (let i = 0; i < 64; i++) {
        hash += chars[Math.floor(Math.random() * 16)];
    }
    return hash;
}
export function getFullPricing() {
    return [
        { tool: 'check_trade_preflight', price: 0.05, description: 'Gate check: market allowed, cooldown, regime, model context' },
        { tool: 'get_crypto_decision', price: 0.15, description: 'Probabilistic decision journal + decision_id' },
        { tool: 'audit_trade_decision', price: 0.07, description: 'Verify against real prices: verdict + PnL%' },
        { tool: 'get_crypto_signals', price: 0.05, description: 'Model context for BTC, ETH, SOL, XRP, ADA' },
        { tool: 'get_crypto_signal_history', price: 0.05, description: '168h of context history' },
        { tool: 'get_crypto_forecast', price: 0.05, description: 'Conformally-calibrated 80% price range' },
        { tool: 'review_signal_anomaly', price: 0.07, description: 'Score signal features for unusual conditions' },
        { tool: 'get_crypto_risk', price: 0.02, description: 'Market risk state and cooldown context' },
        { tool: 'search_agent_automations', price: 0.01, description: 'Search 15 agent automation prompts' },
        { tool: 'get_agent_automation', price: 0.01, description: 'Full prompt + workflow steps by slug' },
        { tool: 'list_automation_categories', price: 0.005, description: 'All 6 automation categories' },
    ];
}
//# sourceMappingURL=payment-layer.js.map