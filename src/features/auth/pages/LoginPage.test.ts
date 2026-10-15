import Swal from "sweetalert2";
import { get } from "svelte/store";
import { screen, fireEvent, waitFor } from "@testing-library/svelte";
import LoginPage from "./LoginPage.svelte";
import { authToken } from "../states/authStore";
import { renderWithProviders, mockApi, okResponse, failResponse, sampleUser } from "../../../test-utils";

async function fillAndSubmit() {
  await fireEvent.input(screen.getByLabelText("Email"), { target: { value: "a@a.com" } });
  await fireEvent.input(screen.getByLabelText("Kata sandi"), { target: { value: "rahasia" } });
  await fireEvent.submit(screen.getByTestId("login-form"));
}

describe("LoginPage", () => {
  it("login berhasil menyimpan sesi", async () => {
    mockApi({
      "POST /auth/login": okResponse({ token: "tok" }),
      "GET /users/me": okResponse({ user: sampleUser }),
    });
    renderWithProviders(LoginPage);
    await fillAndSubmit();
    await waitFor(() => expect(get(authToken)).toBe("tok"));
    expect(Swal.fire).not.toHaveBeenCalled();
  });

  it("menampilkan dialog galat bila login gagal dan status memuat", async () => {
    let release: () => void = () => {};
    const gate = new Promise<void>((resolve) => (release = resolve));
    globalThis.fetch = vi.fn(async () => {
      await gate;
      return { json: async () => failResponse("Email atau sandi salah") };
    }) as any;
    renderWithProviders(LoginPage);
    await fillAndSubmit();
    expect(screen.getByRole("button", { name: "Memproses..." })).toBeDisabled();
    release();
    await waitFor(() =>
      expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "error" }))
    );
    expect(screen.getByRole("button", { name: "Masuk" })).toBeEnabled();
  });
});
