import {
  Button,
  Card,
  ConfigProvider,
  Form,
  Input,
  Modal,
  Space,
  Switch,
  Table,
  Row,
  Col,
  Statistic,
  Badge,
  Tag,
  Tooltip,
  Avatar,
  Typography,
  Divider,
  Spin,
  Upload,
} from "antd";
import React, { useEffect, useState } from "react";
import adminService from "../../../services/adminServices";
import toast from "react-hot-toast";
import {
  LoadingOutlined,
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  HomeOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  UserOutlined,
  FireOutlined,
  CalendarOutlined,
  QrcodeOutlined,
  BankOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import { FaPlus, FaDumbbell, FaMapMarkerAlt } from "react-icons/fa";
import { ImBin } from "react-icons/im";
import { MdEdit, MdLocationOn } from "react-icons/md";
import { IoBarbell, IoLocationSharp } from "react-icons/io5";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

const { Title, Text } = Typography;

export default function ManageGymPage() {
  const [gym, setGym] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isModalAddGymOpen, setIsModalAddGymOpen] = useState(false);
  const [formAdd] = Form.useForm();
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [mainImageList, setMainImageList] = useState({});
  const [imagesList, setImagesList] = useState([]);
  const [position, setPosition] = useState(null);
  const [statistics, setStatistics] = useState({
    totalGyms: 0,
    hotResearchGyms: 0,
    normalGyms: 0,
    averageYear: 0,
  });

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyBUQ7fgnOaws1lzGbOfN0L2zVwxRw-m1gU",
  });

  const containerStyle = {
    width: "100%",
    height: "400px",
    borderRadius: "12px",
  };

  const center = {
    lat: 10.762622,
    lng: 106.660172,
  };

  const fetchGym = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const response = await adminService.getAllGym({ page, size: pageSize });
      const { items, total, page: currentPage } = response.data;

      setGym(items);

      // Update statistics
      const hotResearchCount = items.filter((gym) => gym.hotResearch).length;
      const avgYear =
        items.length > 0
          ? Math.round(
              items.reduce((sum, gym) => sum + (gym.since || 2020), 0) /
                items.length
            )
          : 0;

      setStatistics({
        totalGyms: total,
        hotResearchGyms: hotResearchCount,
        normalGyms: total - hotResearchCount,
        averageYear: avgYear,
      });

      setPagination({
        current: currentPage,
        pageSize,
        total,
      });
    } catch (error) {
      console.error("Error fetching gyms:", error);
      toast.error("Lỗi khi lấy danh sách phòng gym");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGym();
  }, []);

  const handleDelete = async (id) => {
    Modal.confirm({
      title: "Xác nhận xóa phòng gym",
      content:
        "Bạn có chắc chắn muốn xóa phòng gym này? Hành động này không thể hoàn tác.",
      okText: "Xóa",
      cancelText: "Hủy",
      okType: "danger",
      centered: true,
      icon: <DeleteOutlined style={{ color: "#ff4d4f" }} />,
      onOk: async () => {
        try {
          await adminService.deleteGym(id);
          fetchGym();
          toast.success("Đã xóa phòng gym thành công");
        } catch (error) {
          console.error("Error deleting gym:", error);
          toast.error(
            error.response?.data?.message || "Không thể xóa phòng gym"
          );
        }
      },
    });
  };

  const columns = [
    {
      title: "Thông Tin Phòng Gym",
      dataIndex: "gymName",
      key: "gymName",
      width: 300,
      render: (text, record) => (
        <div className="flex items-center gap-3">
          <Avatar
            size={50}
            icon={<FaDumbbell />}
            style={{
              backgroundColor: record.hotResearch ? "#ff4d4f" : "#FF914D",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          />
          <div>
            <div className="font-semibold text-gray-900 text-base mb-1">
              {text}
              {record.hotResearch && (
                <Tag color="red" className="ml-2" icon={<FireOutlined />}>
                  HOT
                </Tag>
              )}
            </div>
            <div className="flex items-center text-sm text-gray-500 mb-1">
              <EnvironmentOutlined className="mr-1" />
              {record.address}
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <CalendarOutlined className="mr-1" />
              Hoạt động từ {record.since || "N/A"}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Liên Hệ",
      dataIndex: "phone",
      key: "contact",
      width: 200,
      render: (phone, record) => (
        <div className="space-y-2">
          <div className="flex items-center text-gray-700">
            <PhoneOutlined className="mr-2 text-blue-500" />
            <span>{phone || record.address}</span>
          </div>
          <div className="flex items-center text-gray-700">
            <UserOutlined className="mr-2 text-green-500" />
            <span className="font-medium">{record.representName}</span>
          </div>
        </div>
      ),
    },
    {
      title: "Vị Trí",
      key: "location",
      width: 150,
      render: (_, record) => (
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <IoLocationSharp className="text-red-500 text-lg mr-1" />
            <span className="font-medium text-gray-700">Tọa độ</span>
          </div>
          {record.latitude && record.longitude ? (
            <div className="text-xs text-gray-500 space-y-1">
              <div>Lat: {record.latitude}</div>
              <div>Lng: {record.longitude}</div>
            </div>
          ) : (
            <span className="text-gray-400">Chưa có</span>
          )}
        </div>
      ),
    },
    {
      title: "Trạng Thái",
      dataIndex: "hotResearch",
      key: "hotResearch",
      width: 120,
      align: "center",
      render: (hotResearch) => (
        <div className="flex flex-col items-center space-y-2">
          <Switch
            checked={hotResearch}
            disabled
            size="small"
            style={{
              backgroundColor: hotResearch ? "#ff4d4f" : undefined,
            }}
          />
          <Badge
            status={hotResearch ? "success" : "default"}
            text={hotResearch ? "Hot Research" : "Bình thường"}
            className="text-xs"
          />
        </div>
      ),
    },
    {
      title: "Hành Động",
      key: "action",
      width: 120,
      align: "center",
      render: (text, record) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              className="text-orange-500 hover:bg-orange-50"
              onClick={() => console.log("Edit gym:", record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              type="text"
              icon={<DeleteOutlined />}
              danger
              className="hover:bg-red-50"
              onClick={() => handleDelete(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleTableChange = (pagination) => {
    fetchGym(pagination.current, pagination.pageSize);
  };

  const filteredData = searchText
    ? gym.filter(
        (item) =>
          (item.gymName?.toLowerCase() || "").includes(
            searchText.toLowerCase()
          ) ||
          (item.address?.toLowerCase() || "").includes(
            searchText.toLowerCase()
          ) ||
          (item.representName?.toLowerCase() || "").includes(
            searchText.toLowerCase()
          )
      )
    : gym;

  const handleAddGym = async (values) => {
    setLoadingAdd(true);

    const formData = new FormData();

    // Add basic user fields
    formData.append("Phone", values.phone || "");
    formData.append("Email", values.email || "");
    formData.append("Password", values.password || "");

    // Add gym-specific fields with corrected naming
    formData.append("CreateNewGym.GymName", values.gymName || "");
    formData.append("CreateNewGym.Since", values.since || 0);
    formData.append("CreateNewGym.Address", values.address || "");
    formData.append("CreateNewGym.RepresentName", values.representName || "");
    formData.append("CreateNewGym.TaxCode", values.taxCode || "");
    formData.append("CreateNewGym.Longitude", values.longitude || 0);
    formData.append("CreateNewGym.Latitude", values.latitude || 0);
    formData.append("CreateNewGym.Qrcode", values.qrcode || "");

    // Handle hotResearch boolean

    // Handle main image file (single object) - modified to handle object instead of array
    if (values.mainImage && values.mainImage.originFileObj) {
      formData.append("CreateNewGym.MainImage", values.mainImage.originFileObj);
    }

    // Handle multiple images array
    if (values.images && values.images.length > 0) {
      values.images.forEach((file, index) => {
        if (file.originFileObj) {
          formData.append("CreateNewGym.Images", file.originFileObj);
        }
      });
    }

    try {
      const response = await adminService.addGym(formData);
      console.log("Add Gym Response Data:", response);
      toast.success("Thêm phòng gym thành công!");
      fetchGym();
      setIsModalAddGymOpen(false);
      formAdd.resetFields();
      setPosition(null);
      setMainImageList({});
      setImagesList([]);
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể thêm phòng gym");
    } finally {
      setLoadingAdd(false);
    }
  };

  const handleMapClick = (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setPosition({ lat, lng });

    formAdd.setFieldsValue({
      latitude: lat,
      longitude: lng,
    });
  };

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

  return (
    <div className="">
      <div className="">
        {/* Header */}
        <div className="">
          <Title
            level={2}
            className="text-gray-900 mb-2 flex items-center gap-3"
          >
            <FaDumbbell className="text-orange-500" />
            Quản Lý Phòng Gym
          </Title>
          <Text className="text-gray-600 text-base">
            Quản lý và theo dõi thông tin các phòng gym trong hệ thống
          </Text>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[20, 20]} className="mb-8">
          <Col xs={24} sm={12} lg={6}>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-blue-100">
              <Statistic
                title={
                  <span className="text-gray-600 font-medium">
                    Tổng Số Phòng Gym
                  </span>
                }
                value={statistics.totalGyms}
                prefix={<HomeOutlined className="text-blue-500" />}
                valueStyle={{
                  color: "#1890ff",
                  fontSize: "28px",
                  fontWeight: "bold",
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-red-50 to-red-100">
              <Statistic
                title={
                  <span className="text-gray-600 font-medium">
                    Hot Research
                  </span>
                }
                value={statistics.hotResearchGyms}
                prefix={<FireOutlined className="text-red-500" />}
                valueStyle={{
                  color: "#ff4d4f",
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
                    Phòng Gym Thường
                  </span>
                }
                value={statistics.normalGyms}
                prefix={<BankOutlined className="text-green-500" />}
                valueStyle={{
                  color: "#52c41a",
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
                  placeholder="Tìm kiếm theo tên gym, địa chỉ, người đại diện..."
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
                onClick={() => setIsModalAddGymOpen(true)}
              >
                Thêm Phòng Gym
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
                <span className="font-semibold">{statistics.totalGyms}</span>{" "}
                phòng gym
                {searchText && (
                  <span className="ml-2">
                    | Tìm kiếm: "
                    <span className="font-semibold text-blue-600">
                      {searchText}
                    </span>
                    "
                  </span>
                )}
              </Text>
            </div>

            {/* Table */}
            <Table
              rowKey="id"
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
              }}
              onChange={handleTableChange}
              className="rounded-lg overflow-hidden"
              scroll={{ x: 1000 }}
              size="middle"
            />
          </ConfigProvider>
        </Card>
      </div>

      {/* Add Gym Modal */}
      <Modal
        open={isModalAddGymOpen}
        onCancel={() => {
          setIsModalAddGymOpen(false);
          formAdd.resetFields();
          setPosition(null);
          setMainImageList({});
          setImagesList([]);
        }}
        title={
          <div className="flex items-center gap-3 pb-4 border-b">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center">
              <IoBarbell className="text-white text-lg" />
            </div>
            <div>
              <Title level={3} className="m-0 text-gray-800">
                Thêm Phòng Gym Mới
              </Title>
              <Text className="text-gray-500">
                Điền thông tin để thêm phòng gym vào hệ thống
              </Text>
            </div>
          </div>
        }
        footer={null}
        width={900}
        className="custom-modal"
      >
        <Form
          form={formAdd}
          layout="vertical"
          requiredMark={false}
          onFinish={handleAddGym}
          className="max-h-[70vh] overflow-y-auto py-6"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={
                  <span className="font-semibold text-gray-700">
                    Số điện thoại
                  </span>
                }
                name="phone"
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại" },
                  { pattern: /^[0-9]+$/, message: "Vui lòng chỉ nhập số" },
                ]}
              >
                <Input
                  prefix={<PhoneOutlined className="text-gray-400" />}
                  placeholder="09XXXXXXXX"
                  maxLength={10}
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={
                  <span className="font-semibold text-gray-700">Email</span>
                }
                name="email"
                rules={[
                  { required: true, message: "Vui lòng nhập email" },
                  { type: "email", message: "Email không hợp lệ" },
                ]}
              >
                <Input
                  prefix={<GlobalOutlined className="text-gray-400" />}
                  placeholder="example@email.com"
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label={
              <span className="font-semibold text-gray-700">Mật khẩu</span>
            }
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
          >
            <Input.Password placeholder="Nhập mật khẩu" size="large" />
          </Form.Item>

          <Divider />

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={
                  <span className="font-semibold text-gray-700">
                    Tên Phòng Gym
                  </span>
                }
                name="gymName"
                rules={[
                  { required: true, message: "Vui lòng nhập tên phòng gym" },
                ]}
              >
                <Input
                  prefix={<FaDumbbell className="text-gray-400" />}
                  placeholder="Tên phòng gym"
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={
                  <span className="font-semibold text-gray-700">
                    Hoạt động từ năm
                  </span>
                }
                name="since"
                rules={[
                  { required: true, message: "Vui lòng nhập năm hoạt động" },
                ]}
              >
                <Input
                  prefix={<CalendarOutlined className="text-gray-400" />}
                  placeholder="2025"
                  type="number"
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label={<span className="font-semibold text-gray-700">Địa chỉ</span>}
            name="address"
            rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
          >
            <Input
              prefix={<EnvironmentOutlined className="text-gray-400" />}
              placeholder="123 Nguyễn Văn Linh, TP.HCM"
              size="large"
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={
                  <span className="font-semibold text-gray-700">
                    Tên người đại diện
                  </span>
                }
                name="representName"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập tên người đại diện",
                  },
                ]}
              >
                <Input
                  prefix={<UserOutlined className="text-gray-400" />}
                  placeholder="Nguyễn Văn A"
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={
                  <span className="font-semibold text-gray-700">
                    Mã số thuế
                  </span>
                }
                name="taxCode"
                rules={[
                  { required: true, message: "Vui lòng nhập mã số thuế" },
                ]}
              >
                <Input
                  prefix={<BankOutlined className="text-gray-400" />}
                  placeholder="ABC1234567"
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={
                  <span className="font-semibold text-gray-700">Kinh độ</span>
                }
                name="longitude"
                rules={[{ required: true, message: "Vui lòng nhập kinh độ" }]}
              >
                <Input
                  placeholder="106.660172"
                  type="number"
                  step="any"
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={
                  <span className="font-semibold text-gray-700">Vĩ độ</span>
                }
                name="latitude"
                rules={[{ required: true, message: "Vui lòng nhập vĩ độ" }]}
              >
                <Input
                  placeholder="10.762622"
                  type="number"
                  step="any"
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          <div className="mb-4">
            <Text className="font-semibold text-gray-700 block mb-2">
              Chọn vị trí trên bản đồ (tùy chọn)
            </Text>
            <div className="border rounded-lg overflow-hidden shadow-sm">
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={13}
                onClick={handleMapClick}
                options={{
                  styles: [
                    {
                      featureType: "poi",
                      elementType: "labels",
                      stylers: [{ visibility: "off" }],
                    },
                  ],
                }}
              >
                {position && (
                  <Marker
                    position={position}
                    animation={window.google?.maps?.Animation?.BOUNCE}
                  />
                )}
              </GoogleMap>
            </div>
            <Text className="text-gray-500 text-sm mt-2">
              Nhấp vào bản đồ để chọn vị trí chính xác của phòng gym
            </Text>
          </div>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={
                  <span className="font-semibold text-gray-700">QR Code</span>
                }
                name="qrcode"
                rules={[{ required: true, message: "Vui lòng nhập QR code" }]}
              >
                <Input
                  prefix={<QrcodeOutlined className="text-gray-400" />}
                  placeholder="QR123456"
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Main Image Upload */}
          <Form.Item
            label={
              <span className="font-semibold text-gray-700">
                Ảnh đại diện phòng gym
              </span>
            }
            name="mainImage"
            rules={[
              { required: true, message: "Vui lòng tải lên ảnh đại diện" },
            ]}
          >
            <Upload
              listType="picture-card"
              fileList={mainImageList ? [mainImageList] : []}
              onChange={({ fileList }) => {
                const latestFile = fileList[fileList.length - 1] || null;
                setMainImageList(latestFile); // Set as single object instead of array
                formAdd.setFieldsValue({ mainImage: latestFile });
              }}
              beforeUpload={() => false} // Prevent auto upload
              accept="image/*"
              maxCount={1}
            >
              {!mainImageList && (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Tải lên</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          {/* Multiple Images Upload */}
          <Form.Item
            label={
              <span className="font-semibold text-gray-700">
                Ảnh bổ sung phòng gym
              </span>
            }
            name="images"
          >
            <Upload
              listType="picture-card"
              fileList={imagesList}
              onChange={({ fileList }) => {
                setImagesList(fileList);
                formAdd.setFieldsValue({ images: fileList });
              }}
              beforeUpload={() => false} // Prevent auto upload
              accept="image/*"
              multiple
            >
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Tải lên</div>
              </div>
            </Upload>
          </Form.Item>

          <div className="text-center pt-6 border-t mt-6">
            <Space size="middle">
              <Button
                size="large"
                onClick={() => {
                  setIsModalAddGymOpen(false);
                  formAdd.resetFields();
                  setPosition(null);
                  setMainImageList([]);
                  setImagesList([]);
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
                className="bg-gradient-to-r from-orange-400 to-orange-600 border-0 px-8 shadow-lg"
              >
                {loadingAdd ? "Đang thêm..." : "Thêm Phòng Gym"}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      <style jsx global>{`
        .custom-modal .ant-modal-header {
          border-bottom: none;
          padding: 24px 24px 0;
        }
        .custom-modal .ant-modal-body {
          padding: 0 24px 24px;
        }
        .ant-table-thead > tr > th {
          font-weight: 600;
          color: #374151;
        }
        .ant-pagination-item-active {
          background: #ff914d !important;
          border-color: #ff914d !important;
        }
        .ant-pagination-item-active a {
          color: white !important;
        }
        .ant-pagination-item:hover {
          border-color: #ff914d !important;
        }
        .ant-pagination-item:hover a {
          color: #ff914d !important;
        }
      `}</style>
    </div>
  );
}
