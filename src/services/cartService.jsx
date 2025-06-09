import { request } from "./request";

const cartService = {
  addPT: (data) => request("POST", "v1/pt", data),
};

export default cartService;
