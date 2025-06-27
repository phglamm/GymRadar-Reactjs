import { useEffect, useState } from "react";
import { Layout, Menu, Tooltip } from "antd";
const { Sider } = Layout;
import {
  BarChartOutlined,
  DropboxOutlined,
  HomeOutlined,
  NotificationOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";
import { route } from "../../routes";
import logo from "../../assets/LogoColor.png";
import "./SidebarAdmin.scss";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/features/userSlice";
import { FaDumbbell } from "react-icons/fa";
import { GiTeacher } from "react-icons/gi";
import { FaRegCalendarCheck } from "react-icons/fa";
import { GrTransaction } from "react-icons/gr";
import { LiaFileContractSolid } from "react-icons/lia";
import { GiGymBag } from "react-icons/gi";

export default function SidebarAdmin({ collapsed, onCollapse }) {
  function getItem(label, key, icon, children) {
    return { key, label, icon, children };
  }

  const [items, setItems] = useState([]);
  const location = useLocation();
  const currentPath = location.pathname;
  const user = useSelector(selectUser);

  // Persist collapse state
  const [internalCollapsed, setInternalCollapsed] = useState(
    JSON.parse(localStorage.getItem("sidebarCollapsed")) ?? false
  );

  useEffect(() => {
    if (user?.role === "ADMIN") {
      setItems([
        getItem(
          "Dashboard",
          `${route.admin}/${route.dashboard}`,
          <BarChartOutlined className="text-lg" />
        ),
        getItem(
          "Quản Lý User",
          `${route.admin}/${route.manageUser}`,
          <UserOutlined className="text-lg" />
        ),
        getItem(
          "Quản Lý Phòng Tập",
          `${route.admin}/${route.manageGym}`,
          <FaDumbbell className="text-lg" />
        ),
        getItem(
          "Quản Lý PT",
          `${route.admin}/${route.managePT}`,
          <GiTeacher className="text-lg" />
        ),
        // getItem(
        //   "Quản Lý Gói Tập",
        //   `${route.admin}/${route.managePackages}`,
        //   <GiGymBag className="text-lg" />
        // ),
        getItem(
          "Quản Lý Giao Dịch",
          `${route.admin}/${route.manageTransaction}`,
          <GrTransaction className="text-lg" />
        ),
        getItem(
          "Gói Premium",
          `${route.admin}/manage-premium`,
          <DropboxOutlined className="text-lg" />
        ),
        getItem(
          "Thông Báo",
          `${route.admin}/${route.manageNotification}`,
          <NotificationOutlined className="text-lg" />
        ),
      ]);
    } else if (user?.role === "GYM") {
      setItems([
        getItem(
          "Dashboard",
          `${route.gym}/${route.dashboardGym}`,
          <BarChartOutlined className="text-lg" />
        ),
        // getItem(
        //   "Thông Tin Phòng Tập",
        //   `${route.gym}/${route.manageinformationGym}`,
        //   <FaDumbbell className="text-lg" />
        // ),
        getItem(
          "Quản Lý PT",
          `${route.gym}/${route.managePTGym}`,
          <GiTeacher className="text-lg" />
        ),
        getItem(
          "Quản Lý Gói Tập",
          `${route.gym}/${route.managePackagesGym}`,
          <GiGymBag className="text-lg" />
        ),
        getItem(
          "Quản Lý Slot",
          `${route.gym}/${route.manageSlotGym}`,
          <FaRegCalendarCheck className="text-lg" />
        ),
        getItem(
          "Lịch Sử Giao Dịch",
          `${route.gym}/${route.manageTransactionGym}`,
          <GrTransaction className="text-lg" />
        ),
        getItem(
          "Hợp Đồng & Hóa Đơn",
          `${route.gym}/${route.billandcontract}`,
          <LiaFileContractSolid className="text-lg" />
        ),
      ]);
    }
  }, [user?.role]);

  const handleCollapse = (value) => {
    setInternalCollapsed(value);
    localStorage.setItem("sidebarCollapsed", JSON.stringify(value));
    if (onCollapse) onCollapse(value);
  };

  // Remove custom trigger - using default Ant Design trigger

  return (
    <Sider
      collapsible
      collapsed={internalCollapsed}
      onCollapse={handleCollapse}
      width={280}
      collapsedWidth={80}
      className="sidebar !bg-[#1D1D1D] shadow-xl !transition-all !duration-300 !h-screen !fixed !left-0 !top-0 !z-50"
    >
      {/* Logo Section */}
      <div className="flex items-center justify-center py-6 border-b border-gray-700">
        {internalCollapsed ? (
          <div className="w-10 h-10 bg-[#ed2a46] rounded-lg flex items-center justify-center">
            <FaDumbbell className="text-white text-xl" />
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <img src={logo} alt="Logo" className="w-16 h-16 mb-2" />
            <div className="text-white font-bold text-xl tracking-wide">
              GymRadar
            </div>
          </div>
        )}
      </div>

      {/* User Role Badge */}
      {!internalCollapsed && (
        <div className="px-4 py-3 border-b border-gray-700">
          <div className="bg-[#ed2a46] rounded-full px-3 py-1 text-center">
            <span className="text-white text-sm font-medium">
              {user?.role === "ADMIN" ? "Quản Trị Viên" : "Quản Lý Phòng Tập"}
            </span>
          </div>
        </div>
      )}

      {/* Menu Section */}
      <div className="flex-1 overflow-y-auto pb-16">
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[currentPath]}
          className="!bg-[#1D1D1D] !border-r-0 menu-custom"
          inlineIndent={24}
        >
          {items.map((item) => {
            const menuItem = (
              <Menu.Item
                key={item.key}
                icon={item.icon}
                className="!text-gray-300 hover:!bg-[#ed2a46] hover:!text-white transition-all duration-200 !mb-1 !rounded-lg !mx-2"
              >
                <Link to={item.key} className="font-medium text-sm ">
                  {item.label}
                </Link>
              </Menu.Item>
            );

            return internalCollapsed ? (
              <Tooltip
                key={item.key}
                title={item.label}
                placement="right"
                overlayClassName="sidebar-tooltip"
              >
                {menuItem}
              </Tooltip>
            ) : (
              menuItem
            );
          })}
        </Menu>
      </div>
    </Sider>
  );
}
