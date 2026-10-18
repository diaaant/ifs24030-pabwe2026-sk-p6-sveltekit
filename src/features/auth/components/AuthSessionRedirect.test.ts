import { describe, it, expect, vi, beforeEach } from "vitest";
import { get } from "svelte/store";
import { waitFor, render } from "@testing-library/svelte";
import { goto } from "$app/navigation";
import AuthSessionRedirect from "./AuthSessionRedirect.svelte";
import { authToken, isAuthLogin } from "../states/authStore";
import { profile } from "../../users/states/usersStore";
import { setPage, mockApi, okResponse, failResponse, sampleUser } from "../../../test-utils";

describe("AuthSessionRedirect", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authToken.set(null);
    isAuthLogin.set(false);
    profile.set(null);
    setPage("/auth/login");
  });

  it("tidak mengalihkan tanpa token", async () => {
    mockApi({});
    render(AuthSessionRedirect);
    await new Promise((r) => setTimeout(r, 20));
    expect(goto).not.toHaveBeenCalled();
  });

  it("tidak mengalihkan sebelum status login dan profil siap", async () => {
    authToken.set("tok");
    // Tetap di halaman auth agar saat token di-reset oleh logout(), tidak terpicu redirect
    setPage("/auth/login"); 
    mockApi({}); // Biarkan loadProfile gagal, sehingga token di-reset
    render(AuthSessionRedirect); 
    await new Promise((r) => setTimeout(r, 20));
    expect(goto).not.toHaveBeenCalled();
  });

  it("mengalihkan ke beranda setelah token, status login, dan profil siap", async () => {
    authToken.set("tok");
    isAuthLogin.set(true);
    profile.set(sampleUser);
    
    render(AuthSessionRedirect);
    await waitFor(() => expect(goto).toHaveBeenCalledWith("/", { replaceState: true }));
  });

  it("memulihkan sesi dari token tersimpan lalu mengalihkan", async () => {
    authToken.set("tok");
    mockApi({ "GET /users/me": okResponse({ user: sampleUser }) });
    
    render(AuthSessionRedirect);
    await waitFor(() => expect(get(profile)).toEqual(sampleUser));
    await waitFor(() => expect(goto).toHaveBeenCalledWith("/", { replaceState: true }));
  });

  it("logout bila token tersimpan tidak valid", async () => {
    authToken.set("tok");
    mockApi({ "GET /users/me": failResponse() });
    
    render(AuthSessionRedirect);
    await waitFor(() => expect(get(authToken)).toBeNull());
    expect(goto).not.toHaveBeenCalled();
  });
});