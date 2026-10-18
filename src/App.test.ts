import { describe, it, expect } from "vitest";
import { get } from "svelte/store";
import { render, screen, fireEvent, waitFor } from "@testing-library/svelte";
import { goto } from "$app/navigation";
import LoginRoute from "./routes/auth/login/+page.svelte";
// 1. IMPORT KOMPONEN REDIRECT
import AuthSessionRedirect from "./features/auth/components/AuthSessionRedirect.svelte"; 
import { authToken } from "./features/auth/states/authStore";
import { profile } from "./features/users/states/usersStore";
import { resetAllStores, setPage, mockApi, okResponse, sampleUser } from "./test-utils";

describe("alur aplikasi", () => {
  it("login berhasil: sesi tersimpan lalu pengguna dialihkan ke beranda", async () => {
    resetAllStores();
    setPage("/auth/login");

    mockApi({
      "POST /auth/login": okResponse({ token: "tok" }),
      "GET /users/me": okResponse({ user: sampleUser }),
    });

    // 2. RENDER KEDUA KOMPONEN
    render(LoginRoute);
    render(AuthSessionRedirect); 

    // 1. Isi form
    await fireEvent.input(screen.getByLabelText("Email"), { target: { value: "a@a.com" } });
    await fireEvent.input(screen.getByLabelText("Kata sandi"), { target: { value: "rahasia" } });
    
    // 2. Submit form menggunakan data-testid form
    await fireEvent.submit(screen.getByTestId("login-form"));

    // 3. Tunggu proses selesai dan pastikan goto terpanggil
    // Tambahkan { timeout: 3000 } karena AuthSessionRedirect harus fetch /users/me dulu sebelum redirect
    await waitFor(
      () => expect(goto).toHaveBeenCalledWith("/", expect.anything()), 
      { timeout: 3000 } 
    );
    
    expect(get(authToken)).toBe("tok");
    expect(get(profile)).toEqual(sampleUser);
  });
});