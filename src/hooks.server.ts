import { describe, it, expect, vi } from 'vitest';
import { handle } from './hooks.server';

describe('hooks.server.ts', () => {
  // Mock event dasar (bisa ditambahkan jika kode Anda membutuhkan cookies/request)
  const mockEvent = {} as any;

  it('menerapkan header cache-control pada respons HTML', async () => {
    // 1. Buat mock response HTML
    const mockResponse = new Response('<!DOCTYPE html><html></html>', {
      headers: { 'content-type': 'text/html' }
    });
    const resolve = vi.fn().mockResolvedValue(mockResponse);

    // 2. Jalankan fungsi handle
    const response = await handle({ event: mockEvent, resolve });

    // 3. Pastikan header terpasang
    expect(response.headers.get('cache-control')).toBe('no-store, no-cache, must-revalidate');
    expect(response.headers.get('Vary')).toBe('Cookie');
  });

  it('tidak menerapkan header cache-control pada respons JSON', async () => {
    // 1. Buat mock response JSON
    const mockResponse = new Response(JSON.stringify({ data: 'ok' }), {
      headers: { 'content-type': 'application/json' }
    });
    const resolve = vi.fn().mockResolvedValue(mockResponse);

    const response = await handle({ event: mockEvent, resolve });

    // 2. Pastikan header tidak terpasang
    expect(response.headers.get('cache-control')).toBeNull();
    expect(response.headers.get('Vary')).toBeNull();
  });

  it('tidak error saat respons tidak memiliki header content-type', async () => {
    // 1. Buat mock response tanpa content-type
    const mockResponse = new Response('plain text');
    const resolve = vi.fn().mockResolvedValue(mockResponse);

    const response = await handle({ event: mockEvent, resolve });

    expect(response.headers.get('cache-control')).toBeNull();
  });
});