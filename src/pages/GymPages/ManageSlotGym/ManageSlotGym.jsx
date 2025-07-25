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
  TimePicker,
  Typography,
  Empty,
  Tooltip,
  Row,
  Col,
} from "antd";
import React, { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import {
  LoadingOutlined,
  SearchOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { FaPlus } from "react-icons/fa";
import gymService from "../../../services/gymServices";
import { ImBin } from "react-icons/im";
import { MdEdit } from "react-icons/md";
import { IoBarbell } from "react-icons/io5";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { confirm } = Modal;

export default function ManageSlotGym() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalAddSlotOpen, setIsModalAddSlotOpen] = useState(false);
  const [isModalEditSlotOpen, setIsModalEditSlotOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [formAdd] = Form.useForm();
  const [formEdit] = Form.useForm();
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Memoized fetch function to prevent unnecessary re-renders
  const fetchSlotsGym = useCallback(
    async (page = 1, pageSize = 10, search = "") => {
      setLoading(true);
      try {
        const response = await gymService.getSlotOfGym({
          page,
          size: pageSize,
          search: search.trim(),
        });
        const { items, total, page: currentPage } = response.data;
        setSlots(items || []);
        setPagination({
          current: currentPage,
          pageSize,
          total,
        });
      } catch (error) {
        console.error("Error fetching Slots:", error);
        toast.error("Không thể tải danh sách slot. Vui lòng thử lại.");
        setSlots([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchSlotsGym();
  }, [fetchSlotsGym]);

  const handleTableChange = (newPagination) => {
    fetchSlotsGym(newPagination.current, newPagination.pageSize, searchText);
  };

  const handleDelete = async (record) => {
    confirm({
      title: "Xác nhận xóa slot",
      content: (
        <div>
          <p>
            Bạn có chắc chắn muốn xóa slot <strong>"{record.name}"</strong>{" "}
            không?
          </p>
          <p className="text-gray-500 mt-2">
            Thời gian: {record.startTime?.slice(0, 5)} -{" "}
            {record.endTime?.slice(0, 5)}
          </p>
        </div>
      ),
      icon: <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />,
      okText: "Xóa",
      cancelText: "Hủy",
      okType: "danger",
      onOk: async () => {
        try {
          await gymService.deleteSlot(record.id);
          toast.success(`Đã xóa slot "${record.name}" thành công`);
          // Refresh current page or go to previous page if current page becomes empty
          const newTotal = pagination.total - 1;
          const maxPage = Math.ceil(newTotal / pagination.pageSize);
          const targetPage =
            pagination.current > maxPage ? maxPage : pagination.current;
          fetchSlotsGym(
            Math.max(1, targetPage),
            pagination.pageSize,
            searchText
          );
        } catch (error) {
          console.error("Error deleting slot:", error);
          toast.error(error.response?.data?.message || "Xóa slot thất bại");
        }
      },
    });
  };

  const handleEdit = (record) => {
    setEditingSlot(record);
    formEdit.setFieldsValue({
      name: record.name,
      startTime: dayjs(record.startTime, "HH:mm:ss"),
      endTime: dayjs(record.endTime, "HH:mm:ss"),
    });
    setIsModalEditSlotOpen(true);
  };

  const validateTimeRange = (_, value) => {
    if (!value) return Promise.resolve();

    const formValues = formAdd.getFieldsValue();
    const startTime = formValues.startTime;
    const endTime = formValues.endTime;

    if (startTime && endTime) {
      if (dayjs(endTime).isBefore(dayjs(startTime))) {
        return Promise.reject(new Error("Giờ kết thúc phải sau giờ bắt đầu"));
      }

      const duration = dayjs(endTime).diff(dayjs(startTime), "minutes");
      if (duration < 30) {
        return Promise.reject(
          new Error("Slot phải có thời lượng tối thiểu 30 phút")
        );
      }
    }

    return Promise.resolve();
  };

  const columns = [
    {
      title: "STT",
      key: "index",
      align: "center",
      width: 60,
      render: (_, __, index) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: "Tên Slot",
      dataIndex: "name",
      key: "name",
      align: "center",
      ellipsis: true,
      render: (text) => (
        <Text strong className="text-gray-800">
          {text}
        </Text>
      ),
    },
    {
      title: (
        <span className="flex items-center justify-center gap-1">
          <ClockCircleOutlined />
          Thời gian
        </span>
      ),
      key: "timeRange",
      align: "center",
      render: (_, record) => (
        <div className="text-center">
          <div className="text-sm font-medium text-blue-600">
            {record.startTime?.slice(0, 5)}
          </div>
          <div className="text-xs text-gray-400">đến</div>
          <div className="text-sm font-medium text-blue-600">
            {record.endTime?.slice(0, 5)}
          </div>
        </div>
      ),
    },
    {
      title: "Thời lượng",
      key: "duration",
      align: "center",
      render: (_, record) => {
        if (!record.startTime || !record.endTime) return "-";
        const start = dayjs(record.startTime, "HH:mm:ss");
        const end = dayjs(record.endTime, "HH:mm:ss");
        const duration = end.diff(start, "minutes");
        const hours = Math.floor(duration / 60);
        const minutes = duration % 60;

        return (
          <Text className="text-gray-600">
            {hours > 0 ? `${hours}h ` : ""}
            {minutes > 0 ? `${minutes}m` : ""}
          </Text>
        );
      },
    },
    {
      title: "Hành động",
      key: "action",
      align: "center",
      width: 120,
      render: (_, record) => (
        <div className="flex justify-center items-center gap-3">
          <Tooltip title="Chỉnh sửa">
            <MdEdit
              onClick={() => handleEdit(record)}
              className="cursor-pointer hover:scale-110 transition-transform"
              size={20}
              color="#FF914D"
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <ImBin
              onClick={() => handleDelete(record)}
              className="cursor-pointer hover:scale-110 transition-transform"
              color="#ED2A46"
              size={18}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  const handleAddSlot = async (values) => {
    setLoadingAdd(true);
    try {
      const requestData = {
        name: values.name.trim(),
        startTime: dayjs(values.startTime).format("HH:mm:ss"),
        endTime: dayjs(values.endTime).format("HH:mm:ss"),
      };

      await gymService.addSlot(requestData);
      toast.success("Thêm slot thành công");
      fetchSlotsGym(pagination.current, pagination.pageSize, searchText);
      setIsModalAddSlotOpen(false);
      formAdd.resetFields();
    } catch (error) {
      console.error("Error adding slot:", error);
      toast.error(error.response?.data?.message || "Thêm slot thất bại");
    } finally {
      setLoadingAdd(false);
    }
  };

  const handleEditSlot = async (values) => {
    setLoadingEdit(true);
    try {
      const requestData = {
        name: values.name.trim(),
        startTime: dayjs(values.startTime).format("HH:mm:ss"),
        endTime: dayjs(values.endTime).format("HH:mm:ss"),
      };

      await gymService.updateSlot(editingSlot.id, requestData);
      toast.success("Cập nhật slot thành công");
      fetchSlotsGym(pagination.current, pagination.pageSize, searchText);
      setIsModalEditSlotOpen(false);
      setEditingSlot(null);
      formEdit.resetFields();
    } catch (error) {
      console.error("Error updating slot:", error);
      toast.error(error.response?.data?.message || "Cập nhật slot thất bại");
    } finally {
      setLoadingEdit(false);
    }
  };

  const handleCloseAddModal = () => {
    setIsModalAddSlotOpen(false);
    formAdd.resetFields();
  };

  const handleCloseEditModal = () => {
    setIsModalEditSlotOpen(false);
    setEditingSlot(null);
    formEdit.resetFields();
  };

  if (loading && slots.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spin
          indicator={
            <LoadingOutlined style={{ fontSize: 48, color: "#FF914D" }} spin />
          }
          tip="Đang tải danh sách slot..."
          size="large"
        />
      </div>
    );
  }
  const filteredSlot = slots.filter((slot) =>
    slot.name.toLowerCase().includes(searchText.toLowerCase())
  );
  return (
    <div className="  min-h-screen">
      <div className="">
        <div className="mb-6">
          <Title level={2} className="!mb-2 flex items-center gap-2">
            <IoBarbell className="text-[#FF914D]" />
            Quản lý Slot Gym
          </Title>
          <Text type="secondary">
            Quản lý các khung giờ tập luyện tại phòng gym
          </Text>
        </div>

        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} md={8}>
            <Input.Search
              placeholder="Tìm kiếm slot..."
              allowClear
              size="middle"
              onChange={(e) => {
                if (!e.target.value) {
                  setSearchText(e.target.value);
                }
              }}
            />
          </Col>
          <Col xs={24} sm={12} md={16} className="text-right">
            <Button
              type="primary"
              icon={<FaPlus />}
              size="middle"
              className="bg-[#FF914D] hover:bg-[#e8822d] border-[#FF914D]"
              onClick={() => setIsModalAddSlotOpen(true)}
            >
              Thêm Slot Mới
            </Button>
          </Col>
        </Row>

        <ConfigProvider
          theme={{
            components: {
              Table: {
                headerBg: "#FFE5E9",
                headerColor: "#ED2A46",
              },
            },
          }}
        >
          <Table
            dataSource={filteredSlot}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total} slot`,
              position: ["bottomCenter"],
              pageSizeOptions: ["10", "20", "50"],
            }}
            onChange={handleTableChange}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Chưa có slot nào"
                />
              ),
            }}
            scroll={{ x: 600 }}
          />
        </ConfigProvider>
      </div>

      {/* Add Slot Modal */}
      <Modal
        open={isModalAddSlotOpen}
        onCancel={handleCloseAddModal}
        title={
          <div className="text-xl font-bold text-[#ED2A46] flex items-center gap-2 border-b pb-3">
            <IoBarbell />
            Thêm Slot Mới
          </div>
        }
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form
          form={formAdd}
          layout="vertical"
          requiredMark={false}
          onFinish={handleAddSlot}
          className="pt-4"
        >
          <Form.Item
            label={
              <Text strong className="text-[#ED2A46]">
                Tên Slot
              </Text>
            }
            name="name"
            rules={[
              { required: true, message: "Vui lòng nhập tên slot" },
              { min: 3, message: "Tên slot phải có ít nhất 3 ký tự" },
              { max: 50, message: "Tên slot không được quá 50 ký tự" },
            ]}
          >
            <Input
              placeholder="VD: Slot buổi sáng, Slot tập yoga..."
              maxLength={50}
              showCount
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={
                  <Text strong className="text-[#ED2A46]">
                    Giờ bắt đầu
                  </Text>
                }
                name="startTime"
                rules={[
                  { required: true, message: "Vui lòng chọn giờ bắt đầu" },
                  { validator: validateTimeRange },
                ]}
              >
                <TimePicker
                  format="HH:mm"
                  className="!w-full"
                  placeholder="Chọn giờ bắt đầu"
                  minuteStep={15}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={
                  <Text strong className="text-[#ED2A46]">
                    Giờ kết thúc
                  </Text>
                }
                name="endTime"
                rules={[
                  { required: true, message: "Vui lòng chọn giờ kết thúc" },
                  { validator: validateTimeRange },
                ]}
              >
                <TimePicker
                  format="HH:mm"
                  className="!w-full"
                  placeholder="Chọn giờ kết thúc"
                  minuteStep={15}
                />
              </Form.Item>
            </Col>
          </Row>

          <div className="text-center pt-4 border-t">
            <Space>
              <Button onClick={handleCloseAddModal}>Hủy</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loadingAdd}
                className="bg-[#FF914D] hover:bg-[#e8822d] border-[#FF914D] px-8"
              >
                Thêm Slot
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* Edit Slot Modal */}
      <Modal
        open={isModalEditSlotOpen}
        onCancel={handleCloseEditModal}
        title={
          <div className="text-xl font-bold text-[#ED2A46] flex items-center gap-2 border-b pb-3">
            <MdEdit />
            Chỉnh sửa Slot
          </div>
        }
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form
          form={formEdit}
          layout="vertical"
          requiredMark={false}
          onFinish={handleEditSlot}
          className="pt-4"
        >
          <Form.Item
            label={
              <Text strong className="text-[#ED2A46]">
                Tên Slot
              </Text>
            }
            name="name"
            rules={[
              { required: true, message: "Vui lòng nhập tên slot" },
              { min: 3, message: "Tên slot phải có ít nhất 3 ký tự" },
              { max: 50, message: "Tên slot không được quá 50 ký tự" },
            ]}
          >
            <Input
              placeholder="VD: Slot buổi sáng, Slot tập yoga..."
              maxLength={50}
              showCount
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={
                  <Text strong className="text-[#ED2A46]">
                    Giờ bắt đầu
                  </Text>
                }
                name="startTime"
                rules={[
                  { required: true, message: "Vui lòng chọn giờ bắt đầu" },
                ]}
              >
                <TimePicker
                  format="HH:mm"
                  className="!w-full"
                  placeholder="Chọn giờ bắt đầu"
                  minuteStep={15}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={
                  <Text strong className="text-[#ED2A46]">
                    Giờ kết thúc
                  </Text>
                }
                name="endTime"
                rules={[
                  { required: true, message: "Vui lòng chọn giờ kết thúc" },
                ]}
              >
                <TimePicker
                  format="HH:mm"
                  className="!w-full"
                  placeholder="Chọn giờ kết thúc"
                  minuteStep={15}
                />
              </Form.Item>
            </Col>
          </Row>

          <div className="text-center pt-4 border-t">
            <Space>
              <Button onClick={handleCloseEditModal}>Hủy</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loadingEdit}
                className="bg-[#FF914D] hover:bg-[#e8822d] border-[#FF914D] px-8"
              >
                Cập nhật
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
