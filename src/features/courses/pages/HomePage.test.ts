import Swal from "sweetalert2";
import { screen, fireEvent, waitFor } from "@testing-library/svelte";
import HomePage from "./HomePage.svelte";
import { renderWithProviders, mockApi, okResponse, sampleCourse, sampleUser } from "../../../test-utils";

const other = { ...sampleCourse, id: "c2", user_id: "u2", title: "Resep", cover: "http://x/c.png" };
const routes = () => ({
  "GET /courses": okResponse({ courses: [sampleCourse, other] }),
  "DELETE /courses/c1": okResponse({}, "Dihapus"),
  "DELETE /courses": okResponse({}, "Semua dihapus"),
  "POST /courses": okResponse({}, "Dibuat"),
});

describe("HomePage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("menampilkan daftar kursus dengan cover atau placeholder", async () => {
    mockApi(routes());
    renderWithProviders(HomePage, {}, { user: sampleUser });
    await waitFor(() => expect(screen.getAllByTestId("card")).toHaveLength(2));
    expect(screen.getByAltText("Resep")).toBeInTheDocument();
    expect(screen.getByText("Dasar Svelte")).toHaveAttribute("href", "/courses/c1");
  });

  it("pencarian dan filter milik saya", async () => {
    mockApi(routes());
    renderWithProviders(HomePage, {}, { user: sampleUser });
    await waitFor(() => expect(screen.getAllByTestId("card")).toHaveLength(2));
    await fireEvent.input(screen.getByLabelText("Cari"), { target: { value: "resep" } });
    expect(screen.getAllByTestId("card")).toHaveLength(1);
    await fireEvent.input(screen.getByLabelText("Cari"), { target: { value: "" } });
    await fireEvent.click(screen.getByLabelText("Milik saya"));
    expect(screen.getAllByTestId("card")).toHaveLength(1);
    await fireEvent.input(screen.getByLabelText("Cari"), { target: { value: "zzz" } });
    expect(screen.getByTestId("empty")).toBeInTheDocument();
  });

  it("tanpa profil, tidak ada kursus yang dianggap milik saya", async () => {
    mockApi(routes());
    renderWithProviders(HomePage);
    await waitFor(() => expect(screen.getAllByTestId("card")).toHaveLength(2));
    await fireEvent.click(screen.getByLabelText("Milik saya"));
    expect(screen.getByTestId("empty")).toBeInTheDocument();
  });

  it("membuka dan menutup modal tambah", async () => {
    mockApi(routes());
    renderWithProviders(HomePage);
    await fireEvent.click(screen.getByText("Tambah"));
    expect(screen.getByRole("dialog", { name: "Tambah Kursus" })).toBeInTheDocument();
    await fireEvent.click(screen.getByLabelText("Tutup"));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("hapus satu kursus (dibatalkan lalu dikonfirmasi)", async () => {
    const fetchMock = mockApi(routes());
    renderWithProviders(HomePage, {}, { user: sampleUser });
    await waitFor(() => expect(screen.getAllByTestId("card")).toHaveLength(2));
    (Swal.fire as any).mockResolvedValueOnce({ isConfirmed: false });
    await fireEvent.click(screen.getByLabelText("Hapus Dasar Svelte"));
    await waitFor(() => expect(Swal.fire).toHaveBeenCalled());
    expect(fetchMock.mock.calls.some(([, o]: any) => o.method === "DELETE")).toBe(false);
    await fireEvent.click(screen.getByLabelText("Hapus Dasar Svelte"));
    await waitFor(() => expect(fetchMock.mock.calls.some(([u, o]: any) => o.method === "DELETE" && u.endsWith("/c1"))).toBe(true));
  });

  it("hapus semua (dibatalkan lalu dikonfirmasi)", async () => {
    const fetchMock = mockApi(routes());
    renderWithProviders(HomePage);
    (Swal.fire as any).mockResolvedValueOnce({ isConfirmed: false });
    await fireEvent.click(screen.getByText("Hapus semua"));
    await waitFor(() => expect(Swal.fire).toHaveBeenCalled());
    expect(fetchMock.mock.calls.some(([, o]: any) => o.method === "DELETE")).toBe(false);
    await fireEvent.click(screen.getByText("Hapus semua"));
    await waitFor(() => expect(fetchMock.mock.calls.some(([u, o]: any) => o.method === "DELETE" && u.endsWith("/courses"))).toBe(true));
  });
});
