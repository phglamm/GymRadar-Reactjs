import { useState } from "react";

import LogoColor from "./assets/LogoColor.png";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { route } from "./routes";
import HomeLoginPage from "./pages/HomeLoginPage/HomeLoginPage";
import ManageGymPage from "./pages/AdminPages/ManageGymPage/ManageGymPage";
import AdminLayout from "./layouts/AdminLayout/AdminLayout";

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
          path: route.manageGym,
          element: <ManageGymPage />,
        },
      ],
    },
  ]);
  return <RouterProvider router={router} />;
}

export default App;
