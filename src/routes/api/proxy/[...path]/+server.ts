import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const API_BASE = 'https://open-api.delcom.org/api/v1';

export const fallback: RequestHandler = async ({ request, params, url, fetch }) => {
  const path = params.path;
  const targetUrl = `${API_BASE}/${path}${url.search}`;

  const headers = new Headers(request.headers);
  headers.delete('host'); 
  headers.delete('connection');

  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? await request.text() : undefined,
    });

    const data = await response.text();

    return new Response(data, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error("Proxy Error:", error);
    return json({ error: 'Proxy gagal terhubung ke API' }, { status: 502 });
  }
};