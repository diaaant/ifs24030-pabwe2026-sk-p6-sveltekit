import { request } from "../../../helpers/apiHelper";

export const getUsers = () => request("/users");
export const getMe = () => request("/users/me");
export const putMe = (data: { name: string; email: string }) => request("/users/me", { method: "PUT", body: data });
export const postPhoto = (file: File) => {
  const form = new FormData();
  form.append("photo", file);
  return request("/users/photo", { method: "POST", form });
};
export const putPassword = (data: { password: string; new_password: string }) =>
  request("/users/change-password", { method: "PUT", body: data });
