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
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.clear();
  
    setIsLoggedIn(false);
  
    setTimeout(() => {
      alert("ออกจากระบบสำเร็จ");
    }, 100);
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Mobile */}
        <Route path="/mobile/login" element={<MobileLogin />} />

        <Route
          path="/mobile/order"
          element={
            localStorage.getItem("mobileUser") ? <Order /> : <MobileLogin />
          }
        />

        {/* Web Login */}
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

        {/* Web Admin */}
        {!isLoggedIn ? (
          <Route path="*" element={<Navigate to="/login" replace />} />
        ) : (
          <>
            <Route path="/" element={<Main onLogout={handleLogout} />} />
            <Route path="/products" element={<Products onLogout={handleLogout} />} />
            <Route path="/categories" element={<Categories onLogout={handleLogout} />} />
            <Route path="/orders" element={<WebOrder onLogout={handleLogout} />} />
            <Route path="/mock-sales" element={<MockSales onLogout={handleLogout} />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;