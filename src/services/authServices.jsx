import { request } from "./request";

const authService = {
  login: (loginData) => request("POST", "v1/auth", loginData),
};

export default authService;
