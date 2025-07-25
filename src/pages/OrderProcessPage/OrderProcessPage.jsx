import React, { useState, useEffect } from "react";

const THEME_COLORS = {
  primary: "#ED2A46",
  secondary: "#FF914D",
  white: "#FFFFFF",
  black: "#000000",
  gray: "#F5F5F5",
  lightGray: "#E0E0E0",
  success: "#4CAF50",
};

export default function OrderProcessPage() {
  const [orderStatus, setOrderStatus] = useState("processing"); // 'processing', 'success', 'failed'
  const [orderData, setOrderData] = useState(null);

  // Simulate order processing
  useEffect(() => {
    const timer = setTimeout(() => {
      // Randomly simulate success or failure for demo
      const isSuccess = Math.random() > 0.99; // 70% success rate

      if (isSuccess) {
        setOrderStatus("success");
        setOrderData({
          orderCode:
            "ORD" + Math.random().toString(36).substr(2, 6).toUpperCase(),
          amount: 2850000,
          description: "Thanh toán đơn hàng thực phẩm",
          paymentMethod: "Thẻ tín dụng",
        });
      } else {
        setOrderStatus("failed");
        setOrderData({
          orderCode:
            "ORD" + Math.random().toString(36).substr(2, 6).toUpperCase(),
          amount: 2850000,
          description: "Thanh toán đơn hàng thực phẩm",
        });
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const formatAmount = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const handleGoBack = () => {
    alert("Navigating to home page...");
  };

  const handleRetry = () => {
    setOrderStatus("processing");
    setOrderData(null);

    // Restart the process
    setTimeout(() => {
      const isSuccess = Math.random() > 0.3;

      if (isSuccess) {
        setOrderStatus("success");
        setOrderData({
          orderCode:
            "ORD" + Math.random().toString(36).substr(2, 6).toUpperCase(),
          amount: 2850000,
          description: "Thanh toán đơn hàng thực phẩm",
          paymentMethod: "Thẻ tín dụng",
        });
      } else {
        setOrderStatus("failed");
        setOrderData({
          orderCode:
            "ORD" + Math.random().toString(36).substr(2, 6).toUpperCase(),
          amount: 2850000,
          description: "Thanh toán đơn hàng thực phẩm",
        });
      }
    }, 3000);
  };

  // Processing State
  if (orderStatus === "processing") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-5">
        <div className="text-center max-w-sm w-full">
          <div className="mb-6 flex justify-center">
            <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-2xl font-bold text-black mb-3">
            Đang xử lý thanh toán...
          </h2>
          <p className="text-gray-600 text-lg">Vui lòng đợi trong giây lát</p>
        </div>
      </div>
    );
  }

  // Success State
  if (orderStatus === "success") {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-md mx-auto px-5 pt-16 pb-8">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-4xl text-white font-bold">✓</span>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-green-500 text-center mb-3">
            Thanh toán thành công!
          </h1>
          <p className="text-gray-600 text-center mb-8 text-lg">
            Đơn hàng của bạn đã được xử lý thành công
          </p>

          {/* Order Details */}
          {orderData && (
            <div className=" rounded-xl p-6 mb-8 shadow-sm">
              <h3 className="text-xl font-bold text-black mb-4">
                Chi tiết đơn hàng
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">Mã đơn hàng:</span>
                  <span className="font-semibold text-black">
                    {orderData.orderCode}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">Số tiền:</span>
                  <span className="font-semibold text-black text-lg">
                    {formatAmount(orderData.amount)}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">Mô tả:</span>
                  <span className="font-semibold text-black text-right max-w-48">
                    {orderData.description}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Phương thức:</span>
                  <span className="font-semibold text-black">
                    {orderData.paymentMethod}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="text-center">
            <p className="text-gray-700 text-lg font-medium leading-tight">
              Bạn đã thanh toán thành công và có thể quay lại APP
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Failed State
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-md mx-auto px-5 pt-16 pb-8">
        {/* Failed Icon */}
        <div className="flex justify-center mb-6">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg"
            style={{ backgroundColor: THEME_COLORS.primary }}
          >
            <span className="text-4xl text-white font-bold">✕</span>
          </div>
        </div>

        <h1
          className="text-3xl font-bold text-center mb-3"
          style={{ color: THEME_COLORS.primary }}
        >
          Thanh toán thất bại!
        </h1>
        <p className="text-gray-600 text-center mb-8 text-lg">
          Đã xảy ra lỗi khi xử lý thanh toán của bạn
        </p>

        {/* Order Details */}
        {orderData && (
          <div className="bg-gray-50 rounded-xl p-6 mb-8 shadow-sm">
            <h3 className="text-xl font-bold text-black mb-4">
              Thông tin đơn hàng
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600">Mã đơn hàng:</span>
                <span className="font-semibold text-black">
                  {orderData.orderCode}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600">Số tiền:</span>
                <span className="font-semibold text-black text-lg">
                  {formatAmount(orderData.amount)}
                </span>
              </div>

              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Trạng thái:</span>
                <span
                  className="font-semibold"
                  style={{ color: THEME_COLORS.primary }}
                >
                  Thất bại
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="text-center">
          <p className="text-gray-700 text-lg font-medium leading-relaxed">
            Vui lòng kiểm tra lại hoặc thông báo hotline
          </p>
        </div>
      </div>
    </div>
  );
}
