import express, { Request, Response } from 'express';
import cors from 'cors';
import { executeTool, registerTools } from './mcp-server.js';
import { checkTradePreflight, getDecision, auditTradeDecision, getCryptoSignals, getCryptoRisk, getCryptoForecast } from './api/market-intelligence.js';
import { AUTOMATIONS } from './data/agent-automations.js';
const AGENT_AUTOMATIONS = AUTOMATIONS;

const app = express();
const PORT = process.env.PORT || 3001;
const WALLET = process.env.WALLET_ADDRESS || '0x7457c38Ee6306d698C94B23914724F74C8E6e0DB';
const VERSION = '1.1.0';

app.use(cors());
app.use(express.json({ limit: '256kb' }));

// ─── X402 Protocol ─────────────────────────────────────────────
app.use((req: Request, res: Response, next: any) => {
  if (req.path === '/' || req.path === '/health' || req.path === '/x402-config' || req.path === '/.well-known/x402.json' || req.path === '/x402/discover' || req.path === '/x402' || req.path === '/x402/facilitate') return next();

  const payment = req.headers['x402-payment'];
  if (!payment) {
    return res.status(402).json({
      x402: {
        accepts: [{
          scheme: 'exact',
          network: 'base',
          maxPrice: '0.10',
          resource: `https://${req.headers.host}${req.path}`,
          description: 'Kronos X402 - Agent API access',
        }],
        wallet: WALLET,
        facilitator: 'https://x402scan.com/facilitator',
      }
    });
  }
  next();
});

// ─── Health ────────────────────────────────────────────────────
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'kronos-x402 live', wallet: WALLET, network: 'base', version: VERSION, uptime: process.uptime() });
});

// ─── X402 Discovery Endpoint ──────────────────────────────────
app.get('/x402-config', (_req: Request, res: Response) => {
  res.json({
    name: 'Kronos X402',
    version: VERSION,
    wallet: WALLET,
    network: 'base',
    facilitator: 'https://x402scan.com/facilitator',
    tools: {
      check_trade_preflight: { price: '0.03', description: 'Pre-trade risk check' },
      get_crypto_decision: { price: '0.10', description: 'Full market decision' },
      audit_trade_decision: { price: '0.05', description: 'Post-decision audit' },
      get_signals: { price: '0.02', description: 'Raw signal data' },
      get_risk: { price: '0.02', description: 'Risk assessment' },
      get_forecast: { price: '0.02', description: 'Price forecast' },
    },
    payment_header: 'X402-Payment: <encoded-payment>',
    website: 'https://github.com/pgentles/kronos-x402',
  });
});

app.get('/.well-known/x402.json', (_req: Request, res: Response) => {
  res.json({
    name: 'Kronos X402',
    wallet: WALLET,
    network: 'base',
    facilitator: 'https://x402scan.com/facilitator',
    tools: [
      { name: 'check_trade_preflight', price: '0.03' },
      { name: 'get_crypto_decision', price: '0.10' },
      { name: 'audit_trade_decision', price: '0.05' },
      { name: 'get_signals', price: '0.02' },
      { name: 'get_risk', price: '0.02' },
      { name: 'get_forecast', price: '0.02' },
    ],
  });
});

// ─── X402 Discovery (public, no 402 challenge) ──────────────────
app.get('/x402/discover', (_req: Request, res: Response) => {
  res.json({
    schema: 'https://x402.org/schemas/discovery/v1',
    name: 'Kronos X402 - AI Market Intelligence',
    version: VERSION,
    wallet: WALLET,
    network: 'base',
    chain_id: 8453,
    facilitator: 'https://x402scan.com/facilitator',
    mcp_endpoint: '/mcp',
    pricing_scheme: 'exact',
    payment_header: 'X402-Payment',
    tools: [
      { name: 'check_trade_preflight', price: '0.03', description: 'Pre-trade risk assessment' },
      { name: 'get_crypto_decision', price: '0.10', description: 'Full buy/sell/hold decision' },
      { name: 'audit_trade_decision', price: '0.05', description: 'Post-decision audit' },
      { name: 'get_signals', price: '0.02', description: 'Raw market signal data' },
      { name: 'get_risk', price: '0.02', description: 'Risk assessment' },
      { name: 'get_forecast', price: '0.02', description: 'Price forecast' },
    ],
    capabilities: ['mcp', 'x402', 'streamable-http'],
    uptime_seconds: Math.round(process.uptime()),
  });
});

