# Kronos X402 — Project Knowledge Base

> **Last Updated:** 2026-06-28
> **Status:** Live on x402scan.com
> **Repo:** https://github.com/pgentles/kronos-x402
> **Live URL:** https://kronos-x402.onrender.com

---

## 1. Executive Summary

Kronos X402 is a crypto market intelligence API for AI agents, implementing the X402 payment protocol. It provides trading signals, risk assessment, and price forecasts via both REST and MCP (Model Context Protocol) interfaces. Agents discover it through x402scan and pay USDC on Base network for each API call.

---

## 2. Architecture Overview

```
Agent (e.g. Claude, Codex)
    │
    ▼
x402scan.com (discovery + payment facilitation)
    │
    ▼ HTTPS request + X402-Payment header (USDC on Base)
    │
┌─────────────────────────────────────┐
│  kronos-x402.onrender.com (Express) │
│                                     │
│  ┌─────────┐  ┌──────────────────┐  │
│  │OpenAPI  │  │X402 Middleware    │  │
│  │Discovery│  │(payment gate)    │  │
│  └─────────┘  └──────────────────┘  │
│                                     │
│  ┌─────────┐  ┌──────────────────┐  │
│  │MCP /mcp │  │REST Market Intel │  │
│  │(free)   │  │(paid, x402)      │  │
│  └─────────┘  └──────────────────┘  │
└─────────────────────────────────────┘
```

### Key Components
- **Express server** on Render.com (TypeScript, Node.js)
- **X402 middleware** — blocks all paths except bypass list, requires `X402-Payment` header
- **MCP endpoint** — free (bypasses x402), JSON-RPC 2.0
- **REST endpoints** — paid, x402-gated
- **OpenAPI discovery** — at `/openapi.json`, OpenAPI 3.1.0
- **Static files** — served from `public/` (favicon.ico, etc.)

---

## 3. Endpoints

### 3.1 Paid Endpoints (x402-gated)

| Endpoint | Method | Price (USDC) | Input |
|----------|--------|-------------|-------|
| `/api/signals` | POST | 0.02 | `{symbol}`
| `/api/risk` | POST | 0.02 | `{symbol}`
| `/api/forecast` | POST | 0.02 | `{symbol, hours?}`
| `/api/decision` | POST | 0.10 | `{symbol, direction, amount_usd?}`
| `/api/preflight` | POST | 0.03 | `{symbol, direction, amount_usd?}`
| `/api/audit` | POST | 0.05 | `{decisionId, windowHours?}`

All paid endpoints return **402** with x402 v2 headers when no `X402-Payment` header is present.

### 3.2 Free Endpoints (bypass x402)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/mcp` | POST | MCP JSON-RPC tools (free for agents) |
| `/openapi.json` | GET | OpenAPI 3.1.0 discovery doc |
| `/x402-config` | GET | X402 service config |
| `/x402/discover` | GET | Extended discovery manifest |
| `/x402/register` | POST | Registration endpoint (x402 compatibility) |
| `/x402/facilitate` | POST | Simulated facilitator |
| `/.well-known/x402.json` | GET | X402 payment manifest |
| `/favicon.ico` | GET | API icon |
| `/health` | GET | Health + wallet status |
| `/api/automations` | GET | List available automations |
| `/api/automations/run` | POST | Run an automation |
| `/api/agent-types` | GET | Available agent type templates |
| `/api/wallet` | GET | Wallet address + network info |

### 3.3 MCP Tools (via /mcp)

| Tool | Price (USDC) | Description |
|------|-------------|-------------|
| `check_trade_preflight` | 0.03 | Pre-trade risk check |
| `get_crypto_decision` | 0.10 | Full buy/sell/hold decision |
| `audit_trade_decision` | 0.05 | Post-decision audit |
| `get_signals` | 0.02 | Raw signal data |
| `get_risk` | 0.02 | Risk assessment |
| `get_forecast` | 0.02 | Price forecast |

---

## 4. Configuration

### 4.1 Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `PORT` | 3001 | Server port (Render sets this) |
| `WALLET_ADDRESS` | `0x421C25445d6CF7B292933D743E698ed24dE36270` | Payment wallet (Base/ETH) |

