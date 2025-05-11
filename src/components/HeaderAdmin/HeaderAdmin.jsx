import { useSelector } from "react-redux";
import { selectUser } from "../../../redux/features/userSlice";
import { Badge, Layout } from "antd";
import { LogoutOutlined, NotificationFilled } from "@ant-design/icons";
const { Header } = Layout;
export default function HeaderAdmin() {
  const user = useSelector(selectUser);
  return (
    <Header className="!bg-gradient-to-br !from-[#FF914D] !to-[#FF3A50] !text-white flex items-center justify-end shadow-md gap-15">
      <Badge count={5} size="small" color="#FF914D">
        <NotificationFilled
          style={{ fontSize: "25px", cursor: "pointer" }}
          className="!text-white"
        />
      </Badge>
      <div className="flex items-center justify-center gap-4">
        <img
          src="https://www.w3schools.com/howto/img_avatar.png"
          alt=""
          className="h-[50px] rounded-[100%] border border-black"
        />
        <div className="flex flex-col justify-start items-start">
          <p className="font-bold text-xl">{user?.username || "Admin"}</p>
          <p className="text-sm">{user?.role || "Admin"}</p>
        </div>
      </div>
      <LogoutOutlined style={{ fontSize: "25px", cursor: "pointer" }} />
    </Header>
  );
}
