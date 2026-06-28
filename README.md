# Kronos X402 — Auditable Market Intelligence MCP Server

**AI agents pay per call. Every decision is self-verifying.**

An MCP (Model Context Protocol) server that lets AI agents buy market context with x402 micropayments. Calibrated ranges, risk context, decision journals, and audit records.

> Kronos is not a buy/sell oracle: it gives agents calibrated ranges, risk context, decision journals, and audit records they can verify.

## Why Kronos Is Different

Most market APIs stop after returning a direction. Kronos leads with calibrated ranges and risk context, then assigns a `decision_id` so every decision can be audited against future market behavior.

The moat is the audit loop: **preflight → decision → audit**. Trust the process less. Verify the record more.

## Architecture

```
Agent (Claude Code / Cursor / Custom)
    │
    │  MCP (stdio) or HTTP
    ▼
Kronos X402 MCP Server (TypeScript/Node.js)
    │
    │  Simulated x402 payment (production: USDC on Base)
    ▼
Market Intelligence API (simulated crypto signals)
    │
    ▼
Audit Decision Store (in-memory, per-session)
```

## Tools

| Tool | Description | Cost |
|------|-------------|------|
| `check_trade_preflight` | Gate check: market allowed, cooldown, regime, model context | $0.05 |
| `get_crypto_decision` | Probabilistic decision journal with decision_id | $0.15 |
| `audit_trade_decision` | Verify against real prices: verdict + PnL% | $0.07 |
| `get_crypto_signals` | Model context for BTC, ETH, SOL, XRP, ADA | $0.05 |
| `get_crypto_signal_history` | 168h of context history for analysis | $0.05 |
| `get_crypto_forecast` | Conformally-calibrated 80% price range | $0.05 |
| `review_signal_anomaly` | Score features for unusual conditions | $0.07 |
| `get_crypto_risk` | Market risk state and cooldown context | $0.02 |
| `search_agent_automations` | Search 15 agent automation prompts | $0.01 |
| `get_agent_automation` | Full prompt + workflow steps by slug | $0.01 |
| `list_automation_categories` | All 6 automation categories | $0.005 |

## Install

### npm
```bash
npx kronos-x402
```

### Claude Code MCP Server
Add to `~/.claude/settings.json`:
```json
{
  "mcpServers": {
    "kronos": {
      "command": "node",
      "args": ["/path/to/kronos-x402/dist/mcp-server.js"]
    }
  }
}
```

### Standalone HTTP Server
```bash
npm install
npm run build
npm run start
# Server runs on http://localhost:3001
```

### Docker
```bash
docker build -t kronos-x402 .
docker run -p 3001:3001 kronos-x402
```

## Usage (HTTP API)

### Decision cycle:
```bash
# 1. Preflight gate check ($0.05)
curl -X POST http://localhost:3001/api/preflight \
  -H "Content-Type: application/json" \
  -d '{"symbol": "BTC"}'

# 2. Get decision ($0.15) — save the decision_id
curl -X POST http://localhost:3001/api/decision \
  -H "Content-Type: application/json" \
  -d '{"symbol": "BTC"}'

# 3. Audit later ($0.07) — verify the decision
curl -X POST http://localhost:3001/api/audit \
  -H "Content-Type: application/json" \
  -d '{"decision_id": "<from step 2>", "window": "1h"}'
```

### Agent Automations:
```bash
curl "http://localhost:3001/api/automations?q=defi"
curl "http://localhost:3001/api/automations/defi-yield-monitor"
```

### Other endpoints:
```bash
curl http://localhost:3001/api/signals/BTC
curl http://localhost:3001/api/forecast/ETH
curl http://localhost:3001/api/risk/SOL
```

## Agent Code Example

```js
const API = 'http://localhost:3001';

// Step 1 — gate check
const pre = await fetch(`${API}/api/preflight`, {
  method: 'POST', headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({symbol: 'BTC'})
}).then(r => r.json());
if (!pre.allowed) return console.log('Not allowed:', pre.reason);

// Step 2 — get decision journal
const dec = await fetch(`${API}/api/decision`, {
  method: 'POST', headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({symbol: 'BTC'})
}).then(r => r.json());
console.log(dec.directionalBias, dec.decisionId);

// Step 3 — audit 1 hour later
const audit = await fetch(`${API}/api/audit`, {
  method: 'POST', headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({decision_id: dec.decisionId, window: '1h'})
}).then(r => r.json());
console.log(audit.verdict, audit.pnlPct + '%');
```

## Agent Automations

15 ready-to-use agent automation prompts across 6 categories:
- **DeFi & Yield** (4): Yield Monitor, Liquidity Optimizer, Liquidation Tracker, Aave Health
- **NFTs & Collectibles** (2): Floor Alert, Whale Party Tracker
- **ICO & Launches** (2): ICO Screener, Sniper Detector
- **Security & Audits** (2): GH Advisory Watcher, Normandy Basics
- **Infrastructure & DevOps** (2): AWS Cost Burn, Datadog Log Anomaly
- **Signals & Research** (3): LSTM Forecaster, Smart Money Tracker, Copy-Trade Alert

## Audit Verdicts

| Verdict | Meaning |
|---------|---------|
| GOOD_DECISION | Direction held, positive PnL |
| BAD_DIRECTION | Direction opposite to prediction |
| NOISE | No meaningful movement |
| NO_ACTION_TAKEN | Decision_id not found |
| PENDING | Window not yet mature |

## Payment Stack

| Component | Value |
|-----------|-------|
| Protocol | x402 (simulated) |
| Scheme | ExactEvmScheme (EIP-3009) |
| Network | Base mainnet |
| Token | USDC |

## Review Labels

| Label | Description |
|-------|-------------|
| normal_review | Score below threshold |
| review | Minor anomaly detected |
| elevated_review | Significant anomaly |
| critical_review | Urgent: immediate attention |

## Project Structure

```
kronos-x402/
├── src/
│   ├── api/
│   │   ├── market-intelligence.ts   # Core market logic
│   │   └── payment-layer.ts         # x402 micropayment simulation
│   ├── data/
│   │   ├── market-sim.ts            # Simulated crypto price engine
│   │   └── agent-automations.ts     # 15 automation prompts
│   ├── mcp-server.ts                # MCP (stdio) server
│   ├── server.ts                    # HTTP REST server
│   ├── types/index.ts               # TypeScript types
│   └── core/config.ts               # Configuration
├── dist/                            # Compiled output
├── package.json
├── tsconfig.json
└── Dockerfile
```

## Development

```bash
npm install
npm run build   # TypeScript compile
npm run dev     # ts-node hot reload
npm start       # Run compiled server
```

## License
MIT
