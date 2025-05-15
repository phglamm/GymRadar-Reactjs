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
} from "antd";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { LoadingOutlined, SearchOutlined } from "@ant-design/icons";
import { FaPlus } from "react-icons/fa";
import gymService from "../../../services/gymServices";
import { ImBin } from "react-icons/im";
import { MdEdit } from "react-icons/md";
import { IoBarbell } from "react-icons/io5";
import dayjs from "dayjs";
export default function ManageSlotGym() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalAddSlotOpen, setIsModalAddSlotOpen] = useState(false);
  const [formAdd] = Form.useForm();
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const fetchSlotsGym = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const response = await gymService.getSlotOfGym({
        page,
        size: pageSize,
      });
      const { items, total, page: currentPage } = response.data;
      setSlots(items);
      console.log(items);
      setPagination({
        current: currentPage,
        pageSize,
        total,
      });
    } catch (error) {
      console.error("Error fetching Slots:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlotsGym();
  }, []);

  const handleTableChange = (pagination) => {
    fetchSlotsGym(pagination.current, pagination.pageSize);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spin
          indicator={
            <LoadingOutlined style={{ fontSize: 48, color: "#FF914D" }} spin />
          }
          tip="Loading"
          size="large"
        />
      </div>
    );
  }
  const handleDelete = async (id) => {
    Modal.confirm({
      title: "Bạn có chắc chắn muốn xóa Slot này không?",
      onOk: async () => {
        try {
          await gymService.deleteSlot(id);
          fetchSlotsGym();
          toast.success("Xoá Slot thành công");
        } catch (error) {
          console.error("Error deleting course:", error);
          toast.error(error.response?.data?.message || "Lỗi xóa Slot thất bại");
        }
      },
    });
  };

  const columns = [
    {
      title: "Tên Slot",
      dataIndex: "name",
      key: "name",
      align: "center",
    },
    {
      title: "Giờ bắt đầu",
      dataIndex: "startTime",
      key: "startTime",
      align: "center",
      render: (text) => text?.slice(0, 5), // e.g., "08:00"
    },
    {
      title: "Giờ kết thúc",
      dataIndex: "endTime",
      key: "endTime",
      align: "center",
      render: (text) => text?.slice(0, 5),
    },
    {
      title: "Hành động",
      key: "action",
      align: "center",
      render: (_, record) => (
        <div className="flex justify-center items-center gap-2">
          <ImBin
            onClick={() => handleDelete(record.id)}
            color="#ED2A46"
            size={25}
            className="cursor-pointer"
          />
          <MdEdit className="cursor-pointer" size={25} color="#FF914D" />
        </div>
      ),
    },
  ];

  const handleAddCourseGym = async (values) => {
    setLoadingAdd(true);
    console.log(values);
    const requestData = {
      name: values.name,
      startTime: dayjs(values.startTime).format("HH:mm:ss"),
      endTime: dayjs(values.endTime).format("HH:mm:ss"),
    };
    console.log("Request Add Slot", requestData);
    try {
      const response = await gymService.addSlot(requestData);
      toast.success("Thêm Slot thành công");
      fetchSlotsGym();
      setIsModalAddSlotOpen(false);
      formAdd.resetFields();
      console.log(response);
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Lỗi thêm Slot thất bại");
    } finally {
      setLoadingAdd(false);
    }
  };

  return (
    <div className="">
      <ConfigProvider
        theme={{ components: { Table: { headerBg: "#FFE5E9" } } }}
      >
        <div className="flex justify-end items-center mb-6">
          <Button
            icon={<FaPlus />}
            className="ml-4"
            color="blue"
            variant="solid"
            onClick={() => setIsModalAddSlotOpen(true)}
          >
            Thêm Slot
          </Button>
        </div>
        <Table
          dataSource={slots}
          columns={columns}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: false,
            position: ["bottomCenter"],
          }}
          onChange={handleTableChange}
        />
      </ConfigProvider>

      <Modal
        open={isModalAddSlotOpen}
        onCancel={() => setIsModalAddSlotOpen(false)}
        title={
          <p className="text-2xl font-bold text-[#ED2A46] flex items-center gap-2">
            <IoBarbell />
            Thêm Slot
          </p>
        }
        footer={null}
        width={600}
      >
        <Form
          form={formAdd}
          layout="vertical"
          requiredMark={false}
          onFinish={handleAddCourseGym}
          className="max-h-[65vh] overflow-y-auto !py-5 !px-15"
        >
          <Form.Item
            label={<p className="text-xl font-bold text-[#ED2A46]">Tên Slot</p>}
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên Slot" }]}
          >
            <Input placeholder="Slot buổi sáng" />
          </Form.Item>

          <Form.Item
            label={
              <p className="text-xl font-bold text-[#ED2A46]">Giờ bắt đầu</p>
            }
            name="startTime"
            rules={[{ required: true, message: "Vui lòng chọn giờ bắt đầu" }]}
          >
            <TimePicker format="HH:mm" className="!w-full" />
          </Form.Item>

          <Form.Item
            label={
              <p className="text-xl font-bold text-[#ED2A46]">Giờ kết thúc</p>
            }
            name="endTime"
            rules={[{ required: true, message: "Vui lòng chọn giờ kết thúc" }]}
          >
            <TimePicker format="HH:mm" className="!w-full" />
          </Form.Item>

          <div className="text-center mt-4">
            <Button
              onClick={() => formAdd.submit()}
              loading={loadingAdd}
              type="primary"
              className="!w-[50%] !rounded-full !h-10 !font-medium"
            >
              Gửi Thông Tin
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
