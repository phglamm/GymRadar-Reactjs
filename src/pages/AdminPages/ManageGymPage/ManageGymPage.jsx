import {
  Button,
  Card,
  ConfigProvider,
  Form,
  Input,
  Modal,
  Space,
  Spin,
  Switch,
  Table,
} from "antd";
import React, { useEffect, useState } from "react";
import adminService from "../../../services/adminServices";
import toast from "react-hot-toast";
import { LoadingOutlined, SearchOutlined } from "@ant-design/icons";
import { FaPlus } from "react-icons/fa";

export default function ManageGymPage() {
  const [gym, setGym] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isModalAddGymOpen, setIsModalAddGymOpen] = useState(false);
  const [formAdd] = Form.useForm();
  const [loadingAdd, setLoadingAdd] = useState(false);
  const fetchGym = async () => {
    setLoading(true);
    try {
      const response = await adminService.getAllGym();
      console.log(response);
      setGym(response);
    } catch (error) {
      console.error("Error fetching gyms:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchGym();
  }, []);

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
      title: "Are you sure you want to delete this gym?",
      onOk: async () => {
        try {
          await adminService.deleteGym(id);
          fetchGym();
          toast.success("Gym deleted successfully");
        } catch (error) {
          console.error("Error deleting gym:", error);
          toast.error(error.response?.data?.message || "Failed to delete gym");
        }
      },
    });
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      align: "center",
    },
    {
      title: "Gym Name",
      dataIndex: "name",
      key: "name",
      align: "center",
    },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
      align: "center",
    },
    {
      title: "Action",
      key: "action",
      align: "center",

      render: (text, record) => (
        <Button color="danger" onClick={() => handleDelete(record.id)}>
          <a>Delete</a>
        </Button>
      ),
    },
  ];

  const filteredData = searchText
    ? gym.filter((item) =>
        (item.name?.toLowerCase() || "").includes(searchText.toLowerCase())
      )
    : gym;

  const handleAddGym = async (values) => {
    setLoadingAdd(true);
    console.log(values);
    const requestData = {
      phone: values.phone,
      email: values.email,
      password: values.password,
      createNewGym: {
        gymName: values.gymName,
        since: values.since,
        address: values.address,
        representName: values.representName,
        taxCode: values.taxCode,
        longitude: values.longitude,
        latitude: values.latitude,
        qrcode: values.qrcode,
        hotResearch: values.hotResearch,
      },
    };
    console.log("Request Add Gym", requestData);
    try {
      const response = await adminService.addGym(requestData);
      toast.success("Gym added successfully");
      fetchGym();
      setIsModalAddGymOpen(false);
      formAdd.resetFields();
      console.log(response);
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to add gym");
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
            placeholder="Search Gym's Name"
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
            Add Gym
          </Button>
        </div>
        <Table
          dataSource={filteredData}
          columns={columns}
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
            hideOnSinglePage: true,
            position: ["bottomCenter"],
          }}
        />
      </ConfigProvider>

      <Modal
        open={isModalAddGymOpen}
        onCancel={() => setIsModalAddGymOpen(false)}
        title={
          <p className="text-2xl font-bold text-[#ED2A46]">Thêm Phòng Gym</p>
        }
        footer={null}
        width={700}
      >
        <Form
          form={formAdd}
          layout="vertical"
          requiredMark={false}
          onFinish={handleAddGym}
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
                Mật Khẩu Phòng Gym
              </p>
            }
            name="password"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập mật khẩu cho phòng Gym!",
              },
            ]}
          >
            <Input placeholder="Phòng Gym" />
          </Form.Item>

          <Form.Item
            label={
              <p className="text-xl font-bold text-[#ED2A46]">Tên Phòng Gym</p>
            }
            name="gymName"
            rules={[
              { required: true, message: "Vui lòng nhập tên phòng gym!" },
            ]}
          >
            <Input placeholder="Phòng Gym" />
          </Form.Item>

          <Form.Item
            label={
              <p className="text-xl font-bold text-[#ED2A46]">Hoạt động từ</p>
            }
            name="since"
            rules={[{ required: true, message: "Bắt buộc nhập hoạt động từ" }]}
          >
            <Input placeholder="2025" type="number" />
          </Form.Item>

          <Form.Item
            label={<p className="text-xl font-bold text-[#ED2A46]">Địa chỉ</p>}
            name="address"
            rules={[{ required: true, message: "Bắt buộc nhập địa chỉ" }]}
          >
            <Input placeholder="123 Nguyễn Văn Linh, Hanoi" />
          </Form.Item>

          <Form.Item
            label={
              <p className="text-xl font-bold text-[#ED2A46]">
                Tên Người Đại Diện
              </p>
            }
            name="representName"
            rules={[
              { required: true, message: "Bắt buộc nhập tên người đại diện" },
            ]}
          >
            <Input placeholder="Nguyễn Văn A" />
          </Form.Item>

          <Form.Item
            label={
              <p className="text-xl font-bold text-[#ED2A46]">Mã Số Thuế</p>
            }
            name="taxCode"
            rules={[{ required: true, message: "Bắt buộc nhập mã số thuế" }]}
          >
            <Input placeholder="ABC1234" />
          </Form.Item>

          <Form.Item
            label={<p className="text-xl font-bold text-[#ED2A46]">Kinh Độ</p>}
            name="longitude"
            rules={[{ required: true, message: "Bắt buộc nhập kinh độ" }]}
          >
            <Input placeholder="25.80.234" type="number" />
          </Form.Item>

          <Form.Item
            label={<p className="text-xl font-bold text-[#ED2A46]">Vĩ Độ</p>}
            name="latitude"
            rules={[{ required: true, message: "Bắt buộc nhập vĩ độ" }]}
          >
            <Input placeholder="25.80.234" type="number" />
          </Form.Item>

          <Form.Item
            label={<p className="text-xl font-bold text-[#ED2A46]">QR Code</p>}
            name="qrcode"
            rules={[{ required: true, message: "Bắt buộc QR code" }]}
          >
            <Input placeholder="QR123456" />
          </Form.Item>

          <Form.Item
            label={
              <p className="text-xl font-bold text-[#ED2A46]">Hot Research</p>
            }
            name="hotResearch"
            valuePropName="checked"
            defaultValue={false}
          >
            <Switch
              checkedChildren="Bật"
              unCheckedChildren="Tắt"
              size="large"
            />
          </Form.Item>

          <div className="text-center">
            <Button
              onClick={() => formAdd.submit()}
              loading={loadingAdd}
              color="orange"
              variant="solid"
              className="!w-[50%] !rounded-full !h-10 !font-medium !border-0 shadow-2xl"
            >
              Đăng nhập
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
