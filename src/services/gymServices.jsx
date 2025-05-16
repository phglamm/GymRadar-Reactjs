import create from "@ant-design/icons/lib/components/IconFont";
import axios from "axios";
import Cookies from "js-cookie";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const request = async (method, url, data = null, headers = {}, params = {}) => {
  try {
    const accessToken = Cookies.get("token")?.replaceAll('"', "");

    const authHeaders = accessToken
      ? { Authorization: `Bearer ${accessToken}` }
      : {};

    const response = await axios({
      method,
      url: `${API_BASE_URL}${url}`,
      data,
      params,
      headers: {
        ...authHeaders,
        ...headers,
      },
    });

    return response.data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

const gymService = {
  addPT: (data) => request("POST", "v1/pt", data),
  getPTofGym: (params) => request("GET", "v1/pt", null, {}, params),
  deletePT: (id) => request("DELETE", `v1/pt/${id}`),

  getCourseOfGym: (params) => request("GET", "v1/course", null, {}, params),
  addCourse: (data) => request("POST", "v1/course", data),

  getSlotOfGym: (params) => request("GET", "v1/slot", null, {}, params),
  addSlot: (data) => request("POST", "v1/slot", data),
  deleteSlot: (id) => request("DELETE", `v1/slot/${id}`),
};

export default gymService;
