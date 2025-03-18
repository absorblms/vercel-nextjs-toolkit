import { VercelJwt } from '../types';
import { NextRequest } from 'next/server';

export declare const getVercelJwtCookie: (request: NextRequest) => string | undefined;
export declare const parseVercelJwtCookie: (vercelJwtCookie: string) => VercelJwt;
