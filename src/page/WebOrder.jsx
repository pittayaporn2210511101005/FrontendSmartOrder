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
  FaSearch,
  FaRedoAlt,
  FaEye,
  FaTimesCircle,
  FaCheckCircle,
  FaMoneyBillWave,
  FaChartLine,
  FaCube,
} from "react-icons/fa";
import "../pagecss/WebOrder.css";

function WebOrder() {
  const navigate = useNavigate();

  const ORDER_API = "http://localhost:8089/api/mobile/orders";

  const [orders, setOrders] = useState([]);
  const [details, setDetails] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("today");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get(ORDER_API);
      const data = Array.isArray(res.data) ? res.data : [];
      setOrders(data);

      const detailMap = {};
      for (const order of data) {
        const orderId = order.id;
        try {
          const detailRes = await axios.get(`${ORDER_API}/${orderId}/details`);
          detailMap[orderId] = Array.isArray(detailRes.data)
            ? detailRes.data
            : [];
        } catch {
          detailMap[orderId] = [];
        }
      }

      setDetails(detailMap);
    } catch (error) {
      console.error(error);
      alert("โหลดออเดอร์ไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const getOrderCode = (order) => {
    return `ORD${String(order.id).padStart(3, "0")}`;
  };

  const formatDateTime = (dateValue) => {
    if (!dateValue) return "-";

    const date = new Date(dateValue);
    return date.toLocaleString("th-TH", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getOrderItemsCount = (orderId) => {
    const list = details[orderId] || [];
    return list.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  };

   

  const getProfit = (orderId) => {
    const list = details[orderId] || [];

    return list.reduce((sum, item) => {
      const sell = Number(item.sellingPrice || 0);
      const buy = Number(item.product?.buyPrice || 0);
      const qty = Number(item.quantity || 0);
      return sum + (sell - buy) * qty;
    }, 0);
  };

  const isToday = (dateValue) => {
    if (!dateValue) return false;

    const date = new Date(dateValue);
    const today = new Date();

    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const filteredOrders = useMemo(() => {
    return orders
      .filter((order) => {
        const keyword = searchTerm.toLowerCase();
        if (!keyword) return true;

        return getOrderCode(order).toLowerCase().includes(keyword);
      })
      
      .filter((order) => {
        if (dateFilter === "today") return isToday(order.createdAt);
        return true;
      })
      .sort((a, b) => Number(b.id || 0) - Number(a.id || 0));
  }, [orders, searchTerm, dateFilter, details]);

  const todayOrders = orders.filter((order) => isToday(order.createdAt));
  const todaySales = todayOrders.reduce(
    (sum, order) => sum + Number(order.totalSell || 0),
    0
  );
  const todayProfit = todayOrders.reduce(
    (sum, order) => sum + getProfit(order.id),
    0
  );
  const todayProductQty = todayOrders.reduce(
    (sum, order) => sum + getOrderItemsCount(order.id),
    0
  );
   
  const openDetail = (order) => {
    setSelectedOrder(order);
    setShowDetail(true);
  };

  const closeDetail = () => {
    setSelectedOrder(null);
    setShowDetail(false);
  };

  const handleReset = () => {
    setSearchTerm("");
    setStatusFilter("");
    setDateFilter("today");
    loadOrders();
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
          <NavLink to="/" end className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
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

        <button className="logout-btn" type="button" onClick={handleLogout}>
          <FaSignOutAlt />
          <span>ออกจากระบบ</span>
        </button>
      </aside>

      <main className="content weborder-page">
        <header className="dashboard-header">
          <div>
            <h1>ออเดอร์</h1>
            <p>จัดการออเดอร์ในร้าน</p>
          </div>
        </header>

        <section className="weborder-summary-grid">
          <div className="weborder-summary-card blue">
            <div className="summary-icon"><FaShoppingCart /></div>
            <div>
              <span>ออเดอร์วันนี้</span>
              <strong>{todayOrders.length}</strong>
              <small>ออเดอร์</small>
            </div>
          </div>

          <div className="weborder-summary-card green">
            <div className="summary-icon"><FaMoneyBillWave /></div>
            <div>
              <span>ยอดขายวันนี้</span>
              <strong>฿{todaySales.toLocaleString()}</strong>
              <small>บาท</small>
            </div>
          </div>

          <div className="weborder-summary-card orange">
            <div className="summary-icon"><FaChartLine /></div>
            <div>
              <span>กำไรวันนี้</span>
              <strong>฿{todayProfit.toLocaleString()}</strong>
              <small>บาท</small>
            </div>
          </div>

          <div className="weborder-summary-card purple">
  <div className="summary-icon">
    <FaCube />
  </div>

  <div>
    <span>สินค้าที่ขายวันนี้</span>
    <strong>{todayProductQty}</strong>
    <small>ชิ้น</small>
  </div>
</div>
        </section>

        

        <section className="weborder-table-section">
          <div className="weborder-filter-row">
            <div className="weborder-search-box">
              <FaSearch />
              <input
                type="text"
                placeholder="ค้นหาเลขออเดอร์..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
              <option value="today">วันนี้</option>
              <option value="all">ทั้งหมด</option>
            </select>

            <button className="search-btn" type="button">
              <FaSearch />
              ค้นหา
            </button>

            <button className="reset-btn" type="button" onClick={handleReset}>
              <FaRedoAlt />
              รีเฟรช
            </button>
          </div>

          <table className="weborder-table">
            <thead>
              <tr>
                <th>เลขออเดอร์</th>
                <th>วันที่</th>
                <th>จำนวนสินค้า</th>
                <th>ยอดขาย</th>
                <th>กำไร</th>
                <th>จัดการ</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="empty-table">
                    กำลังโหลดออเดอร์...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-table">
                    ไม่พบออเดอร์
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                   

                  return (
                    <tr key={order.id}>
                      <td>{getOrderCode(order)}</td>
                      <td>{formatDateTime(order.createdAt)}</td>
                      <td>{getOrderItemsCount(order.id)} รายการ</td>
                      <td className="money">฿{Number(order.totalSell || 0).toLocaleString()}</td>
                      <td className="profit">฿{getProfit(order.id).toLocaleString()}</td>
                       
                      <td>
                        <button
                          className="detail-btn"
                          type="button"
                          onClick={() => openDetail(order)}
                        >
                          <FaEye />
                          ดูรายละเอียด
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          <div className="table-footer">
            แสดง {filteredOrders.length} จาก {orders.length} ออเดอร์
          </div>
        </section>
      </main>

      {showDetail && selectedOrder && (
        <div className="weborder-modal-overlay">
          <div className="weborder-modal">
            <button className="modal-close" type="button" onClick={closeDetail}>
              ×
            </button>

            <h2>รายละเอียด {getOrderCode(selectedOrder)}</h2>
            <p className="modal-subtitle">
              วันที่ {formatDateTime(selectedOrder.createdAt)}
            </p>

            <div className="order-detail-list">
              {(details[selectedOrder.id] || []).map((item) => (
                <div className="order-detail-item" key={item.id}>
                  <div>
                    <strong>{item.product?.productName || "-"}</strong>
                    <p>
                      {item.quantity} ชิ้น x ฿
                      {Number(item.sellingPrice || 0).toLocaleString()}
                    </p>
                  </div>

                  <span>
                    ฿{Number(item.totalPrice || 0).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="modal-total">
              <span>รวมทั้งหมด</span>
              <strong>
                ฿{Number(selectedOrder.totalSell || 0).toLocaleString()}
              </strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WebOrder;