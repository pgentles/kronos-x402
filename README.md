# Kronos X402 — AI Market Intelligence MCP Server

A professional **Model Context Protocol (MCP)** server that provides AI agents with crypto market intelligence, trade risk analysis, and automated agent workflows. Compatible with the **X402 protocol** for agent-to-agent paid API access.

**Wallet:** `0x7457c38Ee6306d698C94B23914724F74C8E6e0DB` (Base Network)

## Features

- **MCP JSON-RPC** — Full protocol support (initialize, tools/list, tools/call)
- **X402 Protocol** — 402 Payment Required responses for agent discovery
- **6 Market Intelligence Tools** — Preflight, Decision, Audit, Signals, Risk, Forecast
- **6 Agent Automations** — DeFi, NFT, ICO, Security, Infra, Signal Aggregator
- **REST API** — Full CRUD on all endpoints
- **TypeScript + ESM** — Modern, type-safe, production-ready

## Quick Start

```bash
git clone git@github.com:pgentles/kronos-x402.git
cd kronos-x402
npm install
npm run build
npm start
```

Default port: `3001`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check + wallet info |
| GET | `/x402-config` | X402 service discovery config |
| GET | `/.well-known/x402.json` | Well-known X402 metadata |
| POST | `/mcp` | MCP JSON-RPC endpoint |
| POST | `/api/preflight?symbol=BTC&direction=buy&amount_usd=5000` | Pre-trade risk check |
| POST | `/api/decision?symbol=ETH&direction=buy&amount_usd=5000` | Full market decision |
| POST | `/api/audit?decisionId=<uuid>` | Post-decision audit |
| POST | `/api/signals?symbol=SOL` | Raw market signals |
| POST | `/api/risk?symbol=BTC` | Risk assessment |
| POST | `/api/forecast?symbol=ETH&hours=24` | Price forecast |
| GET | `/api/automations` | List all agent automations |
| POST | `/api/automations/run?agent_type=defi-yield-monitor&symbol=ETH` | Execute agent automation |
| GET | `/api/agent-types` | List supported agent types |
| GET | `/api/wallet` | Wallet info + Base network details |

## MCP Tools

| Tool | Description | Price |
|------|-------------|-------|
| `check_trade_preflight` | Pre-trade risk check (support/resistance, trend, risk, cooldown) | 0.03 |
| `get_crypto_decision` | Full buy/sell/hold decision with confidence, regime, compliance | 0.10 |
| `audit_trade_decision` | Post-decision audit with PASS/FAIL verdict, P&L | 0.05 |
| `get_signals` | Raw signal data (strength, price action, volume, volatility) | 0.02 |
| `get_risk` | Risk assessment (score, factors, market state) | 0.02 |
| `get_forecast` | Price forecast with horizon | 0.02 |

## Agent Automations

| Agent | Description |
|-------|-------------|
| `defi-yield-monitor` | Monitors DeFi yields across Aave, Compound, MakerDAO |
| `nft-floor-alert` | Real-time NFT floor price alerts (OpenSea, LooksRare) |
| `ico-snipe` | Detects new token launches with safety checks |
| `security-anomaly` | Detects exploits, rug pulls, whale anomalies |
| `infra-monitor` | On-chain infrastructure health monitoring |
| `signal-aggregator` | Multi-source signal feed (technical + on-chain + social) |

## Usage Examples

### REST API
```bash
# Health
curl http://localhost:3001/health

# Market intelligence
curl -X POST http://localhost:3001/api/preflight \
  -H "Content-Type: application/json" \
  -H "X402-Payment: verified" \
  -d '{"symbol":"BTC","direction":"buy","amount_usd":5000}'

# Agent automation
curl -X POST http://localhost:3001/api/automations/run \
  -H "Content-Type: application/json" \
  -H "X402-Payment: verified" \
  -d '{"agent_type":"defi-yield-monitor","symbol":"ETH"}'
```

### MCP (via JSON-RPC)
```bash
curl -X POST http://localhost:3001/mcp \
  -H "Content-Type: application/json" \
  -H "X402-Payment: verified" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"get_crypto_decision","arguments":{"symbol":"BTC","direction":"buy","amount_usd":5000}}}'
```

### Python Client
```python
import requests, json

BASE = "http://localhost:3001"
headers = {"Content-Type": "application/json", "X402-Payment": "verified"}

# Preflight
r = requests.post(f"{BASE}/api/preflight", headers=headers, json={"symbol":"ETH","direction":"buy","amount_usd":10000})
print(r.json())

# MCP tools list
r = requests.post(f"{BASE}/mcp", headers=headers, json={"jsonrpc":"2.0","id":1,"method":"tools/list"})
print(r.json())
```

## Architecture

```
Agent (Claude/Bot) → X402 Protocol (HTTP 402)
       ↓
  Kronos X402 Server
       ↓
  ┌────┴──────────┐
  ▼               ▼
MCP Layer     REST API
  │               │
  ▼               ▼
Market Intelligence Engine
  │
  ├── Market Data (simulated)
  ├── Signal Processing
  ├── Risk Assessment
  └── Decision Engine
       ↓
  Agent Automations
```

## Tech Stack

- **TypeScript 5.x** + ESM
- **Express 4.x** — REST API
- **Zod** — Schema validation
- **@modelcontextprotocol/sdk** — MCP protocol
- **X402 Protocol** — Agent payment layer

## Deployment

```bash
# Docker
docker build -t kronos-x402 .
docker run -p 3001:3001 -e WALLET_ADDRESS=0x... kronos-x402

# Railway/Render
# Set WALLET_ADDRESS env var, deploy from GitHub
```

## License

MIT
