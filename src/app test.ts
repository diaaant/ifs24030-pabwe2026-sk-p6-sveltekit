import { describe, it, expect } from "vitest";
import { screen, waitFor, fireEvent } from "@testing-library/svelte";
import { goto } from "$app/navigation";
import { get } from "svelte/store";
import { authToken } from "./features/auth/states/authStore";
import { profile } from "./features/users/states/usersStore";
import {
  renderWithProviders,
  mockApi,
  okResponse,
  sampleUser,
} from "./test-utils";
import LoginRoute from "./routes/auth/login/+page.svelte";

describe("alur aplikasi", () => {
  it("login berhasil: sesi tersimpan lalu pengguna dialihkan ke beranda", async () => {
    mockApi({
      "POST /auth/login": okResponse({ token: "tok" }),
      "GET /users/me": okResponse({ user: sampleUser }),
    });

    renderWithProviders(LoginRoute);

    await fireEvent.input(screen.getByLabelText("Email"), {
      target: { value: "test@example.com" },
    });
    await fireEvent.input(screen.getByLabelText("Kata sandi"), {
      target: { value: "rahasia" },
    });
    await fireEvent.submit(screen.getByTestId("login-form"));

    // Ini memastikan kita mengecek persis seperti yang dipanggil komponen
    await waitFor(() =>
      expect(goto).toHaveBeenCalledWith("/", { replaceState: true }),
    );

    expect(get(authToken)).toBe("tok");
    expect(get(profile)).toEqual(sampleUser);
  });
});
