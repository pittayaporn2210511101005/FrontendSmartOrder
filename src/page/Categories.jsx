import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaHome,
  FaBox,
  FaThLarge,
  FaClipboardList,
  FaSignOutAlt,
  FaShoppingCart,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSave,
} from "react-icons/fa";
import "../pagecss/Categories.css";

function Categories() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState("add");
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    id: "",
    categoryname: "",
  });
  const [loading, setLoading] = useState(false);

  const API_URL = "http://localhost:8089/api/admin/categories";

  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL);
      setCategories(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error(error);
      alert("โหลดหมวดหมู่ไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const totalProductsInCategories = categories.reduce(
    (sum, cat) => sum + Number(cat.productCount || 0),
    0
  );

  const filteredCategories = useMemo(() => {
    return categories.filter((cat) =>
      String(cat.categoryname || cat.Categoryname || cat.categoryName || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  }, [categories, searchTerm]);

  const openAddModal = () => {
    setMode("add");
    setEditingCategory(null);
    setFormData({
      id: "",
      categoryname: "",
    });
    setShowModal(true);
  };

  const openEditModal = (category) => {
    setMode("edit");
    setEditingCategory(category);
    setFormData({
      id: category.id || "",
      categoryname: category.categoryname || "",
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({
      id: "",
      categoryname: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.id.trim()) {
      alert("กรุณากรอกรหัสหมวดหมู่");
      return;
    }

    if (!formData.categoryname.trim()) {
      alert("กรุณากรอกชื่อหมวดหมู่");
      return;
    }

    const payload = {
      id: formData.id.trim(),
      categoryname: formData.categoryname.trim(),
    };

    try {
      if (mode === "add") {
        await axios.post(API_URL, payload);
        alert("เพิ่มหมวดหมู่สำเร็จ");
      } else {
        await axios.put(`${API_URL}/${editingCategory.id}`, payload);
        alert("แก้ไขหมวดหมู่สำเร็จ");
      }

      await loadCategories();
      closeModal();
    } catch (error) {
      console.error(error);
      alert(
        mode === "add"
          ? "เพิ่มหมวดหมู่ไม่สำเร็จ"
          : "แก้ไขหมวดหมู่ไม่สำเร็จ"
      );
    }
  };

  const handleDelete = async (id) => {
    if (!id) {
      alert("ไม่พบรหัสหมวดหมู่");
      return;
    }

    const confirmDelete = window.confirm("ต้องการลบหมวดหมู่นี้ใช่หรือไม่?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_URL}/${id}`);
      await loadCategories();
      alert("ลบหมวดหมู่สำเร็จ");
    } catch (error) {
      console.error(error);
      alert("ลบหมวดหมู่ไม่สำเร็จ อาจมีสินค้าอยู่ในหมวดหมู่นี้");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.clear();
    navigate("/login");
  };

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-box">
            <FaShoppingCart />
          </div>
          <h2>SmartOrder</h2>
          <p>ระบบจัดการร้านค้า</p>
        </div>

        <nav className="menu">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? "menu-item active" : "menu-item"
            }
          >
            <FaHome />
            <span>หน้าหลัก</span>
          </NavLink>

          <NavLink
            to="/products"
            className={({ isActive }) =>
              isActive ? "menu-item active" : "menu-item"
            }
          >
            <FaBox />
            <span>สินค้า</span>
          </NavLink>

          <NavLink
            to="/categories"
            className={({ isActive }) =>
              isActive ? "menu-item active" : "menu-item"
            }
          >
            <FaThLarge />
            <span>หมวดหมู่</span>
          </NavLink>

          <NavLink
            to="/orders"
            className={({ isActive }) =>
              isActive ? "menu-item active" : "menu-item"
            }
          >
            <FaClipboardList />
            <span>ออเดอร์</span>
          </NavLink>
        </nav>

        <button className="logout-btn" type="button" onClick={handleLogout}>
          <FaSignOutAlt />
          <span>ออกจากระบบ</span>
        </button>
      </aside>

      <main className="content">
        <header className="dashboard-header">
          <div>
            <h1>หมวดหมู่สินค้า</h1>
            <p>จัดการหมวดหมู่สินค้าในร้าน</p>
          </div>

          <button className="add-btn" type="button" onClick={openAddModal}>
            <FaPlus />
            เพิ่มหมวดหมู่
          </button>
        </header>

        <section className="summary-grid">
          <div className="summary-card all">
            <span>จำนวนหมวดหมู่</span>
            <strong>{categories.length}</strong>
            <small>หมวดหมู่</small>
          </div>

          <div className="summary-card ready">
            <span>จำนวนสินค้าในหมวดหมู่</span>
            <strong>{totalProductsInCategories}</strong>
            <small>รายการ</small>
          </div>
        </section>

        <section className="products-table-section">
          <div className="table-header">
            <input
              type="text"
              placeholder="ค้นหาหมวดหมู่..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <table className="products-table">
            <thead>
              <tr>
                <th>รหัส</th>
                <th>ชื่อหมวดหมู่</th>
                <th>จำนวนสินค้า</th>
                <th>จัดการ</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="empty-table">
                    กำลังโหลดข้อมูล...
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan="4" className="empty-table">
                    ไม่พบหมวดหมู่
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat) => (
                  <tr key={cat.id}>
                    <td>{cat.id}</td>
                    <td>{cat.categoryname}</td>
                    <td>{Number(cat.productCount || 0)} รายการ</td>
                    <td>
                      <div className="action-row">
                        <button
                          className="edit"
                          type="button"
                          onClick={() => openEditModal(cat)}
                          title="แก้ไข"
                        >
                          <FaEdit />
                        </button>

                        <button
                          className="delete"
                          type="button"
                          onClick={() => handleDelete(cat.id)}
                          title="ลบ"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="table-footer">
            แสดง {filteredCategories.length} จาก {categories.length} รายการ
          </div>
        </section>
      </main>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <button className="modal-close" type="button" onClick={closeModal}>
              ×
            </button>

            <form className="add-product-form" onSubmit={handleSubmit}>
              <h2>{mode === "add" ? "เพิ่มหมวดหมู่" : "แก้ไขหมวดหมู่"}</h2>

              <div className="form-group">
                <label>รหัสหมวดหมู่</label>
                <input
                  type="text"
                  value={formData.id}
                  disabled={mode === "edit"}
                  onChange={(e) =>
                    setFormData({ ...formData, id: e.target.value })
                  }
                  placeholder="เช่น C001"
                />
              </div>

              <div className="form-group">
                <label>ชื่อหมวดหมู่</label>
                <input
                  type="text"
                  value={formData.categoryname}
                  onChange={(e) =>
                    setFormData({ ...formData, categoryname: e.target.value })
                  }
                  placeholder="เช่น เครื่องดื่ม"
                />
              </div>

              <button className="submit-product-btn" type="submit">
                {mode === "add" ? <FaPlus /> : <FaSave />}
                {mode === "add" ? "เพิ่มหมวดหมู่" : "บันทึกการแก้ไข"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Categories;