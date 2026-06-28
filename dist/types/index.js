// src/types/index.ts
export const SYMBOLS = ['BTC/USD', 'ETH/USD', 'SOL/USD', 'XRP/USD', 'ADA/USD', 'DOGE/USD', 'AVAX/USD', 'LINK/USD', 'DOT/USD', 'MATIC/USD'];
export const SYMBOL_MAP = {
    BTC: 'BTC/USD', ETH: 'ETH/USD', SOL: 'SOL/USD', XRP: 'XRP/USD',
    ADA: 'ADA/USD', DOGE: 'DOGE/USD', AVAX: 'AVAX/USD', LINK: 'LINK/USD',
    DOT: 'DOT/USD', MATIC: 'MATIC/USD'
};
export function normalizeSymbol(input) {
    const upper = input.toUpperCase().replace('/USD', '').replace('-USD', '').trim();
    return SYMBOL_MAP[upper] || 'BTC/USD';
}
//# sourceMappingURL=index.js.map