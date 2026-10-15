import { screen } from "@testing-library/svelte";
import NotFoundPage from "./NotFoundPage.svelte";
import { renderWithProviders } from "../../../test-utils";

describe("NotFoundPage", () => {
  it("menampilkan 404 dengan tautan ke beranda", () => {
    renderWithProviders(NotFoundPage);
    expect(screen.getByText("Halaman tidak ditemukan")).toBeInTheDocument();
    expect(screen.getByText("Kembali ke beranda")).toHaveAttribute("href", "/");
  });
});
