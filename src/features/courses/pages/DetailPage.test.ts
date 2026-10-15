import Swal from "sweetalert2";
import { screen, fireEvent, waitFor } from "@testing-library/svelte";
import DetailPage from "./DetailPage.svelte";
import { renderWithProviders, mockApi, okResponse, sampleCourse, sampleUser } from "../../../test-utils";

const owner = sampleUser; // u1 pemilik kursus
const student = { id: "u2", name: "Budi", email: "b@e.com", photo: null };
const visitor = { id: "u3", name: "Cici", email: "c@e.com", photo: null };

const routes = (course: any = sampleCourse) => ({
  "GET /courses/c1": okResponse({ course }),
  "POST /courses/c1/students": okResponse({}, "Terdaftar"),
  "DELETE /courses/c1/students": okResponse({}, "Keluar"),
  "POST /courses/c1/ratings": okResponse({}, "Rating terkirim"),
  "DELETE /courses/-/contents/k1": okResponse({}, "Konten dihapus"),
  "POST /courses/c1/cover": okResponse({}, "Sampul diubah"),
  "POST /courses/c1/contents": okResponse({}, "Konten ditambah"),
  "PUT /courses/c1": okResponse({}, "Diubah"),
});

const calls = (fn: any) => fn.mock.calls.map(([u, o]: any) => `${o.method || "GET"} ${u.replace(DELCOM_BASEURL, "")}`);