### 4.2 Render Deployment
- **Platform:** Render.com (free tier)
- **Build:** `npm install && npm run build`
- **Start:** `npm start`
- **Auto-deploy:** Yes, on every `git push` to `main`
- **Network:** HTTPS (Render-managed cert)

### 4.3 x402scan Registration
- **Origin:** `kronos-x402.onrender.com`
- **Contact:** `pgpgentles@gmail.com`
- **Wallet:** `0x421C25445d6CF7B292933D743E698ed24dE36270`
- **Network:** Base (chain_id: 8453)
- **Asset:** USDC
- **Facilitator:** `https://x402scan.com/facilitator`

---

## 5. X402 Payment Protocol Implementation

### 5.1 Request Flow

```
Agent → GET/POST /api/signals         → 402 with challenge
Agent → POST /api/signals + payment   → 200 with data
```

### 5.2 402 Response Headers

```
HTTP/1.1 402 Payment Required
X-Payment-Protocol: x402
X402-Payment: required
Payment-Required: eyJ4ND...IifQ==
Content-Type: application/json
```

### 5.3 402 Response Body (v2)

```json
{
  "x402Version": 2,
  "accepts": [{
    "network": "base",
    "asset": "USDC",
    "amount": "0.10",
    "scheme": "exact",
    "payTo": "0x421C25445d6CF7B292933D743E698ed24dE36270",
    "resource": "https://kronos-x402.onrender.com/api/signals"
  }],
  "wallet": "0x421C25445d6CF7B292933D743E698ed24dE36270",
  "facilitator": "https://x402scan.com/facilitator"
}
```

The `Payment-Required` header contains the base64-encoded version of the above body.

### 5.4 Bypass Paths (free of x402 payment)

```typescript
const FREE_PATHS = [
  '/', '/health', '/x402-config',
  '/.well-known/x402.json',
  '/x402/discover', '/x402', '/x402/facilitate',
  '/openapi.json', '/favicon.ico'
];
```

---

## 6. OpenAPI Spec Requirements (x402scan)

Paid endpoints **must** have:
- `x-payment-info` with fixed pricing + protocols
- `requestBody` with JSON schema (x402scan probes these!)
- `responses.402` 
- POST method (not GET — x402scan requires requestBody input schemas)

Free endpoints **must** have:
- `security: []` in the operation to mark them as exempt from probing

Required top-level fields:
- `info.contact.email` (ownership verification)
- `info['x-guidance']` (agent discovery)
- OpenAPI version `3.1.0`

---

## 7. Common Pitfalls & Lessons Learned

### 7.1 x402probe requires GET→POST migration
x402scan's discovery probes endpoints looking for `requestBody` schemas only — it doesn't consider query parameter schemas sufficient for "input schema." All paid endpoints must use POST with JSON body.

### 7.2 Free endpoints need security: []
Any endpoint without `x-payment-info` must declare `security: []` or x402scan will try to probe it and fail.

### 7.3 x402 v2 response format matters
x402scan's parser chain:
1. Checks `Payment-Required` header → base64-decodes → checks `x402Version === 2`
2. Checks `X-Payment-Protocol` header → adds to `protocols` array
3. Checks `www-authenticate` → alternative payment option extraction
4. If OpenAPI available, uses `extractInputSchema()` from spec

### 7.4 Static files need explicit bypass in middleware
`express.static('public')` must be called before the x402 middleware, AND the path `/favicon.ico` must be in the FREE_PATHS list.

### 7.5 x402scan UI auto-discoveres domains
x402scan's web interface auto-discovered the Render URL and created a `/server/kronos-x402.onrender.com` page. Registration must be done from the main `/resources/register` page or via direct API call.

---

## 8. Maintenance Runbook

### 8.1 Redeploy
```bash
cd ~/kronos-x402
git add -A && git commit -m "your message"
git push origin main
# Render auto-deploys within ~60 seconds
```

### 8.2 View Logs
Render Dashboard → Service "kronos-x402" → **Live Logs**

