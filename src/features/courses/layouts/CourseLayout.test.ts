import { get } from "svelte/store";
import { screen, waitFor } from "@testing-library/svelte";
import CourseLayout from "./CourseLayout.svelte";
import { profile } from "../../users/states/usersStore";
import { authToken } from "../../auth/states/authStore";
import { renderWithProviders, mockApi, okResponse, failResponse, snippet, sampleUser } from "../../../test-utils";

describe("CourseLayout", () => {
  it("tidak memuat profil bila sudah ada", () => {
    const fetchMock = mockApi({});
    renderWithProviders(CourseLayout, { children: snippet("<p>konten</p>") }, { token: "t", user: sampleUser });
    expect(screen.getByText("konten")).toBeInTheDocument();
    expect(screen.getByText("Delcom Courses")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("memuat profil bila belum ada", async () => {
    mockApi({ "GET /users/me": okResponse({ user: sampleUser }) });
    renderWithProviders(CourseLayout, { children: snippet() }, { token: "t" });
    await waitFor(() => expect(get(profile)).toEqual(sampleUser));
  });

  it("logout otomatis bila profil gagal dimuat", async () => {
    mockApi({ "GET /users/me": failResponse() });
    renderWithProviders(CourseLayout, { children: snippet() }, { token: "t" });
    await waitFor(() => expect(get(authToken)).toBeNull());
  });
});
