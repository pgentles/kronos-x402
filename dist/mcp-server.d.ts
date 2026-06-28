export interface McpContext {
    prepaid?: boolean;
}
export declare function registerTools(): Promise<({
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            symbol: {
                type: string;
            };
            direction: {
                type: string;
            };
            amount_usd: {
                type: string;
            };
            holdings_usd?: undefined;
            entry_price?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            symbol: {
                type: string;
            };
            direction: {
                type: string;
            };
            amount_usd: {
                type: string;
            };
            holdings_usd: {
                type: string;
            };
            entry_price?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            symbol: {
                type: string;
            };
            direction: {
                type: string;
            };
            amount_usd: {
                type: string;
            };
            entry_price: {
                type: string;
            };
            holdings_usd?: undefined;
        };
        required: string[];
    };
})[]>;
