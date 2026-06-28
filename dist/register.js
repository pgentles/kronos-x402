/**
 * X402 Server Registration
 * Registers your server on the X402 marketplace
 */
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3001';
const WALLET = '0x7457c38Ee6306d698C94B23914724F74C8E6e0DB';
async function registerServer() {
    console.log('📋 Registering Kronos X402 on X402 marketplace...');
    console.log(`   Wallet: ${WALLET}`);
    const manifest = {
        name: 'Kronos X402 - AI Market Intelligence',
        description: 'Professional crypto market intelligence for AI agents. Trade preflight checks, real-time decisions, AI audits.',
        url: `${SERVER_URL}/mcp`,
        wallet: WALLET,
        pricing: {
            check_trade_preflight: 0.03,
            get_crypto_decision: 0.10,
            audit_trade_decision: 0.05,
            run_agent_automation: 0.01,
        },
        tools: [
            { name: 'check_trade_preflight', description: 'Pre-trade risk assessment', inputSchema: { type: 'object', properties: { symbol: { type: 'string' }, direction: { type: 'string' }, amount_usd: { type: 'number' } }, required: ['symbol', 'direction'] } },
            { name: 'get_crypto_decision', description: 'Full buy/sell/hold decision', inputSchema: { type: 'object', properties: { symbol: { type: 'string' }, direction: { type: 'string' }, amount_usd: { type: 'number' }, holdings_usd: { type: 'number' } }, required: ['symbol', 'direction'] } },
            { name: 'audit_trade_decision', description: 'Post-decision audit', inputSchema: { type: 'object', properties: { symbol: { type: 'string' }, direction: { type: 'string' }, amount_usd: { type: 'number' } }, required: ['symbol', 'direction'] } },
            { name: 'run_agent_automation', description: 'Execute agent workflow', inputSchema: { type: 'object', properties: { agent_type: { type: 'string' }, symbol: { type: 'string' } }, required: ['agent_type', 'symbol'] } },
        ],
    };
    console.log('\n📝 Server Manifest:');
    console.log(JSON.stringify(manifest, null, 2));
    console.log('\n🌐 To register, POST this JSON to:');
    console.log('   https://x402.scan/api/servers');
    console.log('   OR use the x402scan.com web UI');
    console.log('\n✅ Registration payload ready.');
    console.log('\nℹ️  After registration, agents will discover your server via X402 protocol.');
}
registerServer();
export {};
//# sourceMappingURL=register.js.map