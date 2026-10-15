# Delcom Courses (SvelteKit + TypeScript) — Studi Kasus 2, PABWE P6

Aplikasi kursus: autentikasi, CRUD kursus (judul, deskripsi, sampul), peserta (daftar/keluar), rating 1-5,
konten video YouTube dengan status belajar, daftar pengguna, dan profil. Memakai REST API Delcom.

## Menjalankan
```bash
bun install
bun run dev              # http://localhost:3005
bun run test:coverage    # coverage 100% (lines, functions, branches, statements)
bun run build && bun run start
```
Atur `VITE_DELCOM_BASEURL` dan `APP_PORT` pada `.env`.

## Endpoint yang dipakai (src/features/courses/api/courseApi.ts)
`/courses` (GET, POST, DELETE semua), `/courses/:id` (GET, PUT, DELETE), `/courses/:id/cover` (POST, field `cover`),
`/courses/:id/students` (POST daftar, DELETE keluar), `/courses/:id/ratings` (POST `{rating}`),
`/courses/:id/contents` (POST `{title, youtube}`), `/courses/-/contents/:contentId` (GET, PUT, DELETE),
`/courses/-/contents/:contentId/learns` (PUT `{status: 0|1}`).
Bila nama field/endpoint di dokumentasi API berbeda, cukup ubah file API tersebut.
