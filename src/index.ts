/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
import LZString from "lz-string";
import {
    createResponse,
    createErrorResponse,
    createOptionsResponse,
    handleUnknownError
} from './response-utils';

export default {
    async fetch(request, env, ctx): Promise<Response> {
        // 处理预检请求 (OPTIONS)
        if (request.method === 'OPTIONS') {
            return createOptionsResponse();
        }

        try {
            const query = request.url.split('?')[1] || '';

            // 快速识别类型，避免多次字符串操作
            let contentType: string;
            let dataStartIndex: number;

            if (query.startsWith('json')) {
                contentType = 'application/json; charset=utf-8';
                dataStartIndex = 4; // "json".length
            } else if (query.startsWith('plain')) {
                contentType = 'text/plain; charset=utf-8';
                dataStartIndex = 5; // "plain".length
            } else {
                return createErrorResponse(
                    "Invalid type prefix",
                    400
                );
            }

            const compressedData = query.slice(dataStartIndex);
            if (!compressedData) return createErrorResponse(
                "No compressed data provided",
                400
            );

            const decompressed = LZString.decompressFromEncodedURIComponent(compressedData);
            if (!decompressed) {
                return createErrorResponse(
                    "Decompression failed",
                    400
                );
            }

            return createResponse(decompressed, {
                contentType
            });

        } catch (error) {
            return handleUnknownError(error);
        }
    },
} satisfies ExportedHandler<Env>;
