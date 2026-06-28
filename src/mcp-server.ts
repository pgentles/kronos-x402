import { z } from 'zod';

export interface McpContext { prepaid?: boolean; }

const PricePreflightSchema = z.object({
  symbol: z.string(),
  direction: z.enum(['long', 'short', 'buy', 'sell']),
  amount_usd: z.number().positive(),
});

const CryptoDecisionSchema = z.object({
  symbol: z.string(),
  direction: z.enum(['long', 'short', 'buy', 'sell']),
  amount_usd: z.number().positive(),
  holdings_usd: z.number().optional(),
});

const AuditSchema = z.object({
  symbol: z.string(),
  direction: z.enum(['long', 'short', 'buy', 'sell']),
  amount_usd: z.number(),
  entry_price: z.number().optional(),
});

export async function registerTools() {
  return [
    {
      name: 'check_trade_preflight',
      description: 'Pre-trade risk check for crypto positions',
      inputSchema: { type: 'object', properties: { symbol: { type: 'string' }, direction: { type: 'string' }, amount_usd: { type: 'number' } }, required: ['symbol', 'direction', 'amount_usd'] },
    },
    {
      name: 'get_crypto_decision',
      description: 'Full buy/sell/hold market decision',
      inputSchema: { type: 'object', properties: { symbol: { type: 'string' }, direction: { type: 'string' }, amount_usd: { type: 'number' }, holdings_usd: { type: 'number' } }, required: ['symbol', 'direction', 'amount_usd'] },
    },
    {
      name: 'audit_trade_decision',
      description: 'Post-decision AI audit with verdict',
      inputSchema: { type: 'object', properties: { symbol: { type: 'string' }, direction: { type: 'string' }, amount_usd: { type: 'number' }, entry_price: { type: 'number' } }, required: ['symbol', 'direction'] },
    },
  ];
}
