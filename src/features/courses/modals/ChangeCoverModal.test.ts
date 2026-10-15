import Swal from "sweetalert2";
import { screen, fireEvent, waitFor } from "@testing-library/svelte";
import ChangeCoverModal from "./ChangeCoverModal.svelte";
import { renderWithProviders, mockApi, okResponse, sampleCourse } from "../../../test-utils";

describe("ChangeCoverModal", () => {
  it("memperingatkan bila berkas kosong, lalu mengunggah", async () => {
    const onClose = vi.fn();
    const fetchMock = mockApi({
      "POST /courses/c1/cover": okResponse({}, "Sampul diubah"),
      "GET /courses/c1": okResponse({ course: sampleCourse }),
    });
    renderWithProviders(ChangeCoverModal, { courseId: "c1", onClose });
    await fireEvent.submit(screen.getByTestId("cover-form"));
    await waitFor(() => expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "warning" })));
    expect(fetchMock).not.toHaveBeenCalled();
    const file = new File(["x"], "c.png", { type: "image/png" });
    await fireEvent.change(screen.getByTestId("cover-input"), { target: { files: [file] } });
    await fireEvent.submit(screen.getByTestId("cover-form"));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(fetchMock.mock.calls[0][1].body.get("cover")).toBeInstanceOf(File);
  });
});
