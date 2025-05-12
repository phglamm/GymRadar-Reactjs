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

const adminService = {
  getAllGym: () => request("GET", "category"),
  addGym: (data) => request("POST", "v1/gym", data),

  getAllUser: () => request("GET", "user/get-all"),
  getAllPT: () => request("GET", "pt/get-all"),
  getAllPackages: () => request("GET", "packages/get-all"),
};

export default adminService;
