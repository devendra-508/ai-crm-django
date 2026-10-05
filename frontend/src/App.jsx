import { useState } from "react";

import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";

import api from "./api";

// Components
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";

// Pages
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Products from "./pages/Products";
import Stock from "./pages/Stock";
import Purchases from "./pages/Purchases";
import Reports from "./pages/Reports";
import AIInsights from "./pages/AIInsights";

function App() {
    // =========================
    // LOGIN STATE
    // =========================

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [user, setUser] = useState(() => {
        const savedUser =
            localStorage.getItem("user");

        return savedUser
            ? JSON.parse(savedUser)
            : null;
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // =========================
    // LOGIN
    // =========================

    const handleLogin = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await api.post(
                "/auth/login/",
                {
                    username,
                    password,
                }
            );

            // Save access token
            localStorage.setItem(
                "access_token",
                response.data.access
            );

            // Save refresh token
            localStorage.setItem(
                "refresh_token",
                response.data.refresh
            );

            // Save user
            localStorage.setItem(
                "user",
                JSON.stringify(
                    response.data.user
                )
            );

            // Update React state
            setUser(response.data.user);

            // Clear form
            setUsername("");
            setPassword("");
        } catch (error) {
            console.error(
                "Login Error:",
                error.response?.data ||
                    error.message
            );

            setError(
                error.response?.data
                    ?.non_field_errors?.[0] ||
                    error.response?.data?.detail ||
                    "Invalid username or password"
            );
        } finally {
            setLoading(false);
        }
    };

    // =========================
    // LOGOUT
    // =========================

    const handleLogout = () => {
        localStorage.removeItem(
            "access_token"
        );

        localStorage.removeItem(
            "refresh_token"
        );

        localStorage.removeItem("user");

        setUser(null);
        setUsername("");
        setPassword("");
    };

    // =========================
    // LOGIN PAGE
    // =========================

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">

                <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">

                    {/* Logo / Title */}

                    <div className="text-center mb-8">

                        <h1 className="text-3xl font-bold text-slate-900">
                            AI CRM
                        </h1>

                        <p className="text-slate-500 mt-2">
                            Sign in to your dashboard
                        </p>

                    </div>

                    {/* Login Form */}

                    <form onSubmit={handleLogin}>

                        {/* Username */}

                        <div className="mb-5">

                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Username
                            </label>

                            <input
                                type="text"
                                value={username}
                                onChange={(e) =>
                                    setUsername(
                                        e.target.value
                                    )
                                }
                                placeholder="Enter username"
                                required
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                            />

                        </div>

                        {/* Password */}

                        <div className="mb-6">

                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Password
                            </label>

                            <input
                                type="password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(
                                        e.target.value
                                    )
                                }
                                placeholder="Enter password"
                                required
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                            />

                        </div>

                        {/* Login Button */}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition"
                        >
                            {loading
                                ? "Signing in..."
                                : "Sign In"}
                        </button>

                    </form>

                    {/* Error */}

                    {error && (
                        <p className="text-red-600 text-sm text-center mt-4">
                            {error}
                        </p>
                    )}

                </div>

            </div>
        );
    }

    // =========================
    // CRM APPLICATION
    // =========================

    return (
        <BrowserRouter>

            <div className="min-h-screen bg-slate-100 flex">

                {/* =========================
                    SIDEBAR
                ========================= */}

                <Sidebar
                    onLogout={handleLogout}
                />

                {/* =========================
                    MAIN AREA
                ========================= */}

                <div className="flex-1 min-w-0">

                    {/* Navbar */}

                    <Navbar user={user} />

                    {/* Page Content */}

                    <main className="p-6">

                        <Routes>

                            {/* Dashboard */}

                            <Route
                                path="/dashboard"
                                element={
                                    <Dashboard />
                                }
                            />

                            {/* Customers */}

                            <Route
                                path="/customers"
                                element={
                                    <Customers />
                                }
                            />

                            {/* Products */}

                            <Route
                                path="/products"
                                element={
                                    <Products />
                                }
                            />

                            {/* Stock */}

                            <Route
                                path="/stock"
                                element={
                                    <Stock />
                                }
                            />

                            {/* Purchases */}

                            <Route
                                path="/purchases"
                                element={
                                    <Purchases />
                                }
                            />

                            {/* Reports */}

                            <Route
                                path="/reports"
                                element={
                                    <Reports />
                                }
                            />

                            {/* AI Insights */}

                            <Route
                                path="/ai-insights"
                                element={
                                    <AIInsights />
                                }
                            />

                            {/* Unknown Route */}

                            <Route
                                path="*"
                                element={
                                    <Navigate
                                        to="/dashboard"
                                        replace
                                    />
                                }
                            />

                        </Routes>

                    </main>

                </div>

            </div>

        </BrowserRouter>
    );
}

export default App;