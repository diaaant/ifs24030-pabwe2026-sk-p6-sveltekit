import { request } from "../../../helpers/apiHelper";

export const postLogin = (data: { email: string; password: string }) => request("/auth/login", { method: "POST", body: data });
export const postRegister = (data: { name: string; email: string; password: string }) => request("/auth/register", { method: "POST", body: data });
