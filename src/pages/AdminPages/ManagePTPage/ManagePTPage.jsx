import { ConfigProvider, Input, Spin, Table } from "antd";
import React, { useEffect, useState } from "react";
import adminService from "../../../services/adminServices";
import { LoadingOutlined, SearchOutlined } from "@ant-design/icons";

export default function ManagePTPage() {
  const [pts, setPts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const fetchPT = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const response = await adminService.getAllPT({ page, size: pageSize });
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
    fetchPT();
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
  const handleTableChange = (pagination) => {
    fetchPT(pagination.current, pagination.pageSize);
  };
  const columns = [
    {
      title: "Tên PT",
      dataIndex: "fullName",
      key: "fullName",
      align: "center",
    },
    {
      title: "Số Điện Thoại",
      dataIndex: "location",
      key: "location",
      align: "center",
    },
    {
      title: "Phòng Gym Liên Kết",
      dataIndex: "location",
      key: "location",
      align: "center",
    },
    {
      title: "Khách hàng Liên Kết",
      dataIndex: "location",
      key: "location",
      align: "center",
    },
    {
      title: "Gói Tập Liên Kết",
      dataIndex: "location",
      key: "location",
      align: "center",
    },
    {
      title: "Trạng Thái",
      key: "action",
      align: "center",
    },
  ];
  const filteredData = searchText
    ? pts.filter((item) =>
        (item.fullName?.toLowerCase() || "").includes(searchText.toLowerCase())
      )
    : pts;
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
    </div>
  );
}
