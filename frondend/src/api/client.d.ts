export declare class ApiError extends Error {
    status: number;
    details?: unknown;
    constructor(status: number, message: string, details?: unknown);
}
export declare function setAuthToken(token: string | null): void;
export declare function getAuthToken(): string | null;
export declare const api: {
    get: <T>(path: string) => Promise<T>;
    post: <T>(path: string, body?: unknown) => Promise<T>;
    patch: <T>(path: string, body?: unknown) => Promise<T>;
    del: <T>(path: string) => Promise<T>;
};
