import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./page/Login";
import Main from "./page/Main";
import Products from "./page/Products";
import Categories from "./page/Categories";
import WebOrder from "./page/WebOrder";

import MobileLogin from "./mobile/MobileLogin";
import Order from "./mobile/Order";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginName, setLoginName] = useState("");

  const handleLoginSuccess = (username) => {
    setLoginName(username);
    setIsLoggedIn(true);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/mobile/login" element={<MobileLogin />} />
        <Route path="/mobile/order" element={<Order />} />

        {!isLoggedIn ? (
          <Route
            path="*"
            element={<Login onLoginSuccess={handleLoginSuccess} />}
          />
        ) : (
          <>
            <Route path="/" element={<Main username={loginName} />} />
            <Route path="/products" element={<Products />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/orders" element={<WebOrder />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;