describe("DetailPage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("pemilik: status memuat, detail, rating rata-rata, peserta, dan aksi pemilik", async () => {
    mockApi(routes());
    renderWithProviders(DetailPage, { courseId: "c1" }, { user: owner });
    expect(screen.getByTestId("loading")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByTestId("detail-title")).toHaveTextContent("Dasar Svelte"));
    expect(screen.getByTestId("rating-average")).toHaveTextContent("4.5 (2 rating)");
    expect(screen.getByTestId("owner-actions")).toBeInTheDocument();
    expect(screen.queryByTestId("student-actions")).toBeNull();
    expect(screen.getByTestId("student")).toHaveTextContent("Budi");
    expect(screen.getAllByTestId("content-item")).toHaveLength(2);
    expect(screen.getByText("Selesai")).toBeInTheDocument();
  });

  it("pemilik: tanpa peserta, tanpa konten, tanpa rating, dengan sampul", async () => {
    mockApi(routes({ ...sampleCourse, cover: "http://x/c.png", students: [], contents: [], ratings: [] }));
    renderWithProviders(DetailPage, { courseId: "c1" }, { user: owner });
    await waitFor(() => expect(screen.getByAltText("Dasar Svelte")).toBeInTheDocument());
    expect(screen.getByTestId("no-students")).toBeInTheDocument();
    expect(screen.getByTestId("no-contents")).toBeInTheDocument();
    expect(screen.getByTestId("rating-average")).toHaveTextContent("0.0 (0 rating)");
  });

  it("pemilik: membuka & menutup modal ubah data, sampul, dan konten", async () => {
    mockApi(routes());
    renderWithProviders(DetailPage, { courseId: "c1" }, { user: owner });
    await waitFor(() => expect(screen.getByTestId("owner-actions")).toBeInTheDocument());
    for (const [button, title] of [["Ubah data", "Ubah Kursus"], ["Ubah sampul", "Ubah Sampul"], ["Tambah konten", "Tambah Konten"]]) {
      await fireEvent.click(screen.getByText(button));
      expect(screen.getByRole("dialog", { name: title })).toBeInTheDocument();
      await fireEvent.click(screen.getByLabelText("Tutup"));
      expect(screen.queryByRole("dialog")).toBeNull();
    }
    await fireEvent.click(screen.getByLabelText("Ubah Pengantar"));
    expect(screen.getByRole("dialog", { name: "Ubah Konten" })).toBeInTheDocument();
  });

  it("pemilik: mengirim ubah data, sampul, dan konten baru sampai modal tertutup", async () => {
    mockApi(routes());
    renderWithProviders(DetailPage, { courseId: "c1" }, { user: owner });
    await waitFor(() => expect(screen.getByTestId("owner-actions")).toBeInTheDocument());

    await fireEvent.click(screen.getByText("Ubah data"));
    await fireEvent.submit(screen.getByTestId("change-form"));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());

    await fireEvent.click(screen.getByText("Ubah sampul"));
    await fireEvent.change(screen.getByTestId("cover-input"), { target: { files: [new File(["x"], "c.png")] } });
    await fireEvent.submit(screen.getByTestId("cover-form"));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());

    await fireEvent.click(screen.getByText("Tambah konten"));
    await fireEvent.input(screen.getByLabelText("Judul materi"), { target: { value: "Bab" } });
    await fireEvent.input(screen.getByLabelText("Tautan YouTube"), { target: { value: "https://youtu.be/dQw4w9WgXcQ" } });
    await fireEvent.submit(screen.getByTestId("content-form"));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("pemilik: hapus konten (dibatalkan lalu dikonfirmasi)", async () => {
    const fetchMock = mockApi(routes());
    renderWithProviders(DetailPage, { courseId: "c1" }, { user: owner });
    await waitFor(() => expect(screen.getAllByTestId("content-item")).toHaveLength(2));
    (Swal.fire as any).mockResolvedValueOnce({ isConfirmed: false });
    await fireEvent.click(screen.getByLabelText("Hapus Pengantar"));
    await waitFor(() => expect(Swal.fire).toHaveBeenCalled());
    expect(calls(fetchMock)).not.toContain("DELETE /courses/-/contents/k1");
    await fireEvent.click(screen.getByLabelText("Hapus Pengantar"));
    await waitFor(() => expect(calls(fetchMock)).toContain("DELETE /courses/-/contents/k1"));
  });

  it("peserta: memberi rating, melihat konten tanpa aksi pemilik, dan keluar kursus", async () => {
    const fetchMock = mockApi(routes());
    renderWithProviders(DetailPage, { courseId: "c1" }, { user: student });
    await waitFor(() => expect(screen.getByTestId("student-actions")).toBeInTheDocument());
    expect(screen.queryByTestId("owner-actions")).toBeNull();
    expect(screen.queryByText("Tambah konten")).toBeNull();
    expect(screen.queryByTestId("student")).toBeNull();
    expect(screen.queryByLabelText("Ubah Pengantar")).toBeNull();
    expect(screen.getAllByTestId("content-item")).toHaveLength(2);

    await fireEvent.click(screen.getByLabelText("Beri rating 5"));
    await waitFor(() => expect(calls(fetchMock)).toContain("POST /courses/c1/ratings"));

    (Swal.fire as any).mockResolvedValueOnce({ isConfirmed: false });
    await fireEvent.click(screen.getByText("Keluar dari kursus"));
    await waitFor(() => expect(Swal.fire).toHaveBeenCalled());
    expect(calls(fetchMock)).not.toContain("DELETE /courses/c1/students");
    await fireEvent.click(screen.getByText("Keluar dari kursus"));
    await waitFor(() => expect(calls(fetchMock)).toContain("DELETE /courses/c1/students"));
  });

  it("bukan peserta: bisa mendaftar dan materi terkunci", async () => {
    const fetchMock = mockApi(routes());
    renderWithProviders(DetailPage, { courseId: "c1" }, { user: visitor });
    await waitFor(() => expect(screen.getByText("Daftar kursus")).toBeInTheDocument());
    expect(screen.getByTestId("locked")).toBeInTheDocument();
    await fireEvent.click(screen.getByText("Daftar kursus"));
    await waitFor(() => expect(calls(fetchMock)).toContain("POST /courses/c1/students"));
  });

  it("tanpa profil diperlakukan sebagai bukan peserta", async () => {
    mockApi(routes());
    renderWithProviders(DetailPage, { courseId: "c1" });
    await waitFor(() => expect(screen.getByText("Daftar kursus")).toBeInTheDocument());
  });

  it("memperbarui rating dan jumlah peserta setelah data dimuat ulang", async () => {
    let loads = 0;
    const eka = { id: "u9", name: "Eka" };
    const versions = [
      sampleCourse,
      { ...sampleCourse, students: [...sampleCourse.students, eka], ratings: [{ rating: 4 }, { rating: 5 }, { rating: 4.5 }] },
      { ...sampleCourse, students: [...sampleCourse.students, eka], ratings: [{ rating: 5 }, { rating: 5 }, { rating: 5 }] },
      { ...sampleCourse, students: [eka], ratings: [{ rating: 1 }] },
    ];
    mockApi({
      ...routes(),
      "GET /courses/c1": () => okResponse({ course: versions[Math.min(loads++, versions.length - 1)] }),
    });
    renderWithProviders(DetailPage, { courseId: "c1" }, { user: owner });
    await waitFor(() => expect(screen.getByTestId("rating-average")).toHaveTextContent("4.5 (2 rating)"));
    const uploadCover = async () => {
      await fireEvent.click(screen.getByText("Ubah sampul"));
      await fireEvent.change(screen.getByTestId("cover-input"), { target: { files: [new File(["x"], "c.png")] } });
      await fireEvent.submit(screen.getByTestId("cover-form"));
      await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    };
    await uploadCover();
    await waitFor(() => expect(screen.getByTestId("rating-average")).toHaveTextContent("4.5 (3 rating)"));
    expect(screen.getByText("Peserta (2)")).toBeInTheDocument();
    await uploadCover();
    await waitFor(() => expect(screen.getByTestId("rating-average")).toHaveTextContent("5.0 (3 rating)"));
    await uploadCover();
    await waitFor(() => expect(screen.getByTestId("rating-average")).toHaveTextContent("1.0 (1 rating)"));
    expect(screen.getByText("Peserta (1)")).toBeInTheDocument();
  });
});
