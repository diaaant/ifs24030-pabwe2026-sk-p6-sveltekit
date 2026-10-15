import { writable, type Writable } from "svelte/store";
import * as api from "../api/usersApi";
import { isSuccess } from "../../../helpers/apiHelper";

export const users = writable<any[]>([]);
export const profile = writable<any>(null);
export const isProfileUpdated = writable(false);
export const isPhotoUpdated = writable(false);
export const isPasswordChanged = writable(false);

export async function loadUsers() {
  const res = await api.getUsers();
  users.set(isSuccess(res) ? res.data.users : []);
  return res;
}

export async function loadProfile() {
  const res = await api.getMe();
  profile.set(isSuccess(res) ? res.data.user : null);
  return res;
}

async function mutate(call: () => Promise<any>, flag: Writable<boolean>) {
  const res = await call();
  if (isSuccess(res)) {
    flag.set(true);
    await loadProfile();
  }
  return res;
}

export const updateProfile = (data: { name: string; email: string }) => mutate(() => api.putMe(data), isProfileUpdated);
export const updatePhoto = (file: File) => mutate(() => api.postPhoto(file), isPhotoUpdated);

export async function changePassword(data: { password: string; new_password: string }) {
  const res = await api.putPassword(data);
  if (isSuccess(res)) isPasswordChanged.set(true);
  return res;
}

export function resetUsers() {
  users.set([]);
  profile.set(null);
  isProfileUpdated.set(false);
  isPhotoUpdated.set(false);
  isPasswordChanged.set(false);
}
