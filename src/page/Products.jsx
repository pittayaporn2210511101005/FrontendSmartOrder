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
  FaRedoAlt,
} from "react-icons/fa";

import "../pagecss/Products.css";
import AddProduct from "./AddProduct";

function Products() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [showProductModal, setShowProductModal] = useState(false);
  const [formMode, setFormMode] = useState("add");
  const [editingProduct, setEditingProduct] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [sortBy, setSortBy] = useState("latest");

  const [loading, setLoading] = useState(false);

  const normalizeValue = (value) => {
    if (value === null || value === undefined) return "";
    return String(value).trim();
  };

  const normalizeText = (value) => {
    return normalizeValue(value).toLowerCase();
  };

  const getProductId = (p) => {
    return p.id ?? p.productId ?? p.product_id;
  };

  const getProductName = (p) => {
    return normalizeValue(p.productName ?? p.product_name ?? p.name);
  };

  const getCategoryIdFromProduct = (p) => {
    return normalizeValue(
      p.category?.id ??
        p.category?.categoryId ??
        p.category?.category_id ??
        p.categoryId ??
        p.category_id ??
        p.categoryID
    );
  };

  const getCategoryNameFromProduct = (p) => {
    if (typeof p.category === "string") {
      return normalizeValue(p.category);
    }

    return normalizeValue(
      p.category?.categoryname ??
        p.category?.categoryName ??
        p.category?.category_name ??
        p.category?.name ??
        p.categoryname ??
        p.categoryName ??
        p.category_name
    );
  };

  const getCategoryIdFromCategory = (cat) => {
    if (typeof cat === "string") return "";

    return normalizeValue(
      cat.id ?? cat.categoryId ?? cat.category_id ?? cat.categoryID
    );
  };

  const getCategoryNameFromCategory = (cat) => {
    if (typeof cat === "string") return normalizeValue(cat);

    return normalizeValue(
      cat.categoryname ?? cat.categoryName ?? cat.category_name ?? cat.name
    );
  };

  const getCategorySelectValue = (cat) => {
    const categoryId = getCategoryIdFromCategory(cat);
    const categoryName = getCategoryNameFromCategory(cat);

    return categoryId || categoryName;
  };

  const getStatus = (stock, minStockQty = 10) => {
    const safeStock = Number(stock || 0);
    const safeMinStockQty = Number(minStockQty || 10);

    if (safeStock === 0) return "หมดสต๊อก";
    if (safeStock <= safeMinStockQty) return "ใกล้หมด";
    return "พร้อมขาย";
  };

  const getStatusClass = (status) => {
    if (status === "หมดสต๊อก") return "empty";
    if (status === "ใกล้หมด") return "low";
    return "ok";
  };

  const formatStock = (stock) => {
    return (
      <div className="stock-cell">
        <span>{Number(stock || 0).toLocaleString()} ชิ้น</span>
      </div>
    );
  };

  const loadProducts = async () => {
    try {
      setLoading(true);

      const res = await axios.get("http://localhost:8089/api/admin/products");
      const data = Array.isArray(res.data) ? res.data : [];

      const productsWithStatus = data.map((p) => {
        const warehouseStock = Number(p.warehouseStock || 0);
        const storeStock = Number(p.storeStock || 0);
        const totalStock = warehouseStock + storeStock;

        return {
          ...p,
          id: getProductId(p),
          productName: getProductName(p),
          warehouseStock,
          storeStock,
          stock: totalStock,
          status: getStatus(totalStock, p.minStockQty),
          _categoryId: getCategoryIdFromProduct(p),
          _categoryName: getCategoryNameFromProduct(p),
          imageUrl: p.imageUrl || "",
        };
      });

      setProducts(productsWithStatus);
    } catch (error) {
      console.error("โหลดสินค้าไม่สำเร็จ:", error);
      alert("โหลดสินค้าไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await axios.get("http://localhost:8089/api/admin/categories");
      const data = Array.isArray(res.data) ? res.data : [];

      setCategories(data);
    } catch (error) {
      console.error("โหลดหมวดหมู่ไม่สำเร็จ:", error);
      alert("โหลดหมวดหมู่ไม่สำเร็จ");
    }
  };

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const openAddModal = () => {
    setFormMode("add");
    setEditingProduct(null);
    setShowProductModal(true);
  };

  const openEditModal = (product) => {
    if (!product?.id) {
      alert("ไม่พบรหัสสินค้า");
      return;
    }

    setFormMode("edit");
    setEditingProduct(product);
    setShowProductModal(true);
  };

  const closeProductModal = () => {
    setShowProductModal(false);
    setEditingProduct(null);
    setFormMode("add");
  };

  const handleSubmitProduct = async (payload) => {
    try {
      if (formMode === "edit") {
        if (!editingProduct?.id) {
          alert("ไม่พบรหัสสินค้า");
          return;
        }

        await axios.put(
          `http://localhost:8089/api/admin/products/${editingProduct.id}`,
          payload
        );

        alert("แก้ไขสินค้าสำเร็จ");
      } else {
        await axios.post("http://localhost:8089/api/admin/products", payload);

        alert("เพิ่มสินค้าสำเร็จ");
      }

      await loadProducts();
      closeProductModal();
    } catch (error) {
      console.error("บันทึกสินค้าไม่สำเร็จ:", error);
      alert(
        formMode === "edit"
          ? "แก้ไขสินค้าไม่สำเร็จ"
          : "เพิ่มสินค้าไม่สำเร็จ"
      );
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!id) {
      alert("ไม่พบรหัสสินค้า");
      return;
    }

    const confirmDelete = window.confirm("คุณต้องการลบสินค้านี้ใช่หรือไม่?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:8089/api/admin/products/${id}`);

      await loadProducts();
      alert("ลบสินค้าสำเร็จ");
    } catch (error) {
      console.error("ลบสินค้าไม่สำเร็จ:", error);
      alert("ลบสินค้าไม่สำเร็จ");
    }
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedStatus("");
    setSortBy("latest");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.clear();

    navigate("/login");
  };

  const filteredProducts = useMemo(() => {
    const selectedCategoryData = categories.find(
      (cat) => getCategorySelectValue(cat) === selectedCategory
    );

    const selectedCategoryId = selectedCategoryData
      ? getCategoryIdFromCategory(selectedCategoryData)
      : "";

    const selectedCategoryName = selectedCategoryData
      ? getCategoryNameFromCategory(selectedCategoryData)
      : selectedCategory;

    return [...products]
      .filter((p) => {
        const productName = normalizeText(p.productName);
        const keyword = normalizeText(searchTerm);

        if (!keyword) return true;
        return productName.includes(keyword);
      })
      .filter((p) => {
        if (!selectedCategory) return true;

        const productCategoryId = normalizeValue(p._categoryId);
        const productCategoryName = normalizeValue(p._categoryName);

        const matchById =
          selectedCategoryId &&
          productCategoryId &&
          productCategoryId === selectedCategoryId;

        const matchByName =
          selectedCategoryName &&
          productCategoryName &&
          normalizeText(productCategoryName) ===
            normalizeText(selectedCategoryName);

        return matchById || matchByName;
      })
      .filter((p) => {
        if (!selectedStatus) return true;
        return p.status === selectedStatus;
      })
      .sort((a, b) => {
        if (sortBy === "name") {
          return String(a.productName || "").localeCompare(
            String(b.productName || ""),
            "th"
          );
        }

        if (sortBy === "stock") {
          return Number(a.stock || 0) - Number(b.stock || 0);
        }

        return Number(b.id || 0) - Number(a.id || 0);
      });
  }, [
    products,
    categories,
    searchTerm,
    selectedCategory,
    selectedStatus,
    sortBy,
  ]);

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
            <h1>สินค้า</h1>
            <p>จัดการสินค้าในร้าน</p>
          </div>

          <button className="add-btn" type="button" onClick={openAddModal}>
            <FaPlus />
            เพิ่มสินค้า
          </button>
        </header>

        <section className="summary-grid">
          <div className="summary-card all">
            <span>สินค้าทั้งหมด</span>
            <strong>{products.length}</strong>
            <small>รายการ</small>
          </div>

          <div className="summary-card ready">
            <span>สินค้าพร้อมขาย</span>
            <strong>
              {products.filter((p) => p.status === "พร้อมขาย").length}
            </strong>
            <small>รายการ</small>
          </div>

          <div className="summary-card low">
            <span>สินค้าใกล้หมด</span>
            <strong>
              {products.filter((p) => p.status === "ใกล้หมด").length}
            </strong>
            <small>รายการ</small>
          </div>

          <div className="summary-card empty">
            <span>สินค้าหมดสต๊อก</span>
            <strong>
              {products.filter((p) => p.status === "หมดสต๊อก").length}
            </strong>
            <small>รายการ</small>
          </div>
        </section>

        <section className="products-table-section">
          <div className="table-header">
            <input
              type="text"
              placeholder="ค้นหาสินค้า"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <div className="filters">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">หมวดหมู่ทั้งหมด</option>

                {categories.map((cat) => {
                  const categoryValue = getCategorySelectValue(cat);
                  const categoryName = getCategoryNameFromCategory(cat);

                  return (
                    <option
                      key={categoryValue || categoryName}
                      value={categoryValue}
                    >
                      {categoryName || "-"}
                    </option>
                  );
                })}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="">สถานะทั้งหมด</option>
                <option value="พร้อมขาย">พร้อมขาย</option>
                <option value="ใกล้หมด">ใกล้หมด</option>
                <option value="หมดสต๊อก">หมดสต๊อก</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="latest">เรียงตามล่าสุด</option>
                <option value="name">เรียงตามชื่อสินค้า</option>
                <option value="stock">สต็อกน้อยไปมาก</option>
              </select>

              <button
                className="reset-filter-btn"
                type="button"
                onClick={handleResetFilters}
              >
                <FaRedoAlt />
                รีเซ็ต
              </button>
            </div>
          </div>

          <table className="products-table">
  <thead>
    <tr>
      <th>รูป</th>
      <th>สินค้า</th>
      <th>หมวดหมู่</th>
      <th>ราคาซื้อ</th>
      <th>ราคาขาย</th>
      <th>โกดัง</th>
      <th>หน้าร้าน</th>
      <th>สต็อกคงเหลือ</th>
      <th>สถานะ</th>
      <th>จัดการ</th>
    </tr>
  </thead>

  <tbody>
    {loading ? (
      <tr>
        <td colSpan="10" className="empty-table">
          กำลังโหลดข้อมูล...
        </td>
      </tr>
    ) : filteredProducts.length === 0 ? (
      <tr>
        <td colSpan="10" className="empty-table">
          ไม่พบสินค้า
        </td>
      </tr>
    ) : (
      filteredProducts.map((p) => (
        <tr key={p.id}>
          <td>
            {p.imageUrl ? (
              <img
                src={p.imageUrl}
                alt={p.productName || "สินค้า"}
                className="product-thumb"
              />
            ) : (
              <div className="product-no-image">ไม่มีรูป</div>
            )}
          </td>

          <td>
            <div className="product-cell">
              <span>{p.productName || "-"}</span>
            </div>
          </td>

          <td className="category-cell">{p._categoryName || "-"}</td>

          <td>
            <div className="price-cell">
              <span>{Number(p.buyPrice || 0).toLocaleString()} บาท</span>
            </div>
          </td>

          <td>
            <div className="price-cell">
              <span>{Number(p.sellPrice || 0).toLocaleString()} บาท</span>
            </div>
          </td>

          <td>{Number(p.warehouseStock || 0).toLocaleString()}</td>

          <td>{Number(p.storeStock || 0).toLocaleString()}</td>

          <td className={getStatusClass(p.status)}>{formatStock(p.stock)}</td>

          <td>
            <span className={`status-badge ${getStatusClass(p.status)}`}>
              {p.status}
            </span>
          </td>

          <td>
            <div className="action-row">
              <button
                className="edit"
                type="button"
                onClick={() => openEditModal(p)}
                title="แก้ไขสินค้า"
              >
                <FaEdit />
              </button>

              <button
                className="delete"
                type="button"
                onClick={() => handleDeleteProduct(p.id)}
                title="ลบสินค้า"
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
            แสดง {filteredProducts.length} จาก {products.length} รายการ
          </div>
        </section>
      </main>

      {showProductModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <button
              className="modal-close"
              type="button"
              onClick={closeProductModal}
            >
              ×
            </button>

            <AddProduct
              mode={formMode}
              initialData={editingProduct}
              onAdd={handleSubmitProduct}
              categories={categories}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;