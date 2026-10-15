import * as api from "./courseApi";
import { mockApi, okResponse } from "../../../test-utils";

describe("courseApi", () => {
  it("memanggil seluruh endpoint kursus", async () => {
    const keys = [
      "POST /courses", "POST /courses/1/cover", "PUT /courses/1", "GET /courses", "GET /courses/1",
      "DELETE /courses/1", "DELETE /courses", "POST /courses/1/students", "DELETE /courses/1/students",
      "POST /courses/1/ratings", "POST /courses/1/contents", "GET /courses/-/contents/2",
      "PUT /courses/-/contents/2", "DELETE /courses/-/contents/2", "PUT /courses/-/contents/2/learns",
    ];
    const fetchMock = mockApi(Object.fromEntries(keys.map((k) => [k, okResponse()])));
    await api.postCourse({ title: "a", description: "b" });
    await api.postCover("1", new File(["x"], "c.png"));
    await api.putCourse("1", { title: "a", description: "b" });
    await api.getCourses();
    await api.getCourse("1");
    await api.deleteCourse("1");
    await api.deleteAllCourses();
    await api.postStudent("1");
    await api.deleteStudent("1");
    await api.postRating("1", 5);
    await api.postContent("1", { title: "t", youtube: "y" });
    await api.getContent("2");
    await api.putContent("2", { title: "t", youtube: "y" });
    await api.deleteContent("2");
    await api.putLearnStatus("2", 1);
    const called = fetchMock.mock.calls.map(([u, o]: any) => `${o.method || "GET"} ${u.replace(DELCOM_BASEURL, "")}`);
    expect(called).toEqual(keys);
    expect(fetchMock.mock.calls[1][1].body.get("cover")).toBeInstanceOf(File);
    expect(JSON.parse(fetchMock.mock.calls[9][1].body)).toEqual({ rating: 5 });
    expect(JSON.parse(fetchMock.mock.calls[14][1].body)).toEqual({ status: 1 });
  });
});
