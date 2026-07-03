import React, { useEffect, useMemo, useState } from "react";
import api from "../api/api";
import {
  FaSearch,
  FaPlus,
  FaMinus,
  FaCheck,
  FaSignOutAlt,
  FaBell,
  FaWarehouse,
  FaStore,
} from "react-icons/fa";
import "../mobilecss/Order.css";

function Order() {
  const PRODUCT_API = "/admin/products";
  const CATEGORY_API = "/admin/categories";
  const ORDER_API = "/mobile/orders";
  const NOTIFICATION_API = "/mobile/notifications";

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [stockType, setStockType] = useState("warehouse");

  const [cart, setCart] = useState({});
  const [showCart, setShowCart] = useState(false);

  const [loading, setLoading] = useState(false);
const [submitting, setSubmitting] = useState(false);

const [notifications, setNotifications] = useState([]);
const [unreadCount, setUnreadCount] = useState(0);
const [showNotifications, setShowNotifications] = useState(false);
const [expandedNotificationId, setExpandedNotificationId] = useState(null);
const [notificationOrders, setNotificationOrders] = useState([]);
const [loadingNotificationDetail, setLoadingNotificationDetail] =
  useState(false);

  const normalizeValue = (value) => {
    if (value === null || value === undefined) return "";
    return String(value).trim();
  };

  const getProductName = (product) => {
    return normalizeValue(
      product.productName ?? product.product_name ?? product.name
    );
  };

  const getCategoryIdFromProduct = (product) => {
    return normalizeValue(
      product.category?.id ??
        product.categoryId ??
        product.category_id ??
        product.categoryID
    );
  };

  const getCategoryNameFromProduct = (product) => {
    return normalizeValue(
      product.category?.categoryname ??
        product.category?.Categoryname ??
        product.category?.categoryName ??
        product.category?.category_name ??
        product.category?.name ??
        product.categoryname ??
        product.Categoryname ??
        product.categoryName ??
        product.category_name
    );
  };

  const getCategoryIdFromCategory = (category) => {
    return normalizeValue(
      category.id ??
        category.categoryId ??
        category.category_id ??
        category.categoryID
    );
  };

  const getCategoryNameFromCategory = (category) => {
    return normalizeValue(
      category.categoryname ??
        category.Categoryname ??
        category.categoryName ??
        category.category_name ??
        category.name
    );
  };

  const getProductPrice = (product) => {
    return Number(product.sellPrice || 0);
  };

  const getProductStock = (product) => {
    if (stockType === "warehouse") {
      return Number(product.warehouseStock || 0);
    }

    return Number(product.storeStock || 0);
  };

  const getAvailableStock = (product) => {
    const warehouseStock = Number(product.warehouseStock || 0);
    const storeStock = Number(product.storeStock || 0);

    if (stockType === "store") {
      return storeStock + warehouseStock;
    }

    return warehouseStock;
  };

  const getQty = (productId) => {
    return Number(cart[productId] || 0);
  };

  const getOrderCode = (order) => {
    return `ORD${String(order.id).padStart(3, "0")}`;
  };

  const formatMoney = (value) => {
    return Number(value || 0).toLocaleString();
  };

  const formatDateThai = (dateValue) => {
    if (!dateValue) return "-";

    const date = new Date(dateValue);

    return date.toLocaleDateString("th-TH", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getDailyReportFromNotification = (noti) => {
    return noti.dailyReport ?? noti.daily_report ?? null;
  };

  const getReportDateFromNotification = (noti) => {
    const report = getDailyReportFromNotification(noti);

    return (
      report?.reportDate ??
      report?.report_date ??
      noti.dateSent?.slice(0, 10) ??
      null
    );
  };

  const isNotificationRead = (noti) => {
    return Boolean(noti.read ?? noti.isRead);
  };

  const cartItems = useMemo(() => {
    return products
      .filter((product) => getQty(product.id) > 0)
      .map((product) => {
        const qty = getQty(product.id);
        const price = getProductPrice(product);

        return {
          ...product,
          qty,
          total: qty * price,
        };
      });
  }, [products, cart]);

  const selectedCount = Object.values(cart).reduce(
    (sum, qty) => sum + Number(qty || 0),
    0
  );

  const selectedProductTypes = Object.keys(cart).length;

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + Number(item.total || 0),
    0
  );

  const filteredProducts = useMemo(() => {
    const keyword = searchTerm.toLowerCase();

    return [...products]
      .filter((product) => {
        if (!selectedCategory) return true;

        return getCategoryIdFromProduct(product) === selectedCategory;
      })
      .filter((product) => {
        const name = getProductName(product).toLowerCase();
        const categoryName = getCategoryNameFromProduct(product).toLowerCase();

        return name.includes(keyword) || categoryName.includes(keyword);
      })
      .sort((a, b) => {
        const qtyA = getQty(a.id);
        const qtyB = getQty(b.id);

        if (qtyA > 0 && qtyB === 0) return -1;
        if (qtyA === 0 && qtyB > 0) return 1;

        return Number(b.id || 0) - Number(a.id || 0);
      });
  }, [products, selectedCategory, searchTerm, cart]);

  const loadData = async () => {
    try {
      setLoading(true);

      const [productRes, categoryRes] = await Promise.all([
        api.get(PRODUCT_API),
        api.get(CATEGORY_API),
      ]);

      setProducts(Array.isArray(productRes.data) ? productRes.data : []);
      setCategories(Array.isArray(categoryRes.data) ? categoryRes.data : []);
    } catch (error) {
      console.error(error);
      alert("โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  const loadNotifications = async () => {
    try {
      const [allRes, unreadRes] = await Promise.all([
        api.get(NOTIFICATION_API),
        api.get(`${NOTIFICATION_API}/unread`),
      ]);

      setNotifications(Array.isArray(allRes.data) ? allRes.data : []);
      setUnreadCount(Array.isArray(unreadRes.data) ? unreadRes.data.length : 0);
    } catch (error) {
      console.error(error);
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  const openNotificationPanel = async () => {
    setShowNotifications(true);
    setExpandedNotificationId(null);
    setNotificationOrders([]);
    await loadNotifications();
  };

  const toggleNotificationDetail = async (noti) => {
    if (expandedNotificationId === noti.id) {
      setExpandedNotificationId(null);
      setNotificationOrders([]);
      return;
    }

    const reportDate = getReportDateFromNotification(noti);

    try {
      setLoadingNotificationDetail(true);
      setExpandedNotificationId(noti.id);

      if (!isNotificationRead(noti)) {
        await api.put(`${NOTIFICATION_API}/${noti.id}/read`);
        await loadNotifications();
      }

      if (!reportDate) {
        setNotificationOrders([]);
        return;
      }

      const orderRes = await api.get(`${ORDER_API}/date?date=${reportDate}`);
      const orderData = Array.isArray(orderRes.data) ? orderRes.data : [];

      const successOrders = orderData.filter((order) => {
        const totalSell = Number(order.totalSell || 0);
        return order.status !== "FAILED" && totalSell > 0;
      });

      setNotificationOrders(successOrders);
    } catch (error) {
      console.error(error);
      setNotificationOrders([]);
    } finally {
      setLoadingNotificationDetail(false);
    }
  };

  useEffect(() => {
    loadData();
    loadNotifications();
  }, []);

  const increaseQty = (product) => {
    const productId = product.id;
    const currentQty = getQty(productId);

    const warehouseStock = Number(product.warehouseStock || 0);
    const storeStock = Number(product.storeStock || 0);
    const availableStock = getAvailableStock(product);

    if (currentQty >= availableStock) {
      alert(
        `สินค้าไม่เพียงพอ\nหน้าร้านมี ${storeStock} ชิ้น\nโกดังมี ${warehouseStock} ชิ้น`
      );
      return;
    }

    if (
      stockType === "store" &&
      currentQty + 1 > storeStock &&
      warehouseStock > 0
    ) {
      alert(
        `หน้าร้านมี ${storeStock} ชิ้น\nระบบจะดึงจากโกดังเพิ่ม ${
          currentQty + 1 - storeStock
        } ชิ้น`
      );
    }

    setCart((prev) => ({
      ...prev,
      [productId]: currentQty + 1,
    }));
  };

  const decreaseQty = (product) => {
    const productId = product.id;
    const currentQty = getQty(productId);

    if (currentQty <= 0) return;

    setCart((prev) => {
      const nextCart = { ...prev };
      const nextQty = currentQty - 1;

      if (nextQty === 0) {
        delete nextCart[productId];
      } else {
        nextCart[productId] = nextQty;
      }

      return nextCart;
    });
  };

  const updateQty = (product, value) => {
    const productId = product.id;

    const warehouseStock = Number(product.warehouseStock || 0);
    const storeStock = Number(product.storeStock || 0);
    const availableStock = getAvailableStock(product);
    const currentQty = getQty(productId);

    const rawValue = String(value).replace(/[^\d]/g, "");

    if (rawValue === "") {
      setCart((prev) => {
        const nextCart = { ...prev };
        delete nextCart[productId];
        return nextCart;
      });
      return;
    }

    let nextQty = Number(rawValue);

    if (nextQty <= 0) {
      setCart((prev) => {
        const nextCart = { ...prev };
        delete nextCart[productId];
        return nextCart;
      });
      return;
    }

    if (nextQty > availableStock) {
      alert(
        `สินค้าไม่เพียงพอ\nหน้าร้านมี ${storeStock} ชิ้น\nโกดังมี ${warehouseStock} ชิ้น\nใส่ได้สูงสุด ${availableStock} ชิ้น`
      );

      nextQty = availableStock;
    }

    if (
      stockType === "store" &&
      currentQty <= storeStock &&
      nextQty > storeStock &&
      warehouseStock > 0
    ) {
      alert(
        `หน้าร้านมี ${storeStock} ชิ้น\nระบบจะดึงจากโกดังเพิ่ม ${
          nextQty - storeStock
        } ชิ้น`
      );
    }

    setCart((prev) => ({
      ...prev,
      [productId]: nextQty,
    }));
  };

  const confirmOrder = async () => {
    if (cartItems.length === 0) {
      alert("ยังไม่มีสินค้าในตะกร้า");
      return;
    }

    const confirmSave = window.confirm("ยืนยันการสั่งซื้อใช่หรือไม่?");
    if (!confirmSave) return;

    try {
      setSubmitting(true);

      const orderRes = await api.post(ORDER_API, {
        totalSell: 0,
      });

      const orderId = orderRes.data.id;

      if (!orderId) {
        alert("สร้างออเดอร์ไม่สำเร็จ");
        return;
      }

      for (const item of cartItems) {
        await api.post(`${ORDER_API}/${orderId}/details`, {
          productId: String(item.id),
          quantity: item.qty,
          stockType: stockType,
        });
      }

      alert("บันทึกออเดอร์เข้าระบบเรียบร้อยแล้ว");

      setCart({});
      setShowCart(false);

      await loadData();
      await loadNotifications();
    } catch (error) {
      console.error(error);

      const message =
        error.response?.data?.message ||
        error.response?.data ||
        "ทำรายการไม่สำเร็จ";

      alert(`ทำรายการไม่สำเร็จ\n${message}`);

      setCart({});
      setShowCart(false);

      await loadData();
      await loadNotifications();
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    localStorage.removeItem("mobileUser");

    window.location.href = "/mobile/login";
  };

  return (
    <div className="mobile-order-page">
      <header className="mobile-order-header">
        <button
          className="mobile-header-icon left"
          type="button"
          onClick={handleLogout}
        >
          <FaSignOutAlt />
        </button>

        <h1>ออเดอร์</h1>

        <button
          className="mobile-header-icon right"
          type="button"
          onClick={openNotificationPanel}
        >
          <FaBell />

          {unreadCount > 0 && (
            <span className="mobile-noti-badge">{unreadCount}</span>
          )}
        </button>
      </header>

      <section className="mobile-search-row">
        <div className="mobile-search-box">
          <FaSearch />
          <input
            type="text"
            placeholder="ค้นหาสินค้า..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </section>

      <section className="mobile-category-tabs">
        <button
          type="button"
          className={!selectedCategory ? "active" : ""}
          onClick={() => setSelectedCategory("")}
        >
          ทั้งหมด
        </button>

        {categories.map((category) => {
          const categoryId = getCategoryIdFromCategory(category);
          const categoryName = getCategoryNameFromCategory(category);

          return (
            <button
              key={categoryId || categoryName}
              type="button"
              className={selectedCategory === categoryId ? "active" : ""}
              onClick={() => setSelectedCategory(categoryId)}
            >
              {categoryName || "-"}
            </button>
          );
        })}
      </section>

      <section className="mobile-stock-card">
        <p>เลือกสต๊อกที่จะขาย</p>

        <div className="mobile-stock-toggle">
          <button
            type="button"
            className={stockType === "warehouse" ? "active warehouse" : ""}
            onClick={() => setStockType("warehouse")}
          >
            <FaWarehouse />
            <span>โกดัง</span>
          </button>

          <button
            type="button"
            className={stockType === "store" ? "active store" : ""}
            onClick={() => setStockType("store")}
          >
            <FaStore />
            <span>หน้าร้าน</span>
          </button>
        </div>
      </section>

      <section className="mobile-product-section">
        <div className="mobile-section-header">
          <h2>รายการสินค้า</h2>
          <span>{filteredProducts.length} รายการ</span>
        </div>

        {loading ? (
          <div className="mobile-empty">กำลังโหลดสินค้า...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="mobile-empty">ไม่พบสินค้า</div>
        ) : (
          <div className="mobile-product-list">
            {filteredProducts.map((product) => {
              const productName = getProductName(product);
              const categoryName = getCategoryNameFromProduct(product);
              const stock = getProductStock(product);
              const availableStock = getAvailableStock(product);
              const qty = getQty(product.id);
              const isSelected = qty > 0;
              const minStock = Number(product.minStockQty || 10);

              return (
                <div
                  key={product.id}
                  className={`mobile-product-card ${
                    isSelected ? "selected" : ""
                  }`}
                >
                  <div
                    className={`mobile-check-circle ${
                      isSelected ? "active" : ""
                    }`}
                  >
                    {isSelected && <FaCheck />}
                  </div>

                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={productName}
                      className="mobile-product-img"
                    />
                  ) : (
                    <div className="mobile-no-img">ไม่มีรูป</div>
                  )}

                  <div className="mobile-product-info">
                    <h3>{productName || "-"}</h3>

                    <p className="mobile-category-name">
                      {categoryName || "ไม่ระบุหมวดหมู่"}
                    </p>

                    <p className="mobile-price">
                      ฿{getProductPrice(product).toLocaleString()}
                    </p>

                    <p
                      className={`mobile-stock-text ${
                        stock <= 0 ? "out" : stock <= minStock ? "low" : ""
                      }`}
                    >
                      {stock <= 0 ? "🔴" : stock <= minStock ? "🟡" : "🟢"}{" "}
                      {stockType === "store"
                        ? `หน้าร้าน ${Number(
                            product.storeStock || 0
                          ).toLocaleString()} / โกดัง ${Number(
                            product.warehouseStock || 0
                          ).toLocaleString()} ชิ้น`
                        : `โกดัง ${Number(
                            product.warehouseStock || 0
                          ).toLocaleString()} ชิ้น`}
                    </p>
                  </div>

                  <div className="mobile-qty-control">
                    <button
                      type="button"
                      onClick={() => decreaseQty(product)}
                      disabled={qty === 0}
                    >
                      <FaMinus />
                    </button>

                    <input
                      className="mobile-qty-input"
                      type="number"
                      min="0"
                      max={availableStock}
                      inputMode="numeric"
                      value={qty === 0 ? "" : qty}
                      placeholder="0"
                      onChange={(e) => updateQty(product, e.target.value)}
                      disabled={availableStock <= 0}
                    />

                    <button
                      type="button"
                      onClick={() => increaseQty(product)}
                      disabled={availableStock <= 0}
                    >
                      <FaPlus />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <footer className="mobile-bottom-bar">
        <div className="mobile-cart-summary">
          <strong>{selectedProductTypes}</strong>
          <span> รายการ</span>
          <p>รวมสินค้า {selectedCount} ชิ้น</p>
        </div>

        <div className="mobile-total-summary">
          <span>รวมทั้งสิ้น</span>
          <strong>฿{totalPrice.toLocaleString()}</strong>
        </div>

        <button
          className="mobile-cart-btn"
          type="button"
          disabled={selectedCount === 0}
          onClick={() => setShowCart(true)}
        >
          ดูตะกร้า
        </button>
      </footer>

      {showCart && (
        <div className="mobile-cart-modal">
          <div className="mobile-cart-box">
            <h2>ตรวจสอบตะกร้า</h2>

            <div className="mobile-cart-list">
              {cartItems.map((item) => (
                <div className="mobile-cart-item" key={item.id}>
                  <div>
                    <strong>{getProductName(item)}</strong>
                    <p>
                      {item.qty} ชิ้น x ฿
                      {getProductPrice(item).toLocaleString()}
                    </p>
                  </div>

                  <span>฿{item.total.toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="mobile-cart-total">
              <span>รวมทั้งหมด</span>
              <strong>฿{totalPrice.toLocaleString()}</strong>
            </div>

            <div className="mobile-cart-actions">
              <button
                type="button"
                className="cancel"
                onClick={() => setShowCart(false)}
              >
                ยกเลิก
              </button>

              <button
                type="button"
                className="confirm"
                onClick={confirmOrder}
                disabled={submitting}
              >
                {submitting ? "กำลังบันทึก..." : "ยืนยันการสั่งซื้อ"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showNotifications && (
        <div className="mobile-noti-modal">
          <div className="mobile-noti-box">
            <div className="mobile-noti-header">
              <h2>แจ้งเตือน</h2>

              <button
                type="button"
                onClick={() => {
                  setShowNotifications(false);
                  setExpandedNotificationId(null);
                  setNotificationOrders([]);
                }}
              >
                ×
              </button>
            </div>

            {notifications.length === 0 ? (
              <div className="mobile-noti-empty">ไม่มีแจ้งเตือน</div>
            ) : (
              <div className="mobile-noti-list">
                {notifications.map((noti) => {
                  const report = getDailyReportFromNotification(noti);
                  const read = isNotificationRead(noti);

                  return (
                    <div
                      className={`mobile-noti-card ${read ? "read" : "unread"}`}
                      key={noti.id}
                    >
                      <button
                        type="button"
                        className="mobile-noti-summary"
                        onClick={() => toggleNotificationDetail(noti)}
                      >
                        <div>
                          <strong>
                            สรุปยอดขายประจำวันที่{" "}
                            {report?.reportDate
                              ? formatDateThai(report.reportDate)
                              : formatDateThai(noti.dateSent)}
                          </strong>

                          <span>ยอดขาย ฿{formatMoney(report?.totalSell)}</span>
                          <span>ต้นทุน ฿{formatMoney(report?.totalCost)}</span>
                          <span>กำไร ฿{formatMoney(report?.profit)}</span>
                          <span>สินค้าขายดี {report?.topSelling || "-"}</span>
                        </div>

                        <small>
                          {expandedNotificationId === noti.id
                            ? "ซ่อน"
                            : "ดูรายการขาย"}
                        </small>
                      </button>

                      {expandedNotificationId === noti.id && (
                        <div className="mobile-noti-detail">
                          {loadingNotificationDetail ? (
                            <div className="mobile-noti-empty">
                              กำลังโหลดรายละเอียด...
                            </div>
                          ) : notificationOrders.length === 0 ? (
                            <div className="mobile-noti-empty">
                              ไม่มีออเดอร์สำเร็จในวันนี้
                            </div>
                          ) : (
                            <>
                              <h3>รายการขายวันนี้</h3>

                              {notificationOrders.map((order) => (
                                <div
                                  className="mobile-noti-order-row"
                                  key={order.id}
                                >
                                  <span>{getOrderCode(order)}</span>
                                  <strong>
                                    ฿{formatMoney(order.totalSell)}
                                  </strong>
                                </div>
                              ))}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Order;