// ─── Public Registration (for x402scan discovery) ───────────────
app.post('/x402/register', express.json(), (req: Request, res: Response) => {
  const { url, wallet, name } = req.body;
  if (!url || !wallet || !name) {
    return res.status(400).json({ error: 'url, wallet, and name required' });
  }
  res.json({
    status: 'registered',
    server: url,
    wallet,
    name,
    network: 'base',
    registered_at: new Date().toISOString(),
  });
});

// ─── X402 /x402 Route (main protocol endpoint) ─────────────────
app.get('/x402', (_req: Request, res: Response) => {
  res.json({
    x402: {
      accepts: [
        {
          scheme: 'exact',
          network: 'base',
          maxPrice: '0.10',
          resource: 'https://kronos-x402.onrender.com/x402',
          description: 'Kronos X402 - Agent API access'
        }
      ],
      wallet: WALLET,
      facilitator: 'https://x402scan.com/facilitator'
    }
  });
});

app.post('/x402/facilitate', express.json(), (req: Request, res: Response) => {
  const { payment, resource } = req.body;
  // Simple facilitator - accepts any payment and returns success
  res.json({
    status: 'accepted',
    payment: payment,
    resource: resource,
    timestamp: new Date().toISOString()
  });
});

// ─── MCP Endpoint ──────────────────────────────────────────────
app.post('/mcp', async (req: Request, res: Response) => {
  const mcp: any = { jsonrpc: '2.0', id: req.body.id };

  if (req.body.method === 'initialize') {
    mcp.result = {
      protocolVersion: '2024-11-05',
      capabilities: { tools: {} },
      serverInfo: { name: 'kronos-x402', version: VERSION }
    };
  } else if (req.body.method === 'tools/list') {
    mcp.result = { tools: registerTools() };
  } else if (req.body.method === 'initialize') {
    mcp.result = {
      protocolVersion: '2024-11-05',
      capabilities: { tools: {} },
      serverInfo: { name: 'kronos-x402', version: VERSION }
    };
  } else if (req.body.method === 'tools/call') {
    const toolName = req.body.params?.name;
    const args = req.body.params?.arguments || {};
    mcp.result = await executeTool(toolName, args, { prepaid: true, requestId: String(req.body.id) });
  } else if (req.body.method === 'ping') {
    mcp.result = {};
  } else {
    mcp.error = { code: -32601, message: `Method not found: ${req.body.method}` };
  }
  res.json(mcp);
});

// ─── REST API: Market Intelligence ────────────────────────────

// Preflight
app.post('/api/preflight', (req: Request, res: Response) => {
  const { symbol, direction, amount_usd } = req.body;
  if (!symbol || !direction) return res.status(400).json({ error: 'symbol and direction required' });
  const result = checkTradePreflight(symbol);
  res.json(result);
});

// Decision
app.post('/api/decision', (req: Request, res: Response) => {
  const { symbol, direction, amount_usd } = req.body;
  if (!symbol || !direction) return res.status(400).json({ error: 'symbol and direction required' });
  const result = getDecision(symbol);
  res.json(result);
});

// Audit
app.post('/api/audit', (req: Request, res: Response) => {
  const { decisionId, windowHours } = req.body;
  if (!decisionId) return res.status(400).json({ error: 'decisionId required' });
  const result = auditTradeDecision(decisionId, windowHours || 1);
  res.json(result);
});

