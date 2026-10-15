import { screen, fireEvent, waitFor } from "@testing-library/svelte";
import ContentModal from "./ContentModal.svelte";
import { renderWithProviders, mockApi, okResponse, sampleCourse } from "../../../test-utils";

const routes = {
  "POST /courses/c1/contents": okResponse({}, "Ditambah"),
  "PUT /courses/-/contents/k1": okResponse({}, "Diubah"),
  "GET /courses/c1": okResponse({ course: sampleCourse }),
};

describe("ContentModal", () => {
  it("mode tambah", async () => {
    const onClose = vi.fn();
    const fetchMock = mockApi(routes);
    renderWithProviders(ContentModal, { courseId: "c1", item: null, onClose });
    expect(screen.getByRole("dialog", { name: "Tambah Konten" })).toBeInTheDocument();
    await fireEvent.input(screen.getByLabelText("Judul materi"), { target: { value: "Bab 1" } });
    await fireEvent.input(screen.getByLabelText("Tautan YouTube"), { target: { value: "https://youtu.be/dQw4w9WgXcQ" } });
    await fireEvent.submit(screen.getByTestId("content-form"));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(fetchMock.mock.calls[0][1].method).toBe("POST");
  });

  it("mode ubah terisi data konten", async () => {
    const onClose = vi.fn();
    const fetchMock = mockApi(routes);
    renderWithProviders(ContentModal, { courseId: "c1", item: sampleCourse.contents[0], onClose });
    expect(screen.getByRole("dialog", { name: "Ubah Konten" })).toBeInTheDocument();
    expect(screen.getByLabelText("Judul materi")).toHaveValue("Pengantar");
    await fireEvent.submit(screen.getByTestId("content-form"));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(fetchMock.mock.calls[0][1].method).toBe("PUT");
  });
});
