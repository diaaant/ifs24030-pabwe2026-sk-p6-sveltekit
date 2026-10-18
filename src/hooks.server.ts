// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';

export const handle = (async ({ event, resolve }) => {
  const response = await resolve(event);
  
  if (response.headers.get('content-type')?.includes('text/html')) {
    response.headers.set('cache-control', 'no-store, no-cache, must-revalidate');
    response.headers.set('Vary', 'Cookie');
  }
  
  return response;
}) satisfies Handle;