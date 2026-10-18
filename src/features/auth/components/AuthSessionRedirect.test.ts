import { describe, it, expect, vi, beforeEach } from "vitest";
import { get } from "svelte/store";
import { waitFor } from "@testing-library/svelte";
import { goto } from "$app/navigation";
import AuthSessionRedirect from "./AuthSessionRedirect.svelte";
import { authToken, isAuthLogin } from "../states/authStore";
import { profile } from "../../users/states/usersStore";
import { renderWithProviders, mockApi, okResponse, failResponse, sampleUser } from "../../../test-utils";

// PERBAIKAN: Gunakan vi.hoisted untuk membuat mock page lokal yang terisolasi
const { mockPage } = vi.hoisted(() => ({
  mockPage: { url: { pathname: "/auth/login" }, params: {} }
}));

vi.mock("$app/state", () => ({
  page: mockPage
}));

describe("AuthSessionRedirect", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isAuthLogin.set(false);
    authToken.set(null);
    profile.set(null);
    // Set default ke /auth/login agar tidak memicu redirect otomatis
    mockPage.url.pathname = "/auth/login";
  });

  it("tidak mengalihkan tanpa token", async () => {
    mockApi({});
    renderWithProviders(AuthSessionRedirect);
    await new Promise((r) => setTimeout(r, 20));
    expect(goto).not.toHaveBeenCalled();
  });

  it("tidak mengalihkan sebelum status login dan profil siap", async () => {
    mockPage.url.pathname = "/"; // Path di luar auth
    renderWithProviders(AuthSessionRedirect, {}, { token: "tok" }); 
    await new Promise((r) => setTimeout(r, 20));
    expect(goto).not.toHaveBeenCalled();
  });

  it("mengalihkan ke beranda setelah token, status login, dan profil siap", async () => {
    mockPage.url.pathname = "/auth/login";
    renderWithProviders(AuthSessionRedirect, {}, { token: "tok", user: sampleUser });
    isAuthLogin.set(true);
    await waitFor(() => expect(goto).toHaveBeenCalledWith("/", { replaceState: true }));
  });

  it("memulihkan sesi dari token tersimpan lalu mengalihkan", async () => {
    mockPage.url.pathname = "/auth/login";
    mockApi({ "GET /users/me": okResponse({ user: sampleUser }) });
    renderWithProviders(AuthSessionRedirect, {}, { token: "tok" });
    await waitFor(() => expect(get(profile)).toEqual(sampleUser));
    await waitFor(() => expect(goto).toHaveBeenCalledWith("/", { replaceState: true }));
  });

  it("logout bila token tersimpan tidak valid", async () => {
    mockPage.url.pathname = "/auth/login";
    mockApi({ "GET /users/me": failResponse() });
    renderWithProviders(AuthSessionRedirect, {}, { token: "tok" });
    await waitFor(() => expect(get(authToken)).toBeNull());
    expect(goto).not.toHaveBeenCalled();
  });
});