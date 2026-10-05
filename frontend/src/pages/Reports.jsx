import { useEffect, useState } from "react";
import {
    Users,
    Package,
    ShoppingCart,
    IndianRupee,
    Boxes,
    AlertTriangle,
} from "lucide-react";

import api from "../api";

function Reports() {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchReport = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                "/reports/summary/"
            );

            setReport(response.data);
        } catch (err) {
            console.error("Reports Error:", err);

            setError(
                "Failed to load report data."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <p className="text-slate-500">
                    Loading reports...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4">
                {error}
            </div>
        );
    }

    if (!report) {
        return (
            <div className="text-center text-slate-500 py-10">
                No report data available.
            </div>
        );
    }

    const stats = [
        {
            title: "Total Customers",
            value: report.total_customers,
            icon: Users,
            bg: "bg-blue-50",
            text: "text-blue-600",
        },
        {
            title: "Total Products",
            value: report.total_products,
            icon: Package,
            bg: "bg-purple-50",
            text: "text-purple-600",
        },
        {
            title: "Total Purchases",
            value: report.total_purchases,
            icon: ShoppingCart,
            bg: "bg-green-50",
            text: "text-green-600",
        },
        {
            title: "Total Revenue",
            value: `₹${Number(
                report.total_revenue || 0
            ).toFixed(2)}`,
            icon: IndianRupee,
            bg: "bg-yellow-50",
            text: "text-yellow-600",
        },
        {
            title: "Items Sold",
            value: report.total_items_sold,
            icon: Boxes,
            bg: "bg-indigo-50",
            text: "text-indigo-600",
        },
        {
            title: "Low Stock Products",
            value: report.low_stock_products,
            icon: AlertTriangle,
            bg: "bg-red-50",
            text: "text-red-600",
        },
    ];

    return (
        <div className="space-y-6">

            {/* Header */}

            <div>
                <h1 className="text-2xl font-bold text-slate-900">
                    Reports
                </h1>

                <p className="text-sm text-slate-500 mt-1">
                    Overview of your CRM business data
                </p>
            </div>

            {/* Statistics */}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

                {stats.map((stat) => {

                    const Icon = stat.icon;

                    return (
                        <div
                            key={stat.title}
                            className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm"
                        >

                            <div className="flex items-center justify-between">

                                <div>

                                    <p className="text-sm text-slate-500">
                                        {stat.title}
                                    </p>

                                    <h2 className="text-2xl font-bold text-slate-900 mt-2">
                                        {stat.value}
                                    </h2>

                                </div>

                                <div
                                    className={`w-11 h-11 rounded-lg ${stat.bg} ${stat.text} flex items-center justify-center`}
                                >
                                    <Icon size={21} />
                                </div>

                            </div>

                        </div>
                    );
                })}

            </div>

            {/* Low Stock Products */}

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">

                <div className="px-5 py-4 border-b border-slate-200">

                    <div className="flex items-center gap-2">

                        <AlertTriangle
                            size={19}
                            className="text-red-500"
                        />

                        <div>

                            <h2 className="font-semibold text-slate-900">
                                Low Stock Products
                            </h2>

                            <p className="text-xs text-slate-500 mt-1">
                                Products that need inventory attention
                            </p>

                        </div>

                    </div>

                </div>

                {report.low_stock_products_list?.length > 0 ? (

                    <div className="overflow-x-auto">

                        <table className="w-full text-sm">

                            <thead>

                                <tr className="bg-slate-50 border-b border-slate-200">

                                    <th className="px-5 py-4 text-left">
                                        Product
                                    </th>

                                    <th className="px-5 py-4 text-left">
                                        Code
                                    </th>

                                    <th className="px-5 py-4 text-center">
                                        Current Stock
                                    </th>

                                    <th className="px-5 py-4 text-center">
                                        Limit
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {report.low_stock_products_list.map(
                                    (product) => (
                                        <tr
                                            key={product.id}
                                            className="border-b border-slate-100 hover:bg-slate-50"
                                        >

                                            <td className="px-5 py-4 font-medium text-slate-900">
                                                {product.name}
                                            </td>

                                            <td className="px-5 py-4 text-slate-600">
                                                {product.product_code}
                                            </td>

                                            <td className="px-5 py-4 text-center">

                                                <span className="px-3 py-1 rounded-full bg-red-50 text-red-600 font-medium">
                                                    {product.current_stock}
                                                </span>

                                            </td>

                                            <td className="px-5 py-4 text-center text-slate-600">
                                                {product.low_stock_limit}
                                            </td>

                                        </tr>
                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                ) : (

                    <div className="p-8 text-center text-slate-500">
                        No low-stock products.
                    </div>

                )}

            </div>

        </div>
    );
}

export default Reports;