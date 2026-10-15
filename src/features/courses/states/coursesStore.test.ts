import { get } from "svelte/store";
import * as store from "./coursesStore";
import { mockApi, okResponse, failResponse, resetAllStores, sampleCourse } from "../../../test-utils";

const base = {
  "GET /courses": okResponse({ courses: [sampleCourse] }),
  "GET /courses/c1": okResponse({ course: sampleCourse }),
  "GET /courses/-/contents/k1": okResponse({ course_content: sampleCourse.contents[0] }),
};

describe("coursesStore", () => {
  beforeEach(resetAllStores);

  it("loadCourses sukses dan gagal", async () => {
    mockApi(base);
    await store.loadCourses();
    expect(get(store.courses)).toEqual([sampleCourse]);
    mockApi({ "GET /courses": failResponse() });
    await store.loadCourses();
    expect(get(store.courses)).toEqual([]);
  });

  it("loadCourse sukses (dengan dan tanpa relasi) dan gagal", async () => {
    mockApi(base);
    await store.loadCourse("c1");
    expect(get(store.course).contents).toHaveLength(2);
    mockApi({ "GET /courses/c1": okResponse({ course: { id: "c1" } }) });
    await store.loadCourse("c1");
    expect(get(store.course)).toMatchObject({ students: [], ratings: [], contents: [] });
    mockApi({ "GET /courses/c1": failResponse() });
    await store.loadCourse("c1");
    expect(get(store.course)).toBeNull();
  });

  it("loadContent sukses dan gagal", async () => {
    mockApi(base);
    await store.loadContent("k1");
    expect(get(store.content).id).toBe("k1");
    mockApi({ "GET /courses/-/contents/k1": failResponse() });
    await store.loadContent("k1");
    expect(get(store.content)).toBeNull();
  });

  it("mutasi daftar kursus", async () => {
    mockApi({ ...base, "POST /courses": okResponse(), "DELETE /courses/c1": okResponse(), "DELETE /courses": okResponse() });
    await store.addCourse({ title: "a", description: "b" });
    await store.removeCourse("c1");
    await store.removeAllCourses();
    expect(get(store.isAdded)).toBe(true);
    expect(get(store.isDeleted)).toBe(true);
    expect(get(store.isAllDeleted)).toBe(true);
  });

  it("mutasi detail: data, sampul, peserta, rating, konten", async () => {
    mockApi({
      ...base,
      "PUT /courses/c1": okResponse(),
      "POST /courses/c1/cover": okResponse(),
      "POST /courses/c1/students": okResponse(),
      "DELETE /courses/c1/students": okResponse(),
      "POST /courses/c1/ratings": okResponse(),
      "POST /courses/c1/contents": okResponse(),
      "PUT /courses/-/contents/k1": okResponse(),
      "DELETE /courses/-/contents/k1": okResponse(),
      "PUT /courses/-/contents/k1/learns": okResponse(),
    });
    await store.changeCourse("c1", { title: "a", description: "b" });
    await store.changeCover("c1", new File(["x"], "c.png"));
    await store.joinCourse("c1");
    await store.leaveCourse("c1");
    await store.rateCourse("c1", 4);
    await store.addContent("c1", { title: "t", youtube: "y" });
    await store.changeContent("c1", "k1", { title: "t", youtube: "y" });
    await store.removeContent("c1", "k1");
    await store.setLearnStatus("k1", 1);
    for (const f of [store.isChanged, store.isCoverChanged, store.isStudentChanged, store.isRated, store.isContentChanged]) {
      expect(get(f)).toBe(true);
    }
    expect(get(store.course).id).toBe("c1");
    expect(get(store.content).id).toBe("k1");
  });

  it("mutasi gagal tidak menyalakan bendera; reset mengosongkan state", async () => {
    mockApi({ "POST /courses": failResponse() });
    await store.addCourse({ title: "a", description: "b" });
    expect(get(store.isAdded)).toBe(false);
    store.isAdded.set(true);
    store.course.set(sampleCourse);
    store.resetCourses();
    expect(get(store.isAdded)).toBe(false);
    expect(get(store.course)).toBeNull();
  });
});
