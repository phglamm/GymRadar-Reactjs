import { request } from "./request";

const gymService = {
  addPT: (data) => request("POST", "v1/pt", data),
  getPTofGym: (params) => request("GET", "v1/pt", null, {}, params),
  deletePT: (id) => request("DELETE", `v1/pt/${id}`),

  getCourseOfGym: (params) => request("GET", "v1/course", null, {}, params),
  addCourse: (data) => request("POST", "v1/course", data),

  getSlotOfGym: (params) => request("GET", "v1/slot", null, {}, params),
  addSlot: (data) => request("POST", "v1/slot", data),
  deleteSlot: (id) => request("DELETE", `v1/slot/${id}`),

  addPTToCourse: (data) => request("POST", "v1/course-pt", data),
  getPTOfCourse: (id) => request("GET", `v1/course/${id}/pts`, null, {}),

  getRevenueOfGym: (params) =>
    request("GET", "v1/gym/me/dashboard", null, {}, params),
};

export default gymService;
