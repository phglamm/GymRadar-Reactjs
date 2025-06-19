import { useSelector } from "react-redux";
import { Badge, Layout, Dropdown, Avatar, Button, Space } from "antd";
import {
  LogoutOutlined,
  NotificationFilled,
  UserOutlined,
  SettingOutlined,
  BellOutlined,
} from "@ant-design/icons";
import { selectUser } from "../../redux/features/userSlice";
const { Header } = Layout;
import { useDispatch } from "react-redux";
import { logout } from "../../redux/features/userSlice";
import { useNavigate } from "react-router-dom";
import { route } from "../../routes";
import Cookies from "js-cookie";

export default function HeaderAdmin() {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("user");
    dispatch(logout());
    navigate(route.welcomeLogin);
  };

  // Dropdown menu items for user profile
  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Thông tin cá nhân",
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Cài đặt",
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      onClick: handleLogout,
      danger: true,
    },
  ];

  const handleMenuClick = ({ key }) => {
    if (key === "logout") {
      handleLogout();
    }
    // Handle other menu items as needed
  };

  // Get user initials for avatar
  const getUserInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case "ADMIN":
        return "Quản trị viên";
      case "GYM":
        return "Quản lý phòng tập";
      default:
        return role || "N/A";
    }
  };

  return (
    <Header className="!bg-white !px-6 !py-0 shadow-sm border-b border-gray-200 flex items-center justify-between">
      {/* Left side - could add breadcrumbs or page title here */}
      <div className="flex items-center">
        <div className="text-gray-600 font-medium">
          {/* You can add dynamic page title here based on current route */}
        </div>
      </div>

      {/* Right side - User info and actions */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <Badge count={5} size="small">
          <Button
            type="text"
            icon={<BellOutlined className="text-lg" />}
            className="flex items-center justify-center hover:bg-gray-100 transition-colors"
            size="large"
          />
        </Badge>

        {/* User Profile Dropdown */}
        <Dropdown
          menu={{
            items: userMenuItems,
            onClick: handleMenuClick,
          }}
          placement="bottomRight"
          arrow
          trigger={["click"]}
        >
          <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors">
            <Avatar
              size="large"
              className="bg-[#ed2a46] text-white font-semibold"
              icon={!user?.fullName && <UserOutlined />}
            >
              {user?.fullName && getUserInitials(user.fullName)}
            </Avatar>

            <div className="hidden md:block text-left">
              <div className="text-gray-900 font-semibold text-sm">
                {user?.fullName || "Người dùng"}
              </div>
              <div className="text-gray-500 text-xs">
                {getRoleDisplayName(user?.role)}
              </div>
            </div>
          </div>
        </Dropdown>
      </div>
    </Header>
  );
}
