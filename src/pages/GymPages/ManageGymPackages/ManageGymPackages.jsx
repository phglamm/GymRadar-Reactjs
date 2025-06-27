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
  FilterOutlined,
  PlusOutlined,
  TrophyOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  UserOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { FaEye, FaPlus, FaPlusCircle } from "react-icons/fa";
import gymService from "../../../services/gymServices";
import { ImBin } from "react-icons/im";
import { MdEdit } from "react-icons/md";
import { IoBarbell } from "react-icons/io5";

const { Option } = Select;

export default function ManageGymPackages() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isModalAddCourseOpen, setIsModalAddCourseOpen] = useState(false);
  const [isModalGymCouseDetailOpen, setIsModalGymCouseDetailOpen] =
    useState(false);
  const [pts, setPts] = useState([]);
  const [isModalAddGymCoursePTOpen, setIsModalAddGymCoursePTOpen] =
    useState(false);

  const [formAdd] = Form.useForm();
  const [formAddGymCourse] = Form.useForm();

  const [loadingAdd, setLoadingAdd] = useState(false);
  const [loadingAddGymCoursePT, setLoadingAddGymCoursePT] = useState(false);
  const [ptsInCourse, setPtsInCourse] = useState([]);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Statistics data
  const [statistics, setStatistics] = useState({
    totalPackages: 0,
    withPTPackages: 0,
    normalPackages: 0,
    totalRevenue: 0,
  });

  const fetchCoursesGym = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const response = await gymService.getCourseOfGym({
        page,
        size: pageSize,
      });
      const { items, total, page: currentPage } = response.data;
      setCourses(items);

      // Calculate statistics
      const withPTCount = items.filter(
        (course) => course.type === "WithPT"
      ).length;
      const normalCount = items.filter(
        (course) => course.type === "Normal"
      ).length;
      const totalRevenue = items.reduce(
        (sum, course) => sum + (course.price || 0),
        0
      );

      setStatistics({
        totalPackages: total,
        withPTPackages: withPTCount,
        normalPackages: normalCount,
        totalRevenue,
      });

      setPagination({
        current: currentPage,
        pageSize,
        total,
      });
    } catch (error) {
      console.error("Error fetching Courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPTGym = async (page = 1, pageSize = 10) => {
    try {
      const response = await gymService.getPTofGym({ page, size: pageSize });
      const { items } = response.data;
      setPts(items);
    } catch (error) {
      console.error("Error fetching Pts:", error);
    }
  };

  useEffect(() => {
    fetchCoursesGym();
    fetchPTGym();
  }, []);

  const handleTableChange = (pagination) => {
    fetchCoursesGym(pagination.current, pagination.pageSize);
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

  const handleDelete = async (id) => {
    Modal.confirm({
      title: "Bạn có chắc chắn muốn xóa gói tập này không?",
      content: "Hành động này không thể hoàn tác.",
      okText: "Xóa",
      cancelText: "Hủy",
      okType: "danger",
      onOk: async () => {
        try {
          await gymService.deleteGym(id);
          fetchCoursesGym();
          toast.success("Xoá gói tập thành công");
        } catch (error) {
          console.error("Error deleting course:", error);
          toast.error(
            error.response?.data?.message || "Lỗi xóa gói tập thất bại"
          );
        }
      },
    });
  };

  const getTypeColor = (type) => {
    return type === "WithPT" ? "success" : "blue";
  };

  const getTypeIcon = (type) => {
    return type === "WithPT" ? <UserOutlined /> : <TrophyOutlined />;
  };

  const columns = [
    {
      title: "Gói Tập",
      dataIndex: "name",
      key: "name",
      align: "left",
      render: (text, record) => (
        <div className="flex items-center gap-3">
          <Avatar
            size={40}
            icon={<IoBarbell />}
            style={{ backgroundColor: "#FF914D" }}
          />
          <div>
            <div className="font-medium text-gray-900">{text}</div>
            <div className="text-sm text-gray-500">{record.duration} ngày</div>
          </div>
        </div>
      ),
    },
    {
      title: "Thời Lượng",
      dataIndex: "duration",
      key: "duration",
      align: "center",
      render: (duration) => (
        <div className="flex flex-col items-center">
          <ClockCircleOutlined style={{ fontSize: "16px", color: "#1890ff" }} />
          <span className="text-sm font-medium">{duration}</span>
          <span className="text-xs text-gray-500">ngày</span>
        </div>
      ),
    },
    {
      title: "Giá Tiền",
      dataIndex: "price",
      key: "price",
      align: "center",
      render: (price) => (
        <div className="flex flex-col items-center">
          <DollarOutlined style={{ fontSize: "16px", color: "#52c41a" }} />
          <span className="text-sm font-medium text-green-600">
            {price?.toLocaleString("vi", {
              style: "currency",
              currency: "VND",
            })}
          </span>
        </div>
      ),
    },
    {
      title: "Loại Gói",
      dataIndex: "type",
      key: "type",
      align: "center",
      render: (type) => (
        <Tag
          icon={getTypeIcon(type)}
          color={getTypeColor(type)}
          className="px-3 py-1"
        >
          {type === "WithPT" ? "Có PT" : "Bình thường"}
        </Tag>
      ),
    },
    {
      title: "Mô Tả",
      dataIndex: "description",
      key: "description",
      align: "center",
      render: (description) => (
        <Tooltip title={description}>
          <span className="text-gray-600 max-w-xs truncate block">
            {description || "Chưa có mô tả"}
          </span>
        </Tooltip>
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
              onClick={() => {
                setIsModalGymCouseDetailOpen(true);
                setSelectedCourse(record);
                fetchPTInCourse(record.id);
              }}
            />
          </Tooltip>

          {record.type === "WithPT" && (
            <Tooltip title="Thêm PT">
              <Button
                type="text"
                icon={<UserAddOutlined />}
                className="text-green-600 hover:bg-green-50"
                onClick={() => {
                  setIsModalAddGymCoursePTOpen(true);
                  setSelectedCourse(record);
                }}
              />
            </Tooltip>
          )}

          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              className="text-orange-600 hover:bg-orange-50"
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

  const fetchPTInCourse = async (id) => {
    try {
      const response = await gymService.getPTOfCourse(id);
      setPtsInCourse(response.data.items);
    } catch (error) {
      console.error("Error fetching Gym Course Detail:", error);
    }
  };

  const filteredData = courses.filter((item) => {
    const matchesSearch = searchText
      ? (item.name?.toLowerCase() || "").includes(searchText.toLowerCase())
      : true;

    const matchesType = typeFilter === "all" || item.type === typeFilter;

    return matchesSearch && matchesType;
  });

  const handleAddCourseGym = async (values) => {
    setLoadingAdd(true);
    const requestData = {
      name: values.name,
      description: values.description,
      price: values.price,
      duration: values.duration,
      type: values.type,
      image: values.image || "image",
    };

    try {
      const response = await gymService.addCourse(requestData);
      toast.success("Thêm gói tập thành công");
      fetchCoursesGym();
      setIsModalAddCourseOpen(false);
      formAdd.resetFields();
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi thêm gói tập thất bại");
    } finally {
      setLoadingAdd(false);
    }
  };

  const handleAddGymCoursePT = async (values) => {
    setLoadingAddGymCoursePT(true);
    const requestData = {
      ptid: values.ptid,
      gymCourseId: selectedCourse.id,
      session: values.session,
    };

    try {
      const response = await gymService.addPTToCourse(requestData);
      toast.success("Thêm PT vào gói tập thành công");
      setIsModalAddGymCoursePTOpen(false);
      formAddGymCourse.resetFields();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Lỗi thêm PT vào gói tập thất bại"
      );
    } finally {
      setLoadingAddGymCoursePT(false);
    }
  };

  const ptInCourseColumns = [
    {
      title: "PT",
      dataIndex: "fullName",
      key: "fullName",
      align: "left",
      render: (text, record) => (
        <div className="flex items-center gap-3">
          <Avatar
            size={40}
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
      title: "Ngày sinh",
      dataIndex: "dob",
      key: "dob",
      align: "center",
      render: (dob) => new Date(dob).toLocaleDateString("vi-VN"),
    },
    {
      title: "Thông tin cơ thể",
      key: "bodyInfo",
      align: "center",
      render: (_, record) => (
        <div className="text-center">
          <div className="text-sm">
            <span className="font-medium">{record.height}cm</span> /
            <span className="font-medium"> {record.weight}kg</span>
          </div>
        </div>
      ),
    },
    {
      title: "Mục tiêu",
      dataIndex: "goalTraining",
      key: "goalTraining",
      align: "center",
      render: (goal) => <Tag color="blue">{goal}</Tag>,
    },
    {
      title: "Kinh nghiệm",
      dataIndex: "experience",
      key: "experience",
      align: "center",
      render: (exp) => (
        <div className="text-center">
          <span className="font-medium">{exp}</span>
          <div className="text-xs text-gray-500">năm</div>
        </div>
      ),
    },
    {
      title: "Giới tính",
      dataIndex: "gender",
      key: "gender",
      align: "center",
      render: (gender) => (
        <Tag color={gender === "Male" ? "blue" : "pink"}>
          {gender === "Male" ? "Nam" : "Nữ"}
        </Tag>
      ),
    },
  ];

  return (
    <div className="">
      <div className="">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Quản Lý Gói Tập Gym
          </h1>
          <p className="text-gray-600">
            Quản lý và theo dõi các gói tập luyện tại phòng gym
          </p>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} className="mb-8">
          <Col xs={24} sm={12} lg={8}>
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <Statistic
                title="Tổng Gói Tập"
                value={statistics.totalPackages}
                prefix={<TrophyOutlined style={{ color: "#FF914D" }} />}
                valueStyle={{
                  color: "#FF914D",
                  fontSize: "24px",
                  fontWeight: "bold",
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <Statistic
                title="Gói Có PT"
                value={statistics.withPTPackages}
                prefix={<UserOutlined style={{ color: "#52c41a" }} />}
                valueStyle={{
                  color: "#52c41a",
                  fontSize: "24px",
                  fontWeight: "bold",
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <Statistic
                title="Gói Bình Thường"
                value={statistics.normalPackages}
                prefix={<ClockCircleOutlined style={{ color: "#1890ff" }} />}
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
                placeholder="Tìm kiếm theo tên gói tập..."
                prefix={<SearchOutlined className="text-gray-400" />}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 280 }}
                allowClear
                className="rounded-lg"
              />
              <Select
                value={typeFilter}
                onChange={setTypeFilter}
                style={{ width: 200 }}
                className="rounded-lg"
                suffixIcon={<FilterOutlined />}
              >
                <Option value="all">Tất cả loại gói</Option>
                <Option value="WithPT">Có PT</Option>
                <Option value="Normal">Bình thường</Option>
              </Select>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsModalAddCourseOpen(true)}
              className="bg-orange-500 hover:bg-orange-600 border-orange-500 hover:border-orange-600 rounded-lg"
            >
              Thêm Gói Tập
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
              <span className="font-semibold">{statistics.totalPackages}</span>{" "}
              gói tập
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
              {typeFilter !== "all" && (
                <span>
                  {" "}
                  | Lọc:{" "}
                  <Tag color={getTypeColor(typeFilter)} className="ml-1">
                    {typeFilter === "WithPT" ? "Có PT" : "Bình thường"}
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

      {/* Add Course Modal */}
      <Modal
        open={isModalAddCourseOpen}
        onCancel={() => setIsModalAddCourseOpen(false)}
        title={
          <p className="text-2xl font-bold text-[#ED2A46] flex items-center gap-2">
            <IoBarbell />
            Thêm Gói Tập Mới
          </p>
        }
        footer={null}
        width={700}
      >
        <Form
          form={formAdd}
          layout="vertical"
          requiredMark={false}
          onFinish={handleAddCourseGym}
          className="max-h-[65vh] overflow-y-auto !py-5 !px-5"
        >
          <Form.Item
            label={
              <p className="text-xl font-bold text-[#ED2A46]">Tên gói tập</p>
            }
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên gói" }]}
          >
            <Input placeholder="Gói 1 tháng" className="rounded-lg" />
          </Form.Item>

          <Form.Item
            label={
              <p className="text-xl font-bold text-[#ED2A46]">Mô tả gói tập</p>
            }
            name="description"
            rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
          >
            <Input.TextArea
              placeholder="Mô tả chi tiết về gói tập..."
              autoSize={{ minRows: 3, maxRows: 5 }}
              className="rounded-lg"
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={
                  <p className="text-xl font-bold text-[#ED2A46]">
                    Giá tiền (VNĐ)
                  </p>
                }
                name="price"
                rules={[{ required: true, message: "Vui lòng nhập giá tiền" }]}
              >
                <InputNumber
                  min={1000}
                  placeholder="100,000"
                  className="!w-full rounded-lg"
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={
                  <p className="text-xl font-bold text-[#ED2A46]">
                    Thời lượng (Ngày)
                  </p>
                }
                name="duration"
                rules={[
                  { required: true, message: "Vui lòng nhập thời lượng" },
                ]}
              >
                <InputNumber
                  min={1}
                  placeholder="30"
                  className="!w-full rounded-lg"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label={
              <p className="text-xl font-bold text-[#ED2A46]">Loại gói tập</p>
            }
            name="type"
            rules={[{ required: true, message: "Vui lòng chọn loại gói tập" }]}
          >
            <Select placeholder="Chọn loại gói tập" className="rounded-lg">
              <Select.Option value="WithPT">
                <div className="flex items-center gap-2">
                  <UserOutlined />
                  Có Personal Trainer
                </div>
              </Select.Option>
              <Select.Option value="Normal">
                <div className="flex items-center gap-2">
                  <TrophyOutlined />
                  Gói tập bình thường
                </div>
              </Select.Option>
            </Select>
          </Form.Item>

          <div className="text-center pt-4">
            <Button
              onClick={() => formAdd.submit()}
              loading={loadingAdd}
              className="!w-[60%] !h-12 !rounded-full !font-medium !border-0 shadow-lg"
              style={{
                background: "linear-gradient(135deg, #FF914D 0%, #ED2A46 100%)",
                color: "white",
              }}
            >
              Tạo Gói Tập
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Add PT to Course Modal */}
      <Modal
        open={isModalAddGymCoursePTOpen}
        onCancel={() => setIsModalAddGymCoursePTOpen(false)}
        title={
          <p className="text-2xl font-bold text-[#ED2A46] flex items-center gap-2">
            <UserAddOutlined />
            Thêm PT vào Gói Tập: {selectedCourse?.name}
          </p>
        }
        footer={null}
        width={600}
      >
        <Form
          form={formAddGymCourse}
          layout="vertical"
          requiredMark={false}
          onFinish={handleAddGymCoursePT}
          className="!py-5"
        >
          <Form.Item
            label={
              <p className="text-xl font-bold text-[#ED2A46]">Số buổi tập</p>
            }
            name="session"
            rules={[{ required: true, message: "Vui lòng nhập số buổi tập" }]}
          >
            <InputNumber
              min={1}
              placeholder="8"
              className="!w-full rounded-lg"
              addonAfter="buổi"
            />
          </Form.Item>

          <Form.Item
            label={
              <p className="text-xl font-bold text-[#ED2A46]">
                Chọn Personal Trainer
              </p>
            }
            name="ptid"
            rules={[{ required: true, message: "Vui lòng chọn PT" }]}
          >
            <Select placeholder="Chọn PT phù hợp" className="rounded-lg">
              {pts.map((pt) => (
                <Select.Option key={pt.id} value={pt.id}>
                  <div className="flex items-center gap-2">
                    <Avatar size="small" icon={<UserOutlined />} />
                    {pt.fullName}
                  </div>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <div className="text-center pt-4">
            <Button
              onClick={() => formAddGymCourse.submit()}
              loading={loadingAddGymCoursePT}
              className="!w-[60%] !h-12 !rounded-full !font-medium !border-0 shadow-lg"
              style={{
                background: "linear-gradient(135deg, #52c41a 0%, #389e0d 100%)",
                color: "white",
              }}
            >
              Thêm PT vào Gói
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Course Detail Modal */}
      <Modal
        open={isModalGymCouseDetailOpen}
        onCancel={() => setIsModalGymCouseDetailOpen(false)}
        title={
          <p className="text-2xl font-bold text-[#ED2A46] flex items-center gap-2">
            <TeamOutlined />
            Personal Trainers - {selectedCourse?.name}
          </p>
        }
        footer={null}
        width={1000}
      >
        <div className="mb-4 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg">
          <Row gutter={16}>
            <Col span={8}>
              <Statistic
                title="Tổng số PT"
                value={ptsInCourse.length}
                prefix={<TeamOutlined />}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Thời lượng gói"
                value={selectedCourse?.duration}
                suffix="ngày"
                prefix={<ClockCircleOutlined />}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Giá gói"
                value={selectedCourse?.price}
                formatter={(value) => `${value?.toLocaleString("vi")}₫`}
                prefix={<DollarOutlined />}
              />
            </Col>
          </Row>
        </div>

        <Table
          dataSource={ptsInCourse}
          columns={ptInCourseColumns}
          pagination={false}
          bordered
          size="middle"
          className="rounded-lg overflow-hidden"
        />
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
