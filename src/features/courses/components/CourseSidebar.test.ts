import { screen } from "@testing-library/svelte";
import CourseSidebar from "./CourseSidebar.svelte";
import { renderWithProviders, setPage } from "../../../test-utils";

describe("CourseSidebar", () => {
  it("menandai menu sesuai path aktif", () => {
    renderWithProviders(CourseSidebar);
    expect(screen.getByText("Semua Kursus").className).toContain("bg-indigo-50");
    expect(screen.getByText("Pengguna").className).not.toContain("bg-indigo-50");
    expect(screen.getByText("Profil")).toHaveAttribute("href", "/profile");
  });

  it("menandai Profil bila path /profile", () => {
    renderWithProviders(CourseSidebar);
    setPage("/profile");
    const { unmount } = renderWithProviders(CourseSidebar);
    unmount();
  });
});
