import { NextApiRequest } from 'next';

interface ParsedRequestUrl {
    origin: string;
    host: string;
    path: string;
    bypassToken: string;
    contentfulPreviewSecret: string;
}
export declare const parseNextApiRequest: (request: NextApiRequest) => ParsedRequestUrl;
export declare const parseRequestUrl: (requestUrl: string | undefined) => ParsedRequestUrl;
export declare const buildRedirectUrl: ({ path, base, bypassTokenFromQuery, }: {
    path: string;
    base: string;
    bypassTokenFromQuery?: string;
}) => string;
export {};
