import React, { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import api from "../api/api";
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
  FaCalendarAlt,
} from "react-icons/fa";

import "../pagecss/Products.css";
import AddProduct from "./AddProduct";

function Products({ onLogout }) {

  const PRODUCT_API = "/admin/products";
  const CATEGORY_API = "/admin/categories";

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

  const normalizeText = (value) => normalizeValue(value).toLowerCase();

  const getProductId = (product) => {
    return product.id;
  };

  const getProductName = (product) => {
    return normalizeValue(product.productName);
  };

  const getCategoryIdFromProduct = (product) => {
    return normalizeValue(product.category?.id);
  };

  const getCategoryNameFromProduct = (product) => {
    return normalizeValue(product.category?.categoryname);
  };

  const getCategoryIdFromCategory = (category) => {
    return normalizeValue(category?.id);
  };

  const getCategoryNameFromCategory = (category) => {
    return normalizeValue(category?.categoryname);
  };

  const getCategorySelectValue = (category) => {
    return getCategoryIdFromCategory(category);
  };

  const getStatus = (stock, minStockQty = 10) => {
    const safeStock = Number(stock || 0);
    const safeMinStockQty = Number(minStockQty ?? 10);

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

      const res = await api.get(PRODUCT_API);
      const data = Array.isArray(res.data) ? res.data : [];

      const mappedProducts = data.map((product) => {
        const warehouseStock = Number(product.warehouseStock || 0);
        const storeStock = Number(product.storeStock || 0);
        const totalStock = warehouseStock + storeStock;

        return {
          ...product,
          id: getProductId(product),
          productName: getProductName(product),
          warehouseStock,
          storeStock,
          stock: totalStock,
          status: getStatus(totalStock, product.minStockQty),
          _categoryId: getCategoryIdFromProduct(product),
          _categoryName: getCategoryNameFromProduct(product),
          imageUrl: product.imageUrl || "",
        };
      });

      setProducts(mappedProducts);
    } catch (error) {
      console.error("โหลดสินค้าไม่สำเร็จ:", error);
      alert("โหลดสินค้าไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await api.get(CATEGORY_API);
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

        await api.put(`${PRODUCT_API}/${editingProduct.id}`, payload);
        alert("แก้ไขสินค้าสำเร็จ");
      } else {
        await api.post(PRODUCT_API, payload);
        alert("เพิ่มสินค้าสำเร็จ");
      }

      await loadProducts();
      await loadCategories();
      closeProductModal();
    } catch (error) {
      console.error("บันทึกสินค้าไม่สำเร็จ:", error);

      const backendMessage =
        error.response?.data?.message ||
        error.response?.data ||
        (formMode === "edit" ? "แก้ไขสินค้าไม่สำเร็จ" : "เพิ่มสินค้าไม่สำเร็จ");

      alert(backendMessage);
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
      await api.delete(`${PRODUCT_API}/${id}`);
      await loadProducts();
      await loadCategories();
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
    const confirmLogout = window.confirm("ต้องการออกจากระบบใช่ไหม");
    if (!confirmLogout) {
      return;
    }
    onLogout();
  };

  const filteredProducts = useMemo(() => {
    const selectedCategoryData = categories.find(
      (category) => getCategorySelectValue(category) ===
      selectedCategory
    );

    const selectedCategoryId = selectedCategoryData
      ? getCategoryIdFromCategory(selectedCategoryData)
      : "";

    const selectedCategoryName = selectedCategoryData
      ? getCategoryNameFromCategory(selectedCategoryData)
      : selectedCategory;

    return [...products]
      .filter((product) => {
        const productName = normalizeText(product.productName);
        const keyword = normalizeText(searchTerm);

        if (!keyword) return true;
        return productName.includes(keyword);
      })
      .filter((product) => {
        if (!selectedCategory) return true;

        const productCategoryId = normalizeValue(product._categoryId);
        const productCategoryName = normalizeValue(product._categoryName);

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
      .filter((product) => {
        if (!selectedStatus) return true;
        return product.status === selectedStatus;
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
            end
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

          <NavLink
            to="/mock-sales"
            className={({ isActive }) =>
              isActive ? "menu-item active" : "menu-item"
            }
          >
            <FaCalendarAlt />
            <span>เพิ่มยอดขายย้อนหลัง</span>
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
              {
                products.filter((product) => product.status === "พร้อมขาย")
                  .length
              }
            </strong>
            <small>รายการ</small>
          </div>

          <div className="summary-card low">
            <span>สินค้าใกล้หมด</span>
            <strong>
              {
                products.filter((product) => product.status === "ใกล้หมด")
                  .length
              }
            </strong>
            <small>รายการ</small>
          </div>

          <div className="summary-card empty">
            <span>สินค้าหมดสต๊อก</span>
            <strong>
              {
                products.filter((product) => product.status === "หมดสต๊อก")
                  .length
              }
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

                {categories.map((category) => {
                  const categoryValue = getCategorySelectValue(category);
                  const categoryName = getCategoryNameFromCategory(category);

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

              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="latest">เรียงตามล่าสุด</option>
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
                filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td>
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.productName || "สินค้า"}
                          className="product-thumb"
                        />
                      ) : (
                        <div className="product-no-image">ไม่มีรูป</div>
                      )}
                    </td>

                    <td>
                      <div className="product-cell">
                        <span>{product.productName || "-"}</span>
                      </div>
                    </td>

                    <td className="category-cell">
                      {product._categoryName || "-"}
                    </td>

                    <td>
                      <div className="price-cell">
                        <span>
                          {Number(product.buyPrice || 0).toLocaleString()} บาท
                        </span>
                      </div>
                    </td>

                    <td>
                      <div className="price-cell">
                        <span>
                          {Number(product.sellPrice || 0).toLocaleString()} บาท
                        </span>
                      </div>
                    </td>

                    <td>
                      {Number(product.warehouseStock || 0).toLocaleString()}
                    </td>

                    <td>{Number(product.storeStock || 0).toLocaleString()}</td>

                    <td className={getStatusClass(product.status)}>
                      {formatStock(product.stock)}
                    </td>

                    <td>
                      <span
                        className={`status-badge ${getStatusClass(
                          product.status
                        )}`}
                      >
                        {product.status}
                      </span>
                    </td>

                    <td>
                      <div className="action-row">
                        <button
                          className="edit"
                          type="button"
                          onClick={() => openEditModal(product)}
                          title="แก้ไขสินค้า"
                        >
                          <FaEdit />
                        </button>

                        <button
                          className="delete"
                          type="button"
                          onClick={() => handleDeleteProduct(product.id)}
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