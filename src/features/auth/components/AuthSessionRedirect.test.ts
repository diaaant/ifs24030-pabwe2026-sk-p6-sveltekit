import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { get } from "svelte/store";
import { waitFor, render, screen } from "@testing-library/svelte";
import { goto } from "$app/navigation";
import AuthSessionRedirect from "./AuthSessionRedirect.svelte";
import { authToken, isAuthLogin } from "../states/authStore";
import { profile } from "../../users/states/usersStore";
import { setPage, mockApi, okResponse, failResponse, sampleUser } from "../../../test-utils";

import * as usersStore from "../../users/states/usersStore";

describe("AuthSessionRedirect", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authToken.set(null);
    isAuthLogin.set(false);
    profile.set(null);
    setPage("/auth/login");
  });

  afterEach(() => {
    vi.restoreAllMocks(); 
  });

  it("tidak mengalihkan tanpa token", async () => {
    mockApi({});
    render(AuthSessionRedirect);
    await new Promise((r) => setTimeout(r, 20));
    expect(goto).not.toHaveBeenCalled();
  });

  it("tidak mengalihkan sebelum status login dan profil siap", async () => {
    authToken.set("tok");
    setPage("/auth/login");
    mockApi({});
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

  it("menampilkan status memuat saat pengecekan sesi belum selesai", async () => {
    authToken.set("tok");
    vi.spyOn(usersStore, "loadProfile").mockReturnValue(new Promise(() => {}));
    
    render(AuthSessionRedirect);
    await new Promise((r) => setTimeout(r, 20)); 
    
    expect(screen.getByText("Memuat...")).toBeInTheDocument();
    expect(goto).not.toHaveBeenCalled();
  });

  it("mengalihkan ke login jika tanpa token dan berada di halaman non-auth", async () => {
    authToken.set(null);
    setPage("/courses"); 
    render(AuthSessionRedirect);
    await waitFor(() => expect(goto).toHaveBeenCalledWith("/auth/login", { replaceState: true }));
  });

  it("tidak mengalihkan jika sudah login dan berada di halaman non-auth", async () => {
    authToken.set("tok");
    isAuthLogin.set(true);
    profile.set(sampleUser);
    setPage("/courses"); 
    render(AuthSessionRedirect);
    await new Promise((r) => setTimeout(r, 20));
    expect(goto).not.toHaveBeenCalled();
  });

  it("menggunakan fallback pathname '/' jika page.url.pathname kosong", async () => {
    authToken.set(null);
    setPage(""); 
    render(AuthSessionRedirect);
    await waitFor(() => expect(goto).toHaveBeenCalledWith("/auth/login", { replaceState: true }));
  });

  // --- TES BARU: MEMICU BLOK CATCH (Mengatasi Lines & Statements) ---
  it("menangani error dengan baik jika loadProfile melempar error (catch block)", async () => {
    authToken.set("tok");
    setPage("/courses"); // Berada di halaman non-auth

    // Paksa loadProfile melempar error jaringan
    vi.spyOn(usersStore, "loadProfile").mockRejectedValue(new Error("Network Error"));
    
    // Matikan sementara console.error agar tidak mengotori log test
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(AuthSessionRedirect);

    // Pastikan console.error terpanggil
    await waitFor(() => expect(consoleSpy).toHaveBeenCalledWith("Gagal memuat profil:", expect.any(Error)));
    
    // Karena kita menambahkan logout() di catch, token harusnya jadi null
    expect(get(authToken)).toBeNull();

    // Dan karena token null, $effect akan melempar ke halaman login
    await waitFor(() => expect(goto).toHaveBeenCalledWith("/auth/login", { replaceState: true }));
  });
});