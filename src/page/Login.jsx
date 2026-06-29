import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import api from "../api/api";

import "../pagecss/Login.css";
import logo from "../assets/logo1.png";

function Login({ onLoginSuccess }) {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      alert("กรุณากรอกชื่อผู้ใช้และรหัสผ่าน");
      return;
    }

    try {
      const response = await api.post("/api/auth/login", {
        username,
        password,
      });

      const token = response.data.token;
      const loginUsername = response.data.username;
      const role = response.data.role;

      if (!token) {
        alert("เข้าสู่ระบบไม่สำเร็จ ไม่พบ token");
        return;
      }

      if (role !== "ADMIN") {
        alert("บัญชีนี้ไม่มีสิทธิ์เข้าใช้งานหลังบ้าน");
        localStorage.clear();
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("username", loginUsername);
      localStorage.setItem("role", role);

      alert("เข้าสู่ระบบสำเร็จ");

      onLoginSuccess();

      navigate("/");
    } catch (error) {
      console.error(error);

      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง";

      alert(message);
    }
  };

  return (
    <div className="login-page">
      <img src={logo} alt="SmartOrder Logo" className="logo" />

      <h1 className="brand-name">
        <span className="brand-blue">Smart</span>
        <span className="brand-orange">Order</span>
      </h1>

      <p className="subtitle">ระบบจัดการร้านค้า</p>

      <form className="login-form" onSubmit={handleSubmit}>
        <label>ชื่อผู้ใช้</label>

        <div className="input-box">
          <FaUser className="icon" />

          <input
            type="text"
            placeholder="กรอกชื่อผู้ใช้"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <label>รหัสผ่าน</label>

        <div className="input-box">
          <FaLock className="icon" />

          <input
            type={showPassword ? "text" : "password"}
            placeholder="กรอกรหัสผ่าน"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="button"
            className="eye-btn"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        <button className="login-btn" type="submit">
          <span>เข้าสู่ระบบ</span>
        </button>
      </form>
    </div>
  );
}

export default Login;