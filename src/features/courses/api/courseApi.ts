import { request } from "../../../helpers/apiHelper";

const base = "/courses";

export type CourseInput = { title: string; description: string };
export type ContentInput = { title: string; youtube: string };

export const postCourse = (data: CourseInput) => request(base, { method: "POST", body: data });
export const postCover = (id: string, file: File) => {
  const form = new FormData();
  form.append("cover", file);
  return request(`${base}/${id}/cover`, { method: "POST", form });
};
export const putCourse = (id: string, data: CourseInput) =>
  request(`${base}/${id}`, { method: "PUT", body: data });
export const getCourses = () => request(base);
export const getCourse = (id: string) => request(`${base}/${id}`);
export const deleteCourse = (id: string) => request(`${base}/${id}`, { method: "DELETE" });
export const deleteAllCourses = () => request(base, { method: "DELETE" });

// Peserta
export const postStudent = (id: string) => request(`${base}/${id}/students`, { method: "POST" });
export const deleteStudent = (id: string) => request(`${base}/${id}/students`, { method: "DELETE" });

// Rating peserta (skala 1 sampai 5)
export const postRating = (id: string, rating: number) =>
  request(`${base}/${id}/ratings`, { method: "POST", body: { rating } });

// Konten
export const postContent = (id: string, data: ContentInput) =>
  request(`${base}/${id}/contents`, { method: "POST", body: data });
export const getContent = (contentId: string) => request(`${base}/-/contents/${contentId}`);
export const putContent = (contentId: string, data: ContentInput) =>
  request(`${base}/-/contents/${contentId}`, { method: "PUT", body: data });
export const deleteContent = (contentId: string) =>
  request(`${base}/-/contents/${contentId}`, { method: "DELETE" });
export const putLearnStatus = (contentId: string, status: 0 | 1) =>
  request(`${base}/-/contents/${contentId}/learns`, { method: "PUT", body: { status } });
