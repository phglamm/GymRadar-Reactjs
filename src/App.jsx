import { useState } from "react";

import LogoColor from "./assets/LogoColor.png";
import "./index.css";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import { route } from "./routes";
import HomeLoginPage from "./pages/HomeLoginPage/HomeLoginPage";
import ManageGymPage from "./pages/AdminPages/ManageGymPage/ManageGymPage";
import AdminLayout from "./layouts/AdminLayout/AdminLayout";
import DashboardPage from "./pages/AdminPages/DashboardPage/DashboardPage";
import ManagePTPage from "./pages/AdminPages/ManagePTPage/ManagePTPage";
import ManageNotificationPage from "./pages/AdminPages/ManageNotificationPage/ManageNotificationPage";
import ManagePackagesPage from "./pages/AdminPages/ManagePackagesPage/ManagePackagesPage";
import ManageUserPage from "./pages/AdminPages/ManageUserPage/ManageUserPage";
import ManagePTGym from "./pages/GymPages/ManagePTGym/ManagePTGym";
import GymBillandContract from "./pages/GymPages/GymBillandContract/GymBillandContract";
import ManageGymTransaction from "./pages/GymPages/ManageGymTransaction/ManageGymTransaction";
import ManageGymInformation from "./pages/GymPages/ManageGymInformation/ManageGymInformation";
import DashboardGym from "./pages/GymPages/DashboardGym/DashboardGym";
import ManageGymPackages from "./pages/GymPages/ManageGymPackages/ManageGymPackages";
import ManageSlotGym from "./pages/GymPages/ManageSlotGym/ManageSlotGym";
import OrderProcessPage from "./pages/OrderProcessPage/OrderProcessPage";
import ManageTransactionPage from "./pages/AdminPages/ManageTransactionPage/ManageTransactionPage";
import ManagePremiumPage from "./pages/AdminPages/ManagePremiumPage/ManagePremiumPage";
function App() {
  const router = createBrowserRouter([
    {
      path: route.welcomeLogin,
      element: <HomeLoginPage />,
    },
    {
      path: route.orderProcess,
      element: <OrderProcessPage />,
    },

    {
      path: route.admin,
      element: <AdminLayout />,
      children: [
        {
          path: route.dashboard,
          element: <DashboardPage />,
        },
        {
          path: route.manageGym,
          element: <ManageGymPage />,
        },
        {
          path: route.managePT,
          element: <ManagePTPage />,
        },
        {
          path: route.manageNotification,
          element: <ManageNotificationPage />,
        },
        {
          path: route.managePackages,
          element: <ManagePackagesPage />,
        },
        {
          path: route.manageUser,
          element: <ManageUserPage />,
        },
        {
          path: route.manageTransaction,
          element: <ManageTransactionPage />,
        },
        {
          path: `manage-premium`,
          element: <ManagePremiumPage />,
        },
      ],
    },
    {
      path: route.gym,
      element: <AdminLayout />,
      children: [
        {
          path: route.dashboardGym,
          element: <DashboardGym />,
        },
        {
          path: route.manageinformationGym,
          element: <ManageGymInformation />,
        },
        {
          path: route.managePTGym,
          element: <ManagePTGym />,
        },
        {
          path: route.managePackagesGym,
          element: <ManageGymPackages />,
        },
        {
          path: route.manageTransactionGym,
          element: <ManageGymTransaction />,
        },
        {
          path: route.manageSlotGym,
          element: <ManageSlotGym />,
        },
        {
          path: route.billandcontract,
          element: <GymBillandContract />,
        },
      ],
    },

    {
      path: "*",
      element: <Navigate to={route.welcomeLogin} />,
    },
  ]);
  return <RouterProvider router={router} />;
}

export default App;
