export interface PaymentResult {
    allowed_tool: string;
    price: number;
    paid: boolean;
    tx_hash?: string;
    wallet?: string;
}
export declare function getPrice(toolName: string): number;
export declare function processPayment(toolName: string): PaymentResult;
export declare function getFullPricing(): {
    tool: string;
    price: number;
    description: string;
}[];
