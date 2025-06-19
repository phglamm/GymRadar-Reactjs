import React from "react";
import { Breadcrumb, Layout } from "antd";
import { motion } from "framer-motion";
import { Link, Outlet, useLocation } from "react-router-dom";
import SidebarAdmin from "../../components/SidebarAdmin/SidebarAdmin";
import HeaderAdmin from "../../components/HeaderAdmin/HeaderAdmin";
const { Sider, Content } = Layout;

export default function AdminLayout() {
  const location = useLocation(); // To get the current URL path

  return (
    <>
      <Layout className="!min-h-screen  !bg-[#1D1D1D]">
        <SidebarAdmin />
        <Layout className="!bg-[#ffffff]">
          <HeaderAdmin />

          {/* <Outlet /> */}

          <Content className="!p-4 flex flex-col">
            <div className="!p-8 !bg-[#ffffff] flex-1">
              <Outlet />
            </div>
          </Content>
        </Layout>
      </Layout>
    </>
  );
}
