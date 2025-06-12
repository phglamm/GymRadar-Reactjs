import {
  ConfigProvider,
  Input,
  Spin,
  Table,
  Card,
  Row,
  Col,
  Statistic,
  Button,
  Space,
  Tag,
  Tooltip,
  Modal,
  Form,
  InputNumber,
  message,
} from "antd";
import React, { useEffect, useState } from "react";
import adminService from "../../../services/adminServices";
import {
  LoadingOutlined,
  SearchOutlined,
  CrownOutlined,
  DollarOutlined,
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  StarOutlined,
} from "@ant-design/icons";

const { TextArea } = Input;

export default function ManagePremiumPage() {
  const [premiumPackages, setPremiumPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Premium package statistics
  const [statistics, setStatistics] = useState({
    totalPackages: 0,
    averagePrice: 0,
    highestPrice: 0,
    lowestPrice: 0,
  });

  // API service functions
  const fetchPremiumPackages = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      // Using your actual API structure
      const response = await adminService.getAllPremiumSubscriptions({
        page,
        size: pageSize,
      });

      const { items, total, page: currentPage, totalPages } = response.data;

      setPremiumPackages(items);
      setPagination({
        current: currentPage,
        pageSize,
        total,
        totalPages,
      });

      // Calculate statistics from the data
      calculateStatistics(items);
    } catch (error) {
      console.error("Error fetching premium packages:", error);
      message.error("Không thể tải danh sách gói premium");
    } finally {
      setLoading(false);
    }
  };

  const calculateStatistics = (data) => {
    if (data.length === 0) {
      setStatistics({
        totalPackages: 0,
        averagePrice: 0,
        highestPrice: 0,
        lowestPrice: 0,
      });
      return;
    }

    const prices = data.map((pkg) => pkg.price || 0);
    const totalPackages = data.length;
    const averagePrice =
      prices.reduce((sum, price) => sum + price, 0) / totalPackages;
    const highestPrice = Math.max(...prices);
    const lowestPrice = Math.min(...prices);

    setStatistics({
      totalPackages,
      averagePrice,
      highestPrice,
      lowestPrice,
    });
  };

  const createPremiumPackage = async (values) => {
    try {
      await adminService.createPremiumPackage(values);
      message.success("Tạo gói premium thành công!");
      setModalVisible(false);
      form.resetFields();
      fetchPremiumPackages(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error("Error creating premium package:", error);
      message.error("Không thể tạo gói premium");
    }
  };

  const updatePremiumPackage = async (id, values) => {
    try {
      await adminService.updatePremiumPackage(id, values);
      message.success("Cập nhật gói premium thành công!");
      setModalVisible(false);
      setEditingPackage(null);
      form.resetFields();
      fetchPremiumPackages(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error("Error updating premium package:", error);
      message.error("Không thể cập nhật gói premium");
    }
  };

  const deletePremiumPackage = async (id) => {
    try {
      await adminService.deletePremiumPackage(id);
      message.success("Xóa gói premium thành công!");
      fetchPremiumPackages(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error("Error deleting premium package:", error);
      message.error("Không thể xóa gói premium");
    }
  };

  useEffect(() => {
    fetchPremiumPackages();
  }, []);

  const handleTableChange = (pagination) => {
    fetchPremiumPackages(pagination.current, pagination.pageSize);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const handleAddPackage = () => {
    setEditingPackage(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditPackage = (record) => {
    setEditingPackage(record);
    form.setFieldsValue({
      name: record.name,
      description: record.description,
      price: record.price,
    });
    setModalVisible(true);
  };

  const handleDeletePackage = (record) => {
    Modal.confirm({
      title: "Xác nhận xóa gói premium",
      content: `Bạn có chắc chắn muốn xóa gói "${record.name}"?`,
      okText: "Xóa",
      cancelText: "Hủy",
      okType: "danger",
      onOk: () => deletePremiumPackage(record.id),
    });
  };

  const handleSubmit = (values) => {
    if (editingPackage) {
      updatePremiumPackage(editingPackage.id, values);
    } else {
      createPremiumPackage(values);
    }
  };

  const columns = [
    {
      title: "Tên Gói",
      dataIndex: "name",
      key: "name",
      align: "left",
      render: (text) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
            <CrownOutlined className="text-white text-lg" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{text}</div>
            <Tag color="gold" size="small">
              Premium
            </Tag>
          </div>
        </div>
      ),
    },
    {
      title: "Mô Tả",
      dataIndex: "description",
      key: "description",
      align: "left",
      render: (text) => (
        <div className="max-w-xs">
          <p className="text-gray-700 truncate" title={text}>
            {text || "Chưa có mô tả"}
          </p>
        </div>
      ),
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      align: "center",
      sorter: (a, b) => (a.price || 0) - (b.price || 0),
      render: (price) => (
        <div className="font-semibold text-green-600 text-lg">
          {formatCurrency(price)}
        </div>
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
                Modal.info({
                  title: `Chi tiết gói: ${record.name}`,
                  content: (
                    <div className="mt-4">
                      <p>
                        <strong>Tên gói:</strong> {record.name}
                      </p>
                      <p>
                        <strong>Mô tả:</strong>{" "}
                        {record.description || "Chưa có mô tả"}
                      </p>
                      <p>
                        <strong>Giá:</strong> {formatCurrency(record.price)}
                      </p>
                      <p>
                        <strong>ID:</strong> {record.id}
                      </p>
                    </div>
                  ),
                  width: 500,
                });
              }}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              className="text-orange-600 hover:bg-orange-50"
              onClick={() => handleEditPackage(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              type="text"
              icon={<DeleteOutlined />}
              className="text-red-600 hover:bg-red-50"
              onClick={() => handleDeletePackage(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const filteredData = premiumPackages.filter((item) => {
    const matchesSearch = searchText
      ? (item.name?.toLowerCase() || "").includes(searchText.toLowerCase()) ||
        (item.description?.toLowerCase() || "").includes(
          searchText.toLowerCase()
        )
      : true;

    return matchesSearch;
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Quản Lý Gói Premium
          </h1>
          <p className="text-gray-600">
            Quản lý các gói premium có sẵn trong hệ thống
          </p>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} className="mb-8">
          <Col xs={24} sm={12} lg={6}>
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <Statistic
                title="Tổng Số Gói"
                value={statistics.totalPackages}
                prefix={<StarOutlined style={{ color: "#FFD700" }} />}
                valueStyle={{
                  color: "#FFD700",
                  fontSize: "24px",
                  fontWeight: "bold",
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <Statistic
                title="Giá Trung Bình"
                value={statistics.averagePrice}
                prefix={<StarOutlined style={{ color: "#fa8c16" }} />}
                formatter={(value) => formatCurrency(value)}
                valueStyle={{
                  color: "#fa8c16",
                  fontSize: "20px",
                  fontWeight: "bold",
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <Statistic
                title="Giá Cao Nhất"
                value={statistics.highestPrice}
                prefix={<DollarOutlined style={{ color: "#52c41a" }} />}
                formatter={(value) => formatCurrency(value)}
                valueStyle={{
                  color: "#52c41a",
                  fontSize: "20px",
                  fontWeight: "bold",
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <Statistic
                title="Giá Thấp Nhất"
                value={statistics.lowestPrice}
                prefix={<DollarOutlined style={{ color: "#FF914D" }} />}
                formatter={(value) => formatCurrency(value)}
                valueStyle={{
                  color: "#FF914D",
                  fontSize: "20px",
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
                placeholder="Tìm kiếm theo tên hoặc mô tả..."
                prefix={<SearchOutlined className="text-gray-400" />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 300 }}
                allowClear
                className="rounded-lg"
              />
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="bg-orange-500 hover:bg-orange-600 border-orange-500"
              onClick={handleAddPackage}
            >
              Thêm Gói Premium
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
              gói premium
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
              scroll={{ x: 800 }}
              rowKey="id"
            />
          </ConfigProvider>
        </Card>

        {/* Add/Edit Modal */}
        <Modal
          title={
            editingPackage ? "Chỉnh Sửa Gói Premium" : "Thêm Gói Premium Mới"
          }
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            setEditingPackage(null);
            form.resetFields();
          }}
          footer={null}
          width={600}
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              label="Tên Gói"
              name="name"
              rules={[
                { required: true, message: "Vui lòng nhập tên gói!" },
                { min: 2, message: "Tên gói phải có ít nhất 2 ký tự!" },
              ]}
            >
              <Input
                placeholder="Nhập tên gói premium"
                prefix={<CrownOutlined />}
              />
            </Form.Item>

            <Form.Item
              label="Mô Tả"
              name="description"
              rules={[
                { required: true, message: "Vui lòng nhập mô tả!" },
                { min: 10, message: "Mô tả phải có ít nhất 10 ký tự!" },
              ]}
            >
              <TextArea
                rows={4}
                placeholder="Nhập mô tả chi tiết về gói premium"
              />
            </Form.Item>

            <Form.Item
              label="Giá (VND)"
              name="price"
              rules={[
                { required: true, message: "Vui lòng nhập giá!" },
                {
                  type: "number",
                  min: 1000,
                  message: "Giá phải lớn hơn 1,000 VND!",
                },
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                placeholder="Nhập giá gói premium"
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                prefix={<DollarOutlined />}
              />
            </Form.Item>

            <div className="flex justify-end gap-2 mt-6">
              <Button
                onClick={() => {
                  setModalVisible(false);
                  setEditingPackage(null);
                  form.resetFields();
                }}
              >
                Hủy
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                className="bg-orange-500 hover:bg-orange-600 border-orange-500"
              >
                {editingPackage ? "Cập Nhật" : "Tạo Mới"}
              </Button>
            </div>
          </Form>
        </Modal>
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
