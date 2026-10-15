import Swal from "sweetalert2";
import { get } from "svelte/store";
import { screen, fireEvent, waitFor } from "@testing-library/svelte";
import CourseNavbar from "./CourseNavbar.svelte";
import { authToken } from "../../auth/states/authStore";
import { renderWithProviders, sampleUser } from "../../../test-utils";

describe("CourseNavbar", () => {
  it("menampilkan nama pengguna bila profil ada", () => {
    renderWithProviders(CourseNavbar, {}, { user: sampleUser });
    expect(screen.getByTestId("navbar-name")).toHaveTextContent("Dian");
  });

  it("tanpa profil tidak menampilkan nama", () => {
    renderWithProviders(CourseNavbar);
    expect(screen.queryByTestId("navbar-name")).toBeNull();
  });

  it("logout hanya berjalan bila dikonfirmasi", async () => {
    renderWithProviders(CourseNavbar, {}, { token: "tok", user: sampleUser });
    (Swal.fire as any).mockResolvedValueOnce({ isConfirmed: false });
    await fireEvent.click(screen.getByText("Keluar"));
    await waitFor(() => expect(Swal.fire).toHaveBeenCalled());
    expect(get(authToken)).toBe("tok");
    await fireEvent.click(screen.getByText("Keluar"));
    await waitFor(() => expect(get(authToken)).toBeNull());
  });
});
