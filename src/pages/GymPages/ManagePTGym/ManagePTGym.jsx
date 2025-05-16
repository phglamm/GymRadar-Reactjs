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
} from "antd";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { LoadingOutlined, SearchOutlined } from "@ant-design/icons";
import { FaPlus } from "react-icons/fa";
import gymService from "../../../services/gymServices";
import dayjs from "dayjs";
import { ImBin } from "react-icons/im";
import { MdEdit } from "react-icons/md";
import { IoBarbell } from "react-icons/io5";

export default function ManagePTGym() {
  const [pts, setPts] = useState([]);
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
  const fetchPTGym = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const response = await gymService.getPTofGym({ page, size: pageSize });
      const { items, total, page: currentPage } = response.data;
      setPts(items);
      console.log(items);
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
      title: "Bạn có chắc chắn muốn xóa PT này không?",
      onOk: async () => {
        try {
          const response = await gymService.deletePT(id);
          console.log("Delete PT response:", response);
          fetchPTGym();
          toast.success("Bạn đã xoá PT thành công");
        } catch (error) {
          console.error("Error deleting gym:", error);
          toast.error(error.response?.data?.message || "Lỗi khi xoá PT");
        }
      },
    });
  };

  const columns = [
    {
      title: "Tên PT",
      dataIndex: "fullName",
      key: "fullName",
      align: "center",
    },
    {
      title: "Phòng gym liên kết",
      dataIndex: "location",
      key: "location",
      align: "center",
    },
    {
      title: "Khách hàng liên kết",
      dataIndex: "location",
      key: "location",
      align: "center",
    },
    {
      title: "Gói tập liên kết",
      dataIndex: "location",
      key: "location",
      align: "center",
    },
    {
      title: "Trạng Thái",
      dataIndex: "location",
      key: "location",
      align: "center",
    },
    {
      title: "Hành động",
      key: "action",
      align: "center",

      render: (text, record) => (
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

  const filteredData = searchText
    ? pts.filter((item) =>
        (item.fullName?.toLowerCase() || "").includes(searchText.toLowerCase())
      )
    : pts;

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

  return (
    <div className="">
      <ConfigProvider
        theme={{ components: { Table: { headerBg: "#FFE5E9" } } }}
      >
        <div className="flex justify-end items-center mb-6">
          <Input
            placeholder="Tìm kiếm theo tên PT"
            prefix={<SearchOutlined />}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
            allowClear
          />
          <Button
            icon={<FaPlus />}
            className="ml-4"
            color="blue"
            variant="solid"
            onClick={() => setIsModalAddGymOpen(true)}
          >
            Thêm PT
          </Button>
        </div>
        <Table
          dataSource={filteredData}
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
        open={isModalAddGymOpen}
        onCancel={() => setIsModalAddGymOpen(false)}
        title={
          <p className="text-2xl font-bold text-[#ED2A46] flex items-center gap-2">
            <IoBarbell />
            Thêm PT
          </p>
        }
        footer={null}
        width={700}
      >
        <Form
          form={formAdd}
          layout="vertical"
          requiredMark={false}
          onFinish={handleAddPTGym}
          className="max-h-[65vh] overflow-y-auto !py-5 !px-15"
        >
          <Form.Item
            label={
              <p className="text-xl font-bold text-[#ED2A46]">Số điện thoại</p>
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
              onKeyPress={(event) => {
                if (!/[0-9]/.test(event.key)) {
                  event.preventDefault();
                }
              }}
            />
          </Form.Item>

          <Form.Item
            label={<p className="text-xl font-bold text-[#ED2A46]">Email</p>}
            name="email"
            rules={[{ required: true, message: "Vui lòng nhập email" }]}
          >
            <Input placeholder="nguyenvana123@email.com" />
          </Form.Item>

          <Form.Item
            label={
              <p className="text-xl font-bold text-[#ED2A46]">
                Mật Khẩu cho PT
              </p>
            }
            name="password"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập mật khẩu cho PT!",
              },
            ]}
          >
            <Input placeholder="*******" type="password" />
          </Form.Item>

          <Form.Item
            label={
              <p className="text-xl font-bold text-[#ED2A46]">Họ và tên</p>
            }
            name="fullName"
            rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
          >
            <Input placeholder="Nguyễn Văn A" />
          </Form.Item>

          <Form.Item
            label={
              <p className="text-xl font-bold text-[#ED2A46]">Ngày sinh</p>
            }
            name="dob"
            rules={[{ required: true, message: "Vui lòng chọn ngày sinh" }]}
          >
            <DatePicker
              format="DD-MM-YYYY"
              className="w-full"
              placeholder="Chọn ngày sinh"
            />
          </Form.Item>

          <Form.Item
            label={
              <p className="text-xl font-bold text-[#ED2A46]">Cân nặng (kg)</p>
            }
            name="weight"
            rules={[{ required: true, message: "Vui lòng nhập cân nặng" }]}
          >
            <InputNumber min={0} placeholder="e.g. 70" className="!w-full" />
          </Form.Item>

          <Form.Item
            label={
              <p className="text-xl font-bold text-[#ED2A46]">Chiều cao (cm)</p>
            }
            name="height"
            rules={[{ required: true, message: "Vui lòng nhập chiều cao" }]}
          >
            <InputNumber min={0} placeholder="e.g. 170" className="!w-full" />
          </Form.Item>

          <Form.Item
            label={
              <p className="text-xl font-bold text-[#ED2A46]">
                Mục tiêu tập luyện
              </p>
            }
            name="goalTraining"
            rules={[{ required: true, message: "Vui lòng nhập mục tiêu" }]}
          >
            <Input placeholder="Tăng cơ, giảm mỡ, ..." />
          </Form.Item>

          <Form.Item
            label={
              <p className="text-xl font-bold text-[#ED2A46]">
                Kinh nghiệm (năm)
              </p>
            }
            name="experience"
            rules={[{ required: true, message: "Vui lòng nhập kinh nghiệm" }]}
          >
            <InputNumber min={0} placeholder="e.g. 2" className="!w-full" />
          </Form.Item>

          <Form.Item
            label={
              <p className="text-xl font-bold text-[#ED2A46]">Giới tính</p>
            }
            name="gender"
            rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
          >
            <Select placeholder="Chọn giới tính">
              <Select.Option value="Male">Nam</Select.Option>
              <Select.Option value="Female">Nữ</Select.Option>
            </Select>
          </Form.Item>

          <div className="text-center">
            <Button
              onClick={() => formAdd.submit()}
              loading={loadingAdd}
              color="orange"
              variant="solid"
              className="!w-[50%] !rounded-full !h-10 !font-medium !border-0 shadow-2xl"
            >
              Gửi Thông Tin
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
