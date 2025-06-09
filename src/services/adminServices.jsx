import { request } from "./request";

const adminService = {
  getAllGym: (params) => request("GET", "v1/gym", null, {}, params),
  addGym: (data) =>
    request("POST", "v1/gym", data, { "Content-Type": "multipart/form-data" }),
  getAllPT: (params) => request("GET", "v1/admin/get-pt", null, {}, params),
};

export default adminService;
