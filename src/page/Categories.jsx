import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { FaHome, FaBox, FaThLarge, FaClipboardList, FaSignOutAlt, FaShoppingCart, FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import "../pagecss/Categories.css"; // จะสร้าง CSS แยกเฉพาะ

function Categories() {
  const [categories, setCategories] = useState([
    { no: 1, name: "เครื่องดื่ม", count: 45, date: "01/05/2567" },
    { no: 2, name: "อาหารแห้ง", count: 32, date: "01/05/2567" },
    { no: 3, name: "ขนมขบเคี้ยว", count: 18, date: "01/05/2567" },
    { no: 4, name: "ของใช้ในบ้าน", count: 12, date: "01/05/2567" },
    { no: 5, name: "ของใช้ส่วนตัว", count: 8, date: "01/05/2567" },
    { no: 6, name: "แช่เย็น / แช่แข็ง", count: 6, date: "01/05/2567" },
    { no: 7, name: "ผลไม้", count: 3, date: "01/05/2567" },
    { no: 8, name: "อื่นๆ", count: 1, date: "01/05/2567" },
  ]);

  const totalCategories = categories.length;
  const totalProducts = categories.reduce((acc, cat) => acc + cat.count, 0);

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-box"><FaShoppingCart /></div>
          <h2>SmartOrder</h2>
          <p>ระบบจัดการร้านค้า</p>
        </div>

        <nav className="menu">
          <NavLink to="/" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}><FaHome /><span>หน้าหลัก</span></NavLink>
          <NavLink to="/products" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}><FaBox /><span>สินค้า</span></NavLink>
          <NavLink to="/categories" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}><FaThLarge /><span>หมวดหมู่</span></NavLink>
          <NavLink to="/orders" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}><FaClipboardList /><span>ออเดอร์</span></NavLink>
        </nav>

        <button className="logout-btn"><FaSignOutAlt /> <span>ออกจากระบบ</span></button>
      </aside>

      {/* Content */}
      <main className="content">
        <header className="dashboard-header">
          <div>
            <h1>หมวดหมู่สินค้า</h1>
            <p>จัดการหมวดหมู่สินค้าในร้าน</p>
          </div>
          <button className="add-btn"><FaPlus /> เพิ่มหมวดหมู่</button>
        </header>

        {/* Summary Cards */}
        <section className="summary-grid">
          <div className="summary-card all">
            <span>จำนวนหมวดหมู่</span>
            <strong>{totalCategories}</strong> หมวดหมู่
          </div>
          <div className="summary-card ready">
            <span>จำนวนสินค้าในหมวดหมู่</span>
            <strong>{totalProducts}</strong> รายการ
          </div>
        </section>

        {/* Categories Table */}
        <section className="products-table-section">
          <div className="table-header">
            <input type="text" placeholder="ค้นหาหมวดหมู่..." />
          </div>

          <table className="products-table">
            <thead>
              <tr>
                <th>ลำดับ</th>
                <th>ชื่อหมวดหมู่</th>
                <th>จำนวนสินค้า</th>
                <th>วันที่สร้าง</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <tr key={cat.no}>
                  <td>{cat.no}</td>
                  <td>{cat.name}</td>
                  <td>{cat.count} รายการ</td>
                  <td>{cat.date}</td>
                  <td>
                    <button className="edit"><FaEdit /></button>
                    <button className="delete"><FaTrash /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="table-footer">
            แสดง 1-{categories.length} จาก {categories.length} รายการ
          </div>
        </section>
      </main>
    </div>
  );
}

export default Categories;