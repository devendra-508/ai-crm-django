import { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  PackagePlus,
  Upload,
  Download,
} from "lucide-react";

import api from "../api";

const emptyProduct = {
  name: "",
  product_code: "",
  hsn_code: "",
  gst_rate: "",
  batch_number: "",
  purchase_rate: "",
  mrp: "",
  expiry_date: "",
  current_stock: "",
  low_stock_limit: "10",
};

function Products() {
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [importLoading, setImportLoading] = useState(false);

  // Add product modal
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(emptyProduct);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const [editingProduct, setEditingProduct] = useState(null);

  const [deletingProduct, setDeletingProduct] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/products/");

      setProducts(response.data);
    } catch (err) {
      console.error("Products Error:", err);
      setError("Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Search
  const filteredProducts = products.filter((product) => {
    const text = `
            ${product.name}
            ${product.product_code}
            ${product.hsn_code || ""}
            ${product.batch_number || ""}
        `.toLowerCase();

    return text.includes(search.toLowerCase());
  });

  // Open Add Product form
  const openAddForm = () => {
    setEditingProduct(null);
    setFormData(emptyProduct);
    setFormError("");
    setShowForm(true);
  };

  const openEditForm = (product) => {
    setEditingProduct(product);

    setFormData({
      name: product.name || "",
      product_code: product.product_code || "",
      hsn_code: product.hsn_code || "",
      gst_rate: product.gst_rate ?? "",
      batch_number: product.batch_number || "",
      purchase_rate: product.purchase_rate ?? "",
      mrp: product.mrp ?? "",
      expiry_date: product.expiry_date || "",
      current_stock: product.current_stock ?? "",
      low_stock_limit: product.low_stock_limit ?? "10",
    });

    setFormError("");
    setShowForm(true);
  };

  // Close form
  const closeForm = () => {
    if (formLoading) return;

    setShowForm(false);
    setFormData(emptyProduct);
    setFormError("");
  };

  // Handle input
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Submit product
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setFormLoading(true);
      setFormError("");

      const data = {
        name: formData.name.trim(),
        product_code: formData.product_code.trim(),
        hsn_code: formData.hsn_code.trim() || null,
        gst_rate: Number(formData.gst_rate || 0),
        batch_number: formData.batch_number.trim() || null,
        purchase_rate: Number(formData.purchase_rate),
        mrp: Number(formData.mrp),
        expiry_date: formData.expiry_date || null,
        current_stock: Number(formData.current_stock || 0),
        low_stock_limit: Number(formData.low_stock_limit || 10),
      };

      if (editingProduct) {
        // UPDATE PRODUCT
        await api.put(`/products/${editingProduct.id}/`, data);
      } else {
        // CREATE PRODUCT
        await api.post("/products/", data);
      }

      await fetchProducts();

      closeForm();
    } catch (err) {
      console.error("Product Save Error:", err);

      const backendError = err.response?.data;

      if (backendError) {
        if (typeof backendError === "object") {
          const messages = Object.entries(backendError).map(
            ([field, message]) => {
              return `${field}: ${
                Array.isArray(message) ? message.join(", ") : message
              }`;
            },
          );

          setFormError(messages.join(" | "));
        } else {
          setFormError(String(backendError));
        }
      } else {
        setFormError("Failed to save product.");
      }
    } finally {
      setFormLoading(false);
    }
  };
  const openDeleteModal = (product) => {
    setDeletingProduct(product);
  };

  const closeDeleteModal = () => {
    if (deleteLoading) return;

    setDeletingProduct(null);
  };

  const handleDelete = async () => {
    if (!deletingProduct) return;

    try {
      setDeleteLoading(true);

      await api.delete(`/products/${deletingProduct.id}/`);

      await fetchProducts();

      setDeletingProduct(null);
    } catch (err) {
      console.error("Delete Product Error:", err);

      alert(err.response?.data?.detail || "Failed to delete product.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.get("/products/export/", {
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type: "text/csv",
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download = "products.csv";

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export CSV Error:", error);

      alert("Failed to export products.");
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".csv")) {
      alert("Please select a CSV file.");
      e.target.value = "";
      return;
    }

    try {
      setImportLoading(true);

      const formData = new FormData();

      formData.append("file", file);

      const response = await api.post("/products/import/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert(`Import completed!\nCreated: ${response.data.created_count}`);

      await fetchProducts();
    } catch (error) {
      console.error("Import CSV Error:", error);

      alert(error.response?.data?.error || "Failed to import CSV.");
    } finally {
      setImportLoading(false);

      e.target.value = "";
    }
  };

  const openStockModal = (product) => {
    setStockProduct(product);
    setStockType("IN");
    setStockQuantity("");
    setStockReason("");
    setStockError("");
  };

  const closeStockModal = () => {
    if (stockLoading) return;

    setStockProduct(null);
    setStockQuantity("");
    setStockReason("");
    setStockError("");
  };

  const handleStockAdjust = async (e) => {
    e.preventDefault();

    if (!stockProduct) return;

    try {
      setStockLoading(true);
      setStockError("");

      await api.post("/stock/adjust/", {
        product: stockProduct.id,
        stock_type: stockType,
        quantity: Number(stockQuantity),
        reason: stockReason.trim() || null,
      });

      await fetchProducts();

      closeStockModal();
    } catch (err) {
      console.error("Stock Adjustment Error:", err);

      const backendError = err.response?.data;

      if (backendError) {
        if (typeof backendError === "object") {
          const messages = Object.entries(backendError).map(
            ([field, message]) => {
              return `${field}: ${
                Array.isArray(message) ? message.join(", ") : message
              }`;
            },
          );

          setStockError(messages.join(" | "));
        } else {
          setStockError(String(backendError));
        }
      } else {
        setStockError("Failed to update stock.");
      }
    } finally {
      setStockLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>

          <p className="text-sm text-slate-500 mt-1">
            Manage your inventory products
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Hidden CSV Input */}
          <input
            type="file"
            accept=".csv"
            id="csv-import"
            className="hidden"
            onChange={handleImport}
          />

          {/* Import CSV */}
          <label
            htmlFor="csv-import"
            className={`flex items-center gap-2 px-4 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg transition cursor-pointer ${
              importLoading ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            <Upload size={18} />

            {importLoading ? "Importing..." : "Import CSV"}
          </label>

          {/* Export CSV */}
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg transition"
          >
            <Download size={18} />
            Export CSV
          </button>

          {/* Add Product */}
          <button
            onClick={openAddForm}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          >
            <Plus size={18} />
            Add Product
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                  <Trash2 size={20} className="text-red-600" />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Delete Product
                  </h2>

                  <p className="text-sm text-slate-500 mt-2">
                    Are you sure you want to delete{" "}
                    <span className="font-medium text-slate-700">
                      {deletingProduct.name}
                    </span>
                    ?
                  </p>

                  <p className="text-xs text-slate-400 mt-2">
                    This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeDeleteModal}
                  disabled={deleteLoading}
                  className="px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition disabled:opacity-50"
                >
                  {deleteLoading ? "Deleting..." : "Delete Product"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="relative max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4">
          {error}
        </div>
      )}

      {/* Product Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">
            Loading products...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-5 py-4 text-left">Product</th>

                  <th className="px-5 py-4 text-left">Code</th>

                  <th className="px-5 py-4 text-left">HSN</th>
                  <th className="px-5 py-4 text-left">GST</th>

                  <th className="px-5 py-4 text-left">Purchase Rate</th>

                  <th className="px-5 py-4 text-left">MRP</th>

                  <th className="px-5 py-4 text-left">Stock</th>

                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-medium text-slate-900">
                            {product.name}
                          </p>

                          {product.batch_number && (
                            <p className="text-xs text-slate-400 mt-1">
                              Batch: {product.batch_number}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {product.product_code}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {product.hsn_code || "-"}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {product.gst_rate ?? 0}%
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        ₹{product.purchase_rate}
                      </td>

                      <td className="px-5 py-4 font-medium text-slate-800">
                        ₹{product.mrp}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={
                            product.current_stock <= product.low_stock_limit
                              ? "px-2.5 py-1 rounded-full bg-red-50 text-red-600 text-xs font-medium"
                              : "px-2.5 py-1 rounded-full bg-green-50 text-green-600 text-xs font-medium"
                          }
                        >
                          {product.current_stock}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            title="Edit product"
                            onClick={() => openEditForm(product)}
                            className="p-2 rounded-lg text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            title="Delete product"
                            onClick={() => openDeleteModal(product)}
                            className="p-2 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="8"
                      className="px-5 py-10 text-center text-slate-400"
                    >
                      {search ? "No products found." : "No products available."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  {editingProduct ? "Edit Product" : "Add Product"}
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  {editingProduct
                    ? "Update product information"
                    : "Add a new product to inventory"}
                </p>
              </div>

              <button
                onClick={closeForm}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Form Error */}
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 text-sm">
                  {formError}
                </div>
              )}

              {/* Basic Information */}
              <div>
                <h3 className="font-semibold text-slate-800 mb-4">
                  Basic Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Product Name */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Product Name *
                    </label>

                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Paracetamol 500mg"
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Product Code */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Product Code *
                    </label>

                    <input
                      type="text"
                      name="product_code"
                      value={formData.product_code}
                      onChange={handleChange}
                      required
                      placeholder="e.g. MED-PARA-500"
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* HSN */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      HSN Code
                    </label>

                    <input
                      type="text"
                      name="hsn_code"
                      value={formData.hsn_code}
                      onChange={handleChange}
                      placeholder="e.g. 300490"
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* GST */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      GST Rate (%)
                    </label>

                    <input
                      type="number"
                      name="gst_rate"
                      value={formData.gst_rate}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      placeholder="e.g. 18"
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Batch */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Batch Number
                    </label>

                    <input
                      type="text"
                      name="batch_number"
                      value={formData.batch_number}
                      onChange={handleChange}
                      placeholder="e.g. PAR-2026-A01"
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div>
                <h3 className="font-semibold text-slate-800 mb-4">Pricing</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Purchase Rate */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Purchase Rate *
                    </label>

                    <input
                      type="number"
                      name="purchase_rate"
                      value={formData.purchase_rate}
                      onChange={handleChange}
                      required
                      min="0"
                      step="0.01"
                      placeholder="e.g. 18"
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* MRP */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      MRP *
                    </label>

                    <input
                      type="number"
                      name="mrp"
                      value={formData.mrp}
                      onChange={handleChange}
                      required
                      min="0"
                      step="0.01"
                      placeholder="e.g. 25"
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Inventory */}
              <div>
                <h3 className="font-semibold text-slate-800 mb-4">Inventory</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Expiry */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Expiry Date
                    </label>

                    <input
                      type="date"
                      name="expiry_date"
                      value={formData.expiry_date}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Stock */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Current Stock
                    </label>

                    <input
                      type="number"
                      name="current_stock"
                      value={formData.current_stock}
                      onChange={handleChange}
                      min="0"
                      placeholder="0"
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Low Stock */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Low Stock Limit
                    </label>

                    <input
                      type="number"
                      name="low_stock_limit"
                      value={formData.low_stock_limit}
                      onChange={handleChange}
                      min="0"
                      placeholder="10"
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={formLoading}
                  className="px-5 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50"
                >
                  {formLoading
                    ? "Saving..."
                    : editingProduct
                      ? "Update Product"
                      : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;
