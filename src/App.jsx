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

function App() {
  const router = createBrowserRouter([
    {
      path: route.welcomeLogin,
      element: <HomeLoginPage />,
    },

    {
      path: route.admin,
      element: <AdminLayout />,
      children: [
        {
          index: true,
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
