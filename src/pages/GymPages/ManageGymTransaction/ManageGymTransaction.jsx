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
import { FaEye, FaMoneyBillWave, FaFilter } from "react-icons/fa";
import { MdPayment } from "react-icons/md";
import { ImStatsBars } from "react-icons/im";
import transactionService from "../../../services/transactionServices";

export default function ManageGymTransaction() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isModalTransactionDetailOpen, setIsModalTransactionDetailOpen] =
    useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState([]);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchTransactions = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const response = await transactionService.getGymTransaction({
        page,
        size: pageSize,
      });
      const { items, total, page: currentPage, totalPages } = response.data;
      setTransactions(items);
      console.log("Transactions:", items);
      setPagination({
        current: currentPage,
        pageSize,
        total,
        totalPages,
      });
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Lỗi tải danh sách giao dịch");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleTableChange = (pagination) => {
    fetchTransactions(pagination.current, pagination.pageSize);
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
          fetchTransactions(pagination.current, pagination.pageSize);
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

  const columns = [
    {
      title: "Mã Giao Dịch",
      dataIndex: "id",
      key: "id",
      align: "center",
      width: 200,
      render: (id) => (
        <Tooltip title={id}>
          <span className="font-mono text-xs">{id.substring(0, 8)}...</span>
        </Tooltip>
      ),
    },
    // {
    //   title: "Khách Hàng",
    //   key: "customer",
    //   align: "center",
    //   render: (record) => (
    //     <div>
    //       <div className="font-medium">{record.user?.fullName || "N/A"}</div>
    //       <div className="text-xs text-gray-500">
    //         {record.user?.email || "N/A"}
    //       </div>
    //     </div>
    //   ),
    // },
    {
      title: "Phòng Gym",
      dataIndex: ["gym", "gymName"],
      key: "gymName",
      align: "center",
      render: (gymName) => gymName || "N/A",
    },
    {
      title: "Gói Tập",
      key: "package",
      align: "center",
      render: (record) => (
        <div>
          <div className="font-medium">{record.gym?.course?.name || "N/A"}</div>
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
      render: (value) =>
        value?.toLocaleString("vi", {
          style: "currency",
          currency: "VND",
        }) || "0 VNĐ",
    },
    {
      title: "Trạng Thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: "Ngày Tạo",
      dataIndex: "createAt",
      key: "createAt",
      align: "center",
      render: (date) =>
        date ? new Date(date).toLocaleDateString("vi-VN") : "N/A",
    },
    {
      title: "Hành Động",
      key: "action",
      align: "center",
      render: (text, record) => (
        <div className="flex justify-center items-center gap-2">
          <Tooltip title="Xem chi tiết">
            <FaEye
              onClick={() => {
                setSelectedTransaction(record);
                setIsModalTransactionDetailOpen(true);
              }}
              size={20}
              className="cursor-pointer text-blue-500 hover:text-blue-700"
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

  const filteredData = transactions.filter((item) => {
    const matchesSearch = searchText
      ? (item.gym?.gymName?.toLowerCase() || "").includes(
          searchText.toLowerCase()
        ) ||
        (item.gym?.course?.name?.toLowerCase() || "").includes(
          searchText.toLowerCase()
        ) ||
        (item.user?.fullName?.toLowerCase() || "").includes(
          searchText.toLowerCase()
        )
      : true;

    const matchesStatus =
      statusFilter === "all" || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const stats = {
    total: transactions.length,
    completed: transactions.filter((t) => t.status === "COMPLETED").length,
    pending: transactions.filter((t) => t.status === "PENDING").length,
    failed: transactions.filter((t) => t.status === "FAILED").length,
    totalRevenue: transactions
      .filter((t) => t.status === "COMPLETED")
      .reduce((sum, t) => sum + (t.price || 0), 0),
  };

  if (loading) {
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
          <MdPayment />
          Quản Lý Giao Dịch
        </h1>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
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
        </div>
      </div>

      <ConfigProvider
        theme={{ components: { Table: { headerBg: "#FFE5E9" } } }}
      >
        {/* Filters */}
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Input
              placeholder="Tìm kiếm theo tên gym, gói tập, khách hàng..."
              prefix={<SearchOutlined />}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 300 }}
              allowClear
            />

            <Select
              placeholder="Lọc theo trạng thái"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 150 }}
            >
              <Select.Option value="all">Tất cả</Select.Option>
              <Select.Option value="COMPLETED">Thành công</Select.Option>
              <Select.Option value="PENDING">Đang xử lý</Select.Option>
              <Select.Option value="FAILED">Thất bại</Select.Option>
            </Select>
          </div>

          <Button
            icon={<ImStatsBars />}
            className="!bg-[#FF914D] !text-white !border-0 hover:!bg-[#e8823d]"
          >
            Xuất báo cáo
          </Button>
        </div>

        <Table
          dataSource={filteredData}
          columns={columns}
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
          scroll={{ x: 1200 }}
          size="middle"
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
        width={800}
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
              </div>
            </Card>

            <Card title="Thông tin khách hàng" size="small">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>Họ tên:</strong>
                  <div className="mt-1">
                    {selectedTransaction.user?.fullName || "N/A"}
                  </div>
                </div>
                <div>
                  <strong>Email:</strong>
                  <div className="mt-1">
                    {selectedTransaction.user?.email || "N/A"}
                  </div>
                </div>
                <div>
                  <strong>Số điện thoại:</strong>
                  <div className="mt-1">
                    {selectedTransaction.user?.phone || "N/A"}
                  </div>
                </div>
                <div>
                  <strong>Địa chỉ:</strong>
                  <div className="mt-1">
                    {selectedTransaction.user?.address || "N/A"}
                  </div>
                </div>
              </div>
            </Card>

            <Card title="Thông tin gói tập" size="small">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>Phòng gym:</strong>
                  <div className="mt-1">
                    {selectedTransaction.gym?.gymName || "N/A"}
                  </div>
                </div>
                <div>
                  <strong>Tên gói:</strong>
                  <div className="mt-1">
                    {selectedTransaction.gym?.course?.name || "N/A"}
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
                      <strong>ID PT:</strong>
                      <div className="mt-1 font-mono text-sm">
                        {selectedTransaction.gym.pt.id}
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
