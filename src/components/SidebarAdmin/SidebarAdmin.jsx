import { useEffect, useState } from "react";
import { Layout, Menu } from "antd";
const { Sider } = Layout;
import {
  BarChartOutlined,
  DropboxOutlined,
  HomeOutlined,
  NotificationOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";

import { route } from "../../routes";
import logo from "../../assets/LogoColor.png";
import "./SidebarAdmin.scss";
export default function SidebarAdmin() {
  function getItem(label, key, icon, children) {
    return { key, label, icon, children };
  }

  const [items, setItems] = useState([]);
  const [key, setKey] = useState();
  const location = useLocation();
  const currentURI =
    location.pathname.split("/")[location.pathname.split("/").length - 1];

  const dataOpen = JSON.parse(localStorage.getItem("keys")) ?? [];

  const [openKeys, setOpenKeys] = useState(dataOpen);

  useEffect(() => {
    setItems([
      getItem("Thống Kê", route.dashboard, <BarChartOutlined />),
      getItem("Quản Lý User", route.projectStatistic, <UserOutlined />),
      getItem("Quản Lý Phòng Tập", route.manageGym, <UserOutlined />),
      getItem("Quản Lý PT", route.feedbackManage, <UserOutlined />),
      getItem("Quản Lý Gói Tập", route.newsManagement, <DropboxOutlined />),
      getItem("Thông Báo", route.newsManagement, <NotificationOutlined />),
    ]);
  }, []);

  const handleSubMenuOpen = (keyMenuItem) => {
    setOpenKeys(keyMenuItem);
  };
  const handleSelectKey = (keyPath) => {
    setKey(keyPath);
  };
  useEffect(() => {
    localStorage.setItem("keys", JSON.stringify(openKeys));
  }, [openKeys]);

  useEffect(() => {
    handleSubMenuOpen([...openKeys, key]);
  }, [currentURI]);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        width={270}
        className="!bg-[#1D1D1D] shadow-lg !transition-all !duration-300 !h-screen !z-1000 sidebar"
      >
        <div className="items-center flex justify-center">
          <img src={logo} alt="Logo" className="w-[50%]" />
        </div>
        <div className="text-[#ED2A46] text-center font-semibold text-lg py-4 px-6 border-b border-gray-700">
          {collapsed ? "🌐" : "GymRadar"}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[currentURI]}
          openKeys={openKeys}
          onOpenChange={handleSubMenuOpen}
          className="h-full !bg-[#1D1D1D]"
        >
          {items.map((item) =>
            item.children ? (
              <Menu.SubMenu
                key={item.key}
                icon={item.icon}
                title={
                  <span className="text-sm font-medium">{item.label}</span>
                }
              >
                {item.children.map((subItem) => (
                  <Menu.Item
                    key={subItem.key}
                    icon={subItem.icon}
                    onClick={(e) => handleSelectKey(e.keyPath[1])}
                    className="!text-white hover:!bg-[#ED2A46] transition-all"
                  >
                    <Link to={subItem.key} className="pl-2 block">
                      {subItem.label}
                    </Link>
                  </Menu.Item>
                ))}
              </Menu.SubMenu>
            ) : (
              <Menu.Item
                key={item.key}
                icon={item.icon}
                className="!text-white hover:!bg-[#ED2A46] transition-all"
              >
                <Link to={item.key} className="pl-2 block text-sm font-medium">
                  {item.label}
                </Link>
              </Menu.Item>
            )
          )}
        </Menu>
      </Sider>
    </>
  );
}
