import { AgentAutomation } from '../types/index.js';
declare const AUTOMATIONS: AgentAutomation[];
declare const CATEGORIES: string[];
export declare function listAutomationCategories(): {
    name: string;
    count: number;
}[];
export declare function searchAutomations(query: string, category?: string): AgentAutomation[];
export declare function getAutomation(slug: string): AgentAutomation | undefined;
export declare function getAllAutomations(): AgentAutomation[];
export { CATEGORIES, AUTOMATIONS };
