import React, { useState, useEffect } from "react";
import {
  Table,
  Input,
  Button,
  Space,
  Modal,
  Form,
  DatePicker,
  InputNumber,
  Select,
  Tag,
  Card,
  Row,
  Col,
  Statistic,
  Avatar,
  Typography,
  Spin,
  ConfigProvider,
  Tooltip,
} from "antd";
import {
  SearchOutlined,
  UserAddOutlined,
  DeleteOutlined,
  EyeOutlined,
  UserOutlined,
  ManOutlined,
  WomanOutlined,
  PhoneOutlined,
  MailOutlined,
  LoadingOutlined,
  PlusOutlined,
  StopOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import adminService from "../../../services/adminServices";
import toast from "react-hot-toast";

const { Search } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

export default function ManageUserPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });
  const [searchText, setSearchText] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState(""); // "add", "view"
  const [form] = Form.useForm();
  const [statistics, setStatistics] = useState({
    totalUsers: 0,
    maleUsers: 0,
    femaleUsers: 0,
    activeUsers: 0,
  });

  // Fetch users data
  const fetchUsers = async (page = 1, size = 10, search = "") => {
    setLoading(true);
    try {
      const params = {
        page: page,
        size: size,
      };

      if (search) {
        params.search = search;
      }

      const response = await adminService.getAllUsers(params);

      if (response.status === "200") {
        const {
          items,
          total,
          page: currentPage,
          size: pageSize,
          totalPages,
        } = response.data;

        setUsers(items);
        setPagination({
          current: currentPage,
          pageSize: pageSize,
          total: total,
          totalPages: totalPages,
        });

        // Update statistics
        const maleCount = items.filter((user) => user.gender === "Male").length;
        const femaleCount = items.filter(
          (user) => user.gender === "Female"
        ).length;
        const activeCount = items.filter(
          (user) =>
            user.gender !== "Unknown" &&
            user.fullName &&
            user.fullName.trim() !== ""
        ).length;

        setStatistics({
          totalUsers: total,
          maleUsers: maleCount,
          femaleUsers: femaleCount,
          activeUsers: activeCount,
        });
      } else {
        toast.error("Không thể tải danh sách người dùng");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Đã xảy ra lỗi khi tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle table pagination change
  const handleTableChange = (pagination) => {
    fetchUsers(pagination.current, pagination.pageSize, searchText);
  };

  // Open modal for different actions
  const openModal = (type, user = null) => {
    setModalType(type);
    setModalVisible(true);

    if (user && type === "view") {
      form.setFieldsValue({
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        dob: user.dob ? dayjs(user.dob) : null,
        weight: user.weight || 0,
        height: user.height || 0,
        gender: user.gender === "Unknown" ? undefined : user.gender,
        address: user.address === "Unknown" ? "" : user.address,
      });
    } else {
      form.resetFields();
    }
  };

  // Handle modal submission
  const handleModalSubmit = async () => {
    try {
      const values = await form.validateFields();
      const formData = {
        ...values,
        dob: values.dob ? values.dob.format("YYYY-MM-DD") : null,
      };

      if (modalType === "add") {
        // Add user API call - using adminService
        try {
          const response = await adminService.createUser(formData);
          if (response.status === "200" || response.status === "201") {
            toast.success("Thêm người dùng thành công");
            fetchUsers(pagination.current, pagination.pageSize, searchText);
          } else {
            toast.error("Không thể thêm người dùng");
          }
        } catch (error) {
          console.error("Error adding user:", error);
          toast.error("Đã xảy ra lỗi khi thêm người dùng");
        }
      }

      setModalVisible(false);
    } catch (error) {
      console.error("Form validation error:", error);
    }
  };

  // Handle user deletion
  // Handle user ban
  const handleBan = async (userId) => {
    Modal.confirm({
      title: "Xác nhận cấm người dùng",
      content:
        "Bạn có chắc chắn muốn cấm người dùng này? Người dùng sẽ không thể truy cập hệ thống.",
      okText: "Cấm",
      cancelText: "Hủy",
      okType: "danger",
      centered: true,
      icon: <StopOutlined style={{ color: "#ff4d4f" }} />,
      onOk: async () => {
        try {
          const response = await adminService.banUser(userId);

          if (response.status === "200") {
            toast.success("Cấm người dùng thành công");
            fetchUsers(pagination.current, pagination.pageSize, searchText);
          } else {
            toast.error("Không thể cấm người dùng");
          }
        } catch (error) {
          console.error("Error banning user:", error);
          toast.error("Đã xảy ra lỗi khi cấm người dùng");
        }
      },
    });
  };

  // Filter users based on search text
  const filteredData = searchText
    ? users.filter(
        (user) =>
          user.fullName?.toLowerCase().includes(searchText.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchText.toLowerCase()) ||
          user.phone?.toLowerCase().includes(searchText.toLowerCase()) ||
          user.address?.toLowerCase().includes(searchText.toLowerCase())
      )
    : users;

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen ">
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

  // Table columns configuration
  const columns = [
    {
      title: "Thông Tin Người Dùng",
      dataIndex: "fullName",
      key: "fullName",
      width: 300,
      render: (text, record) => (
        <div className="flex items-center gap-3">
          <Avatar
            size={50}
            icon={<UserOutlined />}
            style={{
              backgroundColor:
                record.gender === "Male"
                  ? "#1890ff"
                  : record.gender === "Female"
                  ? "#eb2f96"
                  : "#666",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {record.gender === "Male" ? (
              <ManOutlined />
            ) : record.gender === "Female" ? (
              <WomanOutlined />
            ) : (
              <UserOutlined />
            )}
          </Avatar>
          <div>
            <div className="font-semibold text-gray-900 text-base mb-1">
              {text}
            </div>
            <div className="flex items-center text-sm text-gray-500 mb-1">
              <MailOutlined className="mr-1" />
              {record.email || "N/A"}
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <PhoneOutlined className="mr-1" />
              {record.phone || "N/A"}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Thông Tin Cá Nhân",
      key: "personal",
      width: 250,
      render: (_, record) => (
        <div className="space-y-2">
          <div className="flex items-center text-gray-700">
            <span className="text-sm">
              <strong>Ngày sinh:</strong>{" "}
              {record.dob ? dayjs(record.dob).format("DD/MM/YYYY") : "N/A"}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700">
              <strong>Cân nặng:</strong>{" "}
              {record.weight > 0 ? `${record.weight} kg` : "N/A"}
            </span>
            <span className="text-sm text-gray-700">
              <strong>Chiều cao:</strong>{" "}
              {record.height > 0 ? `${record.height} cm` : "N/A"}
            </span>
          </div>
        </div>
      ),
    },
    {
      title: "Giới Tính",
      dataIndex: "gender",
      key: "gender",
      width: 120,
      render: (gender) => (
        <Tag
          color={
            gender === "Male" ? "blue" : gender === "Female" ? "pink" : "gray"
          }
          icon={
            gender === "Male" ? (
              <ManOutlined />
            ) : gender === "Female" ? (
              <WomanOutlined />
            ) : (
              <UserOutlined />
            )
          }
        >
          {gender === "Male"
            ? "Nam"
            : gender === "Female"
            ? "Nữ"
            : "Chưa cập nhật"}
        </Tag>
      ),
    },
    {
      title: "Địa Chỉ",
      dataIndex: "address",
      key: "address",
      width: 200,
      render: (address) => (
        <Tooltip title={address === "Unknown" ? "Chưa cập nhật" : address}>
          <span className="max-w-xs truncate block">
            {address === "Unknown" ? "N/A" : address}
          </span>
        </Tooltip>
      ),
    },
    {
      title: "Thao Tác",
      key: "actions",
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => openModal("view", record)}
              className="text-blue-600 hover:text-blue-800"
            />
          </Tooltip>
          <Tooltip title="Cấm người dùng">
            <Button
              type="link"
              icon={<StopOutlined />}
              onClick={() => handleBan(record.id)}
              className="text-red-600 hover:text-red-800"
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="">
      <div className="">
        {/* Header */}
        <div className="">
          <Title
            level={2}
            className="text-gray-900 mb-2 flex items-center gap-3"
          >
            <UserOutlined className="text-orange-500" />
            Quản Lý Người Dùng
          </Title>
          <Text className="text-gray-600 text-base">
            Quản lý và theo dõi tất cả người dùng trong hệ thống
          </Text>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[20, 20]} className="mb-8">
          <Col xs={24} sm={12} lg={6}>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-blue-100">
              <Statistic
                title={
                  <span className="text-gray-600 font-medium">
                    Tổng Người Dùng
                  </span>
                }
                value={statistics.totalUsers}
                prefix={<UserOutlined className="text-blue-500" />}
                valueStyle={{
                  color: "#1890ff",
                  fontSize: "28px",
                  fontWeight: "bold",
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 to-green-100">
              <Statistic
                title={
                  <span className="text-gray-600 font-medium">
                    Người Dùng Hoạt Động
                  </span>
                }
                value={statistics.activeUsers}
                prefix={<UserAddOutlined className="text-green-500" />}
                valueStyle={{
                  color: "#52c41a",
                  fontSize: "28px",
                  fontWeight: "bold",
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-blue-100">
              <Statistic
                title={<span className="text-gray-600 font-medium">Nam</span>}
                value={statistics.maleUsers}
                prefix={<ManOutlined className="text-blue-500" />}
                valueStyle={{
                  color: "#1890ff",
                  fontSize: "28px",
                  fontWeight: "bold",
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-pink-50 to-pink-100">
              <Statistic
                title={<span className="text-gray-600 font-medium">Nữ</span>}
                value={statistics.femaleUsers}
                prefix={<WomanOutlined className="text-pink-500" />}
                valueStyle={{
                  color: "#eb2f96",
                  fontSize: "28px",
                  fontWeight: "bold",
                }}
              />
            </Card>
          </Col>
        </Row>

        {/* Main Content */}
        <Card className="border-0 shadow-xl">
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
            {/* Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex-1 max-w-md">
                <Input
                  placeholder="Tìm kiếm theo tên, email, số điện thoại, địa chỉ..."
                  prefix={<SearchOutlined className="text-gray-400" />}
                  onChange={(e) => setSearchText(e.target.value)}
                  allowClear
                  size="large"
                  className="rounded-lg shadow-sm"
                />
              </div>

              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="large"
                className="bg-gradient-to-r from-orange-400 to-orange-600 border-0 rounded-lg px-6 shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => openModal("add")}
              >
                Thêm Người Dùng
              </Button>
            </div>

            {/* Results Summary */}
            <div className="mb-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
              <Text className="text-gray-600">
                Hiển thị{" "}
                <span className="font-semibold text-orange-600">
                  {filteredData.length}
                </span>{" "}
                trong tổng số{" "}
                <span className="font-semibold text-blue-600">
                  {pagination.total}
                </span>{" "}
                người dùng
                {searchText && (
                  <>
                    {" "}
                    cho từ khóa "
                    <span className="font-semibold text-blue-600">
                      {searchText}
                    </span>
                    "
                  </>
                )}
              </Text>
            </div>

            {/* Users Table */}
            <Table
              columns={columns}
              dataSource={filteredData}
              rowKey="id"
              loading={loading}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} trong tổng số ${total} người dùng`,
              }}
              onChange={handleTableChange}
              className="bg-white"
              scroll={{ x: 1200 }}
            />
          </ConfigProvider>
        </Card>

        {/* User Modal */}
        <Modal
          title={
            modalType === "add" ? "Thêm Người Dùng Mới" : "Chi Tiết Người Dùng"
          }
          open={modalVisible}
          onOk={modalType === "add" ? handleModalSubmit : undefined}
          onCancel={() => setModalVisible(false)}
          okText={modalType === "add" ? "Thêm Người Dùng" : undefined}
          cancelText="Hủy"
          footer={
            modalType === "view"
              ? [
                  <Button key="close" onClick={() => setModalVisible(false)}>
                    Đóng
                  </Button>,
                ]
              : undefined
          }
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            disabled={modalType === "view"}
            className="mt-4"
          >
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="fullName"
                  label="Họ và Tên"
                  rules={[
                    { required: true, message: "Vui lòng nhập họ và tên" },
                  ]}
                >
                  <Input placeholder="Nhập họ và tên" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { type: "email", message: "Email không hợp lệ" },
                    { required: true, message: "Vui lòng nhập email" },
                  ]}
                >
                  <Input placeholder="Nhập email" prefix={<MailOutlined />} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="phone"
                  label="Số Điện Thoại"
                  rules={[
                    { required: true, message: "Vui lòng nhập số điện thoại" },
                  ]}
                >
                  <Input
                    placeholder="Nhập số điện thoại"
                    prefix={<PhoneOutlined />}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="dob" label="Ngày Sinh">
                  <DatePicker
                    placeholder="Chọn ngày sinh"
                    className="w-full"
                    format="DD/MM/YYYY"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="gender" label="Giới Tính">
                  <Select placeholder="Chọn giới tính">
                    <Option value="Male">Nam</Option>
                    <Option value="Female">Nữ</Option>
                    <Option value="Other">Khác</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="weight" label="Cân Nặng (kg)">
                  <InputNumber
                    placeholder="Nhập cân nặng"
                    min={0}
                    max={500}
                    className="w-full"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="height" label="Chiều Cao (cm)">
                  <InputNumber
                    placeholder="Nhập chiều cao"
                    min={0}
                    max={300}
                    className="w-full"
                  />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item name="address" label="Địa Chỉ">
                  <Input.TextArea placeholder="Nhập địa chỉ" rows={3} />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>
      </div>
    </div>
  );
}
