import { render, screen } from "@testing-library/svelte";
import AuthLayout from "./AuthLayout.svelte";
import { snippet } from "../../../test-utils";

describe("AuthLayout", () => {
  it("menampilkan identitas aplikasi dan konten anak", () => {
    render(AuthLayout, { props: { children: snippet("<p>isi form</p>") } });
    expect(screen.getByText("Delcom Courses")).toBeInTheDocument();
    expect(screen.getByText(/Belajar lewat kursus video/)).toBeInTheDocument();
    expect(screen.getByText("isi form")).toBeInTheDocument();
  });
});
