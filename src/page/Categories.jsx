import { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaHome,
  FaBox,
  FaFolder,
  FaClipboardList,
  FaSignOutAlt,
  FaShoppingCart,
  FaPlus,
  FaEdit,
  FaTrash,
  FaRedoAlt,
  FaSearch,
  FaSave,
  FaCubes,
} from "react-icons/fa";

import "../pagecss/Categories.css";

const API_URL = "http://localhost:8089/api/admin/categories";

function Categories() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    categoryname: "",
  });

  const [mode, setMode] = useState("add");
  const [editingCategory, setEditingCategory] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL);
      setCategories(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("โหลดหมวดหมู่ไม่สำเร็จ:", error);
      alert("โหลดหมวดหมู่ไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openAddModal = () => {
    setMode("add");
    setEditingCategory(null);
    setFormData({
      categoryname: "",
    });
    setShowModal(true);
  };

  const openEditModal = (category) => {
    setMode("edit");
    setEditingCategory(category);
    setFormData({
      categoryname: category.categoryname || "",
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({
      categoryname: "",
    });
    setSubmitting(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const payload = {
      categoryname: formData.categoryname.trim(),
    };
  
    if (!payload.categoryname) {
      alert("กรุณากรอกชื่อหมวดหมู่สินค้า");
      return;
    }
  
    if (isDuplicateCategoryName(payload.categoryname)) {
      alert(`มีหมวดหมู่ "${payload.categoryname}" อยู่แล้ว`);
      return;
    }
  
    try {
      setSubmitting(true);
  
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
      console.error("บันทึกหมวดหมู่ไม่สำเร็จ:", error);
  
      const message =
        error.response?.data?.message ||
        error.response?.data ||
        "";
  
      if (String(message).includes("ซ้ำ")) {
        alert("มีชื่อหมวดหมู่นี้อยู่แล้ว");
        return;
      }
  
      alert(
        mode === "add"
          ? "เพิ่มหมวดหมู่ไม่สำเร็จ"
          : "แก้ไขหมวดหมู่ไม่สำเร็จ"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (category) => {
    const confirmDelete = window.confirm(
      `ยืนยันจะลบหมวดหมู่ "${category.categoryname}" ใช่ไหม?`
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_URL}/${category.id}`);
      alert("ลบหมวดหมู่สำเร็จ");
      await loadCategories();
    } catch (error) {
      console.error("ลบหมวดหมู่ไม่สำเร็จ:", error);
      alert("ลบหมวดหมู่ไม่สำเร็จ อาจมีสินค้าอยู่ในหมวดหมู่นี้");
    }
  };

  const handleResetFilters = () => {
    setSearchTerm("");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.clear();
    navigate("/login");
  };

  const formatDate = (value) => {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleDateString("th-TH", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const filteredCategories = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    if (!keyword) return categories;

    return categories.filter((category) => {
      const name = String(category.categoryname || "").toLowerCase();
      return name.includes(keyword);
    });
  }, [categories, searchTerm]);

  const totalProductsInCategories = categories.reduce(
    (sum, category) => sum + Number(category.productCount || 0),
    0
  );

  const normalizeCategoryName = (name) => {
    return String(name || "").trim().toLowerCase();
  };
  
  const isDuplicateCategoryName = (name) => {
    const newName = normalizeCategoryName(name);
  
    return categories.some((category) => {
      const oldName = normalizeCategoryName(category.categoryname);
  
      if (mode === "edit" && editingCategory) {
        return category.id !== editingCategory.id && oldName === newName;
      }
  
      return oldName === newName;
    });
  };

  return (
    <div className="cat-page">
      <aside className="cat-sidebar">
        <div className="cat-sidebar-logo">
          <div className="cat-logo-box">
            <FaShoppingCart />
          </div>
          <h2>SmartOrder</h2>
          <p>ระบบจัดการร้านค้า</p>
        </div>

        <nav className="cat-menu">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive ? "cat-menu-item active" : "cat-menu-item"
            }
          >
            <FaHome />
            <span>หน้าหลัก</span>
          </NavLink>

          <NavLink
            to="/products"
            className={({ isActive }) =>
              isActive ? "cat-menu-item active" : "cat-menu-item"
            }
          >
            <FaBox />
            <span>สินค้า</span>
          </NavLink>

          <NavLink
            to="/categories"
            className={({ isActive }) =>
              isActive ? "cat-menu-item active" : "cat-menu-item"
            }
          >
            <FaFolder />
            <span>หมวดหมู่</span>
          </NavLink>

          <NavLink
            to="/orders"
            className={({ isActive }) =>
              isActive ? "cat-menu-item active" : "cat-menu-item"
            }
          >
            <FaClipboardList />
            <span>ออเดอร์</span>
          </NavLink>
        </nav>

        <button className="cat-logout-btn" type="button" onClick={handleLogout}>
          <FaSignOutAlt />
          <span>ออกจากระบบ</span>
        </button>
      </aside>

      <main className="cat-content">
        <header className="cat-header">
          <div>
            <h1>จัดการหมวดหมู่สินค้าในร้าน</h1>
             
          </div>

          <button className="cat-add-btn" type="button" onClick={openAddModal}>
            <FaPlus />
            เพิ่มหมวดหมู่
          </button>
        </header>

        <section className="cat-summary-grid">
          <div className="cat-summary-card blue">
            <div className="cat-summary-icon blue-icon">
              <FaFolder />
            </div>

            <div className="cat-summary-info">
              <span>จำนวนหมวดหมู่</span>
              <div>
                <strong>{categories.length}</strong>
                <small>หมวดหมู่</small>
              </div>
            </div>
          </div>

          <div className="cat-summary-card green">
            <div className="cat-summary-icon green-icon">
              <FaCubes />
            </div>

            <div className="cat-summary-info">
              <span>จำนวนสินค้าในหมวดหมู่</span>
              <div>
                <strong>{totalProductsInCategories}</strong>
                <small>รายการ</small>
              </div>
            </div>
          </div>
        </section>

        <section className="cat-table-card">
          <div className="cat-table-toolbar">
            <div className="cat-search-box">
              <FaSearch />
              <input
                type="text"
                placeholder="ค้นหาหมวดหมู่"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

             
          </div>

          <table className="cat-table">
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
              {loading ? (
                <tr>
                  <td colSpan="5" className="cat-empty">
                    กำลังโหลดข้อมูล...
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan="5" className="cat-empty">
                    ไม่พบหมวดหมู่
                  </td>
                </tr>
              ) : (
                filteredCategories.map((category, index) => (
                  <tr key={category.id}>
                    <td className="cat-index-cell">{index + 1}</td>

                    <td>
  <span className="cat-category-name">
    {category.categoryname || "-"}
  </span>
</td>

                    <td>
                      <span className="cat-count-text">
                        {Number(category.productCount || 0).toLocaleString()} รายการ
                      </span>
                    </td>

                    <td className="cat-date-cell">
                      {formatDate(category.createAt || category.createdAt)}
                    </td>

                    <td>
                      <div className="cat-action-row">
                        <button
                          className="cat-edit-btn"
                          type="button"
                          onClick={() => openEditModal(category)}
                          title="แก้ไขหมวดหมู่"
                        >
                          <FaEdit />
                        </button>

                        <button
                          className="cat-delete-btn"
                          type="button"
                          onClick={() => handleDelete(category)}
                          title="ลบหมวดหมู่"
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

          <div className="cat-table-footer">
            แสดง {filteredCategories.length} จาก {categories.length} รายการ
          </div>
        </section>
      </main>

      {showModal && (
        <div className="cat-modal-overlay">
          <div className="cat-modal-card">
            <button className="cat-modal-close" type="button" onClick={closeModal}>
              ×
            </button>

            <form onSubmit={handleSubmit}>
              <div className="cat-form-header">
                <div className="cat-form-icon">
                  {mode === "edit" ? <FaEdit /> : <FaPlus />}
                </div>

                <h2>
                  {mode === "add"
                    ? "เพิ่มชื่อหมวดหมู่สินค้า"
                    : "แก้ไขชื่อหมวดหมู่สินค้า"}
                </h2>
              </div>

              <div className="cat-form-group">
                <label htmlFor="categoryname">ชื่อหมวดหมู่สินค้า</label>
                <input
                  id="categoryname"
                  type="text"
                  name="categoryname"
                  value={formData.categoryname}
                  onChange={handleChange}
                  placeholder="เช่น เครื่องดื่ม, ของแห้ง, ขนม"
                  required
                />
              </div>

              <div className="cat-form-actions">
                <button
                  type="button"
                  className="cat-cancel-btn"
                  onClick={closeModal}
                >
                  ยกเลิก
                </button>

                <button
                  className="cat-submit-btn"
                  type="submit"
                  disabled={submitting}
                >
                  {mode === "edit" ? <FaSave /> : <FaPlus />}
                  {submitting
                    ? "กำลังบันทึก..."
                    : mode === "edit"
                    ? "บันทึก"
                    : "เพิ่มหมวดหมู่"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Categories;