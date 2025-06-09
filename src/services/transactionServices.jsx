import { request } from "./request";

const transactionService = {
  getGymTransaction: (params) =>
    request("GET", "v1/transaction/gym", null, {}, params),

  getAdminTransaction: (params) =>
    request("GET", "v1/admin/transaction", null, {}, params),
};

export default transactionService;
