import React, { useState } from "react";
import { Breadcrumb, Layout } from "antd";
import { motion } from "framer-motion";
import { Link, Outlet, useLocation } from "react-router-dom";
import SidebarAdmin from "../../components/SidebarAdmin/SidebarAdmin";
import HeaderAdmin from "../../components/HeaderAdmin/HeaderAdmin";
const { Sider, Content } = Layout;

export default function AdminLayout() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(
    JSON.parse(localStorage.getItem("sidebarCollapsed")) ?? false
  );

  // Generate breadcrumb items based on current path
  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname.split("/").filter(Boolean);
    const breadcrumbItems = [];

    pathSegments.forEach((segment, index) => {
      const url = `/${pathSegments.slice(0, index + 1).join("/")}`;
      const title =
        segment.charAt(0).toUpperCase() + segment.slice(1).replace("-", " ");

      breadcrumbItems.push({
        title:
          index === pathSegments.length - 1 ? (
            title
          ) : (
            <Link to={url}>{title}</Link>
          ),
        key: url,
      });
    });

    return breadcrumbItems;
  };

  return (
    <Layout className="min-h-screen ">
      <SidebarAdmin collapsed={collapsed} onCollapse={setCollapsed} />

      <Layout
        className="transition-all duration-300"
        style={{
          marginLeft: collapsed ? 80 : 280,
        }}
      >
        <HeaderAdmin />

        <Content className="">
          {/* Breadcrumb Section */}
          <div className="bg-white shadow-sm  px-6 py-4">
            <Breadcrumb
              items={generateBreadcrumbs()}
              className="text-sm"
              separator="/"
            />
          </div>

          {/* Main Content Area */}
          <div className="p-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-lg shadow-sm  min-h-[calc(100vh-200px)]"
            >
              <div className="p-6">
                <Outlet />
              </div>
            </motion.div>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
