import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";
import {
  FaHome,
  FaBox,
  FaThLarge,
  FaClipboardList,
  FaSignOutAlt,
  FaShoppingCart,
  FaMoneyBillWave,
  FaCube,
  FaCalendarAlt,
  FaFileExcel,
  FaFilePdf,
  FaChevronDown,
} from "react-icons/fa";

import "../pagecss/Main.css";

function Main() {
  const navigate = useNavigate();

  const PRODUCT_API = "http://localhost:8089/api/admin/products";
  const ORDER_API = "http://localhost:8089/api/mobile/orders";

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [details, setDetails] = useState({});
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);

  const monthNames = [
    "ม.ค.",
    "ก.พ.",
    "มี.ค.",
    "เม.ย.",
    "พ.ค.",
    "มิ.ย.",
    "ก.ค.",
    "ส.ค.",
    "ก.ย.",
    "ต.ค.",
    "พ.ย.",
    "ธ.ค.",
  ];

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const [productRes, orderRes] = await Promise.all([
        axios.get(PRODUCT_API),
        axios.get(ORDER_API),
      ]);

      const productData = Array.isArray(productRes.data) ? productRes.data : [];
      const orderData = Array.isArray(orderRes.data) ? orderRes.data : [];

      setProducts(productData);
      setOrders(orderData);

      const detailMap = {};

      for (const order of orderData) {
        try {
          const detailRes = await axios.get(`${ORDER_API}/${order.id}/details`);
          detailMap[order.id] = Array.isArray(detailRes.data)
            ? detailRes.data
            : [];
        } catch {
          detailMap[order.id] = [];
        }
      }

      setDetails(detailMap);
    } catch (error) {
      console.error(error);
      alert("โหลดข้อมูลหน้าหลักไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

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

  const getTotalStock = (product) => {
    return Number(product.warehouseStock || 0) + Number(product.storeStock || 0);
  };

  const getProfitByOrderId = (orderId) => {
    const list = details[orderId] || [];

    return list.reduce((sum, item) => {
      const sellPrice = Number(item.sellingPrice || 0);
      const buyPrice = Number(item.product?.buyPrice || 0);
      const qty = Number(item.quantity || 0);

      return sum + (sellPrice - buyPrice) * qty;
    }, 0);
  };

  const todayOrders = orders.filter((order) => isToday(order.createdAt));

  const todaySales = todayOrders.reduce(
    (sum, order) => sum + Number(order.totalSell || 0),
    0
  );

  const todayProfit = todayOrders.reduce(
    (sum, order) => sum + getProfitByOrderId(order.id),
    0
  );

  const lowStockCount = products.filter((product) => {
    const totalStock = getTotalStock(product);
    const minStockQty = Number(product.minStockQty || 10);

    return totalStock > 0 && totalStock <= minStockQty;
  }).length;

  const outStockCount = products.filter((product) => {
    return getTotalStock(product) <= 0;
  }).length;

  const profitPercent =
    todaySales > 0 ? ((todayProfit / todaySales) * 100).toFixed(1) : "0.0";

  const cards = [
    {
      title: "ยอดขายวันนี้",
      value: todaySales.toLocaleString(),
      unit: "บาท",
      icon: <FaShoppingCart />,
      color: "blue",
    },
    {
      title: "กำไรวันนี้",
      value: todayProfit.toLocaleString(),
      unit: "บาท",
      detail: `กำไร ${profitPercent}%`,
      icon: <FaMoneyBillWave />,
      color: "green",
    },
    {
      title: "สินค้าใกล้หมด",
      value: lowStockCount.toLocaleString(),
      unit: "รายการ",
      icon: <FaCube />,
      color: "orange",
    },
    {
      title: "สินค้าหมด",
      value: outStockCount.toLocaleString(),
      unit: "รายการ",
      icon: <FaCube />,
      color: "red",
    },
  ];

  const chartData = useMemo(() => {
    const yearly = Array(12).fill(0);

    orders.forEach((order) => {
      if (!order.createdAt) return;

      const date = new Date(order.createdAt);

      if (date.getFullYear() === selectedYear) {
        yearly[date.getMonth()] += Number(order.totalSell || 0);
      }
    });

    return {
      labels: monthNames,
      values: yearly,
      title: `กราฟยอดขายรายปี ${selectedYear + 543}`,
    };
  }, [orders, selectedYear]);

  const getNiceMax = (values) => {
    const maxValue = Math.max(...values, 0);

    if (maxValue <= 0) return 100;

    const roughMax = maxValue * 1.15;
    const power = Math.pow(10, Math.floor(Math.log10(roughMax)));
    const niceMax = Math.ceil(roughMax / power) * power;

    return niceMax;
  };

  const maxSales = getNiceMax(chartData.values);

  const chartPoints = chartData.values.map((sale, index) => {
    const total = chartData.values.length - 1 || 1;
    const x = (index / total) * 700;
    const y = 300 - (sale / maxSales) * 270;

    return `${x},${y}`;
  });

  const topProducts = useMemo(() => {
    const productMap = {};

    Object.values(details).forEach((list) => {
      list.forEach((item) => {
        const productId = item.product?.id || item.productId;
        const productName = item.product?.productName || "-";
        const imageUrl = item.product?.imageUrl || "";
        const qty = Number(item.quantity || 0);

        if (!productMap[productId]) {
          productMap[productId] = {
            id: productId,
            name: productName,
            imageUrl,
            qty: 0,
          };
        }

        productMap[productId].qty += qty;
      });
    });

    return Object.values(productMap)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [details]);

  const formatCurrentDate = () => {
    return new Date().toLocaleDateString("th-TH", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatCurrentTime = () => {
    return new Date().toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.clear();
    navigate("/login");
  };

  const formatThaiDateShort = (dateValue) => {
    const date = dateValue ? new Date(dateValue) : new Date();
  
    return date.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    });
  };
  
  const getReportRows = () => {
    return todayOrders.map((order) => ({
      วันที่: formatThaiDateShort(order.createdAt),
      เลขออเดอร์: order.orderNumber || `T${order.id}`,
      ต้นทุนสินค้าทั้งหมด: getProfitByOrderId(order.id)
        ? Number(order.totalSell || 0) - getProfitByOrderId(order.id)
        : 0,
      ราคาขายทั้งหมด: Number(order.totalSell || 0),
    }));
  };
  
  const getYearlyReportRows = () => {
    return monthNames.map((month, monthIndex) => {
      const monthOrders = orders.filter((order) => {
        if (!order.createdAt) return false;

        const date = new Date(order.createdAt);

        return (
          date.getFullYear() === selectedYear &&
          date.getMonth() === monthIndex
        );
      });

      const sales = monthOrders.reduce(
        (sum, order) => sum + Number(order.totalSell || 0),
        0
      );

      const profit = monthOrders.reduce(
        (sum, order) => sum + getProfitByOrderId(order.id),
        0
      );

      const cost = sales - profit;

      return {
        month,
        cost,
        sales,
        profit,
      };
    });
  };

  const handleExportExcel = () => {
    const rows = [];
  
    const ordersInYear = orders
      .filter((order) => {
        if (!order.createdAt) return false;
        return new Date(order.createdAt).getFullYear() === selectedYear;
      })
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  
    ordersInYear.forEach((order) => {
      const orderDetails = details[order.id] || [];
      const orderDate = new Date(order.createdAt).toLocaleDateString("th-TH");
      const orderNo = order.orderNumber || `T${order.id}`;
  
      let totalCostOrder = 0;
      let totalSellOrder = 0;
  
      orderDetails.forEach((item, index) => {
        const productName = item.product?.productName || "-";
        const quantity = Number(item.quantity || 0);
        const buyPrice = Number(item.product?.buyPrice || 0);
        const sellPrice = Number(item.sellingPrice || 0);
  
        const totalCost = buyPrice * quantity;
        const totalSell = sellPrice * quantity;
        const profit = totalSell - totalCost;
  
        totalCostOrder += totalCost;
        totalSellOrder += totalSell;
  
        rows.push([
          index === 0 ? orderDate : "",
          index === 0 ? orderNo : "",
          productName,
          quantity,
          buyPrice,
          sellPrice,
          totalCost,
          totalSell,
          profit,
          "",
          "",
        ]);
      });
  
      rows.push([
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        totalCostOrder,
        totalSellOrder,
      ]);
  
      rows.push([]);
    });
  
    const worksheetData = [
      ["ช่วงเวลา", `รายปี ${selectedYear + 543}`],
      ["วันที่ออกรายงาน", formatCurrentDate()],
      [],
      [
        "วันที่",
        "เลขออเดอร์",
        "สินค้า",
        "จำนวน",
        "ต้นทุนต่อหน่วย",
        "ราคาขาย",
        "ต้นทุนรวม",
        "ราคารวม",
        "กำไร",
        "ต้นทุนสินค้าทั้งหมด",
        "ราคาขายทั้งหมด",
      ],
      ...rows,
    ];
  
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  
    worksheet["!cols"] = [
      { wch: 14 },
      { wch: 18 },
      { wch: 30 },
      { wch: 10 },
      { wch: 16 },
      { wch: 16 },
      { wch: 16 },
      { wch: 16 },
      { wch: 14 },
      { wch: 22 },
      { wch: 20 },
    ];
  
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "รายงานละเอียดรายปี");
  
    XLSX.writeFile(workbook, `รายงานละเอียดรายปี-${selectedYear + 543}.xlsx`);
  };

  const handleExportPDF = async () => {
    const reportDate = formatCurrentDate();
    const rows = getYearlyReportRows();

    const totalCost = rows.reduce((sum, row) => sum + row.cost, 0);
    const totalSales = rows.reduce((sum, row) => sum + row.sales, 0);
    const totalProfit = rows.reduce((sum, row) => sum + row.profit, 0);

    const reportElement = document.createElement("div");

    reportElement.style.width = "1000px";
    reportElement.style.padding = "30px";
    reportElement.style.background = "#ffffff";
    reportElement.style.fontFamily = "Prompt, sans-serif";
    reportElement.style.position = "fixed";
    reportElement.style.left = "-9999px";
    reportElement.style.top = "0";

    reportElement.innerHTML = `
      <h2 style="text-align:center; margin-bottom:20px;">
        รายงานยอดขาย : รายปี ${selectedYear + 543}
        &nbsp;&nbsp; วันที่ออกรายงาน: ${reportDate}
      </h2>

      <table style="width:100%; border-collapse:collapse; font-size:20px;">
        <thead>
          <tr>
            <th style="border:1px solid #000; padding:10px;">เดือน</th>
            <th style="border:1px solid #000; padding:10px;">ต้นทุนทั้งหมด</th>
            <th style="border:1px solid #000; padding:10px;">ยอดขายทั้งหมด</th>
            <th style="border:1px solid #000; padding:10px;">กำไรทั้งหมด</th>
          </tr>
        </thead>

        <tbody>
          ${rows
            .map(
              (row) => `
                <tr>
                  <td style="border:1px solid #000; padding:10px; text-align:center;">
                    ${row.month}
                  </td>
                  <td style="border:1px solid #000; padding:10px; text-align:center;">
                    ${row.cost.toLocaleString()}
                  </td>
                  <td style="border:1px solid #000; padding:10px; text-align:center;">
                    ${row.sales.toLocaleString()}
                  </td>
                  <td style="border:1px solid #000; padding:10px; text-align:center;">
                    ${row.profit.toLocaleString()}
                  </td>
                </tr>
              `
            )
            .join("")}
        </tbody>

        <tfoot>
          <tr>
            <th style="border:1px solid #000; padding:10px;">รวมทั้งปี</th>
            <th style="border:1px solid #000; padding:10px;">
              ${totalCost.toLocaleString()}
            </th>
            <th style="border:1px solid #000; padding:10px;">
              ${totalSales.toLocaleString()}
            </th>
            <th style="border:1px solid #000; padding:10px;">
              ${totalProfit.toLocaleString()}
            </th>
          </tr>
        </tfoot>
      </table>
    `;

    document.body.appendChild(reportElement);

    const canvas = await html2canvas(reportElement, {
      scale: 2,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");
    const doc = new jsPDF("landscape", "mm", "a4");

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const imgWidth = pageWidth - 20;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    doc.addImage(
      imgData,
      "PNG",
      10,
      10,
      imgWidth,
      Math.min(imgHeight, pageHeight - 20)
    );

    doc.save(`รายงานยอดขายรายปี-${selectedYear + 543}.pdf`);

    document.body.removeChild(reportElement);
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
        </nav>

        <button className="logout-btn" type="button" onClick={handleLogout}>
          <FaSignOutAlt />
          <span>ออกจากระบบ</span>
        </button>
      </aside>

      <main className="content">
        <header className="dashboard-header">
          <div>
            <h1>สวัสดีครับ</h1>
            <p>
              {loading
                ? "กำลังโหลดข้อมูล..."
                : "ยินดีต้อนรับเข้าสู่ระบบ SmartOrder"}
            </p>
          </div>

          <button className="date-box" type="button" onClick={loadDashboardData}>
            <FaCalendarAlt />
            <div>
              <strong>{formatCurrentDate()}</strong>
              <span>{formatCurrentTime()} น.</span>
            </div>
            <FaChevronDown className="chevron" />
          </button>
        </header>

        <section className="summary-grid">
          {cards.map((card, index) => (
            <div className="summary-card" key={index}>
              <div className={`card-icon ${card.color}`}>{card.icon}</div>

              <div className="card-info">
                <h3>{card.title}</h3>
                <div className="card-value">
                  {card.value} <span>{card.unit}</span>
                </div>
                {card.detail && <p>{card.detail}</p>}
              </div>

              <div className={`mini-chart ${card.color}`}>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          ))}
        </section>

        <section className="main-grid">
          <div className="panel sales-panel">
            <div className="panel-header">
              <h2>{chartData.title}</h2>

              <select
                className="chart-select"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
              >
                {[selectedYear - 2, selectedYear - 1, selectedYear, selectedYear + 1].map(
                  (year) => (
                    <option key={year} value={year}>
                      {year + 543}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="chart-area">
              <div className="y-labels">
                <span>{maxSales.toLocaleString()}</span>
                <span>{Math.round(maxSales * 0.75).toLocaleString()}</span>
                <span>{Math.round(maxSales * 0.5).toLocaleString()}</span>
                <span>{Math.round(maxSales * 0.25).toLocaleString()}</span>
                <span>0</span>
              </div>

              <div className="chart">
                <svg viewBox="0 0 700 300" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="blueArea" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor="#0b5cff"
                        stopOpacity="0.35"
                      />
                      <stop
                        offset="100%"
                        stopColor="#0b5cff"
                        stopOpacity="0.02"
                      />
                    </linearGradient>
                  </defs>

                  <polygon
                    points={`${chartPoints.join(" ")} 700,300 0,300`}
                    fill="url(#blueArea)"
                  />

                  <polyline
                    points={chartPoints.join(" ")}
                    fill="none"
                    stroke="#0b5cff"
                    strokeWidth="4"
                  />

                  {chartData.values.map((sale, index) => {
                    const total = chartData.values.length - 1 || 1;
                    const x = (index / total) * 700;
                    const y = 300 - (sale / maxSales) * 270;

                    return (
                      <circle
                        key={index}
                        cx={x}
                        cy={y}
                        r="6"
                        fill="#0b5cff"
                      />
                    );
                  })}
                </svg>

                <div className="x-labels">
                  {chartData.labels.map((label) => (
                    <span key={label}>{label}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="right-column">
            <div className="panel report-panel">
              <h2>รายงาน</h2>

              <div className="report-select fixed">
                <FaCalendarAlt />
                <div>
                  <span>ช่วงเวลา</span>
                  <strong>รายปี</strong>
                </div>
              </div>

              <div className="export-row">
                <button
                  className="excel-btn"
                  type="button"
                  onClick={handleExportExcel}
                >
                  <FaFileExcel />
                  ส่งออก Excel
                </button>

                <button
                  className="pdf-btn"
                  type="button"
                  onClick={handleExportPDF}
                >
                  <FaFilePdf />
                  ส่งออก PDF
                </button>
              </div>
            </div>

            <div className="panel top-panel">
              <h2>สินค้าขายดี 5 อันดับ</h2>

              <div className="product-list">
                {topProducts.length === 0 ? (
                  <div className="product-item">
                    <span className="product-name">ยังไม่มีข้อมูลยอดขาย</span>
                  </div>
                ) : (
                  topProducts.map((item, index) => (
                    <div className="product-item" key={item.id || index}>
                      <span className="product-no">{index + 1}</span>

                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="top-product-img"
                        />
                      ) : (
                        <span className="product-icon">📦</span>
                      )}

                      <span className="product-name">{item.name}</span>
                      <strong>{item.qty.toLocaleString()} ชิ้น</strong>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Main;