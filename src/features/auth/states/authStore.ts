import { writable } from "svelte/store";
import * as api from "../api/authApi";
import {
  getAccessToken,
  putAccessToken,
  removeAccessToken,
  isSuccess,
} from "../../../helpers/apiHelper";
import { loadProfile, resetUsers } from "../../users/states/usersStore";

export const authToken = writable<string | null>(getAccessToken());
export const isAuthLogin = writable(false);
export const isAuthRegister = writable(false);

export async function login(email: string, password: string) {
  const res = await api.postLogin({ email, password });
  if (isSuccess(res)) {
    putAccessToken(res.data.token);
    authToken.set(res.data.token);
    isAuthLogin.set(true);
    const profileRes = await loadProfile();
    if (!isSuccess(profileRes)) {
      logout();
      return profileRes;
    }
  }
  return res;
}

export async function register(name: string, email: string, password: string) {
  const res = await api.postRegister({ name, email, password });
  if (isSuccess(res)) isAuthRegister.set(true);
  return res;
}

export function logout() {
  removeAccessToken();
  authToken.set(null);
  isAuthLogin.set(false);
  resetUsers();
}
