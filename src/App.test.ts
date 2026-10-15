import { get } from "svelte/store";
import { render, screen, fireEvent, waitFor } from "@testing-library/svelte";
import { goto } from "$app/navigation";
import AuthLayoutRoute from "./routes/auth/+layout.svelte";
import LoginRoute from "./routes/auth/login/+page.svelte";
import RootLayout from "./routes/+layout.svelte";
import RootPage from "./routes/+page.svelte";
import { authToken } from "./features/auth/states/authStore";
import { profile } from "./features/users/states/usersStore";
import { resetAllStores, setPage, mockApi, okResponse, snippet, sampleUser, sampleCourse } from "./test-utils";

describe("alur aplikasi", () => {
  it("login berhasil: sesi tersimpan lalu pengguna dialihkan ke beranda", async () => {
    resetAllStores();
    setPage("/auth/login");
    mockApi({
      "POST /auth/login": okResponse({ token: "tok" }),
      "GET /users/me": okResponse({ user: sampleUser }),
    });
    render(AuthLayoutRoute, { props: { children: snippet() } });
    render(LoginRoute);
    await fireEvent.input(screen.getByLabelText("Email"), { target: { value: "a@a.com" } });
    await fireEvent.input(screen.getByLabelText("Kata sandi"), { target: { value: "rahasia" } });
    await fireEvent.submit(screen.getByTestId("login-form"));
    await waitFor(() => expect(goto).toHaveBeenCalledWith("/"));
    expect(get(authToken)).toBe("tok");
    expect(get(profile)).toEqual(sampleUser);
  });

  it("pengguna masuk melihat daftar kursus di dalam layout aplikasi", async () => {
    resetAllStores();
    mockApi({
      "GET /users/me": okResponse({ user: sampleUser }),
      "GET /courses": okResponse({ courses: [sampleCourse] }),
    });
    authToken.set("tok");
    render(RootLayout, { props: { children: snippet("<p>halaman</p>") } });
    await waitFor(() => expect(screen.getByTestId("navbar-name")).toHaveTextContent("Dian"));
    render(RootPage);
    await waitFor(() => expect(screen.getByText("Dasar Svelte")).toBeInTheDocument());
  });
});
