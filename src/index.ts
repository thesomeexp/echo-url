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

export default {
	async fetch(request, env, ctx): Promise<Response> {
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
                return new Response("Error: Invalid type prefix", { status: 400 });
            }
            
            const compressedData = query.slice(dataStartIndex);
            if (!compressedData) {
                return new Response("Error: No data provided", { status: 400 });
            }
            
            const text = LZString.decompressFromEncodedURIComponent(compressedData);
            
            return new Response(text, {
                headers: { "content-type": contentType },
            });
            
        } catch (error) {
            return new Response("Error: Processing failed", { status: 500 });
        }
	},
} satisfies ExportedHandler<Env>;
