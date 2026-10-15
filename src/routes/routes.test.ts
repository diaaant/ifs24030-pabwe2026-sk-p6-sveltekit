import { screen, waitFor } from "@testing-library/svelte";
import { goto } from "$app/navigation";
import { ssr } from "./+layout";
import RootLayout from "./+layout.svelte";
import RootPage from "./+page.svelte";
import ErrorPage from "./+error.svelte";
import AuthLayoutRoute from "./auth/+layout.svelte";
import LoginRoute from "./auth/login/+page.svelte";
import RegisterRoute from "./auth/register/+page.svelte";
import CourseRoute from "./courses/[courseId]/+page.svelte";
import ContentRoute from "./courses/[courseId]/contents/[contentId]/+page.svelte";
import UsersRoute from "./users/+page.svelte";
import ProfileRoute from "./profile/+page.svelte";
import { renderWithProviders, mockApi, okResponse, snippet, setPage, resetAllStores, sampleUser, sampleCourse } from "../test-utils";
import { render } from "@testing-library/svelte";

const api = () =>
  mockApi({
    "GET /users/me": okResponse({ user: sampleUser }),
    "GET /users": okResponse({ users: [sampleUser] }),
    "GET /courses": okResponse({ courses: [sampleCourse] }),
    "GET /courses/c1": okResponse({ course: sampleCourse }),
    "GET /courses/-/contents/k1": okResponse({ course_content: sampleCourse.contents[0] }),
  });

describe("routes", () => {
  it("+layout.ts menonaktifkan SSR", () => {
    expect(ssr).toBe(false);
  });

  it("layout root: halaman auth tidak dibungkus CourseLayout dan tidak mengalihkan", () => {
    api();
    resetAllStores();
    setPage("/auth/login");
    render(RootLayout, { props: { children: snippet("<p>isi auth</p>") } });
    expect(screen.getByText("isi auth")).toBeInTheDocument();
    expect(screen.queryByText("Delcom Courses")).toBeNull();
    expect(goto).not.toHaveBeenCalled();
  });

  it("layout root: tanpa token dialihkan ke login", async () => {
    api();
    renderWithProviders(RootLayout, { children: snippet("<p>isi</p>") });
    await waitFor(() => expect(goto).toHaveBeenCalledWith("/auth/login", { replaceState: true }));
  });

  it("layout root: dengan token dibungkus CourseLayout", () => {
    api();
    renderWithProviders(RootLayout, { children: snippet("<p>isi</p>") }, { token: "t", user: sampleUser });
    expect(screen.getByText("Delcom Courses")).toBeInTheDocument();
    expect(screen.getByText("isi")).toBeInTheDocument();
    expect(goto).not.toHaveBeenCalled();
  });

  it("halaman beranda menampilkan daftar kursus", async () => {
    api();
    renderWithProviders(RootPage, {}, { token: "t", user: sampleUser });
    await waitFor(() => expect(screen.getByText("Dasar Svelte")).toBeInTheDocument());
  });

  it("halaman error menampilkan 404", () => {
    renderWithProviders(ErrorPage);
    expect(screen.getByText("Halaman tidak ditemukan")).toBeInTheDocument();
  });

  it("layout auth membungkus halaman dengan AuthLayout", () => {
    api();
    renderWithProviders(AuthLayoutRoute, { children: snippet("<p>form</p>") });
    expect(screen.getByText("Delcom Courses")).toBeInTheDocument();
    expect(screen.getByText("form")).toBeInTheDocument();
  });

  it("halaman login dan register", () => {
    renderWithProviders(LoginRoute);
    expect(screen.getByTestId("login-form")).toBeInTheDocument();
  });

  it("halaman register", () => {
    renderWithProviders(RegisterRoute);
    expect(screen.getByTestId("register-form")).toBeInTheDocument();
  });

  it("halaman detail kursus memakai param courseId", async () => {
    api();
    resetAllStores();
    setPage("/courses/c1", { courseId: "c1" });
    render(CourseRoute);
    await waitFor(() => expect(screen.getByTestId("detail-title")).toHaveTextContent("Dasar Svelte"));
  });

  it("halaman konten memakai param courseId dan contentId", async () => {
    api();
    resetAllStores();
    setPage("/courses/c1/contents/k1", { courseId: "c1", contentId: "k1" });
    render(ContentRoute);
    await waitFor(() => expect(screen.getByTestId("content-title")).toHaveTextContent("Pengantar"));
  });

  it("halaman pengguna dan profil", async () => {
    api();
    renderWithProviders(UsersRoute);
    await waitFor(() => expect(screen.getByText("dian@example.com")).toBeInTheDocument());
  });

  it("halaman profil", () => {
    api();
    renderWithProviders(ProfileRoute, {}, { user: sampleUser });
    expect(screen.getByTestId("profile-form")).toBeInTheDocument();
  });
});
