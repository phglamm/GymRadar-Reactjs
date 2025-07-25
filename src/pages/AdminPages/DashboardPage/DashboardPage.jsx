import React, { useState, useEffect } from "react";
import { DatePicker } from "antd";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import adminService from "../../../services/adminServices";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

dayjs.locale("vi");

const { RangePicker } = DatePicker;

// Format VND currency
const formatVND = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function DashboardPage() {
  // Set initial date range to past 2 weeks to current date
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(2, "week"),
    dayjs(),
  ]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  // API function to fetch revenue data
  const fetchRevenueData = async (startDate, endDate) => {
    setLoading(true);
    const params = {
      startDate: startDate,
      endDate: endDate,
    };
    try {
      const response = await adminService.getRevenueData(params);
      console.log(response.data);
      setData(response.data);
    } catch (error) {
      console.error("Error fetching revenue data:", error);
      setData([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch when component mounts
  useEffect(() => {
    if (dateRange && dateRange[0] && dateRange[1]) {
      const startDate = dateRange[0].format("YYYY-MM-DD");
      const endDate = dateRange[1].format("YYYY-MM-DD");
      fetchRevenueData(startDate, endDate);
    }
  }, []); // Empty dependency array for initial load only

  // Filter data when data or dateRange changes
  useEffect(() => {
    if (dateRange && dateRange[0] && dateRange[1] && data.length > 0) {
      const startDate = dateRange[0].format("YYYY-MM-DD");
      const endDate = dateRange[1].format("YYYY-MM-DD");

      const filtered = data.filter(
        (item) => item.date >= startDate && item.date <= endDate
      );
      setFilteredData(filtered);
    } else {
      setFilteredData([]);
    }
  }, [data, dateRange]); // Dependencies: data and dateRange

  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
    if (dates && dates[0] && dates[1]) {
      const startDate = dates[0].format("YYYY-MM-DD");
      const endDate = dates[1].format("YYYY-MM-DD");
      fetchRevenueData(startDate, endDate);
    }
  };

  // Calculate metrics
  const totalRevenue = filteredData.reduce(
    (sum, item) => sum + (item.totalRevenue || 0),
    0
  );
  const totalProfit = filteredData.reduce(
    (sum, item) => sum + (item.profit || 0),
    0
  );
  const totalSubscriptionIncome = filteredData.reduce(
    (sum, item) => sum + (item.subscriptionIncome || 0),
    0
  );
  const totalTransactionIncome = filteredData.reduce(
    (sum, item) => sum + (item.transactionIncome || 0),
    0
  );

  // Chart configuration
  const chartData = {
    labels: filteredData.map((item) => dayjs(item.date).format("DD/MM")),
    datasets: [
      {
        label: "Tổng Doanh Thu",
        data: filteredData.map((item) => item.totalRevenue || 0),
        borderColor: "#ed2a47c9",
        backgroundColor: "rgba(237, 42, 71, 0.1)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Lợi Nhuận",
        data: filteredData.map((item) => item.profit || 0),
        borderColor: "#FF914D",
        backgroundColor: "rgba(255, 145, 77, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#333",
          font: {
            size: 12,
            weight: "500",
          },
        },
      },
      title: {
        display: true,
        text: "Xu Hướng Doanh Thu & Lợi Nhuận",
        color: "#333",
        font: {
          size: 16,
          weight: "bold",
        },
      },
      tooltip: {
        mode: "index",
        intersect: false,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "white",
        bodyColor: "white",
        borderColor: "#ed2a47c9",
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
        ticks: {
          color: "#666",
        },
      },
      y: {
        display: true,
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
        ticks: {
          color: "#666",
          callback: function (value) {
            return formatVND(value);
          },
        },
      },
    },
    interaction: {
      mode: "nearest",
      axis: "x",
      intersect: false,
    },
  };

  return (
    <div className="min-h-screen  p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bảng Điều Khiển Doanh Thu
          </h1>
          <p className="text-gray-600">
            Theo dõi hiệu suất thu nhập từ đăng ký và giao dịch
          </p>
        </div>

        {/* Date Range Filter */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Lọc Theo Khoảng Thời Gian
            </h2>
            <RangePicker
              value={dateRange}
              onChange={handleDateRangeChange}
              format="DD/MM/YYYY"
              className="border-2 border-gray-200 rounded-lg"
              size="large"
              placeholder={["Ngày bắt đầu", "Ngày kết thúc"]}
            />
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Tổng Doanh Thu
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatVND(totalRevenue)}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-red-500 rounded"></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Tổng Lợi Nhuận
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatVND(totalProfit)}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-orange-500 rounded"></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Thu Nhập Đăng Ký
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatVND(totalSubscriptionIncome)}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-blue-500 rounded"></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Thu Nhập Giao Dịch
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatVND(totalTransactionIncome)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-green-500 rounded"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="h-96">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
              </div>
            ) : (
              <Line data={chartData} options={chartOptions} />
            )}
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Dữ Liệu Chi Tiết
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tổng giao dịch
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thu Nhập Đăng Ký
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thu Nhập Giao Dịch
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tổng Doanh Thu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lợi Nhuận
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {dayjs(item.date).format("DD/MM/YYYY")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.totalTransactions}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatVND(item.subscriptionIncome || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatVND(item.transactionIncome || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatVND(item.totalRevenue || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                      {formatVND(item.profit || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
