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
  const [reportMode, setReportMode] = useState("year");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
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
    if (reportMode === "year") {
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
    }

    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const monthly = Array(daysInMonth).fill(0);

    orders.forEach((order) => {
      if (!order.createdAt) return;

      const date = new Date(order.createdAt);

      if (
        date.getFullYear() === selectedYear &&
        date.getMonth() === selectedMonth
      ) {
        monthly[date.getDate() - 1] += Number(order.totalSell || 0);
      }
    });

    return {
      labels: Array.from({ length: daysInMonth }, (_, index) => `${index + 1}`),
      values: monthly,
      title: `กราฟยอดขายรายเดือน ${monthNames[selectedMonth]} ${
        selectedYear + 543
      }`,
    };
  }, [orders, selectedYear, selectedMonth, reportMode]);

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

  const monthlySummary = useMemo(() => {
    const values = chartData.values;
    const totalSales = values.reduce((sum, value) => sum + value, 0);
    const maxSale = Math.max(...values, 0);
    const bestIndex = values.findIndex((value) => value === maxSale);

    return {
      totalSales,
      maxSale,
      bestLabel:
        maxSale <= 0
          ? "-"
          : reportMode === "year"
          ? monthNames[bestIndex] || "-"
          : bestIndex >= 0
          ? `วันที่ ${bestIndex + 1}`
          : "-",
    };
  }, [chartData.values, reportMode]);

  const getReportTitle = () => {
    if (reportMode === "year") {
      return `รายปี ${selectedYear + 543}`;
    }

    return `รายเดือน ${monthNames[selectedMonth]} ${selectedYear + 543}`;
  };

  const getOrdersBySelectedPeriod = () => {
    return orders.filter((order) => {
      if (!order.createdAt) return false;

      const date = new Date(order.createdAt);

      if (reportMode === "year") {
        return date.getFullYear() === selectedYear;
      }

      return (
        date.getFullYear() === selectedYear &&
        date.getMonth() === selectedMonth
      );
    });
  };

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
        label: month,
        cost,
        sales,
        profit,
      };
    });
  };

  const getMonthlyReportRows = () => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

    return Array.from({ length: daysInMonth }, (_, index) => {
      const day = index + 1;

      const dayOrders = orders.filter((order) => {
        if (!order.createdAt) return false;

        const date = new Date(order.createdAt);

        return (
          date.getFullYear() === selectedYear &&
          date.getMonth() === selectedMonth &&
          date.getDate() === day
        );
      });

      const sales = dayOrders.reduce(
        (sum, order) => sum + Number(order.totalSell || 0),
        0
      );

      const profit = dayOrders.reduce(
        (sum, order) => sum + getProfitByOrderId(order.id),
        0
      );

      const cost = sales - profit;

      return {
        day,
        label: `วันที่ ${day}`,
        cost,
        sales,
        profit,
      };
    });
  };

  const handleExportExcel = () => {
    const rows = [];

    const ordersInPeriod = getOrdersBySelectedPeriod().sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );

    ordersInPeriod.forEach((order) => {
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
      ["ช่วงเวลา", getReportTitle()],
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

    if (reportMode === "year") {
      XLSX.utils.book_append_sheet(workbook, worksheet, "รายงานละเอียดรายปี");
      XLSX.writeFile(workbook, `รายงานละเอียดรายปี-${selectedYear + 543}.xlsx`);
    } else {
      XLSX.utils.book_append_sheet(workbook, worksheet, "รายงานละเอียดรายเดือน");
      XLSX.writeFile(
        workbook,
        `รายงานละเอียดรายเดือน-${selectedMonth + 1}-${selectedYear + 543}.xlsx`
      );
    }
  };

  const createPdfReportElement = ({
    rows,
    totalCost,
    totalSales,
    totalProfit,
    firstColumnTitle,
    totalLabel,
    reportDate,
    pageNumber,
    totalPages,
    showFooter,
  }) => {
    const tableFontSize = reportMode === "year" ? 20 : 18;
    const cellPadding = reportMode === "year" ? 10 : 9;
    const titleFontSize = reportMode === "year" ? 20 : 18;

    const reportElement = document.createElement("div");

    reportElement.style.width = "1000px";
    reportElement.style.padding = "30px";
    reportElement.style.background = "#ffffff";
    reportElement.style.fontFamily = "Prompt, sans-serif";
    reportElement.style.position = "fixed";
    reportElement.style.left = "-99999px";
    reportElement.style.top = "0";
    reportElement.style.zIndex = "-1";

    reportElement.innerHTML = `
      <h2 style="
        text-align:center;
        margin:0 0 18px;
        font-size:${titleFontSize}px;
        font-weight:bold;
      ">
        รายงานยอดขาย : ${getReportTitle()}
        &nbsp;&nbsp; วันที่ออกรายงาน: ${reportDate}
      </h2>

      ${
        totalPages > 1
          ? `<p style="text-align:right; margin:0 0 8px; font-size:14px;">
              หน้า ${pageNumber} / ${totalPages}
            </p>`
          : ""
      }

      <table style="
        width:100%;
        border-collapse:collapse;
        font-size:${tableFontSize}px;
        table-layout:fixed;
      ">
        <thead>
          <tr>
            <th style="border:1px solid #000; padding:${cellPadding}px;">${firstColumnTitle}</th>
            <th style="border:1px solid #000; padding:${cellPadding}px;">ต้นทุนทั้งหมด</th>
            <th style="border:1px solid #000; padding:${cellPadding}px;">ยอดขายทั้งหมด</th>
            <th style="border:1px solid #000; padding:${cellPadding}px;">กำไรทั้งหมด</th>
          </tr>
        </thead>

        <tbody>
          ${rows
            .map(
              (row) => `
                <tr>
                  <td style="border:1px solid #000; padding:${cellPadding}px; text-align:center;">
                    ${row.label}
                  </td>
                  <td style="border:1px solid #000; padding:${cellPadding}px; text-align:center;">
                    ${row.cost.toLocaleString()}
                  </td>
                  <td style="border:1px solid #000; padding:${cellPadding}px; text-align:center;">
                    ${row.sales.toLocaleString()}
                  </td>
                  <td style="border:1px solid #000; padding:${cellPadding}px; text-align:center;">
                    ${row.profit.toLocaleString()}
                  </td>
                </tr>
              `
            )
            .join("")}
        </tbody>

        ${
          showFooter
            ? `
              <tfoot>
                <tr>
                  <th style="border:1px solid #000; padding:${cellPadding}px;">${totalLabel}</th>
                  <th style="border:1px solid #000; padding:${cellPadding}px;">
                    ${totalCost.toLocaleString()}
                  </th>
                  <th style="border:1px solid #000; padding:${cellPadding}px;">
                    ${totalSales.toLocaleString()}
                  </th>
                  <th style="border:1px solid #000; padding:${cellPadding}px;">
                    ${totalProfit.toLocaleString()}
                  </th>
                </tr>
              </tfoot>
            `
            : ""
        }
      </table>
    `;

    return reportElement;
  };

  const handleExportPDF = async () => {
    const reportDate = formatCurrentDate();
    const rows =
      reportMode === "year" ? getYearlyReportRows() : getMonthlyReportRows();

    const totalCost = rows.reduce((sum, row) => sum + row.cost, 0);
    const totalSales = rows.reduce((sum, row) => sum + row.sales, 0);
    const totalProfit = rows.reduce((sum, row) => sum + row.profit, 0);

    const firstColumnTitle = reportMode === "year" ? "เดือน" : "วันที่";
    const totalLabel = reportMode === "year" ? "รวมทั้งปี" : "รวมทั้งเดือน";

    const rowsPerPage = reportMode === "year" ? 12 : 10;
    const pages = [];

    for (let i = 0; i < rows.length; i += rowsPerPage) {
      pages.push(rows.slice(i, i + rowsPerPage));
    }

    const doc = new jsPDF("landscape", "mm", "a4");

    for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
      const isLastPage = pageIndex === pages.length - 1;

      const reportElement = createPdfReportElement({
        rows: pages[pageIndex],
        totalCost,
        totalSales,
        totalProfit,
        firstColumnTitle,
        totalLabel,
        reportDate,
        pageNumber: pageIndex + 1,
        totalPages: pages.length,
        showFooter: isLastPage,
      });

      document.body.appendChild(reportElement);

      const canvas = await html2canvas(reportElement, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      const margin = 10;
      const imgWidth = pageWidth - margin * 2;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      if (pageIndex > 0) {
        doc.addPage();
      }

      doc.addImage(
        imgData,
        "PNG",
        margin,
        margin,
        imgWidth,
        Math.min(imgHeight, pageHeight - margin * 2)
      );

      document.body.removeChild(reportElement);
    }

    if (reportMode === "year") {
      doc.save(`รายงานยอดขายรายปี-${selectedYear + 543}.pdf`);
    } else {
      doc.save(
        `รายงานยอดขายรายเดือน-${selectedMonth + 1}-${selectedYear + 543}.pdf`
      );
    }
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

              <div className="report-controls">
                <div className="report-mode-buttons">
                  <button
                    type="button"
                    className={
                      reportMode === "month"
                        ? "report-mode-btn active"
                        : "report-mode-btn"
                    }
                    onClick={() => setReportMode("month")}
                  >
                    รายเดือน
                  </button>

                  <button
                    type="button"
                    className={
                      reportMode === "year"
                        ? "report-mode-btn active"
                        : "report-mode-btn"
                    }
                    onClick={() => setReportMode("year")}
                  >
                    รายปี
                  </button>
                </div>

                {reportMode === "month" && (
                  <select
                    className="chart-select"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  >
                    {monthNames.map((month, index) => (
                      <option key={month} value={index}>
                        {month}
                      </option>
                    ))}
                  </select>
                )}

                <select
                  className="chart-select"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                >
                  {[
                    selectedYear - 2,
                    selectedYear - 1,
                    selectedYear,
                    selectedYear + 1,
                  ].map((year) => (
                    <option key={year} value={year}>
                      {year + 543}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {reportMode === "year" ? (
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
            ) : (
              <div className="monthly-report-box">
                <div className="monthly-summary-grid">
                  <div className="monthly-summary-card">
                    <span>ยอดขายรวมเดือนนี้</span>
                    <strong>
                      {monthlySummary.totalSales.toLocaleString()} บาท
                    </strong>
                  </div>

                  <div className="monthly-summary-card">
                    <span>ยอดขายสูงสุด</span>
                    <strong>{monthlySummary.maxSale.toLocaleString()} บาท</strong>
                  </div>

                  <div className="monthly-summary-card">
                    <span>วันที่ขายดีที่สุด</span>
                    <strong>{monthlySummary.bestLabel}</strong>
                  </div>
                </div>

                <div className="monthly-chart-scroll">
                  <div className="monthly-bar-chart">
                    {chartData.values.map((sale, index) => {
                      const percent = maxSales > 0 ? (sale / maxSales) * 100 : 0;
                      const height = sale > 0 ? Math.max(percent, 6) : 2;

                      return (
                        <div className="monthly-bar-item" key={index}>
                          <div className="monthly-bar-value">
                            {sale > 0 ? sale.toLocaleString() : ""}
                          </div>

                          <div className="monthly-bar-track">
                            <div
                              className={
                                sale > 0
                                  ? "monthly-bar-fill"
                                  : "monthly-bar-fill empty"
                              }
                              style={{ height: `${height}%` }}
                            ></div>
                          </div>

                          <div className="monthly-bar-label">
                            {chartData.labels[index]}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <p className="monthly-chart-note">
                  เลื่อนซ้าย-ขวาเพื่อดูยอดขายครบทุกวันของเดือน
                </p>
              </div>
            )}
          </div>

          <div className="right-column">
            <div className="panel report-panel">
              <h2>รายงาน</h2>

              <div className="report-select fixed">
                <FaCalendarAlt />
                <div>
                  <span>ช่วงเวลา</span>
                  <strong>{getReportTitle()}</strong>
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