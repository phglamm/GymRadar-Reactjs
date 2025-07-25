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
import gymService from "../../../services/gymServices";

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

export default function DashboardGym() {
  // Set initial date range to past 2 weeks to current date
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(2, "week"),
    dayjs(),
  ]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  // API function to fetch gym revenue data
  const fetchGymRevenueData = async (startDate, endDate) => {
    setLoading(true);
    const params = {
      startDate: startDate,
      endDate: endDate,
    };
    try {
      const response = await gymService.getRevenueOfGym(params);
      console.log(response.data);
      setData(response.data); // Assuming response.data contains the revenue data
    } catch (error) {
      console.error("Error fetching gym revenue data:", error);
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
      fetchGymRevenueData(startDate, endDate);
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
      fetchGymRevenueData(startDate, endDate);
    }
  };

  // Calculate metrics
  const totalRevenue = filteredData.reduce(
    (sum, item) => sum + (item.totalRevenue || 0),
    0
  );
  const totalAppCommission = filteredData.reduce(
    (sum, item) => sum + (item.appCommission || 0),
    0
  );
  const totalpaybackToGym = filteredData.reduce(
    (sum, item) => sum + (item.paybackToGym || 0),
    0
  );

  // Calculate average values
  const avgRevenue =
    filteredData.length > 0 ? totalRevenue / filteredData.length : 0;
  const avgpaybackToGym =
    filteredData.length > 0 ? totalpaybackToGym / filteredData.length : 0;

  // Chart configuration
  const chartData = {
    labels: filteredData.map((item) => dayjs(item.date).format("DD/MM")),
    datasets: [
      {
        label: "Tổng Doanh Thu",
        data: filteredData.map((item) => item.totalRevenue || 0),
        borderColor: "#3B82F6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Hoa Hồng App (10%)",
        data: filteredData.map((item) => item.appCommission || 0),
        borderColor: "#F59E0B",
        backgroundColor: "rgba(245, 158, 11, 0.1)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Tiền Về Chủ Gym (90%)",
        data: filteredData.map((item) => item.paybackToGym || 0),
        borderColor: "#10B981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
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
          color: "#374151",
          font: {
            size: 12,
            weight: "500",
          },
        },
      },
      title: {
        display: true,
        text: "Xu Hướng Doanh Thu & Lợi Nhuận Phòng Gym",
        color: "#111827",
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
        borderColor: "#3B82F6",
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
          color: "#6B7280",
        },
      },
      y: {
        display: true,
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
        ticks: {
          color: "#6B7280",
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
            Bảng Điều Khiển Doanh Thu Phòng Gym
          </h1>
          <p className="text-gray-600">
            Theo dõi doanh thu từ bán khóa học và hoa hồng ứng dụng
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
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-blue-500 rounded"></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Hoa Hồng App (10%)
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  - {formatVND(totalAppCommission)}
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-amber-500 rounded"></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Tiền Về Chủ Gym (90%)
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatVND(totalpaybackToGym)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-green-500 rounded"></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Doanh Thu Trung Bình
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatVND(avgRevenue)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-purple-500 rounded"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="h-96">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
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
                    Tổng Doanh Thu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hoa Hồng App (10%)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tiền Về Phòng Gym (90%)
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {dayjs(item.date).format("DD/MM/YYYY")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      {formatVND(item.totalRevenue || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-amber-600 font-medium">
                      - {formatVND(item.appCommission || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                      {formatVND(item.paybackToGym || 0)}
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
