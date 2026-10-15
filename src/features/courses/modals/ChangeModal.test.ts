import { screen, fireEvent, waitFor } from "@testing-library/svelte";
import ChangeModal from "./ChangeModal.svelte";
import { renderWithProviders, mockApi, okResponse, sampleCourse } from "../../../test-utils";

describe("ChangeModal", () => {
  it("terisi data lama dan menyimpan perubahan", async () => {
    const onClose = vi.fn();
    const fetchMock = mockApi({
      "PUT /courses/c1": okResponse({}, "Diubah"),
      "GET /courses/c1": okResponse({ course: sampleCourse }),
    });
    renderWithProviders(ChangeModal, { course: sampleCourse, onClose });
    expect(screen.getByLabelText("Judul")).toHaveValue("Dasar Svelte");
    await fireEvent.input(screen.getByLabelText("Judul"), { target: { value: "Baru" } });
    await fireEvent.input(screen.getByLabelText("Deskripsi"), { target: { value: "D" } });
    await fireEvent.submit(screen.getByTestId("change-form"));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ title: "Baru", description: "D" });
  });
});
