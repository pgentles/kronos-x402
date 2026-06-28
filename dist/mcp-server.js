import { z } from 'zod';
import { checkTradePreflight, getDecision, auditTradeDecision, getCryptoSignals, getCryptoRisk, getCryptoForecast } from './api/market-intelligence.js';
const PricePreflightSchema = z.object({
    symbol: z.string().min(2).max(10),
    direction: z.enum(['long', 'short', 'buy', 'sell']),
    amount_usd: z.number().positive().max(10_000_000),
});
const CryptoDecisionSchema = z.object({
    symbol: z.string().min(2).max(10),
    direction: z.enum(['long', 'short', 'buy', 'sell']),
    amount_usd: z.number().positive().max(10_000_000),
    holdings_usd: z.number().optional(),
});
const AuditSchema = z.object({
    decisionId: z.string().uuid('Invalid decision ID format'),
    windowHours: z.number().min(0.1).max(168).default(1),
});
const SignalsSchema = z.object({
    symbol: z.string().min(2).max(10),
});
const RiskSchema = z.object({
    symbol: z.string().min(2).max(10),
});
const ForecastSchema = z.object({
    symbol: z.string().min(2).max(10),
    hours: z.number().min(1).max(72).default(24),
});
export const TOOL_SCHEMAS = {
    check_trade_preflight: PricePreflightSchema,
    get_crypto_decision: CryptoDecisionSchema,
    audit_trade_decision: AuditSchema,
    get_signals: SignalsSchema,
    get_risk: RiskSchema,
    get_forecast: ForecastSchema,
};
export const AVAILABLE_TOOLS = [
    {
        name: 'check_trade_preflight',
        description: 'Pre-trade risk check for crypto positions. Returns support/resistance, trend, risk level, position sizing, cooldown status.',
        inputSchema: { type: 'object', properties: { symbol: { type: 'string', description: 'Asset symbol (BTC, ETH, SOL, etc.)' }, direction: { type: 'string', enum: ['long', 'short', 'buy', 'sell'] }, amount_usd: { type: 'number', description: 'Position size in USD' } }, required: ['symbol', 'direction', 'amount_usd'] },
    },
    {
        name: 'get_crypto_decision',
        description: 'Full buy/sell/hold market decision with confidence, regime analysis, directional bias, compliance mode.',
        inputSchema: { type: 'object', properties: { symbol: { type: 'string', description: 'Asset symbol (BTC, ETH, SOL, etc.)' }, direction: { type: 'string', enum: ['long', 'short', 'buy', 'sell'] }, amount_usd: { type: 'number', description: 'Position size in USD' } }, required: ['symbol', 'direction', 'amount_usd'] },
    },
    {
        name: 'audit_trade_decision',
        description: 'Post-decision AI audit. Requires a decision_id from get_crypto_decision. Returns verdict, P&L analysis, direction held.',
        inputSchema: { type: 'object', properties: { decisionId: { type: 'string', description: 'UUID from a previous get_crypto_decision call' }, windowHours: { type: 'number', description: 'Lookback window in hours (default 1, max 168)' } }, required: ['decisionId'] },
    },
    {
        name: 'get_signals',
        description: 'Raw market signal data for a symbol. Returns signal strength, price action, volume, volatility metrics.',
        inputSchema: { type: 'object', properties: { symbol: { type: 'string', description: 'Asset symbol' } }, required: ['symbol'] },
    },
    {
        name: 'get_risk',
        description: 'Risk assessment for a given crypto asset. Returns risk score, risk factors, market state.',
        inputSchema: { type: 'object', properties: { symbol: { type: 'string', description: 'Asset symbol' } }, required: ['symbol'] },
    },
    {
        name: 'get_forecast',
        description: 'Price forecast for a crypto asset over a given time horizon.',
        inputSchema: { type: 'object', properties: { symbol: { type: 'string', description: 'Asset symbol' }, hours: { type: 'number', description: 'Forecast horizon in hours (1-72, default 24)' } }, required: ['symbol'] },
    },
];
export async function executeTool(name, args, _ctx) {
    try {
        switch (name) {
            case 'check_trade_preflight': {
                const parsed = PricePreflightSchema.parse(args);
                const result = checkTradePreflight(parsed.symbol);
                return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
            }
            case 'get_crypto_decision': {
                const parsed = CryptoDecisionSchema.parse(args);
                const result = getDecision(parsed.symbol);
                return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
            }
            case 'audit_trade_decision': {
                const parsed = AuditSchema.parse(args);
                const result = auditTradeDecision(parsed.decisionId, parsed.windowHours);
                return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
            }
            case 'get_signals': {
                const parsed = SignalsSchema.parse(args);
                const result = getCryptoSignals(parsed.symbol);
                return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
            }
            case 'get_risk': {
                const parsed = RiskSchema.parse(args);
                const result = getCryptoRisk(parsed.symbol);
                return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
            }
            case 'get_forecast': {
                const parsed = ForecastSchema.parse(args);
                const result = getCryptoForecast(parsed.symbol);
                return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
            }
            default:
                return { content: [{ type: 'text', text: JSON.stringify({ error: `Unknown tool: ${name}`, available: AVAILABLE_TOOLS.map(t => t.name) }) }], isError: true };
        }
    }
    catch (e) {
        if (e.name === 'ZodError') {
            return { content: [{ type: 'text', text: JSON.stringify({ error: 'Invalid input', details: e.errors.map((err) => ({ path: err.path.join('.'), message: err.message })) }) }], isError: true };
        }
        return { content: [{ type: 'text', text: JSON.stringify({ error: e.message || 'Internal error' }) }], isError: true };
    }
}
export function registerTools() {
    return [...AVAILABLE_TOOLS];
}
//# sourceMappingURL=mcp-server.js.map