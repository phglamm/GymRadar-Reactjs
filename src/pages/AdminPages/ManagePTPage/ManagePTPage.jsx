import {
  ConfigProvider,
  Input,
  Spin,
  Table,
  Card,
  Row,
  Col,
  Statistic,
  Badge,
  Button,
  Select,
  Space,
  Tag,
  Avatar,
  Tooltip,
  Progress,
} from "antd";
import React, { useEffect, useState } from "react";
import adminService from "../../../services/adminServices";
import {
  LoadingOutlined,
  SearchOutlined,
  UserOutlined,
  TeamOutlined,
  HomeOutlined,
  TrophyOutlined,
  PlusOutlined,
  FilterOutlined,
  EyeOutlined,
  EditOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

const { Option } = Select;

export default function ManagePTPage() {
  const [pts, setPts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Mock statistics data - replace with real data from your API
  const [statistics, setStatistics] = useState({
    totalPTs: 0,
    activePTs: 0,
    inactivePTs: 0,
    totalClients: 0,
  });

  const fetchPT = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const response = await adminService.getAllPT({ page, size: pageSize });
      const { items, total, page: currentPage } = response.data;
      setPts(items);

      // Update statistics based on fetched data
      const activePTs = items.filter((pt) => pt.status === "active").length;
      const inactivePTs = items.filter((pt) => pt.status === "inactive").length;
      const totalClients = items.reduce(
        (sum, pt) => sum + (pt.clientCount || 0),
        0
      );

      setStatistics({
        totalPTs: total,
        activePTs,
        inactivePTs,
        totalClients,
      });

      setPagination({
        current: currentPage,
        pageSize,
        total,
      });
    } catch (error) {
      console.error("Error fetching Pts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPT();
  }, []);

  const handleTableChange = (pagination) => {
    fetchPT(pagination.current, pagination.pageSize);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "success";
      case "inactive":
        return "default";
      case "busy":
        return "warning";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return <CheckCircleOutlined />;
      case "inactive":
        return <ClockCircleOutlined />;
      case "busy":
        return <ExclamationCircleOutlined />;
      default:
        return <ClockCircleOutlined />;
    }
  };

  const columns = [
    {
      title: "PT",
      dataIndex: "fullName",
      key: "fullName",
      align: "left",
      render: (text, record) => (
        <div className="flex items-center gap-3">
          <Avatar
            size={40}
            src={record.avatar}
            icon={<UserOutlined />}
            style={{ backgroundColor: "#FF914D" }}
          />
          <div>
            <div className="font-medium text-gray-900">{text}</div>
            <div className="text-sm text-gray-500">{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Liên Hệ",
      dataIndex: "phone",
      key: "phone",
      align: "center",
      render: (text) => (
        <span className="text-gray-700">{text || "Chưa cập nhật"}</span>
      ),
    },
    {
      title: "Phòng Gym",
      dataIndex: "gymLocation",
      key: "gymLocation",
      align: "center",
      render: (text) => (
        <Tag icon={<HomeOutlined />} color="blue">
          {text || "Chưa phân công"}
        </Tag>
      ),
    },
    {
      title: "Khách Hàng",
      dataIndex: "clientCount",
      key: "clientCount",
      align: "center",
      render: (count) => (
        <div className="flex flex-col items-center">
          <Badge count={count || 0} showZero color="#FF914D" />
          <span className="text-xs text-gray-500 mt-1">khách hàng</span>
        </div>
      ),
    },
    {
      title: "Gói Tập",
      dataIndex: "packageCount",
      key: "packageCount",
      align: "center",
      render: (count) => (
        <div className="flex flex-col items-center">
          <TrophyOutlined style={{ fontSize: "16px", color: "#FFD700" }} />
          <span className="text-sm font-medium">{count || 0}</span>
          <span className="text-xs text-gray-500">gói tập</span>
        </div>
      ),
    },
    {
      title: "Đánh Giá",
      dataIndex: "rating",
      key: "rating",
      align: "center",
      render: (rating) => (
        <div className="flex flex-col items-center">
          <Progress
            type="circle"
            size={40}
            percent={(rating || 0) * 20}
            format={() => `${rating || 0}/5`}
            strokeColor="#FF914D"
          />
        </div>
      ),
    },
    {
      title: "Trạng Thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status) => (
        <Tag
          icon={getStatusIcon(status)}
          color={getStatusColor(status)}
          className="px-3 py-1"
        >
          {status === "active"
            ? "Hoạt động"
            : status === "inactive"
            ? "Không hoạt động"
            : status === "busy"
            ? "Bận"
            : "Không xác định"}
        </Tag>
      ),
    },
    {
      title: "Thao Tác",
      key: "actions",
      align: "center",
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              className="text-blue-600 hover:bg-blue-50"
              onClick={() => console.log("View", record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              className="text-orange-600 hover:bg-orange-50"
              onClick={() => console.log("Edit", record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const filteredData = pts.filter((item) => {
    const matchesSearch = searchText
      ? (item.fullName?.toLowerCase() || "").includes(searchText.toLowerCase())
      : true;

    const matchesStatus =
      statusFilter === "all" || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spin
          indicator={
            <LoadingOutlined style={{ fontSize: 48, color: "#FF914D" }} spin />
          }
          tip="Đang tải dữ liệu..."
          size="large"
        />
      </div>
    );
  }

  return (
    <div className="">
      <div className="">
        {/* Header */}
        <div className="">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Quản Lý Personal Trainer
          </h1>
          <p className="text-gray-600">
            Quản lý và theo dõi thông tin các huấn luyện viên cá nhân
          </p>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} className="mb-8">
          <Col xs={24} sm={12} lg={6}>
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <Statistic
                title="Tổng số PT"
                value={statistics.totalPTs}
                prefix={<UserOutlined style={{ color: "#FF914D" }} />}
                valueStyle={{
                  color: "#FF914D",
                  fontSize: "24px",
                  fontWeight: "bold",
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <Statistic
                title="PT Đang Hoạt Động"
                value={statistics.activePTs}
                prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
                valueStyle={{
                  color: "#52c41a",
                  fontSize: "24px",
                  fontWeight: "bold",
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <Statistic
                title="PT Không Hoạt Động"
                value={statistics.inactivePTs}
                prefix={<ClockCircleOutlined style={{ color: "#faad14" }} />}
                valueStyle={{
                  color: "#faad14",
                  fontSize: "24px",
                  fontWeight: "bold",
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <Statistic
                title="Tổng Khách Hàng"
                value={statistics.totalClients}
                prefix={<TeamOutlined style={{ color: "#1890ff" }} />}
                valueStyle={{
                  color: "#1890ff",
                  fontSize: "24px",
                  fontWeight: "bold",
                }}
              />
            </Card>
          </Col>
        </Row>

        {/* Main Content Card */}
        <Card className="border-0 shadow-lg">
          {/* Filters and Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                placeholder="Tìm kiếm theo tên PT..."
                prefix={<SearchOutlined className="text-gray-400" />}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 280 }}
                allowClear
                className="rounded-lg"
              />
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: 200 }}
                className="rounded-lg"
                suffixIcon={<FilterOutlined />}
              >
                <Option value="all">Tất cả trạng thái</Option>
                <Option value="active">Hoạt động</Option>
                <Option value="inactive">Không hoạt động</Option>
                <Option value="busy">Bận</Option>
              </Select>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-600">
              Hiển thị{" "}
              <span className="font-semibold text-orange-600">
                {filteredData.length}
              </span>{" "}
              trong tổng số{" "}
              <span className="font-semibold">{statistics.totalPTs}</span> PT
              {searchText && (
                <span>
                  {" "}
                  | Tìm kiếm: "
                  <span className="font-semibold text-blue-600">
                    {searchText}
                  </span>
                  "
                </span>
              )}
              {statusFilter !== "all" && (
                <span>
                  {" "}
                  | Lọc:{" "}
                  <Tag color={getStatusColor(statusFilter)} className="ml-1">
                    {statusFilter}
                  </Tag>
                </span>
              )}
            </span>
          </div>

          {/* Table */}
          <ConfigProvider
            theme={{
              components: {
                Table: {
                  headerBg: "linear-gradient(90deg, #FFE5E9 0%, #FFF0F2 100%)",
                  headerColor: "#333",
                  rowHoverBg: "#FFF9FA",
                },
              },
            }}
          >
            <Table
              dataSource={filteredData}
              columns={columns}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} của ${total} mục`,
                position: ["bottomCenter"],
                className: "custom-pagination",
              }}
              onChange={handleTableChange}
              className="rounded-lg overflow-hidden"
              scroll={{ x: 1200 }}
              rowKey="id"
            />
          </ConfigProvider>
        </Card>
      </div>

      <style jsx>{`
        .custom-pagination .ant-pagination-item-active {
          background: #ff914d;
          border-color: #ff914d;
        }
        .custom-pagination .ant-pagination-item-active a {
          color: white;
        }
        .custom-pagination .ant-pagination-item:hover {
          border-color: #ff914d;
        }
        .custom-pagination .ant-pagination-item:hover a {
          color: #ff914d;
        }
      `}</style>
    </div>
  );
}
