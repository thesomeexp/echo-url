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
		const url = new URL(request.url);
		const path = url.pathname.slice(1); // 去掉开头的 "/"

		// 获取路径的前两个部分
		const segments = path.split('/'); // 分割路径
		const prefix = segments[0] || ''; // 获取第一个部分 "aaa"
		const type = segments[1] || '';   // 获取第二个部分 "type"
		const data = segments[2] || '';   // 获取第3个部分 "data"
		switch (prefix) {
		  case 'echo':
			switch (type) {
				case 'plain': {
					const dUri = decodeURIComponent(data)
					const text = LZString.decompressFromEncodedURIComponent(dUri);
					return new Response(text, {
						headers: {
						  "content-type": "text/plain; charset=utf-8",
						},
					  });
				}
				case 'json': {
					const text = LZString.decompressFromEncodedURIComponent(data);
					return new Response(text, {
						headers: {
						  "content-type": "application/json; charset=utf-8",
						},
					  });
				}
			}
		  default:
			return new Response("Error");
		}
		
	},
} satisfies ExportedHandler<Env>;
