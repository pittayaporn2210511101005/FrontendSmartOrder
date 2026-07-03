import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import api from "../api/api";
import {
  FaHome,
  FaBox,
  FaFolder,
  FaClipboardList,
  FaSignOutAlt,
  FaShoppingCart,
  FaPlus,
  FaTrash,
  FaSave,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaCubes,
} from "react-icons/fa";

import "../pagecss/MockSale.css";

const PRODUCT_API = "/admin/products";
const MOCK_ORDER_API = "/admin/mock-orders";

function MockSales({onLogout}) {

  const [products, setProducts] = useState([]);

  const [formData, setFormData] = useState({
    saleDay: "",
    saleMonth: "",
    saleYear: "2026",
    saleTime: "12:00",
    mobileId: "Mater",
    stockType: "store",
  });

  const [items, setItems] = useState([
    {
      productId: "",
      quantity: 1,
    },
  ]);

  const [loadingProducts, setLoadingProducts] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadProducts = async () => {
    try {
      setLoadingProducts(true);

      const res = await api.get(PRODUCT_API);
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("โหลดสินค้าไม่สำเร็จ:", error);
      alert("โหลดสินค้าไม่สำเร็จ");
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleLogout = () => {
    const confirmLogout = window.confirm("ต้องการออกจากระบบใช่ไหม");
    if (!confirmLogout) {
      return;
    }
    onLogout();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleItemChange = (index, field, value) => {
    setItems((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  const addItemRow = () => {
    setItems((prev) => [
      ...prev,
      {
        productId: "",
        quantity: 1,
      },
    ]);
  };

  const removeItemRow = (index) => {
    if (items.length === 1) {
      alert("ต้องมีสินค้าอย่างน้อย 1 รายการ");
      return;
    }

    setItems((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  };

  const resetForm = () => {
    setFormData({
      saleDay: "",
      saleMonth: "",
      saleYear: "2026",
      saleTime: "12:00",
      mobileId: "Mater",
      stockType: "store",
    });

    setItems([
      {
        productId: "",
        quantity: 1,
      },
    ]);
  };

  const getProductId = (product) => {
    return product.id ?? product.productId ?? "";
  };

  const getProductName = (product) => {
    return product.productName ?? product.name ?? "-";
  };

  const getProductSellPrice = (product) => {
    return Number(product.sellPrice ?? product.sellingPrice ?? 0);
  };

  const getSaleDate = () => {
    if (!formData.saleDay || !formData.saleMonth || !formData.saleYear) {
      return "";
    }

    const day = String(formData.saleDay).padStart(2, "0");
    const month = String(formData.saleMonth).padStart(2, "0");

    return `${formData.saleYear}-${month}-${day}`;
  };

  const formatSelectedThaiDate = () => {
    const saleDate = getSaleDate();

    if (!saleDate) return "";

    const date = new Date(`${saleDate}T00:00:00`);

    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const selectedItems = useMemo(() => {
    return items.map((item) => {
      const product = products.find(
        (p) => String(getProductId(p)) === String(item.productId)
      );

      const quantity = Number(item.quantity || 0);
      const sellPrice = product ? getProductSellPrice(product) : 0;
      const totalPrice = quantity * sellPrice;

      return {
        ...item,
        product,
        quantity,
        sellPrice,
        totalPrice,
      };
    });
  }, [items, products]);

  const totalQuantity = selectedItems.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );

  const totalSell = selectedItems.reduce(
    (sum, item) => sum + Number(item.totalPrice || 0),
    0
  );

  const validateForm = () => {
    if (!formData.saleDay || !formData.saleMonth || !formData.saleYear) {
      alert("กรุณาเลือกวัน เดือน และปี");
      return false;
    }
  
    const saleDate = getSaleDate();
    const selectedDate = new Date(`${saleDate}T00:00:00`);
  
    const today = new Date();
    today.setHours(0, 0, 0, 0);
  
    if (selectedDate > today) {
      alert("ไม่สามารถเพิ่มยอดขายย้อนหลังเป็นวันที่ในอนาคตได้");
      return false;
    }
  
    if (!formData.saleTime) {
      alert("กรุณาเลือกเวลา");
      return false;
    }
  
    if (items.length === 0) {
      alert("กรุณาเพิ่มสินค้าอย่างน้อย 1 รายการ");
      return false;
    }
  
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const saleDate = getSaleDate();
    const createdAt = `${saleDate}T${formData.saleTime}:00`;

    const payload = {
      createdAt,
      mobileId: formData.mobileId,
      stockType: formData.stockType,
      items: items
        .filter((item) => item.productId && Number(item.quantity) > 0)
        .map((item) => ({
          productId: item.productId,
          quantity: Number(item.quantity),
          stockType: formData.stockType,
        })),
    };

    const confirmSave = window.confirm(
      `ยืนยันเพิ่มยอดขายย้อนหลังวันที่ ${formatSelectedThaiDate()} ยอดรวม ฿${totalSell.toLocaleString()} ใช่ไหม?`
    );

    if (!confirmSave) return;

    try {
      setSubmitting(true);

      await api.post(MOCK_ORDER_API, payload);

      alert("เพิ่มยอดขายย้อนหลังสำเร็จ");
      resetForm();
    } catch (error) {
      console.error("เพิ่มยอดขายย้อนหลังไม่สำเร็จ:", error);

      const message =
        error.response?.data?.message ||
        error.response?.data ||
        "เพิ่มยอดขายย้อนหลังไม่สำเร็จ";

      alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mock-page">
      <aside className="mock-sidebar">
        <div className="mock-sidebar-logo">
          <div className="mock-logo-box">
            <FaShoppingCart />
          </div>

          <h2>SmartOrder</h2>
          <p>ระบบจัดการร้านค้า</p>
        </div>

        <nav className="mock-menu">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive ? "mock-menu-item active" : "mock-menu-item"
            }
          >
            <FaHome />
            <span>หน้าหลัก</span>
          </NavLink>

          <NavLink
            to="/products"
            className={({ isActive }) =>
              isActive ? "mock-menu-item active" : "mock-menu-item"
            }
          >
            <FaBox />
            <span>สินค้า</span>
          </NavLink>

          <NavLink
            to="/categories"
            className={({ isActive }) =>
              isActive ? "mock-menu-item active" : "mock-menu-item"
            }
          >
            <FaFolder />
            <span>หมวดหมู่</span>
          </NavLink>

          <NavLink
            to="/orders"
            className={({ isActive }) =>
              isActive ? "mock-menu-item active" : "mock-menu-item"
            }
          >
            <FaClipboardList />
            <span>ออเดอร์</span>
          </NavLink>

          <NavLink
            to="/mock-sales"
            className={({ isActive }) =>
              isActive ? "mock-menu-item active" : "mock-menu-item"
            }
          >
            <FaCalendarAlt />
            <span>เพิ่มยอดขายย้อนหลัง</span>
          </NavLink>
        </nav>

        <button className="mock-logout-btn" type="button" onClick={handleLogout}>
          <FaSignOutAlt />
          <span>ออกจากระบบ</span>
        </button>
      </aside>

      <main className="mock-content">
        <header className="mock-header">
          <div>
            <h1>เพิ่มยอดขายย้อนหลัง</h1>
            <p>
              ใช้สำหรับเพิ่มข้อมูล mock ย้อนหลังผ่านหน้าเว็บ โดยไม่ต้องคีย์ DB โดยตรง
            </p>
          </div>
        </header>

        <section className="mock-summary-grid">
          <div className="mock-summary-card">
            <div className="mock-summary-icon mock-blue-icon">
              <FaCubes />
            </div>

            <div className="mock-summary-info">
              <span>จำนวนสินค้าที่เลือก</span>

              <div>
                <strong>{totalQuantity.toLocaleString()}</strong>
                <small>ชิ้น</small>
              </div>
            </div>
          </div>

          <div className="mock-summary-card">
            <div className="mock-summary-icon mock-green-icon">
              <FaMoneyBillWave />
            </div>

            <div className="mock-summary-info">
              <span>ยอดขายรวม</span>

              <div>
                <strong>฿{totalSell.toLocaleString()}</strong>
                <small>บาท</small>
              </div>
            </div>
          </div>
        </section>

        <section className="mock-table-card">
          <form onSubmit={handleSubmit}>
            <div className="mock-table-toolbar">
              <div className="mock-form-row">
                <div className="mock-form-group mock-date-group">
                  <label>วันที่ขายย้อนหลัง</label>

                  <div className="mock-date-select-row">
                    <select
                      name="saleDay"
                      value={formData.saleDay}
                      onChange={handleChange}
                      required
                    >
                      <option value="">วัน</option>
                      {Array.from({ length: 31 }, (_, index) => {
                        const day = index + 1;

                        return (
                          <option key={day} value={day}>
                            {day}
                          </option>
                        );
                      })}
                    </select>

                    <select
                      name="saleMonth"
                      value={formData.saleMonth}
                      onChange={handleChange}
                      required
                    >
                      <option value="">เดือน</option>
                      <option value="1">มกราคม</option>
                      <option value="2">กุมภาพันธ์</option>
                      <option value="3">มีนาคม</option>
                      <option value="4">เมษายน</option>
                      <option value="5">พฤษภาคม</option>
                      <option value="6">มิถุนายน</option>
                      <option value="7">กรกฎาคม</option>
                      <option value="8">สิงหาคม</option>
                      <option value="9">กันยายน</option>
                      <option value="10">ตุลาคม</option>
                      <option value="11">พฤศจิกายน</option>
                      <option value="12">ธันวาคม</option>
                    </select>

                    <select
                      name="saleYear"
                      value={formData.saleYear}
                      onChange={handleChange}
                      required
                    >
                      <option value="2026">2026</option>
                      <option value="2025">2025</option>
                      <option value="2024">2024</option>
                    </select>
                  </div>

                  {formatSelectedThaiDate() && (
                    <small className="mock-date-preview">
                      วันที่ที่เลือก: {formatSelectedThaiDate()}
                    </small>
                  )}
                </div>

                <div className="mock-form-group">
                  <label>เวลา</label>

                  <input
                    type="time"
                    name="saleTime"
                    value={formData.saleTime}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mock-form-group">
                  <label>ตัดสต็อกจาก</label>

                  <select
                    name="stockType"
                    value={formData.stockType}
                    onChange={handleChange}
                  >
                    <option value="store">หน้าร้าน</option>
                    <option value="warehouse">โกดัง</option>
                  </select>
                </div>
              </div>

              <button
                className="mock-add-btn"
                type="button"
                onClick={addItemRow}
              >
                <FaPlus />
                เพิ่มสินค้า
              </button>
            </div>

            <div className="mock-table-wrapper">
              <table className="mock-table">
                <thead>
                  <tr>
                    <th>ลำดับ</th>
                    <th>สินค้า</th>
                    <th>จำนวน</th>
                    <th>ราคาขาย</th>
                    <th>รวม</th>
                    <th>จัดการ</th>
                  </tr>
                </thead>

                <tbody>
                  {loadingProducts ? (
                    <tr>
                      <td colSpan="6" className="mock-empty">
                        กำลังโหลดสินค้า...
                      </td>
                    </tr>
                  ) : selectedItems.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="mock-empty">
                        ยังไม่มีรายการสินค้า
                      </td>
                    </tr>
                  ) : (
                    selectedItems.map((item, index) => (
                      <tr key={index}>
                        <td className="mock-index-cell">{index + 1}</td>

                        <td>
                          <select
                            className="mock-table-select"
                            value={item.productId}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "productId",
                                e.target.value
                              )
                            }
                            required
                          >
                            <option value="">-- เลือกสินค้า --</option>

                            {products.map((product) => (
                              <option
                                key={getProductId(product)}
                                value={getProductId(product)}
                              >
                                {getProductName(product)}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td>
                          <input
                            className="mock-table-input"
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "quantity",
                                e.target.value
                              )
                            }
                            required
                          />
                        </td>

                        <td>฿{Number(item.sellPrice || 0).toLocaleString()}</td>

                        <td>
                          <strong>
                            ฿{Number(item.totalPrice || 0).toLocaleString()}
                          </strong>
                        </td>

                        <td>
                          <div className="mock-action-row">
                            <button
                              className="mock-delete-btn"
                              type="button"
                              onClick={() => removeItemRow(index)}
                              title="ลบสินค้าออกจากรายการ"
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
            </div>

            <div className="mock-table-footer">
              <span>รวม {items.length} รายการ</span>
              <span>จำนวนทั้งหมด {totalQuantity.toLocaleString()} ชิ้น</span>
              <span>ยอดขายรวม ฿{totalSell.toLocaleString()}</span>
            </div>

            <div className="mock-form-actions">
              <button
                type="button"
                className="mock-cancel-btn"
                onClick={resetForm}
              >
                ล้างข้อมูล
              </button>

              <button
                className="mock-submit-btn"
                type="submit"
                disabled={submitting}
              >
                <FaSave />
                {submitting ? "กำลังบันทึก..." : "บันทึกยอดขายย้อนหลัง"}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}

export default MockSales;