### 8.3 Check for Transactions
1. **x402scan dashboard:** Log in → your server page → Transactions/Stats
2. **On-chain:** Look up `0x421C25445d6CF7B292933D743E698ed24dE36270` on https://basescan.org
3. **Server logs:** Watch for POST requests to paid endpoints

### 8.4 Health Check
```bash
curl -s https://kronos-x402.onrender.com/health
```
Expected: `{"status":"kronos-x402 live","wallet":"0x...","network":"base","version":"1.1.0",...}`

### 8.5 Test x402 Flow
```bash
# Should get 402 with payment challenge
curl -s -X POST https://kronos-x402.onrender.com/api/signals \
  -H "Content-Type: application/json" \
  -d '{"symbol":"BTC"}'

# Headers to inspect
curl -s -X POST https://kronos-x402.onrender.com/api/signals \
  -H "Content-Type: application/json" \
  -d '{"symbol":"BTC"}' -D -
```

### 8.6 Test x402scan Registration
```bash
# Check OpenAPI returns contact.email
curl -s https://kronos-x402.onrender.com/openapi.json | python3 -c "
import json,sys; d=json.load(sys.stdin)
print('contact:', d['info'].get('contact'))
print('paths:', list(d['paths'].keys()))
for p in ['/api/signals','/api/risk','/api/forecast']:
    op = d['paths'][p]['post']
    print(f'{p}: method=post, has_requestBody={\"requestBody\" in op}, has_x-payment-info={\"x-payment-info\" in op}')
"
```

### 8.7 Updating Prices
Edit `src/server.ts`, find `x-payment-info.price.amount` for each endpoint. Then:
```bash
git add -A && git commit -m "pricing: update endpoint prices" && git push origin main
```

### 8.8 Regenerate Favicon
```bash
python3 << 'EOF'
import struct, os
width, height = 32, 32
pixels = []
for y in range(height):
    row = []
    for x in range(width):
        r, g, b, a = 26, 26, 46, 255
        if 6 <= x <= 11 and 4 <= y <= 28: r, g, b = 0, 191, 166
        if x >= 12 and y <= 16:
            slope = (x - 12) * 12 / 16
            if abs(y - (16 - slope)) <= 2: r, g, b = 0, 191, 166
        if x >= 12 and y >= 16:
            slope = (x - 12) * 12 / 16
            if abs(y - (16 + slope)) <= 2: r, g, b = 0, 191, 166
        row.extend([b, g, r, a])
    pixels.append(list(bytes(row)))
pixel_bytes = []
for row in pixels:
    pixel_bytes.extend(row)
header = struct.pack('<HHH', 0, 1, 1)
dir_entry = struct.pack('<BBBBHHII', width if width < 256 else 0, height if height < 256 else 0, 0, 0, 1, 32, 40 + len(pixel_bytes), 6 + 16)
bmp_header = struct.pack('<IiiHHIIiiII', 40, width, -height, 1, 32, 0, len(pixel_bytes), 2835, 2835, 0, 0)
path = os.path.expanduser('~/kronos-x402/public/favicon.ico')
os.makedirs(os.path.dirname(path), exist_ok=True)
with open(path, 'wb') as f:
    f.write(header); f.write(dir_entry); f.write(bmp_header); f.write(bytes(pixel_bytes))
print(f'Created {path}')
EOF
```

---

## 9. Project File Structure

```
kronos-x402/
├── src/
│   ├── server.ts              # Main Express server (499 lines)
│   ├── mcp-server.ts          # MCP JSON-RPC tools + registerTools()
│   └── api/
│   └── market-intelligence.ts # Market logic (signals, risk, forecast, etc.)
│   └── data/
│   └── agent-automations.ts   # Agent automation templates
├── public/
│   └── favicon.ico            # Static favicon (4158 bytes)
├── package.json
├── tsconfig.json
├── Dockerfile
├── README.md
└── knowledge-base/            # ← This knowledge base
    └── (this file)
```

---

## 10. Owner Contact

- **Name:** Patrick Gentles
- **Email:** pgpgentles@gmail.com
- **Wallet:** `0x421C25445d6CF7B292933D743E698ed24dE36270`
- **x402scan link:** https://x402scan.com/server/kronos-x402.onrender.com
