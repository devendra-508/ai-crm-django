import {
    LayoutDashboard,
    Users,
    Package,
    Boxes,
    ShoppingCart,
    BarChart3,
    Sparkles,
    LogOut,
} from "lucide-react";

import { NavLink } from "react-router-dom";

const menuItems = [
    {
        name: "Dashboard",
        path: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        name: "Customers",
        path: "/customers",
        icon: Users,
    },
    {
        name: "Products",
        path: "/products",
        icon: Package,
    },
    {
        name: "Stock",
        path: "/stock",
        icon: Boxes,
    },
    {
        name: "Purchases",
        path: "/purchases",
        icon: ShoppingCart,
    },
    {
        name: "Reports",
        path: "/reports",
        icon: BarChart3,
    },
    {
        name: "AI Insights",
        path: "/ai-insights",
        icon: Sparkles,
    },
];

function Sidebar({ onLogout }) {
    return (
        <aside className="w-64 min-h-screen bg-slate-900 text-white flex flex-col">

            {/* Logo */}
            <div className="h-16 flex items-center px-6 border-b border-slate-700">
                <div>
                    <h1 className="text-xl font-bold">
                        AI CRM
                    </h1>

                    <p className="text-xs text-slate-400">
                        Business Management
                    </p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4">

                <p className="text-xs uppercase tracking-wider text-slate-500 px-3 mb-3">
                    Main Menu
                </p>

                <div className="space-y-1">

                    {menuItems.map((item) => {
                        const Icon = item.icon;

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `w-full flex items-center gap-3 px-3 py-3 rounded-lg transition ${
                                        isActive
                                            ? "bg-blue-600 text-white"
                                            : "text-slate-300 hover:bg-slate-800 hover:text-white"
                                    }`
                                }
                            >
                                <Icon size={19} />

                                <span className="text-sm font-medium">
                                    {item.name}
                                </span>
                            </NavLink>
                        );
                    })}

                </div>
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-slate-700">

                <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-slate-300 hover:bg-red-500/10 hover:text-red-400 transition"
                >
                    <LogOut size={19} />

                    <span className="text-sm font-medium">
                        Logout
                    </span>
                </button>

            </div>
        </aside>
    );
}

export default Sidebar;