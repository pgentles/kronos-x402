const AUTOMATIONS = [
    {
        slug: 'defi-yield-monitor',
        category: 'DeFi & Yield',
        title: 'DeFi Yield Opportunity Scanner',
        summary: 'Monitors top DeFi lending protocols for yield opportunities above a configurable threshold and alerts via webhook.',
        prompt: 'Scan Aave, Compound, and MakerDAO lending pools for yields exceeding 8% APY. Report top 3 opportunities ranked by risk-adjusted return, cite sources using CoinGecko and DeFiCompare APIs.',
        workflow: [
            'Fetch current lending pool data from Aave V3, Compound V3, and MakerDAO DAI savings rate',
            'Filter by min_apy threshold (configurable)',
            'Rank results by APY x TVL ratio (risk adjustment)',
            'Generate formatted alert with opportunity summary',
            'Send to configured webhook (Discord/Slack/Telegram)',
        ],
        difficulty: 'intermediate',
        estimatedSetupMin: 25,
    },
    {
        slug: 'nft-floor-alert',
        category: 'NFTs & Collectibles',
        title: 'NFT Floor Price Alert Bot',
        summary: 'Watches OpenSea and LooksRare floor prices for a configurable collection and triggers alerts on significant changes.',
        prompt: 'Monitor floor prices of [collection_slug]. Alert when floor moves >5% in 15-minute window. Include trade volume and rarity data if available.',
        workflow: [
            'Query OpenSea API or LooksRare subgraph for current floor_price',
            'Compare against cached price in Redis or local JSON',
            'If |delta| > threshold, assemble alert',
            'Format: name, floor_price, delta_pct, volume_24h',
            'Dispatch via Telegram bot or webhook',
        ],
        difficulty: 'beginner',
        estimatedSetupMin: 15,
    },
    {
        slug: 'liquidation-tracker',
        category: 'DeFi & Yield',
        title: 'Liquidation Tracker Dashboard',
        summary: 'Tracks upcoming liquidations on major lending protocols to identify cascading liquidation risk.',
        prompt: 'Subscribe to Aave V3 and Compound V3 Borrow events where health_factor < 1.0. Stream updates to a dashboard.',
        workflow: [
            'Connect to RPC (Alchemy/Infura) and listen to LendingPool.LiquidationCall events',
            'Index by user address, debt_asset, collateral_asset, health_factor at time of event',
            'Calculate cumulative liquidation volume per block (cascade risk)',
            'Push to frontend via WebSocket with connected address analysis',
            'Auto-purge data older than 24h to control DB size',
        ],
        difficulty: 'advanced',
        estimatedSetupMin: 45,
    },
    {
        slug: 'yaqoud-liquidity',
        category: 'DeFi & Yield',
        title: 'Liquidity Pool Yield Optimizer',
        summary: 'Recommends rebalancing between ETH/USDC and ETH/USDC pools based on realized fee APY.',
        prompt: 'Compare LP fee income for ETH/USDC position across 7d and 30d periods. Recommend migrate if variance >15%.',
        workflow: [
            'Fetch Infura/Alchemy Uniswap V3 position data',
            'Query pool.feesGenerated over selectable window',
            'Calculate 7d and 30d realized APY including gas estimates',
            'Issue if apyVariance(7d,30d) > 0.15: RECOMMEND MIGRATE',
            'respond with json: { recommendation: { action: MIGRATE|HOLD, priority, apy_7d, apy_30d, variance_pct, reason }}',
        ],
        difficulty: 'intermediate',
        estimatedSetupMin: 30,
    },
    {
        slug: 'sj-ico-screener',
        category: 'ICO & Launches',
        title: 'ICO Launch Screener',
        summary: 'Distills ICO/D launch metrics into a single-page sponsor memo formatted for OTC desk review.',
        prompt: 'Given a coin gecko API token id, generate a memo with market_cap, fdv, pair_volume_24h, liquidity_usd, slug, and platforms flag.',
        workflow: [
            'GET https://api.coingecko.com/api/v3/coins/{id}',
            'Extract: market_cap, fdv, tickers[].target="USD-BTC", liquidity_num = base reserve_usd, volume_24h, contract',
            'Format fields per internal desk template',
            'Evaluate based on: min_liquidity ($50k+) and/or volume_24h ≥ $1M',
            'Respond with sponsor_memo + qualifying pass/fail flag',
        ],
        difficulty: 'beginner',
        estimatedSetupMin: 20,
    },
    {
        slug: 'github-vuln-monitor',
        category: 'Security & Audits',
        title: 'GitHub Advisory Watcher',
        summary: 'Watches GHSA advisories for projects in an installed package manifest and auto-files patch PR.',
        prompt: 'Monitor https://api.github.com/advisories?package_name to detect new vulnerabilities. If any advisory impacts packages in package.json, generate JSON report with ecosystem, severity, fixed_version, ghsa_id.',
        workflow: [
            'Fetch: https://api.github.com/advisories?package_name=npm&per_page=100',
            'Cross-reference installed_packages dict',
            'Filter new advisories not in seen_ids set and intersecting package set',
            'Build vulnerability report per affected package',
            'Label severity (critical/high/medium/low) and include fix recommendation',
        ],
        difficulty: 'intermediate',
        estimatedSetupMin: 20,
    },
    {
        slug: 'infra-adm-costburn',
        category: 'Infrastructure & DevOps',
        title: 'AWS Cost Burn-Down Dashboard',
        summary: 'Pulls AWS Cost Explorer data via boto3 and synthesizes a daily burn report with anomaly alerts.',
        prompt: 'Query AWS Cost Explorer for cost_and_usage of every service in the previous 3 days. Identify top 10 services by spend and any 24h anomaly. Generate JSON report with daily_cost, anomaly_bool, top10 array.',
        workflow: [
            'Initialize boto3 costexplorer client for region us-east-1',
            'Get CostAndUsage for time_period = today - 3d to today, granularity=DAILY',
            'Group by SERVICE for cost breakdown',
            'Compare each service day-over-day; flag if delta > 30% and delta > $50',
            'Response json: { report_date, anomaly_flag, anomaly_details[], active_graphs, total_3d },',
        ],
        difficulty: 'intermediate',
        estimatedSetupMin: 20,
    },
    {
        slug: 'agent-nftlist-buyer',
        category: 'NFTs & Collectibles',
        title: 'Agent NFT Listing Flow',
        summary: 'Completes an NFT listing on OpenSea with a single prompt: approve, sign, and post order.',
        prompt: 'Bidder agent pre-approves WETH and then signs and posts order parameters. Execute flow and return { approval_tx, listing_tx, salt, status }. Requires WALLET_PRIVATE_KEY env.',
        workflow: [
            'Init signer from env.WALLET_PRIVATE_KEY',
            'Fetch WETH approve transaction (call MVP_WHITELIST_ADDRESS or OceanXYZ contract)',
            'Sign and broadcast approval; await confirmation',
            'fetchOpenSea posting order and signOrder(orderParams) using ether port library',
            'validateListing(orderHash) via artemis listing API',
            'Log and return { approval_ham, listing_hash, salt, status }',
        ],
        difficulty: 'advanced',
        estimatedSetupMin: 40,
    },
    {
        slug: 'blockbeat-mgnrl-edge',
        category: 'Signals & Research',
        title: 'Momentum Edge LSTM Forecaster',
        summary: 'Predicts short-term crypto direction (24h) from an LSTM trained on 5-min OHLCV of a target pair.',
        prompt: 'Train model on latest 10,000 5-min OHLCV candles for symbol via Binance public API. Predict 24h direction and probability. Return json direction_str (UP/DOWN), probability.accuracy, loss. Include first_hidden_layer_accuracy metric.',
        workflow: [
            'Fetch Binance klines for symbol, interval 5m, limit=10000 (30-day window)',
            'Preprocess: normalize with sklearn-style scaler (min-max), create 60-min sequences',
            'Build LSTM: first dense layer 32 units, dropout 0.2, output sigmoid',
            'Train: epochs=10, batch_size=32, validation_split=0.2',
            'Predict next candle with last sequence in a complete run',
            'Response: { symbol, direction: "UP"|"DOWN", prob_rounded, model_trained: true }',
        ],
        difficulty: 'advanced',
        estimatedSetupMin: 30,
    },
    {
        slug: 'datadog-log-scan',
        category: 'Infrastructure & DevOps',
        title: 'Datadog Log Anomaly Scanner',
        summary: 'Detects log anomalies in Datadog with automatic Slack remediation runbook suggestions.',
        prompt: 'Log scan returns anomaly_score (0..10) from Datadog over last 4 hours. Slack posts with color-coded severity and a link to log viewer.',
        workflow: [
            'Query Datadog Logs API: search?query=status:error&from=now-4h&to=now',
            'Group errors by service, compute anomaly_score = unique_errors_per_min / historical_baseline',
            'Score thresholds: 0-2 (green), 2-5 (yellow), 5-10 (red)',
            'Generate runbook suggestion: "Check service X, likely Y, documented in runbook Z"',
            'Post to Slack webhook with formatted payload',
        ],
        difficulty: 'intermediate',
        estimatedSetupMin: 25,
    },
    {
        slug: 'aave-health-monitor',
        category: 'DeFi & Yield',
        title: 'Aave V3 LP Position Liquidity Monitor',
        summary: 'Monitors Aave V3 LP positions for liquidity change events and quantifies impermanent loss impact.',
        prompt: 'Pull Aave V3 LP events via subgraph API, compute impermanent loss for liquidity events. Return JSON report with liquidity_delta, impermanent_loss_pct, address, pool_id.',
        workflow: [
            'Query Aave V3 subgraph: liquidityDeposits, liquidityWithdraws, last 4h',
            'Map events to user positions and calculate net liquidity delta',
            'Compute IL using formula (2 * sqrt(price_ratio) / (1 + price_ratio) - 1)',
            'Filter events below min_liquidity threshold',
            'respond with json: { events: [{ address, pool_id, il_pct, liquidity_delta, timestamp }], total_events }',
        ],
        difficulty: 'advanced',
        estimatedSetupMin: 35,
    },
    {
        slug: 'mc-copy-trade-alert',
        category: 'Signals & Research',
        title: 'Smart Money Copy-Trade Alert',
        summary: 'Tracks a list of whale wallets for new exchange deposits and generates alerts with estimated impact.',
        prompt: 'Deposit Tracker monitors wallets for new CEX deposits. Alert with return json: { wallets_tracked, total_deposits_24h, deposit_alert, usd_value_if_positive, genesis_date, curve_name.',
        workflow: [
            'Load known whale wallets from data/whale_wallets.json (min 50 addresses)',
            'fetchDeposits via Alchemy Transfers API (fromAddress=address, category=["external"], toAddress in cex_addresses)',
            'Filter to last 24h and group by token, exchange destination',
            'Calculate alert score = sum of deposits to CEX / total deposit volume',
            'Issue structured alert JSON based on score exceeding configurable threshold',
        ],
        difficulty: 'advanced',
        estimatedSetupMin: 35,
    },
    {
        slug: 'df-telegram-uniswap',
        category: 'DeFi & Yield',
        title: 'Uniswap Telegram Trading Bot',
        summary: 'Telegram bot that routes swap trades through Uniswap V3 at optimized slippage for implementers.',
        prompt: 'Given an amount_in, token_in, token_out, and tolerance (e.g., UniswapV3 router), execute swap with nonce auto-management and a local order book sync. Return { tx_hash, amount_out, effective_price, nonce }.',
        workflow: [
            'Init UniswapV3 router contract and NonceManager from @uniswap/v3-sdk',
            'Initialize bot: grammy Bot with --register liquidity, swap, status commands',
            'executeSwap(params): fetch + increment nonce, call router.exactInputSingle(), await receipt',
            'singaporeyour errors to DB for automated recovery/resignment',
            'Bot replies with instantiation response per request: { tx_hash, amount_out }',
        ],
        difficulty: 'advanced',
        estimatedSetupMin: 45,
    },
    {
        slug: 'gib-normandy-basics',
        category: 'Security & Audits',
        title: 'Normandy Basics',
        summary: 'Extracts and validates Normandy migration contract signatures with a single prompt.',
        prompt: 'Extract coordinates and validate signatures using libnacl for Normandy MigrationContract. Return json: { status: SUCCESS|FAIL, valid_signatures, total_signatures, address_hash_matches }',
        workflow: [
            'Load signature data from repository',
            'Parse user-provided keys (ed25519 seed or json) using TweetNaCl.js or @noble/hashes',
            'Validate that each validator signature is correct for the given message (genesis_hash)',
            'Compare address_hash from local validators with contract address_hash',
            'respond with validation result or FAIL with partial counts',
        ],
        difficulty: 'intermediate',
        estimatedSetupMin: 25,
    },
    {
        slug: 'dparty-whale-tracker',
        category: 'Signals & Research',
        title: 'Whale Party Tracker',
        summary: 'Tracks NFT whale accumulation patterns using Reservoir tools API, generating party alert feed.',
        prompt: 'Monitor top 3 buyers (parties) of a configurable NFT collection using Reservoir sales/v3 API, rank by volume. Output json: { sale_top, buy_summary, rank_volume, total_volume, price_avg_diff_pct, alert_bool, }',
        workflow: [
            'GET https://api.reservoir.tools/sales/v3?contract={collection}&limit=100&order_by=price',
            'Aggregate unique buyerAddress, compute total volume and price changes issue if volumeAnomaly > 20%',
            'Include: sale_top (top buyer address + volume), buy_summary (top 5 with % share), rank_volume',
            'Set alert_bool to true if a single whale buys >20% of total sales volume in window',
        ],
        difficulty: 'intermediate',
        estimatedSetupMin: 25,
    },
    {
        slug: 'sb-gs-detector',
        category: 'ICO & Launches',
        title: 'Guillaume Sniper Detector',
        summary: "Detects 'sniper' front-running bots in the first 30 seconds of a Uniswap V3 token launch.",
        prompt: 'Analyze Uniswap V3 pool creation and first 60 seconds to detect sniper activity. Return sniper_bool, sniper_count, avg_gas_price_gwei, front_runs_detected. Requires RPCs access.',
        workflow: [
            'Connect to Base/Alchemy/etc RPC and listen to new V3 PoolCreated events',
            'For each new pool, subscribe to Swap events in first 60 seconds',
            'Detect sniper: gas_price > 5x avg block gas, caller not in first 10 buyers of pre-launch txs',
            'Count unique sniper addresses, calculate avg gas used',
            'respond with json detecting front-runs if delta_gas > 3x',
        ],
        difficulty: 'advanced',
        estimatedSetupMin: 45,
    },
];
const CATEGORIES = [...new Set(AUTOMATIONS.map(a => a.category))];
export function listAutomationCategories() {
    return CATEGORIES.map(name => ({
        name,
        count: AUTOMATIONS.filter(a => a.category === name).length,
    }));
}
export function searchAutomations(query, category) {
    const q = query.toLowerCase();
    return AUTOMATIONS.filter(a => {
        const matchesQuery = !q ||
            a.title.toLowerCase().includes(q) ||
            a.summary.toLowerCase().includes(q) ||
            a.slug.toLowerCase().includes(q) ||
            a.category.toLowerCase().includes(q);
        const matchesCategory = !category || a.category.toLowerCase() === category.toLowerCase();
        return matchesQuery && matchesCategory;
    });
}
export function getAutomation(slug) {
    return AUTOMATIONS.find(a => a.slug === slug);
}
export function getAllAutomations() {
    return AUTOMATIONS;
}
export { CATEGORIES, AUTOMATIONS };
//# sourceMappingURL=agent-automations.js.map