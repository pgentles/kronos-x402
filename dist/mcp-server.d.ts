import { z } from 'zod';
export interface McpContext {
    prepaid?: boolean;
    requestId?: string;
}
export declare const TOOL_SCHEMAS: {
    readonly check_trade_preflight: z.ZodObject<{
        symbol: z.ZodString;
        direction: z.ZodEnum<["long", "short", "buy", "sell"]>;
        amount_usd: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        symbol: string;
        direction: "long" | "short" | "buy" | "sell";
        amount_usd: number;
    }, {
        symbol: string;
        direction: "long" | "short" | "buy" | "sell";
        amount_usd: number;
    }>;
    readonly get_crypto_decision: z.ZodObject<{
        symbol: z.ZodString;
        direction: z.ZodEnum<["long", "short", "buy", "sell"]>;
        amount_usd: z.ZodNumber;
        holdings_usd: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        symbol: string;
        direction: "long" | "short" | "buy" | "sell";
        amount_usd: number;
        holdings_usd?: number | undefined;
    }, {
        symbol: string;
        direction: "long" | "short" | "buy" | "sell";
        amount_usd: number;
        holdings_usd?: number | undefined;
    }>;
    readonly audit_trade_decision: z.ZodObject<{
        decisionId: z.ZodString;
        windowHours: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        decisionId: string;
        windowHours: number;
    }, {
        decisionId: string;
        windowHours?: number | undefined;
    }>;
    readonly get_signals: z.ZodObject<{
        symbol: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        symbol: string;
    }, {
        symbol: string;
    }>;
    readonly get_risk: z.ZodObject<{
        symbol: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        symbol: string;
    }, {
        symbol: string;
    }>;
    readonly get_forecast: z.ZodObject<{
        symbol: z.ZodString;
        hours: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        symbol: string;
        hours: number;
    }, {
        symbol: string;
        hours?: number | undefined;
    }>;
};
export type ToolName = keyof typeof TOOL_SCHEMAS;
export declare const AVAILABLE_TOOLS: readonly [{
    readonly name: "check_trade_preflight";
    readonly description: "Pre-trade risk check for crypto positions. Returns support/resistance, trend, risk level, position sizing, cooldown status.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly symbol: {
                readonly type: "string";
                readonly description: "Asset symbol (BTC, ETH, SOL, etc.)";
            };
            readonly direction: {
                readonly type: "string";
                readonly enum: readonly ["long", "short", "buy", "sell"];
            };
            readonly amount_usd: {
                readonly type: "number";
                readonly description: "Position size in USD";
            };
        };
        readonly required: readonly ["symbol", "direction", "amount_usd"];
    };
}, {
    readonly name: "get_crypto_decision";
    readonly description: "Full buy/sell/hold market decision with confidence, regime analysis, directional bias, compliance mode.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly symbol: {
                readonly type: "string";
                readonly description: "Asset symbol (BTC, ETH, SOL, etc.)";
            };
            readonly direction: {
                readonly type: "string";
                readonly enum: readonly ["long", "short", "buy", "sell"];
            };
            readonly amount_usd: {
                readonly type: "number";
                readonly description: "Position size in USD";
            };
        };
        readonly required: readonly ["symbol", "direction", "amount_usd"];
    };
}, {
    readonly name: "audit_trade_decision";
    readonly description: "Post-decision AI audit. Requires a decision_id from get_crypto_decision. Returns verdict, P&L analysis, direction held.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly decisionId: {
                readonly type: "string";
                readonly description: "UUID from a previous get_crypto_decision call";
            };
            readonly windowHours: {
                readonly type: "number";
                readonly description: "Lookback window in hours (default 1, max 168)";
            };
        };
        readonly required: readonly ["decisionId"];
    };
}, {
    readonly name: "get_signals";
    readonly description: "Raw market signal data for a symbol. Returns signal strength, price action, volume, volatility metrics.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly symbol: {
                readonly type: "string";
                readonly description: "Asset symbol";
            };
        };
        readonly required: readonly ["symbol"];
    };
}, {
    readonly name: "get_risk";
    readonly description: "Risk assessment for a given crypto asset. Returns risk score, risk factors, market state.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly symbol: {
                readonly type: "string";
                readonly description: "Asset symbol";
            };
        };
        readonly required: readonly ["symbol"];
    };
}, {
    readonly name: "get_forecast";
    readonly description: "Price forecast for a crypto asset over a given time horizon.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly symbol: {
                readonly type: "string";
                readonly description: "Asset symbol";
            };
            readonly hours: {
                readonly type: "number";
                readonly description: "Forecast horizon in hours (1-72, default 24)";
            };
        };
        readonly required: readonly ["symbol"];
    };
}];
export interface McpToolResult {
    content: Array<{
        type: 'text';
        text: string;
    }>;
    isError?: boolean;
}
export declare function executeTool(name: string, args: Record<string, unknown>, _ctx?: McpContext): Promise<McpToolResult>;
export declare function registerTools(): ({
    readonly name: "check_trade_preflight";
    readonly description: "Pre-trade risk check for crypto positions. Returns support/resistance, trend, risk level, position sizing, cooldown status.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly symbol: {
                readonly type: "string";
                readonly description: "Asset symbol (BTC, ETH, SOL, etc.)";
            };
            readonly direction: {
                readonly type: "string";
                readonly enum: readonly ["long", "short", "buy", "sell"];
            };
            readonly amount_usd: {
                readonly type: "number";
                readonly description: "Position size in USD";
            };
        };
        readonly required: readonly ["symbol", "direction", "amount_usd"];
    };
} | {
    readonly name: "get_crypto_decision";
    readonly description: "Full buy/sell/hold market decision with confidence, regime analysis, directional bias, compliance mode.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly symbol: {
                readonly type: "string";
                readonly description: "Asset symbol (BTC, ETH, SOL, etc.)";
            };
            readonly direction: {
                readonly type: "string";
                readonly enum: readonly ["long", "short", "buy", "sell"];
            };
            readonly amount_usd: {
                readonly type: "number";
                readonly description: "Position size in USD";
            };
        };
        readonly required: readonly ["symbol", "direction", "amount_usd"];
    };
} | {
    readonly name: "audit_trade_decision";
    readonly description: "Post-decision AI audit. Requires a decision_id from get_crypto_decision. Returns verdict, P&L analysis, direction held.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly decisionId: {
                readonly type: "string";
                readonly description: "UUID from a previous get_crypto_decision call";
            };
            readonly windowHours: {
                readonly type: "number";
                readonly description: "Lookback window in hours (default 1, max 168)";
            };
        };
        readonly required: readonly ["decisionId"];
    };
} | {
    readonly name: "get_signals";
    readonly description: "Raw market signal data for a symbol. Returns signal strength, price action, volume, volatility metrics.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly symbol: {
                readonly type: "string";
                readonly description: "Asset symbol";
            };
        };
        readonly required: readonly ["symbol"];
    };
} | {
    readonly name: "get_risk";
    readonly description: "Risk assessment for a given crypto asset. Returns risk score, risk factors, market state.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly symbol: {
                readonly type: "string";
                readonly description: "Asset symbol";
            };
        };
        readonly required: readonly ["symbol"];
    };
} | {
    readonly name: "get_forecast";
    readonly description: "Price forecast for a crypto asset over a given time horizon.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly symbol: {
                readonly type: "string";
                readonly description: "Asset symbol";
            };
            readonly hours: {
                readonly type: "number";
                readonly description: "Forecast horizon in hours (1-72, default 24)";
            };
        };
        readonly required: readonly ["symbol"];
    };
})[];
