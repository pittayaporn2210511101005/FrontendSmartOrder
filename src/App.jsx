import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./page/Login";
import Main from "./page/Main";
import Products from "./page/Products";
import Categories from "./page/Categories";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginName, setLoginName] = useState("");

  const handleLoginSuccess = (username) => {
    setLoginName(username);
    setIsLoggedIn(true);
  };

  if (!isLoggedIn) {
    // ถ้ายังไม่ล็อกอิน แสดงหน้า Login
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // ถ้าล็อกอินแล้ว ให้ใช้ Router ครอบทั้งหมด
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Main username={loginName} />} />
        <Route path="/products" element={<Products />} />
        <Route path="/categories" element={<Categories />} />

      </Routes>
       
       
    </BrowserRouter>
  );
}

export default App;