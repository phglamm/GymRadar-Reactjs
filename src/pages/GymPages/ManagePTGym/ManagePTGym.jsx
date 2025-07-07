import {
  Button,
  Card,
  ConfigProvider,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Spin,
  Switch,
  Table,
  Row,
  Col,
  Statistic,
  Badge,
  Tag,
  Avatar,
  Tooltip,
  Progress,
} from "antd";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
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
  DeleteOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  PhoneOutlined,
  MailOutlined,
} from "@ant-design/icons";
import { FaPlus } from "react-icons/fa";
import gymService from "../../../services/gymServices";
import dayjs from "dayjs";
import { ImBin } from "react-icons/im";
import { MdEdit } from "react-icons/md";
import { IoBarbell } from "react-icons/io5";

const { Option } = Select;

export default function ManagePTGym() {
  const [pts, setPts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalAddGymOpen, setIsModalAddGymOpen] = useState(false);
  const [formAdd] = Form.useForm();
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Statistics state
  const [statistics, setStatistics] = useState({
    totalPTs: 0,
    activePTs: 0,
    inactivePTs: 0,
    totalClients: 0,
  });

  const fetchPTGym = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const response = await gymService.getPTofGym({ page, size: pageSize });
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
    fetchPTGym();
  }, []);

  const handleTableChange = (pagination) => {
    fetchPTGym(pagination.current, pagination.pageSize);
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

  const handleDelete = async (id) => {
    Modal.confirm({
      title: "Xác nhận xóa PT",
      content:
        "Bạn có chắc chắn muốn xóa PT này không? Hành động này không thể hoàn tác.",
      okText: "Xóa",
      cancelText: "Hủy",
      okType: "danger",
      onOk: async () => {
        try {
          const response = await gymService.deletePT(id);
          console.log("Delete PT response:", response);
          fetchPTGym();
          toast.success("Xóa PT thành công");
        } catch (error) {
          console.error("Error deleting PT:", error);
          toast.error(error.response?.data?.message || "Lỗi khi xóa PT");
        }
      },
    });
  };

  const columns = [
    {
      title: "Personal Trainer",
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
            <div className="font-medium text-gray-900">
              {text || "Chưa cập nhật"}
            </div>
            <div className="text-sm text-gray-500 flex items-center gap-2">
              <MailOutlined className="text-xs" />
              {record.email || "Chưa có email"}
            </div>
            {record.phone && (
              <div className="text-sm text-gray-500 flex items-center gap-2">
                <PhoneOutlined className="text-xs" />
                {record.phone}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Phòng Gym",
      dataIndex: "location",
      key: "location",
      align: "center",
      render: (text) => (
        <Tag icon={<HomeOutlined />} color="blue">
          {text || "Chưa phân công"}
        </Tag>
      ),
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
      align: "center",
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
      key: "action",
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
          <Tooltip title="Xóa">
            <Button
              type="text"
              icon={<DeleteOutlined />}
              className="text-red-600 hover:bg-red-50"
              onClick={() => handleDelete(record.id)}
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

  const handleAddPTGym = async (values) => {
    setLoadingAdd(true);
    console.log(values);
    const requestData = {
      phone: values.phone,
      email: values.email,
      password: values.password,
      createNewPT: {
        fullName: values.fullName,
        dob: dayjs(values.dob).format("YYYY-MM-DD"),
        weight: values.weight,
        height: values.height,
        goalTraining: values.goalTraining,
        experience: values.experience,
        gender: values.gender,
      },
    };
    console.log("Request Add PT Gym", requestData);
    try {
      const response = await gymService.addPT(requestData);
      toast.success("Thêm PT thành công");
      fetchPTGym();
      setIsModalAddGymOpen(false);
      formAdd.resetFields();
      console.log(response);
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Lỗi thêm PT thất bại");
    } finally {
      setLoadingAdd(false);
    }
  };

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Quản Lý Personal Trainer Gym
          </h1>
          <p className="text-gray-600">
            Quản lý và theo dõi thông tin các huấn luyện viên tại phòng gym của
            bạn
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
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsModalAddGymOpen(true)}
              className="bg-gradient-to-r from-orange-400 to-orange-500 border-0 shadow-lg hover:shadow-xl transition-all duration-300"
              size="large"
            >
              Thêm PT Mới
            </Button>
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

      {/* Add PT Modal */}
      <Modal
        open={isModalAddGymOpen}
        onCancel={() => {
          setIsModalAddGymOpen(false);
          formAdd.resetFields();
        }}
        title={
          <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
            <div className="p-2 bg-gradient-to-r from-orange-400 to-orange-500 rounded-lg">
              <IoBarbell className="text-white text-xl" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 m-0">
                Thêm PT Mới
              </h2>
              <p className="text-sm text-gray-500 m-0">
                Tạo tài khoản cho huấn luyện viên mới
              </p>
            </div>
          </div>
        }
        footer={null}
        width={800}
        className="top-8"
      >
        <Form
          form={formAdd}
          layout="vertical"
          requiredMark={false}
          onFinish={handleAddPTGym}
          className="max-h-[70vh] overflow-y-auto py-6"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={
                  <span className="text-base font-semibold text-gray-700">
                    Số điện thoại
                  </span>
                }
                name="phone"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập số điện thoại",
                  },
                  {
                    pattern: /^[0-9]+$/,
                    message: "Vui lòng chỉ nhập số",
                  },
                ]}
              >
                <Input
                  placeholder="09XXXXXXXX"
                  type="tel"
                  maxLength={10}
                  size="large"
                  prefix={<PhoneOutlined className="text-gray-400" />}
                  onKeyPress={(event) => {
                    if (!/[0-9]/.test(event.key)) {
                      event.preventDefault();
                    }
                  }}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label={
                  <span className="text-base font-semibold text-gray-700">
                    Email
                  </span>
                }
                name="email"
                rules={[
                  { required: true, message: "Vui lòng nhập email" },
                  { type: "email", message: "Email không hợp lệ" },
                ]}
              >
                <Input
                  placeholder="nguyenvana123@email.com"
                  size="large"
                  prefix={<MailOutlined className="text-gray-400" />}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label={
              <span className="text-base font-semibold text-gray-700">
                Mật khẩu
              </span>
            }
            name="password"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập mật khẩu cho PT!",
              },
              {
                min: 6,
                message: "Mật khẩu phải có ít nhất 6 ký tự",
              },
            ]}
          >
            <Input.Password placeholder="Nhập mật khẩu" size="large" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={
                  <span className="text-base font-semibold text-gray-700">
                    Họ và tên
                  </span>
                }
                name="fullName"
                rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
              >
                <Input
                  placeholder="Nguyễn Văn A"
                  size="large"
                  prefix={<UserOutlined className="text-gray-400" />}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label={
                  <span className="text-base font-semibold text-gray-700">
                    Ngày sinh
                  </span>
                }
                name="dob"
                rules={[{ required: true, message: "Vui lòng chọn ngày sinh" }]}
              >
                <DatePicker
                  format="DD-MM-YYYY"
                  className="w-full"
                  placeholder="Chọn ngày sinh"
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label={
                  <span className="text-base font-semibold text-gray-700">
                    Cân nặng (kg)
                  </span>
                }
                name="weight"
                rules={[{ required: true, message: "Vui lòng nhập cân nặng" }]}
              >
                <InputNumber
                  min={0}
                  placeholder="70"
                  className="!w-full"
                  size="large"
                />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                label={
                  <span className="text-base font-semibold text-gray-700">
                    Chiều cao (cm)
                  </span>
                }
                name="height"
                rules={[{ required: true, message: "Vui lòng nhập chiều cao" }]}
              >
                <InputNumber
                  min={0}
                  placeholder="170"
                  className="!w-full"
                  size="large"
                />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                label={
                  <span className="text-base font-semibold text-gray-700">
                    Kinh nghiệm (năm)
                  </span>
                }
                name="experience"
                rules={[
                  { required: true, message: "Vui lòng nhập kinh nghiệm" },
                ]}
              >
                <InputNumber
                  min={0}
                  placeholder="2"
                  className="!w-full"
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={
                  <span className="text-base font-semibold text-gray-700">
                    Giới tính
                  </span>
                }
                name="gender"
                rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
              >
                <Select placeholder="Chọn giới tính" size="large">
                  <Select.Option value="Male">Nam</Select.Option>
                  <Select.Option value="Female">Nữ</Select.Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label={
                  <span className="text-base font-semibold text-gray-700">
                    Mục tiêu tập luyện
                  </span>
                }
                name="goalTraining"
                rules={[{ required: true, message: "Vui lòng nhập mục tiêu" }]}
              >
                <Input placeholder="Tăng cơ, giảm mỡ, ..." size="large" />
              </Form.Item>
            </Col>
          </Row>

          <div className="text-center pt-6 border-t border-gray-200">
            <Space size="middle">
              <Button
                size="large"
                onClick={() => {
                  setIsModalAddGymOpen(false);
                  formAdd.resetFields();
                }}
                className="px-8"
              >
                Hủy
              </Button>
              <Button
                type="primary"
                size="large"
                loading={loadingAdd}
                onClick={() => formAdd.submit()}
                className="px-8 bg-gradient-to-r from-orange-400 to-orange-500 border-0 shadow-lg"
              >
                {loadingAdd ? "Đang xử lý..." : "Thêm PT"}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

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
