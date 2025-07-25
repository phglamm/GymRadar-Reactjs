import {
  Button,
  Card,
  ConfigProvider,
  DatePicker,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Tooltip,
} from "antd";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { LoadingOutlined, SearchOutlined } from "@ant-design/icons";
import {
  FaEye,
  FaMoneyBillWave,
  FaFilter,
  FaUsers,
  FaBuilding,
} from "react-icons/fa";
import { MdPayment, MdAdminPanelSettings } from "react-icons/md";
import { ImStatsBars } from "react-icons/im";
import transactionService from "../../../services/transactionServices";
import gymService from "../../../services/gymServices";
import adminService from "./../../../services/adminServices";

const { RangePicker } = DatePicker;

export default function ManageTransactionPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isModalTransactionDetailOpen, setIsModalTransactionDetailOpen] =
    useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState([]);
  const [gymFilter, setGymFilter] = useState("all");
  const [gyms, setGyms] = useState([]);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Helper to build filters safely
  const buildFilters = () => ({
    status: statusFilter,
    gymId: gymFilter,
    startDate: dateRange?.[0]?.isValid?.() && dateRange[0].format("YYYY-MM-DD"),
    endDate: dateRange?.[1]?.isValid?.() && dateRange[1].format("YYYY-MM-DD"),
    search: searchText,
  });

  // Fetch all transactions for admin
  const fetchTransactions = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const response = await transactionService.getAdminTransaction({
        page,
        size: pageSize,
      });

      const { items, total, page: currentPage, totalPages } = response.data;
      setTransactions(items || []);
      setPagination({
        current: currentPage,
        pageSize,
        total,
        totalPages,
      });
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error(
        error?.response?.data?.message ||
          "Lỗi tải danh sách giao dịch, vui lòng thử lại sau."
      );
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch gyms for filter dropdown
  const fetchGyms = async (page = 1, pageSize = 10000) => {
    try {
      const response = await adminService.getAllGym({
        page,
        size: pageSize,
      });
      setGyms(response.data.items || []);
    } catch (error) {
      console.error("Error fetching gyms:", error);
      toast.error(
        error?.response?.data?.message ||
          "Lỗi tải danh sách phòng gym, vui lòng thử lại sau."
      );
      setGyms([]);
    }
  };

  useEffect(() => {
    fetchTransactions();
    fetchGyms();
  }, []);

  // Only trigger fetch if gyms loaded (for gymFilter) and not loading
  useEffect(() => {
    if (loading) return;
    const filters = buildFilters();
    fetchTransactions(pagination.current, pagination.pageSize, filters);
    // eslint-disable-next-line
  }, [statusFilter, gymFilter, dateRange, searchText]);

  const handleTableChange = (newPagination) => {
    const filters = buildFilters();
    fetchTransactions(newPagination.current, newPagination.pageSize, filters);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "COMPLETED":
        return "green";
      case "PENDING":
        return "orange";
      case "FAILED":
        return "red";
      case "CANCELLED":
        return "default";
      default:
        return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "COMPLETED":
        return "Thành công";
      case "PENDING":
        return "Đang xử lý";
      case "FAILED":
        return "Thất bại";
      case "CANCELLED":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const handleUpdateTransactionStatus = async (transactionId, newStatus) => {
    Modal.confirm({
      title: `Bạn có chắc chắn muốn ${
        newStatus === "COMPLETED" ? "xác nhận" : "hủy"
      } giao dịch này không?`,
      onOk: async () => {
        try {
          await transactionService.updateTransactionStatus(
            transactionId,
            newStatus
          );
          const filters = buildFilters();
          fetchTransactions(pagination.current, pagination.pageSize, filters);
          toast.success(
            `${
              newStatus === "COMPLETED" ? "Xác nhận" : "Hủy"
            } giao dịch thành công`
          );
        } catch (error) {
          console.error("Error updating transaction:", error);
          toast.error(
            error.response?.data?.message || "Lỗi cập nhật trạng thái giao dịch"
          );
        }
      },
    });
  };

  const handleExportReport = async () => {
    setLoading(true);
    try {
      const filters = buildFilters();
      const response = await transactionService.exportTransactionReport(
        filters
      );

      // Handle file download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `transaction-report-${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("Xuất báo cáo thành công");
    } catch (error) {
      console.error("Error exporting report:", error);
      toast.error(
        error?.response?.data?.message ||
          "Lỗi xuất báo cáo, vui lòng thử lại sau."
      );
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Mã Giao Dịch",
      dataIndex: "id",
      key: "id",
      align: "center",
      width: 150,
      render: (id) => (
        <Tooltip title={id}>
          <span className="font-mono text-xs">
            {id ? id.substring(0, 8) + "..." : "N/A"}
          </span>
        </Tooltip>
      ),
    },
    // {
    //   title: "Khách Hàng",
    //   key: "customer",
    //   align: "center",
    //   width: 200,
    //   render: (record) => (
    //     <div>
    //       <div className="font-medium">
    //         {record.user?.fullName || "Chưa có thông tin"}
    //       </div>
    //       <div className="text-xs text-gray-500">
    //         {record.user?.email || "Chưa có email"}
    //       </div>
    //     </div>
    //   ),
    // },
    {
      title: "Phòng Gym",
      dataIndex: ["gym", "gymName"],
      key: "gymName",
      align: "center",
      width: 180,
      render: (gymName, record) => (
        <div>
          <div className="font-medium">{gymName || "N/A"}</div>
          <div className="text-xs text-gray-500">
            {record.gym?.address && `${record.gym.address.substring(0, 30)}...`}
          </div>
        </div>
      ),
    },
    {
      title: "Gói Tập",
      key: "package",
      align: "center",
      width: 200,
      render: (record) => (
        <div>
          <div className="font-medium">{record.gym?.course?.name || "N/A"}</div>
          <div className="text-xs text-gray-500">
            Thời hạn: {record.gym?.course?.duration || "N/A"} tháng
          </div>
          {record.gym?.pt && (
            <div className="text-xs text-blue-600">
              PT: {record.gym.pt.fullName}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Số Tiền",
      dataIndex: "price",
      key: "price",
      align: "center",
      width: 120,
      sorter: (a, b) => (a.price || 0) - (b.price || 0),
      render: (value) => (
        <span className="font-bold text-green-600">
          {value?.toLocaleString("vi", {
            style: "currency",
            currency: "VND",
          }) || "0 VNĐ"}
        </span>
      ),
    },
    {
      title: "Trạng Thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      width: 120,
      filters: [
        { text: "Thành công", value: "COMPLETED" },
        { text: "Đang xử lý", value: "PENDING" },
        { text: "Thất bại", value: "FAILED" },
        { text: "Đã hủy", value: "CANCELLED" },
      ],
      render: (status) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: "Ngày Tạo",
      dataIndex: "createAt",
      key: "createAt",
      align: "center",
      width: 120,
      sorter: (a, b) => {
        const dateA = a.createAt ? new Date(a.createAt) : new Date(0);
        const dateB = b.createAt ? new Date(b.createAt) : new Date(0);
        return dateA - dateB;
      },
      render: (date) => (
        <div>
          <div>{date ? new Date(date).toLocaleDateString("vi-VN") : "N/A"}</div>
          <div className="text-xs text-gray-500">
            {date ? new Date(date).toLocaleTimeString("vi-VN") : ""}
          </div>
        </div>
      ),
    },
    {
      title: "Hành Động",
      key: "action",
      align: "center",
      width: 200,
      render: (text, record) => (
        <div className="flex justify-center items-center gap-2">
          <Tooltip title="Xem chi tiết">
            <Button
              size="small"
              icon={<FaEye />}
              onClick={() => {
                setSelectedTransaction(record);
                setIsModalTransactionDetailOpen(true);
              }}
              className="text-blue-500 hover:text-blue-700"
            />
          </Tooltip>

          {record.status === "PENDING" && (
            <>
              <Tooltip title="Xác nhận giao dịch">
                <Button
                  size="small"
                  type="primary"
                  onClick={() =>
                    handleUpdateTransactionStatus(record.id, "COMPLETED")
                  }
                  className="bg-green-500 hover:bg-green-600 border-0"
                >
                  Xác nhận
                </Button>
              </Tooltip>

              <Tooltip title="Hủy giao dịch">
                <Button
                  size="small"
                  danger
                  onClick={() =>
                    handleUpdateTransactionStatus(record.id, "FAILED")
                  }
                >
                  Hủy
                </Button>
              </Tooltip>
            </>
          )}
        </div>
      ),
    },
  ];

  // Calculate statistics - handle empty arrays safely
  const stats = {
    total: transactions.length,
    completed: transactions.filter((t) => t.status === "COMPLETED").length,
    pending: transactions.filter((t) => t.status === "PENDING").length,
    failed: transactions.filter((t) => t.status === "FAILED").length,
    cancelled: transactions.filter((t) => t.status === "CANCELLED").length,
    totalRevenue: transactions
      .filter((t) => t.status === "COMPLETED")
      .reduce((sum, t) => sum + (t.price || 0), 0),
    pendingRevenue: transactions
      .filter((t) => t.status === "PENDING")
      .reduce((sum, t) => sum + (t.price || 0), 0),
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spin
          indicator={
            <LoadingOutlined style={{ fontSize: 48, color: "#FF914D" }} spin />
          }
          tip="Đang tải giao dịch..."
          size="large"
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#ED2A46] flex items-center gap-2 mb-4">
          <MdAdminPanelSettings />
          Quản Lý Giao Dịch (Admin)
        </h1>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
          <Card className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {stats.total}
            </div>
            <div className="text-gray-600">Tổng giao dịch</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.completed}
            </div>
            <div className="text-gray-600">Thành công</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {stats.pending}
            </div>
            <div className="text-gray-600">Đang xử lý</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {stats.failed}
            </div>
            <div className="text-gray-600">Thất bại</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-[#ED2A46]">
              {stats.totalRevenue.toLocaleString("vi", {
                style: "currency",
                currency: "VND",
              })}
            </div>
            <div className="text-gray-600">Doanh thu</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pendingRevenue.toLocaleString("vi", {
                style: "currency",
                currency: "VND",
              })}
            </div>
            <div className="text-gray-600">Chờ xử lý</div>
          </Card>
        </div>
      </div>

      <ConfigProvider
        theme={{ components: { Table: { headerBg: "#FFE5E9" } } }}
      >
        {/* Advanced Filters */}
        <Card
          className="mb-4"
          title={
            <span className="flex items-center gap-2">
              <FaFilter /> Bộ lọc nâng cao
            </span>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Tìm kiếm theo mã giao dịch, gym..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />

            <Select
              placeholder="Lọc theo trạng thái"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: "100%" }}
            >
              <Select.Option value="all">Tất cả trạng thái</Select.Option>
              <Select.Option value="COMPLETED">Thành công</Select.Option>
              <Select.Option value="PENDING">Đang xử lý</Select.Option>
              <Select.Option value="FAILED">Thất bại</Select.Option>
              <Select.Option value="CANCELLED">Đã hủy</Select.Option>
            </Select>

            <Select
              placeholder="Lọc theo phòng gym"
              value={gymFilter}
              onChange={setGymFilter}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.children ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              notFoundContent={gyms.length === 0 ? "Không có phòng gym" : null}
            >
              <Select.Option value="all">Tất cả phòng gym</Select.Option>
              {gyms.map((gym) => (
                <Select.Option key={gym.id} value={gym.id}>
                  {gym.gymName}
                </Select.Option>
              ))}
            </Select>

            <RangePicker
              placeholder={["Từ ngày", "Đến ngày"]}
              value={dateRange}
              onChange={(dates) => {
                if (!dates || dates.length !== 2) {
                  setDateRange([]);
                } else {
                  setDateRange(dates);
                }
              }}
              style={{ width: "100%" }}
              format="DD/MM/YYYY"
            />
          </div>

          <div className="flex justify-end mt-4">
            <Button
              icon={<ImStatsBars />}
              onClick={handleExportReport}
              className="bg-[#FF914D] text-white border-0 hover:bg-[#e8823d]"
              loading={loading}
            >
              Xuất báo cáo Excel
            </Button>
          </div>
        </Card>

        <Table
          dataSource={transactions}
          columns={columns}
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            position: ["bottomCenter"],
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} giao dịch`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 1400 }}
          size="middle"
          rowKey="id"
        />
      </ConfigProvider>

      {/* Transaction Detail Modal */}
      <Modal
        open={isModalTransactionDetailOpen}
        onCancel={() => setIsModalTransactionDetailOpen(false)}
        title={
          <p className="text-2xl font-bold text-[#ED2A46] flex items-center gap-2">
            <FaMoneyBillWave />
            Chi Tiết Giao Dịch
          </p>
        }
        footer={null}
        width={900}
      >
        {selectedTransaction && (
          <div className="space-y-4">
            <Card title="Thông tin giao dịch" size="small">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>Mã giao dịch:</strong>
                  <div className="font-mono text-sm bg-gray-100 p-2 rounded mt-1">
                    {selectedTransaction.id}
                  </div>
                </div>
                <div>
                  <strong>Trạng thái:</strong>
                  <div className="mt-1">
                    <Tag color={getStatusColor(selectedTransaction.status)}>
                      {getStatusText(selectedTransaction.status)}
                    </Tag>
                  </div>
                </div>
                <div>
                  <strong>Số tiền:</strong>
                  <div className="text-lg font-bold text-[#ED2A46] mt-1">
                    {selectedTransaction.price?.toLocaleString("vi", {
                      style: "currency",
                      currency: "VND",
                    }) || "0 VNĐ"}
                  </div>
                </div>
                <div>
                  <strong>Ngày tạo:</strong>
                  <div className="mt-1">
                    {selectedTransaction.createAt
                      ? new Date(selectedTransaction.createAt).toLocaleString(
                          "vi-VN"
                        )
                      : "N/A"}
                  </div>
                </div>
                <div>
                  <strong>Phương thức thanh toán:</strong>
                  <div className="mt-1">
                    {selectedTransaction.paymentMethod || "N/A"}
                  </div>
                </div>
                <div>
                  <strong>Mã tham chiếu:</strong>
                  <div className="mt-1 font-mono text-sm">
                    {selectedTransaction.referenceId || "N/A"}
                  </div>
                </div>
              </div>
            </Card>

            <Card title="Thông tin khách hàng" size="small">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>Họ tên:</strong>
                  <div className="mt-1">
                    {selectedTransaction.user?.fullName || "Chưa có thông tin"}
                  </div>
                </div>
                <div>
                  <strong>Email:</strong>
                  <div className="mt-1">
                    {selectedTransaction.user?.email || "Chưa có thông tin"}
                  </div>
                </div>
                <div>
                  <strong>Số điện thoại:</strong>
                  <div className="mt-1">
                    {selectedTransaction.user?.phone || "Chưa có thông tin"}
                  </div>
                </div>
                <div>
                  <strong>Địa chỉ:</strong>
                  <div className="mt-1">
                    {selectedTransaction.user?.address || "Chưa có thông tin"}
                  </div>
                </div>
              </div>
            </Card>

            <Card title="Thông tin phòng gym & gói tập" size="small">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>Phòng gym:</strong>
                  <div className="mt-1">
                    {selectedTransaction.gym?.gymName || "N/A"}
                  </div>
                </div>
                <div>
                  <strong>Địa chỉ gym:</strong>
                  <div className="mt-1">
                    {selectedTransaction.gym?.address || "N/A"}
                  </div>
                </div>
                <div>
                  <strong>Tên gói:</strong>
                  <div className="mt-1">
                    {selectedTransaction.gym?.course?.name || "N/A"}
                  </div>
                </div>
                <div>
                  <strong>Thời hạn:</strong>
                  <div className="mt-1">
                    {selectedTransaction.gym?.course?.duration || "N/A"} tháng
                  </div>
                </div>
                {selectedTransaction.gym?.pt && (
                  <>
                    <div>
                      <strong>Personal Trainer:</strong>
                      <div className="mt-1">
                        {selectedTransaction.gym.pt.fullName}
                      </div>
                    </div>
                    <div>
                      <strong>Email PT:</strong>
                      <div className="mt-1">
                        {selectedTransaction.gym.pt.email || "N/A"}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </Card>

            {selectedTransaction.status === "PENDING" && (
              <div className="flex justify-center gap-4 pt-4">
                <Button
                  type="primary"
                  size="large"
                  className="bg-green-500 hover:bg-green-600 border-0"
                  onClick={() => {
                    handleUpdateTransactionStatus(
                      selectedTransaction.id,
                      "COMPLETED"
                    );
                    setIsModalTransactionDetailOpen(false);
                  }}
                >
                  Xác nhận giao dịch
                </Button>
                <Button
                  danger
                  size="large"
                  onClick={() => {
                    handleUpdateTransactionStatus(
                      selectedTransaction.id,
                      "FAILED"
                    );
                    setIsModalTransactionDetailOpen(false);
                  }}
                >
                  Hủy giao dịch
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
