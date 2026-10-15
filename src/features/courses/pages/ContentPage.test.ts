import { screen, fireEvent, waitFor } from "@testing-library/svelte";
import ContentPage from "./ContentPage.svelte";
import { renderWithProviders, mockApi, okResponse } from "../../../test-utils";

const done = { id: "k1", title: "Pengantar", youtube: "https://youtu.be/dQw4w9WgXcQ", status: 1 };
const todo = { ...done, status: 0 };
const invalid = { ...done, youtube: "https://contoh.com" };

const routes = (content: any) => ({
  "GET /courses/-/contents/k1": okResponse({ course_content: content }),
  "PUT /courses/-/contents/k1/learns": okResponse({}, "Status diperbarui"),
});

describe("ContentPage", () => {
  it("status memuat lalu pemutar video dan tombol tandai selesai", async () => {
    const fetchMock = mockApi(routes(todo));
    renderWithProviders(ContentPage, { courseId: "c1", contentId: "k1" });
    expect(screen.getByTestId("loading")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByTestId("content-title")).toHaveTextContent("Pengantar"));
    expect(screen.getByTitle("Pengantar")).toHaveAttribute("src", "https://www.youtube.com/embed/dQw4w9WgXcQ");
    expect(screen.getByText("← Kembali ke kursus")).toHaveAttribute("href", "/courses/c1");
    await fireEvent.click(screen.getByText("Tandai selesai"));
    await waitFor(() => {
      const put = fetchMock.mock.calls.find(([, o]: any) => o.method === "PUT");
      expect(JSON.parse(put[1].body)).toEqual({ status: 1 });
    });
  });

  it("tombol tandai belum selesai mengirim status 0", async () => {
    const fetchMock = mockApi(routes(done));
    renderWithProviders(ContentPage, { courseId: "c1", contentId: "k1" });
    await waitFor(() => expect(screen.getByText("Tandai belum selesai")).toBeInTheDocument());
    await fireEvent.click(screen.getByText("Tandai belum selesai"));
    await waitFor(() => {
      const put = fetchMock.mock.calls.find(([, o]: any) => o.method === "PUT");
      expect(JSON.parse(put[1].body)).toEqual({ status: 0 });
    });
  });

  it("menampilkan pesan bila tautan video tidak valid", async () => {
    mockApi(routes(invalid));
    renderWithProviders(ContentPage, { courseId: "c1", contentId: "k1" });
    await waitFor(() => expect(screen.getByTestId("invalid-video")).toBeInTheDocument());
    expect(screen.queryByTitle("Pengantar")).toBeNull();
  });
});
