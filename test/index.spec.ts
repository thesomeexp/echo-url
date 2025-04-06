// test/index.spec.ts
import { env, createExecutionContext, waitOnExecutionContext, SELF } from 'cloudflare:test';
import { describe, it, expect } from 'vitest';
import worker from '../src/index';

// For now, you'll need to do something like this to get a correctly-typed
// `Request` to pass to `worker.fetch()`.
const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

describe('echo-url worker', () => {
	
  // 测试解压功能
  it('should decompress plain text correctly', async () => {
    const compressed = "tHKkp-RwKoIW6Orahk3oTHJA"; // 这里放实际压缩后的字符串
    const request = new IncomingRequest(`http://example.com/echo?plain${compressed}`);
    const ctx = createExecutionContext();
    
    const response = await worker.fetch(request, {}, ctx);
    await waitOnExecutionContext(ctx);
    
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('text/plain');
    expect(await response.text()).toMatchInlineSnapshot(`"压缩后的字符串"`);
  });
  
  // 测试JSON解压
  it('should decompress JSON correctly', async () => {
    const compressed = "N4XyA";
    const request = new IncomingRequest(`http://example.com/?json${compressed}`);
    const ctx = createExecutionContext();
    
    const response = await worker.fetch(request, {}, ctx);
    await waitOnExecutionContext(ctx);
    
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('application/json');
    expect(await response.text()).toMatchInlineSnapshot(`"{}"`);
  });


  // 测试错误处理
  it('should handle decompression failure', async () => {
    const invalidData = "无效的压缩数据";
    const request = new IncomingRequest(`http://example.com/?plain${invalidData}`);
    const ctx = createExecutionContext();
    
    const response = await worker.fetch(request, {}, ctx);
    await waitOnExecutionContext(ctx);
    
    expect(response.status).toBe(400);
    expect(await response.text()).toContain(`Error: Decompression failed`);
  });

  // 测试CORS头
  it('should include CORS headers', async () => {
    const request = new IncomingRequest('http://example.com/?plaintest');
    const ctx = createExecutionContext();
    
    const response = await worker.fetch(request, {}, ctx);
    await waitOnExecutionContext(ctx);
    
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
  });

  // 测试OPTIONS预检请求
  it('should handle OPTIONS request', async () => {
    const request = new IncomingRequest('http://example.com/', {
      method: 'OPTIONS'
    });
    const ctx = createExecutionContext();
    
    const response = await worker.fetch(request, {}, ctx);
    await waitOnExecutionContext(ctx);
    
    expect(response.status).toBe(200);
    expect(response.headers.get('Access-Control-Allow-Methods')).toContain('GET');
  });
});
