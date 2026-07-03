import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./page/Login";
import Main from "./page/Main";
import Products from "./page/Products";
import Categories from "./page/Categories";
import WebOrder from "./page/WebOrder";
import MockSales from "./page/MockSales";

import MobileLogin from "./mobile/MobileLogin";
import Order from "./mobile/Order";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    Boolean(localStorage.getItem("adminUser"))
  );

  const handleLoginSuccess = (username) => {
    localStorage.setItem("adminUser", username || "admin");
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("adminUser");
    localStorage.removeItem("mobileUser");
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    sessionStorage.clear();

    setIsLoggedIn(false);
  };

  const isMobileLoggedIn = Boolean(localStorage.getItem("mobileUser"));

  return (
    <BrowserRouter>
      <Routes>
        {/* Mobile */}
        <Route
          path="/mobile/login"
          element={
            isMobileLoggedIn ? (
              <Navigate to="/mobile/order" replace />
            ) : (
              <MobileLogin />
            )
          }
        />

        <Route
          path="/mobile/order"
          element={
            isMobileLoggedIn ? (
              <Order />
            ) : (
              <Navigate to="/mobile/login" replace />
            )
          }
        />

        {/* Admin Login */}
        <Route
          path="/login"
          element={
            isLoggedIn ? (
              <Navigate to="/" replace />
            ) : (
              <Login onLoginSuccess={handleLoginSuccess} />
            )
          }
        />

        {/* Admin Pages */}
        {!isLoggedIn ? (
          <Route path="*" element={<Navigate to="/login" replace />} />
        ) : (
          <>
            <Route path="/" element={<Main onLogout={handleLogout} />} />
            <Route
              path="/products"
              element={<Products onLogout={handleLogout} />}
            />
            <Route
              path="/categories"
              element={<Categories onLogout={handleLogout} />}
            />
            <Route
              path="/orders"
              element={<WebOrder onLogout={handleLogout} />}
            />
            <Route
              path="/mock-sales"
              element={<MockSales onLogout={handleLogout} />}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;