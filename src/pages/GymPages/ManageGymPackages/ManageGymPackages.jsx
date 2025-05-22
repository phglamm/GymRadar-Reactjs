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
import { FaEye, FaPlus } from "react-icons/fa";
import gymService from "../../../services/gymServices";
import dayjs from "dayjs";
import { ImBin } from "react-icons/im";
import { MdEdit } from "react-icons/md";
import { IoBarbell } from "react-icons/io5";
export default function ManageGymPackages() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
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

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
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
      console.log(items);
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
    setLoading(true);
    try {
      const response = await gymService.getPTofGym({ page, size: pageSize });
      const { items } = response.data;
      setPts(items);
      console.log(items);
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
          tip="Loading"
          size="large"
        />
      </div>
    );
  }
  const handleDelete = async (id) => {
    Modal.confirm({
      title: "Bạn có chắc chắn muốn xóa gói tập này không?",
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

  const columns = [
    {
      title: "Tên Gói Tập",
      dataIndex: "name",
      key: "fullName",
      align: "center",
    },
    {
      title: "Thời Lượng (Ngày)",
      dataIndex: "duration",
      key: "duration",
      align: "center",
    },
    {
      title: "Giá Tiền (VNĐ)",
      dataIndex: "price",
      key: "price",
      align: "center",
      render: (value) =>
        value.toLocaleString("vi", {
          style: "currency",
          currency: "VND",
        }),
    },
    {
      title: "Loại Gói Tập",
      dataIndex: "type",
      key: "type",
      render: (value) => (value === "WithPT" ? "Có PT" : "Không có PT"),
      align: "center",
    },
    {
      title: "Hành động",
      key: "action",
      align: "center",

      render: (text, record) => (
        <div className="flex justify-center items-center gap-2">
          <FaEye
            onClick={() => {
              setIsModalGymCouseDetailOpen(true);
              setSelectedCourse(record);
              fetchGymCourseDetail(record.id);
            }}
            size={25}
            className="cursor-pointer"
          />
          <Button
            type="primary"
            onClick={() => {
              setIsModalAddGymCoursePTOpen(true);
              setSelectedCourse(record);
            }}
          >
            Thêm PT vào gói Tập
          </Button>
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

  const fetchGymCourseDetail = async (id) => {
    try {
      const response = await gymService.getDetailGymCoursePT({ id });
      console.log("GymCourseDetail", response.data);
    } catch (error) {
      console.error("Error fetching Gym Course Detail:", error);
    }
  };
  const filteredData = searchText
    ? courses.filter((item) =>
        (item.name?.toLowerCase() || "").includes(searchText.toLowerCase())
      )
    : courses;

  const handleAddCourseGym = async (values) => {
    setLoadingAdd(true);
    console.log(values);
    const requestData = {
      name: values.name,
      description: values.description,
      price: values.price,
      duration: values.duration,
      type: values.type,
      image: values.image || "image",
    };
    console.log("Request Add Course", requestData);
    try {
      const response = await gymService.addCourse(requestData);
      toast.success("Thêm gói tập thành công");
      fetchCoursesGym();
      setIsModalAddCourseOpen(false);
      formAdd.resetFields();
      console.log(response);
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Lỗi thêm gói tập thất bại");
    } finally {
      setLoadingAdd(false);
    }
  };

  const handleAddGymCoursePT = async (values) => {
    setLoadingAddGymCoursePT(true);
    console.log(values);
    const requestData = {
      ptid: values.ptid,
      gymCourseId: selectedCourse.id,
      session: values.session,
    };
    console.log("Request Add PT to Course", requestData);
    try {
      const response = await gymService.addPTToCourse(requestData);
      toast.success("Thêm PT vào gói tập thành công");
      setIsModalAddGymCoursePTOpen(false);
      formAddGymCourse.resetFields();
      console.log(response);
    } catch (error) {
      console.log(error);
      toast.error(
        error.response?.data?.message || "Lỗi thêm PT vào gói tập thất bại"
      );
    } finally {
      setLoadingAddGymCoursePT(false);
    }
  };

  return (
    <div className="">
      <ConfigProvider
        theme={{ components: { Table: { headerBg: "#FFE5E9" } } }}
      >
        <div className="flex justify-end items-center mb-6">
          <Input
            placeholder="Tìm kiếm theo tên Gói Tập"
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
            onClick={() => setIsModalAddCourseOpen(true)}
          >
            Thêm Gói Tập
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
        open={isModalAddCourseOpen}
        onCancel={() => setIsModalAddCourseOpen(false)}
        title={
          <p className="text-2xl font-bold text-[#ED2A46] flex items-center gap-2">
            <IoBarbell />
            Thêm Gói Tập
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
          className="max-h-[65vh] overflow-y-auto !py-5 !px-15"
        >
          <Form.Item
            label={
              <p className="text-xl font-bold text-[#ED2A46]">Tên gói tập</p>
            }
            name="name"
            rules={[{ required: true, message: "Vui lòng tên gói" }]}
          >
            <Input placeholder="Gói 1 tháng" />
          </Form.Item>

          <Form.Item
            label={
              <p className="text-xl font-bold text-[#ED2A46]">Giới thiệu</p>
            }
            name="description"
            rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
          >
            <Input.TextArea
              placeholder="Mô tả gói tập"
              autoSize={{ minRows: 3, maxRows: 5 }}
            />
          </Form.Item>

          <Form.Item
            label={<p className="text-xl font-bold text-[#ED2A46]">Giá tiền</p>}
            name="price"
            rules={[{ required: true, message: "Vui lòng nhập giá tiền" }]}
          >
            <InputNumber
              min={1000}
              placeholder="e.g. 100000"
              className="!w-full"
            />
          </Form.Item>

          <Form.Item
            label={
              <p className="text-xl font-bold text-[#ED2A46]">
                Thời lượng gói tập (Ngày)
              </p>
            }
            name="duration"
            rules={[{ required: true, message: "Vui lòng thời lượng gói tập" }]}
          >
            <InputNumber min={1} placeholder="e.g. 30" className="!w-full" />
          </Form.Item>

          <Form.Item
            label={
              <p className="text-xl font-bold text-[#ED2A46]">Loại gói tập</p>
            }
            name="type"
            rules={[{ required: true, message: "Vui lòng chọn loại gói tập" }]}
          >
            <Select placeholder="Chọn gói tập">
              <Select.Option value="WithPT">Có PT</Select.Option>
              <Select.Option value="Normal">Bình thường</Select.Option>
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

      <Modal
        open={isModalAddGymCoursePTOpen}
        onCancel={() => setIsModalAddGymCoursePTOpen(false)}
        title={
          <p className="text-2xl font-bold text-[#ED2A46] flex items-center gap-2">
            <IoBarbell />
            Thêm PT vào Gói Tập
          </p>
        }
        footer={null}
        width={700}
      >
        <Form
          form={formAddGymCourse}
          layout="vertical"
          requiredMark={false}
          onFinish={handleAddGymCoursePT}
          className="max-h-[65vh] overflow-y-auto !py-5 !px-15"
        >
          <Form.Item
            label={
              <p className="text-xl font-bold text-[#ED2A46]">Số lượng buổi</p>
            }
            name="session"
            rules={[{ required: true, message: "Vui lòng tên gói" }]}
          >
            <InputNumber min={1} className="!w-full" />
          </Form.Item>

          <Form.Item
            label={<p className="text-xl font-bold text-[#ED2A46]">Chọn PT</p>}
            name="ptid"
            rules={[{ required: true, message: "Vui lòng chọn loại gói tập" }]}
          >
            <Select placeholder="Chọn PT">
              {pts.map((pt) => (
                <Select.Option key={pt.id} value={pt.id}>
                  {pt.fullName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <div className="text-center">
            <Button
              onClick={() => formAddGymCourse.submit()}
              loading={loadingAddGymCoursePT}
              color="orange"
              variant="solid"
              className="!w-[50%] !rounded-full !h-10 !font-medium !border-0 shadow-2xl"
            >
              Gửi Thông Tin
            </Button>
          </div>
        </Form>
      </Modal>

      <Modal
        open={isModalGymCouseDetailOpen}
        onCancel={() => setIsModalGymCouseDetailOpen(false)}
        title={
          <p className="text-2xl font-bold text-[#ED2A46] flex items-center gap-2">
            <IoBarbell />
            PT trong Gói Tập
          </p>
        }
        footer={null}
        width={700}
      ></Modal>
    </div>
  );
}
