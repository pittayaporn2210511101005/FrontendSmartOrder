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
      alert("กรุณากรอกข้อมูล");
      return;
    }

    try {
      const res = await api.post("/admin/login", {
        username,
        password,
      });

      if (res.data === "success") {
        localStorage.setItem("mobileUser", username);

        navigate("/mobile/order");
      } else {
        alert(res.data);
      }
    } catch (err) {
      console.error(err);
      alert("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
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
              onChange={(e) =>
                setUsername(e.target.value)
              }
            />
          </div>

          <label>รหัสผ่าน</label>

          <div className="mobile-input-box">
            <FaLock />

            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              placeholder="กรอกรหัสผ่าน"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
            />

            <button
              type="button"
              className="eye-btn-mobile"
              onClick={() =>
                setShowPassword(!showPassword)
              }
            >
              {showPassword ? (
                <FaEyeSlash />
              ) : (
                <FaEye />
              )}
            </button>
          </div>

          <button
            type="submit"
            className="mobile-login-btn"
          >
            เข้าสู่ระบบ
          </button>
        </form>

        <div className="mobile-support">
           
        </div>
      </div>
    </div>
  );
}

export default MobileLogin;