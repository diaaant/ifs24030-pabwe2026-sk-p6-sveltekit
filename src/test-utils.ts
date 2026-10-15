import { render } from "@testing-library/svelte";
import { vi } from "vitest";
import { createRawSnippet } from "svelte";
import { page } from "$app/state";
import { goto } from "$app/navigation";
import { authToken, isAuthLogin, isAuthRegister } from "./features/auth/states/authStore";
import { profile, resetUsers } from "./features/users/states/usersStore";
import { resetCourses } from "./features/courses/states/coursesStore";

export function setPage(pathname = "/", params: Record<string, string> = {}) {
  (page as any).url.pathname = pathname;
  (page as any).params = params;
}

export function resetAllStores() {
  localStorage.clear();
  authToken.set(null);
  isAuthLogin.set(false);
  isAuthRegister.set(false);
  resetUsers();
  resetCourses();
  setPage("/", {});
  vi.mocked(goto).mockClear();
}

/** Render komponen Svelte setelah store direset dan diisi sesuai opsi. */
export function renderWithProviders(
  Component: any,
  props: Record<string, unknown> = {},
  { token = null, user = null }: { token?: string | null; user?: any } = {}
) {
  resetAllStores();
  if (token) authToken.set(token);
  if (user) profile.set(user);
  return render(Component, { props });
}

export const okResponse = (data: any = {}, message = "OK") => ({ status: "success", message, data });
export const failResponse = (message = "Gagal") => ({ status: "fail", message });

/** Mock fetch berdasarkan kunci "METHOD /path". */
export function mockApi(routes: Record<string, any> = {}) {
  const fn = vi.fn(async (url: string, options: any = {}) => {
    const path = String(url).replace(DELCOM_BASEURL, "");
    const key = `${options.method || "GET"} ${path}`;
    const handler = routes[key];
    const body =
      typeof handler === "function" ? handler(options) : (handler ?? failResponse(`Tidak di-mock: ${key}`));
    return { json: async () => body };
  });
  globalThis.fetch = fn as any;
  return fn;
}

export const snippet = (html = "<p>anak</p>") => createRawSnippet(() => ({ render: () => html }));

export const sampleUser = { id: "u1", name: "Dian", email: "dian@example.com", photo: null };
export const sampleCourse = {
  id: "c1",
  user_id: "u1",
  title: "Dasar Svelte",
  description: "Belajar Svelte dari nol",
  cover: null,
  students: [{ id: "u2", name: "Budi" }],
  ratings: [{ rating: 4 }, { rating: 5 }],
  contents: [
    { id: "k1", title: "Pengantar", youtube: "https://youtu.be/dQw4w9WgXcQ", status: 0 },
    { id: "k2", title: "Rune", youtube: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", status: 1 },
  ],
};