// Signals
app.post('/api/signals', (req: Request, res: Response) => {
  const { symbol } = req.body;
  if (!symbol) return res.status(400).json({ error: 'symbol required' });
  const result = getCryptoSignals(symbol);
  res.json(result);
});

// Risk
app.post('/api/risk', (req: Request, res: Response) => {
  const { symbol } = req.body;
  if (!symbol) return res.status(400).json({ error: 'symbol required' });
  const result = getCryptoRisk(symbol);
  res.json(result);
});

// Forecast
app.post('/api/forecast', (req: Request, res: Response) => {
  const { symbol, hours } = req.body;
  if (!symbol) return res.status(400).json({ error: 'symbol required' });
  const result = getCryptoForecast(symbol);
  res.json(result);
});

// ─── Agent Automations ─────────────────────────────────────────
app.get('/api/automations', (_req: Request, res: Response) => {
  res.json({
    automations: AGENT_AUTOMATIONS,
    pricing: '0.01 USDC per activation',
  });
});

app.post('/api/automations/run', (req: Request, res: Response) => {
  const { agent_type, symbol } = req.body;
  if (!agent_type || !symbol) return res.status(400).json({ error: 'agent_type and symbol required' });
  const auto = AGENT_AUTOMATIONS.find(a => a.slug === agent_type || a.title.toLowerCase().includes(agent_type.toLowerCase()));
  if (!auto) return res.status(404).json({ error: `Unknown agent: ${agent_type}`, available: AGENT_AUTOMATIONS.map(a => a.slug) });
  const decision = getDecision(symbol);
  res.json({ agent: auto, symbol, result: decision, executed_at: new Date().toISOString() });
});

// ─── Agent Types (discoverability) ─────────────────────────────
app.get('/api/agent-types', (_req: Request, res: Response) => {
  res.json({
    agents: [
      { type: 'DeFi Yield Scanner', description: 'Monitor yields across DEX pools', indicators: ['tvl', 'apy', 'volatility'], data: 'on-chain', active: true },
      { type: 'NFT Floor Alert', description: 'Real-time NFT floor price alerts', indicators: ['floor_price', 'volume', 'rarity'], data: 'on-chain', active: true },
      { type: 'ICO Snipe Detection', description: 'Detect new token launches', indicators: ['liquidity', 'contract_verified', 'holders'], data: 'on-chain', active: true },
      { type: 'Security Anomaly', description: 'Detect exploits and anomalies', indicators: ['tvl_change', 'price_dump', 'whale_transfer'], data: 'on-chain', active: true },
      { type: 'Infrastructure Monitor', description: 'On-chain infrastructure health', indicators: ['block_time', 'gas', 'uptime'], data: 'RPC', active: true },
      { type: 'Signal Aggregator', description: 'Multi-source signal feed', indicators: ['technical', 'on-chain', 'social'], data: 'hybrid', active: true },
      { type: 'Custom Agent', description: 'User-defined agent logic', indicators: ['configurable'], data: 'configurable', active: false },
    ],
  });
});

// ─── Wallet Info ───────────────────────────────────────────────
app.get('/api/wallet', (_req: Request, res: Response) => {
  res.json({
    wallet: WALLET,
    network: 'base',
    chain_id: 8453,
    usdc_contract: '0x833589c731f89c7A8D8948e3eBb9B9c6c4a1f7e4c',
    balance: 'live-on-chain',
  });
});

app.listen(PORT, () => {
  console.log(`Kronos X402 v${VERSION} running on port ${PORT}`);
  console.log(`Wallet: ${WALLET}`);
  console.log(`MCP: http://localhost:${PORT}/mcp`);
  console.log(`API: http://localhost:${PORT}/api/{preflight,decision,audit,signals,risk,forecast,automations,agent-types,wallet}`);
  console.log(`X402 Config: http://localhost:${PORT}/x402-config`);
});
