import React, { useEffect, useState } from "react";
import {
  FaPlusCircle,
  FaEdit,
  FaSave,
  FaExclamationTriangle,
} from "react-icons/fa";

function AddProduct({ onAdd, categories = [], mode = "add", initialData = null }) {
  const isEditMode = mode === "edit";
  const [submitting, setSubmitting] = useState(false);

  const normalizeValue = (value) => {
    if (value === null || value === undefined) return "";
    return String(value).trim();
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

  const getInitialCategoryValue = (data) => {
    if (!data) return "";

    return normalizeValue(
      data._categoryId ??
        data.category?.id ??
        data.category?.categoryId ??
        data.category?.category_id ??
        data.categoryId ??
        data.category_id ??
        data.categoryID ??
        data._categoryName ??
        data.category?.categoryname ??
        data.category?.categoryName ??
        data.category?.name ??
        data.categoryName ??
        data.categoryname
    );
  };

  const getEmptyForm = () => ({
    productName: "",
    categoryId: "",
    buyPrice: "",
    sellPrice: "",
    warehouseStock: "",
    storeStock: "",
    minStockQty: "",
    imageUrl: "",
  });

  const [formData, setFormData] = useState(getEmptyForm());

  useEffect(() => {
    if (isEditMode && initialData) {
      setFormData({
        productName: normalizeValue(
          initialData.productName ?? initialData.product_name ?? initialData.name
        ),
        categoryId: getInitialCategoryValue(initialData),
        buyPrice: normalizeValue(initialData.buyPrice),
        sellPrice: normalizeValue(initialData.sellPrice),
        warehouseStock: normalizeValue(initialData.warehouseStock),
        storeStock: normalizeValue(initialData.storeStock),
        minStockQty: normalizeValue(initialData.minStockQty || 10),
        imageUrl: normalizeValue(initialData.imageUrl),
      });
    } else {
      setFormData(getEmptyForm());
    }
  }, [isEditMode, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toNumber = (value) => {
    const numberValue = Number(value);
    return Number.isNaN(numberValue) ? 0 : numberValue;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const productName = formData.productName.trim();

    if (!productName) {
      alert("กรุณากรอกชื่อสินค้า");
      return;
    }

    if (!formData.categoryId) {
      alert("กรุณาเลือกหมวดหมู่");
      return;
    }

    if (toNumber(formData.sellPrice) < toNumber(formData.buyPrice)) {
      const confirmPrice = window.confirm(
        "ราคาขายต่ำกว่าราคาซื้อ ต้องการบันทึกต่อหรือไม่?"
      );

      if (!confirmPrice) return;
    }

    const selectedCategory = categories.find(
      (cat) => getCategorySelectValue(cat) === formData.categoryId
    );

    const categoryName = selectedCategory
      ? getCategoryNameFromCategory(selectedCategory)
      : formData.categoryId;

    const categoryIdNumber = Number(formData.categoryId);
    const safeCategoryId = Number.isNaN(categoryIdNumber)
      ? formData.categoryId
      : categoryIdNumber;

      const payload = {
        productName,
        buyPrice: toNumber(formData.buyPrice),
        sellPrice: toNumber(formData.sellPrice),
        warehouseStock: toNumber(formData.warehouseStock),
        storeStock: toNumber(formData.storeStock),
        minStockQty: toNumber(formData.minStockQty || 10),
        imageUrl: formData.imageUrl,
        category: {
          id: String(formData.categoryId),
        },
      };

    try {
      setSubmitting(true);
      await onAdd(payload);
    } finally {
      setSubmitting(false);
    }
  };
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
  
    if (!file) return;
  
    if (!file.type.startsWith("image/")) {
      alert("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
      return;
    }
  
    if (file.size > 2 * 1024 * 1024) {
      alert("รูปภาพต้องมีขนาดไม่เกิน 2MB");
      return;
    }
  
    const reader = new FileReader();
  
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        imageUrl: reader.result,
      }));
    };
  
    reader.readAsDataURL(file);
  };

  return (
    <form
      className={`add-product-form ${
        isEditMode ? "edit-product-form" : "new-product-form"
      }`}
      onSubmit={handleSubmit}
    >
      <div className="product-form-header">
        <div className="product-form-icon">
          {isEditMode ? <FaEdit /> : <FaPlusCircle />}
        </div>

        <div>
           

          <h2>{isEditMode ? "แก้ไขสินค้า" : "เพิ่มสินค้าใหม่"}</h2>

           
        </div>
      </div>

      {isEditMode && (
        <div className="edit-warning-box">
          <FaExclamationTriangle />
          <span>
            กำลังแก้ไขข้อมูลสินค้าเดิม เมื่อกดบันทึก ข้อมูลเก่าจะถูกอัปเดตทันที
          </span>
        </div>
      )}
<div className="form-group">
  <label>รูปภาพสินค้า</label>

  <div className="image-upload-box">
    {formData.imageUrl ? (
      <img
        src={formData.imageUrl}
        alt="รูปสินค้า"
        className="image-preview"
      />
    ) : (
      <div className="image-empty-preview">ยังไม่มีรูปภาพ</div>
    )}

    <label className="upload-image-btn">
      เลือกรูปภาพ
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        hidden
      />
    </label>

    {formData.imageUrl && (
      <button
        type="button"
        className="remove-image-btn"
        onClick={() =>
          setFormData((prev) => ({
            ...prev,
            imageUrl: "",
          }))
        }
      >
        ลบรูปภาพ
      </button>
    )}
  </div>
</div>
      <div className="form-group">
        <label htmlFor="productName">ชื่อสินค้า</label>
        <input
          id="productName"
          name="productName"
          type="text"
          value={formData.productName}
          onChange={handleChange}
          placeholder="เช่น น้ำเปล่า"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="categoryId">หมวดหมู่สินค้า</label>
        <select
          id="categoryId"
          name="categoryId"
          value={formData.categoryId}
          onChange={handleChange}
          required
        >
          <option value="">เลือกหมวดหมู่</option>

          {categories.map((cat) => {
            const categoryValue = getCategorySelectValue(cat);
            const categoryName = getCategoryNameFromCategory(cat);

            return (
              <option key={categoryValue || categoryName} value={categoryValue}>
                {categoryName || "-"}
              </option>
            );
          })}
        </select>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="buyPrice">ราคาซื้อ</label>
          <input
            id="buyPrice"
            name="buyPrice"
            type="number"
            min="0"
            step="0.01"
            value={formData.buyPrice}
            onChange={handleChange}
            placeholder="0"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="sellPrice">ราคาขาย</label>
          <input
            id="sellPrice"
            name="sellPrice"
            type="number"
            min="0"
            step="0.01"
            value={formData.sellPrice}
            onChange={handleChange}
            placeholder="0"
            required
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="warehouseStock">จำนวนในโกดัง</label>
          <input
            id="warehouseStock"
            name="warehouseStock"
            type="number"
            min="0"
            value={formData.warehouseStock}
            onChange={handleChange}
            placeholder="0"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="storeStock">จำนวนหน้าร้าน</label>
          <input
            id="storeStock"
            name="storeStock"
            type="number"
            min="0"
            value={formData.storeStock}
            onChange={handleChange}
            placeholder="0"
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="minStockQty">จำนวนขั้นต่ำก่อนแจ้งเตือนใกล้หมด</label>
        <input
          id="minStockQty"
          name="minStockQty"
          type="number"
          min="0"
          value={formData.minStockQty}
          onChange={handleChange}
          placeholder="10"
          required
        />
      </div>

      <button
        className={`submit-product-btn ${
          isEditMode ? "edit-submit-btn" : "add-submit-btn"
        }`}
        type="submit"
        disabled={submitting}
      >
        {isEditMode ? <FaSave /> : <FaPlusCircle />}
        {submitting
          ? "กำลังบันทึก..."
          : isEditMode
          ? "บันทึกการแก้ไข"
          : "เพิ่มสินค้าใหม่"}
      </button>
    </form>
  );
}

export default AddProduct;