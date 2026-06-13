import React from "react";
import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaBox,
  FaThLarge,
  FaClipboardList,
  FaSignOutAlt,
  FaShoppingCart,
  FaMoneyBillWave,
  FaShoppingBag,
  FaCube,
  FaCalendarAlt,
  FaFileExcel,
  FaFilePdf,
  FaChevronDown,
} from "react-icons/fa";

import "../pagecss/Main.css";

function Main() {
  const cards = [
    { title: "ยอดขายวันนี้", value: "12,450", unit: "บาท", icon: <FaShoppingCart />, color: "blue" },
    { title: "กำไรวันนี้", value: "3,250", unit: "บาท", detail: "กำไร 26.1%", icon: <FaMoneyBillWave />, color: "green" },
    { title: "ออเดอร์วันนี้", value: "28", unit: "ออเดอร์", icon: <FaShoppingBag />, color: "orange" },
    { title: "สินค้าใกล้หมด", value: "35", unit: "รายการ", icon: <FaCube />, color: "red" },
  ];

  const products = [
    { no: 1, icon: "🧴", name: "น้ำดื่ม 600ml", qty: "120 ชิ้น" },
    { no: 2, icon: "🥫", name: "บะหมี่กึ่งสำเร็จรูป", qty: "85 ชิ้น" },
    { no: 3, icon: "🥛", name: "นมกล่องรสจืด", qty: "68 ชิ้น" },
    { no: 4, icon: "🥐", name: "ขนมปังไส้กรอก", qty: "56 ชิ้น" },
    { no: 5, icon: "☕", name: "กาแฟกระป๋อง", qty: "42 ชิ้น" },
  ];

  const months = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
  const sales = [45000,52000,68000,55000,75000,80000,65000,90000,85000,95000,100000,110000];

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-box"><FaShoppingCart /></div>
          <h2>SmartOrder</h2>
          <p>ระบบจัดการร้านค้า</p>
        </div>

        <nav className="menu">
          <NavLink to="/" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
            <FaHome /><span>หน้าหลัก</span>
          </NavLink>

          <NavLink to="/products" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
            <FaBox /><span>สินค้า</span>
          </NavLink>

          <NavLink to="/categories" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
            <FaThLarge /><span>หมวดหมู่</span>
          </NavLink>

          <NavLink to="/orders" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
            <FaClipboardList /><span>ออเดอร์</span>
          </NavLink>
        </nav>

        <button className="logout-btn">
          <FaSignOutAlt /><span>ออกจากระบบ</span>
        </button>
      </aside>

      <main className="content">
        {/* Header */}
        <header className="dashboard-header">
          <div>
            <h1>สวัสดีครับ</h1>
            <p>ยินดีต้อนรับเข้าสู่ระบบ SmartOrder</p>
          </div>
          <div className="date-box">
            <FaCalendarAlt />
            <div>
              <strong>22 พฤษภาคม 2567</strong>
              <span>10:30 น.</span>
            </div>
            <FaChevronDown className="chevron"/>
          </div>
        </header>

        {/* Summary Cards */}
        <section className="summary-grid">
          {cards.map((card,index) => (
            <div className="summary-card" key={index}>
              <div className={`card-icon ${card.color}`}>{card.icon}</div>
              <div className="card-info">
                <h3>{card.title}</h3>
                <div className="card-value">{card.value} <span>{card.unit}</span></div>
                {card.detail && <p>{card.detail}</p>}
              </div>
              <div className={`mini-chart ${card.color}`}>
                <span></span><span></span><span></span><span></span>
              </div>
            </div>
          ))}
        </section>

        {/* Main Grid */}
        <section className="main-grid">
          {/* Sales Panel */}
          <div className="panel sales-panel">
            <div className="panel-header">
              <h2>กราฟยอดขาย (รายเดือน)</h2>
              <button className="select-btn">
                <FaCalendarAlt /> รายเดือน <FaChevronDown />
              </button>
            </div>
            {/* Chart */}
            <div className="chart-area">
              <div className="y-labels">
                <span>120,000</span><span>100,000</span><span>80,000</span>
                <span>60,000</span><span>40,000</span><span>20,000</span><span>0</span>
              </div>
              <div className="chart">
                <svg viewBox="0 0 700 300" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="blueArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0b5cff" stopOpacity="0.35"/>
                      <stop offset="100%" stopColor="#0b5cff" stopOpacity="0.02"/>
                    </linearGradient>
                  </defs>
                  <polygon points="0,210 64,190 128,150 192,180 256,130 320,115 384,165 448,90 512,110 576,75 640,60 700,35 700,300 0,300" fill="url(#blueArea)"/>
                  <polyline points="0,210 64,190 128,150 192,180 256,130 320,115 384,165 448,90 512,110 576,75 640,60 700,35" fill="none" stroke="#0b5cff" strokeWidth="4"/>
                  {sales.map((sale,index)=>{
                    const x=(index/11)*700;
                    const y=300-(sale/120000)*290;
                    return <circle key={index} cx={x} cy={y} r="7" fill="#0b5cff"/>;
                  })}
                </svg>
                <div className="x-labels">{months.map(m=><span key={m}>{m}</span>)}</div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="right-column">
            <div className="panel report-panel">
              <h2>รายงาน</h2>
              <button className="report-select">
                <FaCalendarAlt/>
                <div><span>เลือกช่วงเวลา</span><strong>รายเดือน</strong></div>
                <FaChevronDown/>
              </button>
              <div className="export-row">
                <button className="excel-btn"><FaFileExcel/> ส่งออก Excel</button>
                <button className="pdf-btn"><FaFilePdf/> ส่งออก PDF</button>
              </div>
            </div>

            <div className="panel top-panel">
              <h2>สินค้าขายดี 5 อันดับ</h2>
              <div className="product-list">
                {products.map((item)=>(
                  <div className="product-item" key={item.no}>
                    <span className="product-no">{item.no}</span>
                    <span className="product-icon">{item.icon}</span>
                    <span className="product-name">{item.name}</span>
                    <strong>{item.qty}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Main;