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
		let data = request.url.split('?')[1] || '';
		let type = '' ;
		if (data.startsWith('plain')) {
			type = 'plain'
		} else if (data.startsWith('json')) {
			type = 'json'
		}
		data = data.slice(type.length); 
		const text = LZString.decompressFromEncodedURIComponent(data);
		switch (type) {
			case 'plain': {
				return new Response(text, {
					headers: {
					  "content-type": "text/plain; charset=utf-8",
					},
				  });
			}
			case 'json': {
				return new Response(text, {
					headers: {
					  "content-type": "application/json; charset=utf-8",
					},
				  });
			}
		}
		return new Response("Error");
	},
} satisfies ExportedHandler<Env>;
