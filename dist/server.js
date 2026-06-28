import express from 'express';
import cors from 'cors';
import { checkTradePreflight, getDecision, auditTradeDecision } from './api/market-intelligence.js';
const app = express();
const PORT = process.env.PORT || 3001;
const WALLET = process.env.WALLET_ADDRESS || '0x7457c38Ee6306d698C94B23914724F74C8E6e0DB';
app.use(cors());
app.use(express.json());
// X402 Protocol: Return 402 when no payment header
app.use((_req, res, next) => {
    if (_req.path === '/' || _req.path === '/health')
        return next();
    const payment = _req.headers['x402-payment'];
    if (!payment) {
        return res.status(402).json({
            x402: {
                accepts: [{
                        scheme: 'exact',
                        network: 'base',
                        maxPrice: '0.10',
                        resource: `https://${_req.headers.host}${_req.path}`,
                    }],
                wallet: WALLET,
            }
        });
    }
    next();
});
// Health
app.get('/health', (_req, res) => {
    res.json({ status: 'kronos-x402 live', wallet: WALLET, network: 'base', version: '1.0.0' });
});
// MCP endpoint
app.post('/mcp', async (req, res) => {
    try {
        const mcp = { jsonrpc: '2.0', id: req.body.id };
        if (req.body.method === 'initialize') {
            mcp.result = {
                protocolVersion: '2024-11-05',
                capabilities: { tools: {} },
                serverInfo: { name: 'kronos-x402', version: '1.0.0' }
            };
        }
        else if (req.body.method === 'tools/list') {
            mcp.result = {
                tools: [
                    {
                        name: 'check_trade_preflight',
                        description: 'Pre-trade risk check for crypto positions',
                        inputSchema: { type: 'object', properties: { symbol: { type: 'string' } }, required: ['symbol'] },
                    },
                    {
                        name: 'get_crypto_decision',
                        description: 'Full buy/sell/hold decision',
                        inputSchema: { type: 'object', properties: { symbol: { type: 'string' } }, required: ['symbol'] },
                    },
                    {
                        name: 'audit_trade_decision',
                        description: 'Post-decision audit with PASS/FAIL verdict',
                        inputSchema: { type: 'object', properties: { decisionId: { type: 'string' }, windowHours: { type: 'number' } }, required: ['decisionId'] },
                    },
                ]
            };
        }
        else if (req.body.method === 'tools/call') {
            const toolName = req.body.params?.name;
            const args = req.body.params?.arguments || {};
            let result;
            try {
                if (toolName === 'check_trade_preflight') {
                    const r = checkTradePreflight(args.symbol || 'BTC');
                    result = JSON.stringify(r, null, 2);
                }
                else if (toolName === 'get_crypto_decision') {
                    const r = getDecision(args.symbol || 'BTC');
                    result = JSON.stringify(r, null, 2);
                }
                else if (toolName === 'audit_trade_decision') {
                    const r = auditTradeDecision(args.decisionId || 'none', args.windowHours || 1);
                    result = JSON.stringify(r, null, 2);
                }
                else {
                    result = JSON.stringify({ error: `Unknown tool: ${toolName}` });
                }
                mcp.result = { content: [{ type: 'text', text: result }] };
            }
            catch (e) {
                mcp.result = { content: [{ type: 'text', text: JSON.stringify({ error: e.message }) }] };
            }
        }
        res.json(mcp);
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
// REST API endpoints
app.post('/api/preflight', (req, res) => {
    const { symbol } = req.body;
    const result = checkTradePreflight(symbol || 'BTC');
    res.json(result);
});
app.post('/api/decision', (req, res) => {
    const { symbol } = req.body;
    const result = getDecision(symbol || 'BTC');
    res.json(result);
});
app.post('/api/audit', (req, res) => {
    const { decisionId, windowHours } = req.body;
    const result = auditTradeDecision(decisionId || 'none', windowHours || 1);
    res.json(result);
});
app.get('/api/automations', (_req, res) => {
    res.json({
        automations: [
            { name: 'DeFi Yield Scanner', price: '0.01 USDC' },
            { name: 'NFT Floor Alert', price: '0.01 USDC' },
            { name: 'ICO Snipe Detection', price: '0.01 USDC' },
            { name: 'Security Anomaly', price: '0.01 USDC' },
            { name: 'Infra Monitor', price: '0.01 USDC' },
            { name: 'Auto Signal Bot', price: '0.01 USDC' },
        ]
    });
});
app.listen(PORT, () => {
    console.log(`Kronos X402 running on port ${PORT}`);
    console.log(`Wallet: ${WALLET}`);
    console.log(`MCP: http://localhost:${PORT}/mcp`);
    console.log(`API: http://localhost:${PORT}/api/{preflight,decision,audit}`);
});
//# sourceMappingURL=server.js.map