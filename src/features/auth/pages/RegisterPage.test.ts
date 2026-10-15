import Swal from "sweetalert2";
import { screen, fireEvent, waitFor } from "@testing-library/svelte";
import { goto } from "$app/navigation";
import RegisterPage from "./RegisterPage.svelte";
import { renderWithProviders, mockApi, okResponse, failResponse } from "../../../test-utils";

async function fillAndSubmit() {
  await fireEvent.input(screen.getByLabelText("Nama"), { target: { value: "Dian" } });
  await fireEvent.input(screen.getByLabelText("Email"), { target: { value: "a@a.com" } });
  await fireEvent.input(screen.getByLabelText("Kata sandi"), { target: { value: "rahasia" } });
  await fireEvent.submit(screen.getByTestId("register-form"));
}

describe("RegisterPage", () => {
  it("register berhasil lalu menuju login", async () => {
    mockApi({ "POST /auth/register": okResponse({}, "Akun dibuat") });
    renderWithProviders(RegisterPage);
    await fillAndSubmit();
    await waitFor(() => expect(goto).toHaveBeenCalledWith("/auth/login"));
  });

  it("menampilkan galat bila register gagal", async () => {
    mockApi({ "POST /auth/register": failResponse("Email terpakai") });
    renderWithProviders(RegisterPage);
    await fillAndSubmit();
    await waitFor(() =>
      expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "error" }))
    );
    expect(screen.getByRole("button", { name: "Daftar" })).toBeEnabled();
    expect(goto).not.toHaveBeenCalled();
  });
});
