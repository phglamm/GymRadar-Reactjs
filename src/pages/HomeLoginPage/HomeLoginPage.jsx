import { motion } from "framer-motion";
import LogoColor from "../../assets/LogoColor.png";
import { Button, Form, Input } from "antd";
import authService from "../../services/authServices";
import toast from "react-hot-toast";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import { useState } from "react";
import { FaFacebook, FaGoogle, FaApple } from "react-icons/fa";

export default function HomeLoginPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (values) => {
    setLoading(true);
    console.log("Login values:", values);
    const requestData = {
      phone: values.phone,
      password: values.password,
    };
    console.log("Request data:", requestData);
    try {
      const response = await authService.login(requestData);
      console.log("Login response:", response);
      toast.success("Đăng nhập thành công");
    } catch (error) {
      console.log("Login error:", error);
      toast.error(error.response?.data?.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="min-h-screen bg-[#242424] flex items-center justify-center">
      <motion.div
        className="w-full max-w-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="bg-white rounded-3xl shadow-xl overflow-hidden"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Top white section with logo */}
          <div className="pt-8 pb-4 px-8 text-center">
            <img
              src={LogoColor}
              alt="GymRadar Logo"
              className="h-30 w-30 items-center justify-center mx-auto"
            />
            <h1 className="text-[#FF3A50] font-bold text-3xl ">GymRadar</h1>
            <h2 className="text-[#FF3A50] font-bold text-3xl mt-5">
              Đăng Nhập
            </h2>
          </div>

          {/* Middle gradient section with form */}
          <div className="!bg-gradient-to-br !from-[#FF3A50] !to-[#FF914D] !p-6">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleLogin}
              requiredMark={false}
            >
              <Form.Item
                label={
                  <span className="text-xl font-bold text-white">
                    Số điện thoại
                  </span>
                }
                name="phone"
                rules={[
                  {
                    required: true,
                    message: (
                      <p className="text-white !mt-1">
                        Vui lòng nhập số điện thoại
                      </p>
                    ),
                  },
                  {
                    pattern: /^[0-9]+$/,
                    message: (
                      <p className="text-white !mt-1">Vui lòng chỉ nhập số</p>
                    ),
                  },
                ]}
              >
                <Input
                  placeholder="09XXXXXXXX"
                  type="tel"
                  className="!rounded-lg !py-3 !px-3 !border-0"
                  maxLength={10}
                  onKeyPress={(event) => {
                    if (!/[0-9]/.test(event.key)) {
                      event.preventDefault();
                    }
                  }}
                />
              </Form.Item>

              <Form.Item
                label={
                  <span className="text-xl font-bold text-white">Mật khẩu</span>
                }
                name="password"
                rules={[
                  {
                    required: true,
                    message: (
                      <p className="text-white !mt-1">Vui lòng nhập mật khẩu</p>
                    ),
                  },
                ]}
                className="mb-0"
              >
                <Input.Password
                  placeholder="••••••"
                  className="!rounded-lg !py-3 !px-3 !border-0"
                  iconRender={(visible) =>
                    visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                  }
                />
              </Form.Item>
            </Form>
          </div>

          {/* Bottom white section with buttons */}
          <div className="px-6 py-6 bg-white text-center">
            <Button
              type="primary"
              onClick={() => form.submit()}
              loading={loading}
              className="!w-[60%] !rounded-full !h-10 !font-medium !bg-[#FF914D] !border-0"
            >
              Đăng nhập
            </Button>

            <p className="text-gray-600 mt-4 mb-3">hoặc đăng nhập bằng</p>

            <div className="flex justify-center space-x-6">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaGoogle size={24} className="text-red-500" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaFacebook size={24} className="text-blue-600" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaApple size={24} className="text-black" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
