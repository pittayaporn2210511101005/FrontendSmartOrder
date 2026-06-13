import React, { useState } from "react";
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import "../pagecss/Login.css";
import logo from "../assets/logo1.png";
import axios from "axios";

function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      alert("กรุณากรอกชื่อผู้ใช้และรหัสผ่าน");
      return;
    }

    try{
      const response = await axios.post(
        "http://localhost:8089/api/admin/login",
        {
          username,password,
        }
      );

      console.log(response.data);

    if (response.data === "success") {
      alert("เข้าสู่ระบบสำเร็จ");
      onLoginSuccess(username);
      }else {
        alert(response.data);
      }
    } catch (error) {
      console.error(error);
      alert("Emailหรือรหัสไม่ถูกต้อง");
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