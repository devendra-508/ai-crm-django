import { useEffect, useState } from "react";
import {
    Sparkles,
    TrendingUp,
    Package,
    Lightbulb,
    RefreshCw,
    AlertCircle,
} from "lucide-react";

import api from "../api";

function AIInsights() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // =========================
    // FETCH AI INSIGHTS
    // =========================

    const fetchInsights = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                "/ai-insights/"
            );

            setData(response.data);
        } catch (err) {
            console.error(
                "AI Insights Error:",
                err
            );

            setError(
                err.response?.data?.error ||
                "Failed to generate AI insights."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInsights();
    }, []);

    // =========================
    // LOADING
    // =========================

    if (loading) {
        return (
            <div className="min-h-[500px] flex flex-col items-center justify-center">

                <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4">

                    <Sparkles
                        size={26}
                        className="animate-pulse"
                    />

                </div>

                <h2 className="text-lg font-semibold text-slate-800">
                    Generating AI Insights...
                </h2>

                <p className="text-sm text-slate-500 mt-2">
                    Analyzing your CRM data
                </p>

            </div>
        );
    }

    // =========================
    // ERROR
    // =========================

    if (error) {
        return (
            <div className="space-y-6">

                <div>

                    <h1 className="text-2xl font-bold text-slate-900">
                        AI Insights
                    </h1>

                    <p className="text-sm text-slate-500 mt-1">
                        AI-powered analysis of your CRM data
                    </p>

                </div>

                <div className="bg-red-50 border border-red-200 rounded-xl p-5">

                    <div className="flex items-start gap-3">

                        <AlertCircle
                            size={21}
                            className="text-red-600 mt-0.5"
                        />

                        <div>

                            <h3 className="font-semibold text-red-700">
                                Unable to generate insights
                            </h3>

                            <p className="text-sm text-red-600 mt-1">
                                {error}
                            </p>

                        </div>

                    </div>

                    <button
                        onClick={fetchInsights}
                        className="mt-4 flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                    >
                        <RefreshCw size={16} />
                        Try Again
                    </button>

                </div>

            </div>
        );
    }

    const insights = data?.ai_insights;

    if (!insights) {
        return (
            <div className="text-center py-10 text-slate-500">
                No AI insights available.
            </div>
        );
    }

    return (
        <div className="space-y-6">

            {/* ================= HEADER ================= */}

            <div className="flex items-center justify-between">

                <div>

                    <div className="flex items-center gap-2">

                        <Sparkles
                            size={24}
                            className="text-blue-600"
                        />

                        <h1 className="text-2xl font-bold text-slate-900">
                            AI Insights
                        </h1>

                    </div>

                    <p className="text-sm text-slate-500 mt-1">
                        AI-powered analysis of your CRM data
                    </p>

                </div>

                <button
                    onClick={fetchInsights}
                    className="flex items-center gap-2 px-4 py-2.5 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-lg transition"
                >
                    <RefreshCw size={17} />
                    Refresh Insights
                </button>

            </div>

            {/* ================= CRM SUMMARY ================= */}

            {data?.crm_data && (

                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">

                    <h2 className="font-semibold text-slate-900 mb-4">
                        CRM Data Summary
                    </h2>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">

                        <div className="bg-blue-50 rounded-lg p-4">
                            <p className="text-xs text-blue-600">
                                Customers
                            </p>

                            <p className="text-xl font-bold text-slate-900 mt-1">
                                {
                                    data.crm_data
                                        .total_customers
                                }
                            </p>
                        </div>

                        <div className="bg-purple-50 rounded-lg p-4">
                            <p className="text-xs text-purple-600">
                                Products
                            </p>

                            <p className="text-xl font-bold text-slate-900 mt-1">
                                {
                                    data.crm_data
                                        .total_products
                                }
                            </p>
                        </div>

                        <div className="bg-green-50 rounded-lg p-4">
                            <p className="text-xs text-green-600">
                                Purchases
                            </p>

                            <p className="text-xl font-bold text-slate-900 mt-1">
                                {
                                    data.crm_data
                                        .total_purchases
                                }
                            </p>
                        </div>

                        <div className="bg-yellow-50 rounded-lg p-4">
                            <p className="text-xs text-yellow-700">
                                Revenue
                            </p>

                            <p className="text-xl font-bold text-slate-900 mt-1">
                                ₹
                                {
                                    data.crm_data
                                        .total_revenue
                                }
                            </p>
                        </div>

                        <div className="bg-red-50 rounded-lg p-4">
                            <p className="text-xs text-red-600">
                                Low Stock
                            </p>

                            <p className="text-xl font-bold text-slate-900 mt-1">
                                {
                                    data.crm_data
                                        .low_stock_products
                                        ?.length || 0
                                }
                            </p>
                        </div>

                    </div>

                </div>
            )}

            {/* ================= BUSINESS SUMMARY ================= */}

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">

                <div className="flex items-center gap-3 mb-4">

                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">

                        <Sparkles size={20} />

                    </div>

                    <div>

                        <h2 className="font-semibold text-slate-900">
                            Business Summary
                        </h2>

                        <p className="text-xs text-slate-500">
                            AI-generated overview
                        </p>

                    </div>

                </div>

                <p className="text-sm leading-7 text-slate-600">
                    {insights.summary}
                </p>

            </div>

            {/* ================= SALES + INVENTORY ================= */}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Sales */}

                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">

                    <div className="flex items-center gap-3 mb-4">

                        <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">

                            <TrendingUp size={20} />

                        </div>

                        <div>

                            <h2 className="font-semibold text-slate-900">
                                Sales Insights
                            </h2>

                            <p className="text-xs text-slate-500">
                                AI sales analysis
                            </p>

                        </div>

                    </div>

                    <p className="text-sm leading-7 text-slate-600">
                        {insights.sales_insights}
                    </p>

                </div>

                {/* Inventory */}

                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">

                    <div className="flex items-center gap-3 mb-4">

                        <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">

                            <Package size={20} />

                        </div>

                        <div>

                            <h2 className="font-semibold text-slate-900">
                                Inventory Insights
                            </h2>

                            <p className="text-xs text-slate-500">
                                AI inventory analysis
                            </p>

                        </div>

                    </div>

                    <p className="text-sm leading-7 text-slate-600">
                        {insights.inventory_insights}
                    </p>

                </div>

            </div>

            {/* ================= RECOMMENDATIONS ================= */}

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">

                <div className="flex items-center gap-3 mb-5">

                    <div className="w-10 h-10 rounded-lg bg-yellow-50 text-yellow-600 flex items-center justify-center">

                        <Lightbulb size={20} />

                    </div>

                    <div>

                        <h2 className="font-semibold text-slate-900">
                            AI Recommendations
                        </h2>

                        <p className="text-xs text-slate-500">
                            Suggestions based on CRM data
                        </p>

                    </div>

                </div>

                <div className="space-y-3">

                    {Array.isArray(
                        insights.recommendations
                    ) &&
                        insights.recommendations.map(
                            (recommendation, index) => (

                                <div
                                    key={index}
                                    className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-100 rounded-lg"
                                >

                                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold shrink-0">
                                        {index + 1}
                                    </div>

                                    <p className="text-sm text-slate-600 leading-6">
                                        {recommendation}
                                    </p>

                                </div>

                            )
                        )}

                </div>

            </div>

        </div>
    );
}

export default AIInsights;