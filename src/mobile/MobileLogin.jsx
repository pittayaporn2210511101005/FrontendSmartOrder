import React, { useState } from "react";
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import logo from "../assets/logo1.png";

import "../mobilecss/MobileLogin.css";

function MobileLogin() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      alert("กรุณากรอกชื่อผู้ใช้และรหัสผ่าน");
      return;
    }

    try {
      const res = await api.post("/api/auth/login", {
        username,
        password,
      });

      const token = res.data.token;
      const loginUsername = res.data.username;
      const role = res.data.role;

      if (!token) {
        alert("เข้าสู่ระบบไม่สำเร็จ ไม่พบ token");
        return;
      }

      if (role !== "MOBILE" && role !== "ADMIN") {
        alert("บัญชีนี้ไม่มีสิทธิ์เข้าใช้งานหน้าสั่งซื้อ");
        localStorage.clear();
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("username", loginUsername);
      localStorage.setItem("role", role);
      localStorage.setItem("mobileUser", loginUsername);

      navigate("/mobile/order");
    } catch (err) {
      console.error(err);

      const message =
        err.response?.data?.message ||
        err.response?.data ||
        "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง";

      alert(message);
    }
  };

  return (
    <div className="mobile-login-page">
      <div className="mobile-login-container">
        <img
          src={logo}
          alt="SmartOrder Logo"
          className="mobile-admin-logo"
        />

        <h1 className="mobile-brand">
          <span className="blue">Smart</span>
          <span className="orange">Order</span>
        </h1>

        <p className="mobile-subtitle">ระบบจัดการร้านค้า</p>

        <form onSubmit={handleLogin}>
          <label>ชื่อผู้ใช้</label>

          <div className="mobile-input-box">
            <FaUser />
            <input
              type="text"
              placeholder="กรอกชื่อผู้ใช้"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <label>รหัสผ่าน</label>

          <div className="mobile-input-box">
            <FaLock />

            <input
              type={showPassword ? "text" : "password"}
              placeholder="กรอกรหัสผ่าน"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              type="button"
              className="eye-btn-mobile"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <button type="submit" className="mobile-login-btn">
            เข้าสู่ระบบ
          </button>
        </form>

        <div className="mobile-support"></div>
      </div>
    </div>
  );
}

export default MobileLogin;