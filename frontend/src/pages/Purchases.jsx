import { useEffect, useState } from "react";
import {
    Search,
    Plus,
    X,
    ShoppingCart,
} from "lucide-react";

import api from "../api";

function Purchases() {
    const [purchases, setPurchases] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");

    // Purchase modal
    const [showForm, setShowForm] = useState(false);

    const [formData, setFormData] = useState({
        customer: "",
        product: "",
        quantity: "1",
    });

    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState("");

    // =========================
    // FETCH PURCHASES
    // =========================

    const fetchPurchases = async () => {
        try {
            const response = await api.get("/purchases/");

            setPurchases(response.data);
        } catch (err) {
            console.error(
                "Purchases Error:",
                err
            );

            setError("Failed to load purchases.");
        }
    };

    // =========================
    // FETCH CUSTOMERS
    // =========================

    const fetchCustomers = async () => {
        try {
            const response = await api.get("/customers/");

            setCustomers(response.data);
        } catch (err) {
            console.error(
                "Customers Error:",
                err
            );

            setError("Failed to load customers.");
        }
    };

    // =========================
    // FETCH PRODUCTS
    // =========================

    const fetchProducts = async () => {
        try {
            const response = await api.get("/products/");

            setProducts(response.data);
        } catch (err) {
            console.error(
                "Products Error:",
                err
            );

            setError("Failed to load products.");
        }
    };

    // =========================
    // LOAD ALL DATA
    // =========================

    const fetchData = async () => {
        try {
            setLoading(true);
            setError("");

            await Promise.all([
                fetchPurchases(),
                fetchCustomers(),
                fetchProducts(),
            ]);
        } catch (err) {
            console.error(
                "Purchase Page Error:",
                err
            );

            setError(
                "Failed to load purchase data."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // =========================
    // OPEN FORM
    // =========================

    const openAddForm = () => {
        setFormData({
            customer: "",
            product: "",
            quantity: "1",
        });

        setFormError("");
        setShowForm(true);
    };

    // =========================
    // CLOSE FORM
    // =========================

    const closeForm = () => {
        if (formLoading) return;

        setShowForm(false);

        setFormData({
            customer: "",
            product: "",
            quantity: "1",
        });

        setFormError("");
    };

    // =========================
    // HANDLE INPUT
    // =========================

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // =========================
    // SELECTED PRODUCT
    // =========================

    const selectedProduct = products.find(
        (product) =>
            String(product.id) ===
            String(formData.product)
    );

    // =========================
    // PURCHASE CALCULATION
    // =========================

    const quantity =
        Number(formData.quantity) || 0;

    const unitPrice = selectedProduct
        ? Number(selectedProduct.mrp)
        : 0;

    const totalAmount =
        quantity * unitPrice;

    // =========================
    // CREATE PURCHASE
    // =========================

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setFormLoading(true);
            setFormError("");

            if (!formData.customer) {
                setFormError(
                    "Please select a customer."
                );
                return;
            }

            if (!formData.product) {
                setFormError(
                    "Please select a product."
                );
                return;
            }

            if (quantity <= 0) {
                setFormError(
                    "Quantity must be greater than 0."
                );
                return;
            }

            if (
                selectedProduct &&
                quantity >
                    selectedProduct.current_stock
            ) {
                setFormError(
                    `Only ${selectedProduct.current_stock} units are available in stock.`
                );
                return;
            }

            await api.post("/purchases/", {
                customer: Number(formData.customer),
                product: Number(formData.product),
                quantity: quantity,
            });

            await fetchData();

            closeForm();
        } catch (err) {
            console.error(
                "Create Purchase Error:",
                err
            );

            const backendError =
                err.response?.data;

            if (backendError) {
                if (
                    typeof backendError ===
                    "object"
                ) {
                    const messages =
                        Object.entries(
                            backendError
                        ).map(
                            ([field, message]) => {
                                return `${field}: ${
                                    Array.isArray(
                                        message
                                    )
                                        ? message.join(
                                              ", "
                                          )
                                        : message
                                }`;
                            }
                        );

                    setFormError(
                        messages.join(" | ")
                    );
                } else {
                    setFormError(
                        String(backendError)
                    );
                }
            } else {
                setFormError(
                    "Failed to create purchase."
                );
            }
        } finally {
            setFormLoading(false);
        }
    };

    // =========================
    // SEARCH
    // =========================

    const filteredPurchases =
        purchases.filter((purchase) => {
            const customer =
                customers.find(
                    (item) =>
                        Number(item.id) ===
                        Number(
                            purchase.customer
                        )
                );

            const product =
                products.find(
                    (item) =>
                        Number(item.id) ===
                        Number(
                            purchase.product
                        )
                );

            const customerName =
                customer?.name ||
                purchase.customer_name ||
                "";

            const productName =
                product?.name ||
                purchase.product_name ||
                "";

            const text = `
                ${customerName}
                ${productName}
                ${purchase.quantity || ""}
                ${purchase.total_amount || ""}
            `.toLowerCase();

            return text.includes(
                search.toLowerCase()
            );
        });

    return (
        <div className="space-y-6">

            {/* ================= HEADER ================= */}

            <div className="flex items-center justify-between">

                <div>

                    <h1 className="text-2xl font-bold text-slate-900">
                        Purchases
                    </h1>

                    <p className="text-sm text-slate-500 mt-1">
                        Manage customer purchases and sales
                    </p>

                </div>

                <button
                    onClick={openAddForm}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                >
                    <Plus size={18} />
                    New Purchase
                </button>

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
                        placeholder="Search purchases..."
                        value={search}
                        onChange={(e) =>
                            setSearch(
                                e.target.value
                            )
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

            {/* ================= TABLE ================= */}

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">

                {loading ? (

                    <div className="p-8 text-center text-slate-500">
                        Loading purchases...
                    </div>

                ) : (

                    <div className="overflow-x-auto">

                        <table className="w-full text-sm">

                            <thead>

                                <tr className="border-b border-slate-200 bg-slate-50">

                                    <th className="px-5 py-4 text-left">
                                        Customer
                                    </th>

                                    <th className="px-5 py-4 text-left">
                                        Product
                                    </th>

                                    <th className="px-5 py-4 text-center">
                                        Quantity
                                    </th>

                                    <th className="px-5 py-4 text-right">
                                        Unit Price
                                    </th>

                                    <th className="px-5 py-4 text-right">
                                        Total
                                    </th>

                                    <th className="px-5 py-4 text-left">
                                        Date
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {filteredPurchases.length >
                                0 ? (

                                    filteredPurchases.map(
                                        (purchase) => {

                                            const customer =
                                                customers.find(
                                                    (item) =>
                                                        Number(
                                                            item.id
                                                        ) ===
                                                        Number(
                                                            purchase.customer
                                                        )
                                                );

                                            const product =
                                                products.find(
                                                    (item) =>
                                                        Number(
                                                            item.id
                                                        ) ===
                                                        Number(
                                                            purchase.product
                                                        )
                                                );

                                            const customerName =
                                                customer?.name ||
                                                purchase.customer_name ||
                                                `Customer #${purchase.customer}`;

                                            const productName =
                                                product?.name ||
                                                purchase.product_name ||
                                                `Product #${purchase.product}`;

                                            return (
                                                <tr
                                                    key={
                                                        purchase.id
                                                    }
                                                    className="border-b border-slate-100 hover:bg-slate-50"
                                                >

                                                    {/* Customer */}

                                                    <td className="px-5 py-4">

                                                        <div className="flex items-center gap-3">

                                                            <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-medium">
                                                                {customerName
                                                                    .charAt(
                                                                        0
                                                                    )
                                                                    .toUpperCase()}
                                                            </div>

                                                            <div>

                                                                <p className="font-medium text-slate-900">
                                                                    {
                                                                        customerName
                                                                    }
                                                                </p>

                                                            </div>

                                                        </div>

                                                    </td>

                                                    {/* Product */}

                                                    <td className="px-5 py-4">

                                                        <p className="font-medium text-slate-800">
                                                            {
                                                                productName
                                                            }
                                                        </p>

                                                        {product?.product_code && (
                                                            <p className="text-xs text-slate-400 mt-1">
                                                                {
                                                                    product.product_code
                                                                }
                                                            </p>
                                                        )}

                                                    </td>

                                                    {/* Quantity */}

                                                    <td className="px-5 py-4 text-center">

                                                        <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
                                                            {
                                                                purchase.quantity
                                                            }
                                                        </span>

                                                    </td>

                                                    {/* Unit Price */}

                                                    <td className="px-5 py-4 text-right text-slate-600">

                                                        ₹
                                                        {
                                                            purchase.unit_price
                                                        }

                                                    </td>

                                                    {/* Total */}

                                                    <td className="px-5 py-4 text-right font-semibold text-slate-900">

                                                        ₹
                                                        {
                                                            purchase.total_amount
                                                        }

                                                    </td>

                                                    {/* Date */}

                                                    <td className="px-5 py-4 text-slate-500">

                                                        {purchase.created_at
                                                            ? new Date(
                                                                  purchase.created_at
                                                              ).toLocaleDateString(
                                                                  "en-IN",
                                                                  {
                                                                      day: "2-digit",
                                                                      month: "short",
                                                                      year: "numeric",
                                                                  }
                                                              )
                                                            : "-"}

                                                    </td>

                                                </tr>
                                            );
                                        }
                                    )

                                ) : (

                                    <tr>

                                        <td
                                            colSpan="6"
                                            className="px-5 py-10 text-center text-slate-400"
                                        >
                                            {search
                                                ? "No purchases found."
                                                : "No purchases available."}
                                        </td>

                                    </tr>

                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

            {/* ================= NEW PURCHASE MODAL ================= */}

            {showForm && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

                    <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl">

                        {/* Header */}

                        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">

                            <div className="flex items-center gap-3">

                                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">

                                    <ShoppingCart
                                        size={20}
                                    />

                                </div>

                                <div>

                                    <h2 className="text-xl font-semibold text-slate-900">
                                        New Purchase
                                    </h2>

                                    <p className="text-sm text-slate-500 mt-1">
                                        Create a customer purchase
                                    </p>

                                </div>

                            </div>

                            <button
                                type="button"
                                onClick={closeForm}
                                disabled={
                                    formLoading
                                }
                                className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 disabled:opacity-50"
                            >
                                <X size={20} />
                            </button>

                        </div>

                        {/* Form */}

                        <form
                            onSubmit={handleSubmit}
                            className="p-6 space-y-5"
                        >

                            {/* Form Error */}

                            {formError && (

                                <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 text-sm">
                                    {formError}
                                </div>

                            )}

                            {/* Customer */}

                            <div>

                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Customer *
                                </label>

                                <select
                                    name="customer"
                                    value={
                                        formData.customer
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500"
                                >

                                    <option value="">
                                        Select customer
                                    </option>

                                    {customers.map(
                                        (customer) => (

                                            <option
                                                key={
                                                    customer.id
                                                }
                                                value={
                                                    customer.id
                                                }
                                            >
                                                {
                                                    customer.name
                                                }{" "}
                                                -{" "}
                                                {
                                                    customer.phone
                                                }
                                            </option>

                                        )
                                    )}

                                </select>

                            </div>

                            {/* Product */}

                            <div>

                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Product *
                                </label>

                                <select
                                    name="product"
                                    value={
                                        formData.product
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500"
                                >

                                    <option value="">
                                        Select product
                                    </option>

                                    {products.map(
                                        (product) => (

                                            <option
                                                key={
                                                    product.id
                                                }
                                                value={
                                                    product.id
                                                }
                                            >
                                                {
                                                    product.name
                                                }{" "}
                                                — Stock:{" "}
                                                {
                                                    product.current_stock
                                                }
                                            </option>

                                        )
                                    )}

                                </select>

                            </div>

                            {/* Selected Product Info */}

                            {selectedProduct && (

                                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">

                                    <div className="grid grid-cols-2 gap-4">

                                        <div>

                                            <p className="text-xs text-slate-500">
                                                Available Stock
                                            </p>

                                            <p className="font-semibold text-slate-800 mt-1">
                                                {
                                                    selectedProduct.current_stock
                                                }
                                            </p>

                                        </div>

                                        <div>

                                            <p className="text-xs text-slate-500">
                                                MRP / Unit Price
                                            </p>

                                            <p className="font-semibold text-slate-800 mt-1">
                                                ₹
                                                {
                                                    selectedProduct.mrp
                                                }
                                            </p>

                                        </div>

                                    </div>

                                </div>

                            )}

                            {/* Quantity */}

                            <div>

                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Quantity *
                                </label>

                                <input
                                    type="number"
                                    name="quantity"
                                    value={
                                        formData.quantity
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    min="1"
                                    required
                                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                />

                            </div>

                            {/* Total */}

                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">

                                <div className="flex items-center justify-between">

                                    <span className="text-sm text-slate-600">
                                        Total Amount
                                    </span>

                                    <span className="text-xl font-bold text-blue-700">
                                        ₹
                                        {totalAmount.toFixed(
                                            2
                                        )}
                                    </span>

                                </div>

                            </div>

                            {/* Buttons */}

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">

                                <button
                                    type="button"
                                    onClick={
                                        closeForm
                                    }
                                    disabled={
                                        formLoading
                                    }
                                    className="px-5 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={
                                        formLoading
                                    }
                                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50"
                                >
                                    {formLoading
                                        ? "Creating..."
                                        : "Create Purchase"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
}

export default Purchases;