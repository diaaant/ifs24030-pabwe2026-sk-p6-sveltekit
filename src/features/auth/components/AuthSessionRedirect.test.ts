import { get } from "svelte/store";
import { waitFor } from "@testing-library/svelte";
import { goto } from "$app/navigation";
import AuthSessionRedirect from "./AuthSessionRedirect.svelte";
import { authToken, isAuthLogin } from "../states/authStore";
import { profile } from "../../users/states/usersStore";
import { renderWithProviders, mockApi, okResponse, failResponse, sampleUser } from "../../../test-utils";

describe("AuthSessionRedirect", () => {
  it("tidak mengalihkan tanpa token", async () => {
    mockApi({});
    renderWithProviders(AuthSessionRedirect);
    await new Promise((r) => setTimeout(r, 20));
    expect(goto).not.toHaveBeenCalled();
  });

  it("tidak mengalihkan sebelum status login dan profil siap", async () => {
    renderWithProviders(AuthSessionRedirect, {}, { token: "tok", user: sampleUser });
    await new Promise((r) => setTimeout(r, 20));
    expect(goto).not.toHaveBeenCalled();
  });

  it("mengalihkan ke beranda setelah token, status login, dan profil siap", async () => {
    renderWithProviders(AuthSessionRedirect, {}, { token: "tok", user: sampleUser });
    isAuthLogin.set(true);
    await waitFor(() => expect(goto).toHaveBeenCalledWith("/"));
  });

  it("memulihkan sesi dari token tersimpan lalu mengalihkan", async () => {
    mockApi({ "GET /users/me": okResponse({ user: sampleUser }) });
    renderWithProviders(AuthSessionRedirect, {}, { token: "tok" });
    await waitFor(() => expect(get(profile)).toEqual(sampleUser));
    await waitFor(() => expect(goto).toHaveBeenCalledWith("/"));
  });

  it("logout bila token tersimpan tidak valid", async () => {
    mockApi({ "GET /users/me": failResponse() });
    renderWithProviders(AuthSessionRedirect, {}, { token: "tok" });
    await waitFor(() => expect(get(authToken)).toBeNull());
    expect(goto).not.toHaveBeenCalled();
  });
});
