import { useEffect, useState } from "react";
import {
    Search,
    PackagePlus,
    X,
} from "lucide-react";

import api from "../api";

function Stock() {
    const [products, setProducts] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");

    // Stock modal
    const [stockProduct, setStockProduct] = useState(null);
    const [stockType, setStockType] = useState("IN");
    const [stockQuantity, setStockQuantity] = useState("");
    const [stockReason, setStockReason] = useState("");
    const [stockLoading, setStockLoading] = useState(false);
    const [stockError, setStockError] = useState("");

    // =========================
    // FETCH PRODUCTS
    // =========================

    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/products/");

            setProducts(response.data);
        } catch (err) {
            console.error("Stock Products Error:", err);

            setError("Failed to load stock data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // =========================
    // SEARCH
    // =========================

    const filteredProducts = products.filter((product) => {
        const text = `
            ${product.name}
            ${product.product_code}
            ${product.batch_number || ""}
        `.toLowerCase();

        return text.includes(search.toLowerCase());
    });

    // =========================
    // OPEN STOCK MODAL
    // =========================

    const openStockModal = (product) => {
        setStockProduct(product);
        setStockType("IN");
        setStockQuantity("");
        setStockReason("");
        setStockError("");
    };

    // =========================
    // CLOSE STOCK MODAL
    // =========================

    const closeStockModal = () => {
        if (stockLoading) return;

        setStockProduct(null);
        setStockQuantity("");
        setStockReason("");
        setStockError("");
    };

    // =========================
    // STOCK ADJUSTMENT
    // =========================

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
            console.error(
                "Stock Adjustment Error:",
                err
            );

            const backendError = err.response?.data;

            if (backendError) {
                if (typeof backendError === "object") {
                    const messages = Object.entries(
                        backendError
                    ).map(([field, message]) => {
                        return `${field}: ${
                            Array.isArray(message)
                                ? message.join(", ")
                                : message
                        }`;
                    });

                    setStockError(
                        messages.join(" | ")
                    );
                } else {
                    setStockError(
                        String(backendError)
                    );
                }
            } else {
                setStockError(
                    "Failed to update stock."
                );
            }
        } finally {
            setStockLoading(false);
        }
    };

    return (
        <div className="space-y-6">

            {/* ================= HEADER ================= */}

            <div>
                <h1 className="text-2xl font-bold text-slate-900">
                    Stock Management
                </h1>

                <p className="text-sm text-slate-500 mt-1">
                    Manage stock levels and inventory adjustments
                </p>
            </div>

            {/* ================= SEARCH ================= */}

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
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    />

                </div>

            </div>

            {/* ================= ERROR ================= */}

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4">
                    {error}
                </div>
            )}

            {/* ================= STOCK TABLE ================= */}

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">

                {loading ? (

                    <div className="p-8 text-center text-slate-500">
                        Loading stock...
                    </div>

                ) : (

                    <div className="overflow-x-auto">

                        <table className="w-full text-sm">

                            <thead>

                                <tr className="border-b border-slate-200 bg-slate-50">

                                    <th className="px-5 py-4 text-left">
                                        Product
                                    </th>

                                    <th className="px-5 py-4 text-left">
                                        Code
                                    </th>

                                    <th className="px-5 py-4 text-left">
                                        Batch
                                    </th>

                                    <th className="px-5 py-4 text-center">
                                        Current Stock
                                    </th>

                                    <th className="px-5 py-4 text-center">
                                        Low Stock Limit
                                    </th>

                                    <th className="px-5 py-4 text-center">
                                        Status
                                    </th>

                                    <th className="px-5 py-4 text-right">
                                        Action
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {filteredProducts.length > 0 ? (

                                    filteredProducts.map(
                                        (product) => {

                                            const isLowStock =
                                                product.current_stock <=
                                                product.low_stock_limit;

                                            return (
                                                <tr
                                                    key={product.id}
                                                    className="border-b border-slate-100 hover:bg-slate-50"
                                                >

                                                    {/* Product */}

                                                    <td className="px-5 py-4">

                                                        <p className="font-medium text-slate-900">
                                                            {product.name}
                                                        </p>

                                                    </td>

                                                    {/* Code */}

                                                    <td className="px-5 py-4 text-slate-600">
                                                        {
                                                            product.product_code
                                                        }
                                                    </td>

                                                    {/* Batch */}

                                                    <td className="px-5 py-4 text-slate-500">
                                                        {
                                                            product.batch_number ||
                                                            "-"
                                                        }
                                                    </td>

                                                    {/* Current Stock */}

                                                    <td className="px-5 py-4 text-center">

                                                        <span
                                                            className={
                                                                isLowStock
                                                                    ? "px-3 py-1 rounded-full bg-red-50 text-red-600 font-medium"
                                                                    : "px-3 py-1 rounded-full bg-green-50 text-green-600 font-medium"
                                                            }
                                                        >
                                                            {
                                                                product.current_stock
                                                            }
                                                        </span>

                                                    </td>

                                                    {/* Limit */}

                                                    <td className="px-5 py-4 text-center text-slate-600">
                                                        {
                                                            product.low_stock_limit
                                                        }
                                                    </td>

                                                    {/* Status */}

                                                    <td className="px-5 py-4 text-center">

                                                        <span
                                                            className={
                                                                isLowStock
                                                                    ? "px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-medium"
                                                                    : "px-3 py-1 rounded-full bg-green-50 text-green-600 text-xs font-medium"
                                                            }
                                                        >
                                                            {isLowStock
                                                                ? "Low Stock"
                                                                : "In Stock"}
                                                        </span>

                                                    </td>

                                                    {/* Action */}

                                                    <td className="px-5 py-4">

                                                        <div className="flex justify-end">

                                                            <button
                                                                title="Adjust stock"
                                                                onClick={() =>
                                                                    openStockModal(
                                                                        product
                                                                    )
                                                                }
                                                                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                                                            >
                                                                <PackagePlus
                                                                    size={
                                                                        17
                                                                    }
                                                                />

                                                                Adjust
                                                            </button>

                                                        </div>

                                                    </td>

                                                </tr>
                                            );
                                        }
                                    )

                                ) : (

                                    <tr>

                                        <td
                                            colSpan="7"
                                            className="px-5 py-10 text-center text-slate-400"
                                        >
                                            {search
                                                ? "No products found."
                                                : "No products available."}
                                        </td>

                                    </tr>

                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

            {/* ================= STOCK MODAL ================= */}

            {stockProduct && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

                    <div className="bg-white w-full max-w-md rounded-2xl shadow-xl">

                        {/* Header */}

                        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">

                            <div>

                                <h2 className="text-xl font-semibold text-slate-900">
                                    Adjust Stock
                                </h2>

                                <p className="text-sm text-slate-500 mt-1">
                                    Update product inventory
                                </p>

                            </div>

                            <button
                                type="button"
                                onClick={closeStockModal}
                                disabled={stockLoading}
                                className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 disabled:opacity-50"
                            >
                                <X size={20} />
                            </button>

                        </div>

                        {/* Form */}

                        <form
                            onSubmit={handleStockAdjust}
                            className="p-6 space-y-5"
                        >

                            {/* Product */}

                            <div>

                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Product
                                </label>

                                <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg">

                                    <p className="font-medium text-slate-900">
                                        {stockProduct.name}
                                    </p>

                                    <p className="text-xs text-slate-500 mt-1">
                                        Code:{" "}
                                        {
                                            stockProduct.product_code
                                        }
                                    </p>

                                    <p className="text-xs text-slate-500 mt-1">
                                        Current Stock:{" "}
                                        <span className="font-medium text-slate-700">
                                            {
                                                stockProduct.current_stock
                                            }
                                        </span>
                                    </p>

                                </div>

                            </div>

                            {/* Error */}

                            {stockError && (

                                <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 text-sm">
                                    {stockError}
                                </div>

                            )}

                            {/* Stock Type */}

                            <div>

                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Stock Type
                                </label>

                                <div className="grid grid-cols-2 gap-3">

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setStockType("IN")
                                        }
                                        className={
                                            stockType === "IN"
                                                ? "px-4 py-3 rounded-lg border-2 border-green-500 bg-green-50 text-green-700 font-medium"
                                                : "px-4 py-3 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50"
                                        }
                                    >
                                        + Stock IN
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setStockType("OUT")
                                        }
                                        className={
                                            stockType === "OUT"
                                                ? "px-4 py-3 rounded-lg border-2 border-red-500 bg-red-50 text-red-700 font-medium"
                                                : "px-4 py-3 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50"
                                        }
                                    >
                                        - Stock OUT
                                    </button>

                                </div>

                            </div>

                            {/* Quantity */}

                            <div>

                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Quantity *
                                </label>

                                <input
                                    type="number"
                                    min="1"
                                    value={stockQuantity}
                                    onChange={(e) =>
                                        setStockQuantity(
                                            e.target.value
                                        )
                                    }
                                    required
                                    placeholder="Enter quantity"
                                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                />

                            </div>

                            {/* Reason */}

                            <div>

                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Reason
                                </label>

                                <input
                                    type="text"
                                    value={stockReason}
                                    onChange={(e) =>
                                        setStockReason(
                                            e.target.value
                                        )
                                    }
                                    placeholder={
                                        stockType === "IN"
                                            ? "e.g. New stock received"
                                            : "e.g. Damaged / manual adjustment"
                                    }
                                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                />

                            </div>

                            {/* Buttons */}

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">

                                <button
                                    type="button"
                                    onClick={closeStockModal}
                                    disabled={stockLoading}
                                    className="px-5 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={stockLoading}
                                    className={
                                        stockType === "IN"
                                            ? "px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition disabled:opacity-50"
                                            : "px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition disabled:opacity-50"
                                    }
                                >
                                    {stockLoading
                                        ? "Updating..."
                                        : "Update Stock"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
}

export default Stock;