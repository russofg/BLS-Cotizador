import { defineMiddleware } from 'astro:middleware';
import { authMiddlewareHandler } from './utils/authMiddleware';

export const onRequest = defineMiddleware(authMiddlewareHandler);
