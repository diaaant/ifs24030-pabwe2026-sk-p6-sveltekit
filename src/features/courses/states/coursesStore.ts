import { writable, type Writable } from "svelte/store";
import * as api from "../api/courseApi";
import { isSuccess } from "../../../helpers/apiHelper";

export const courses = writable<any[]>([]);
export const course = writable<any>(null);
export const content = writable<any>(null);

// Bendera mutasi: kursus, sampul, peserta, rating, dan konten.
export const isAdded = writable(false);
export const isChanged = writable(false);
export const isDeleted = writable(false);
export const isAllDeleted = writable(false);
export const isCoverChanged = writable(false);
export const isStudentChanged = writable(false);
export const isRated = writable(false);
export const isContentChanged = writable(false);

export async function loadCourses() {
  const res = await api.getCourses();
  courses.set(isSuccess(res) ? res.data.courses : []);
  return res;
}

export async function loadCourse(id: string) {
  const res = await api.getCourse(id);
  course.set(
    isSuccess(res)
      ? {
          ...res.data.course,
          students: res.data.course.students || [],
          ratings: res.data.course.ratings || [],
          contents: res.data.course.contents || [],
        }
      : null
  );
  return res;
}

export async function loadContent(contentId: string) {
  const res = await api.getContent(contentId);
  content.set(isSuccess(res) ? res.data.course_content : null);
  return res;
}

async function mutate(call: () => Promise<any>, flag: Writable<boolean>, reload: () => Promise<unknown>) {
  const res = await call();
  if (isSuccess(res)) {
    flag.set(true);
    await reload();
  }
  return res;
}

export const addCourse = (data: api.CourseInput) =>
  mutate(() => api.postCourse(data), isAdded, loadCourses);
export const changeCourse = (id: string, data: api.CourseInput) =>
  mutate(() => api.putCourse(id, data), isChanged, () => loadCourse(id));
export const changeCover = (id: string, file: File) =>
  mutate(() => api.postCover(id, file), isCoverChanged, () => loadCourse(id));
export const removeCourse = (id: string) =>
  mutate(() => api.deleteCourse(id), isDeleted, loadCourses);
export const removeAllCourses = () =>
  mutate(() => api.deleteAllCourses(), isAllDeleted, loadCourses);

export const joinCourse = (id: string) =>
  mutate(() => api.postStudent(id), isStudentChanged, () => loadCourse(id));
export const leaveCourse = (id: string) =>
  mutate(() => api.deleteStudent(id), isStudentChanged, () => loadCourse(id));
export const rateCourse = (id: string, rating: number) =>
  mutate(() => api.postRating(id, rating), isRated, () => loadCourse(id));

export const addContent = (id: string, data: api.ContentInput) =>
  mutate(() => api.postContent(id, data), isContentChanged, () => loadCourse(id));
export const changeContent = (id: string, contentId: string, data: api.ContentInput) =>
  mutate(() => api.putContent(contentId, data), isContentChanged, () => loadCourse(id));
export const removeContent = (id: string, contentId: string) =>
  mutate(() => api.deleteContent(contentId), isContentChanged, () => loadCourse(id));
export const setLearnStatus = (contentId: string, status: 0 | 1) =>
  mutate(() => api.putLearnStatus(contentId, status), isContentChanged, () => loadContent(contentId));

export function resetCourses() {
  courses.set([]);
  course.set(null);
  content.set(null);
  [isAdded, isChanged, isDeleted, isAllDeleted, isCoverChanged, isStudentChanged, isRated, isContentChanged].forEach(
    (flag) => flag.set(false)
  );
}
