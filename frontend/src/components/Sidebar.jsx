
import {
  LayoutDashboard,
  Users,
  Package,
  Boxes,
  ShoppingCart,
  BarChart3,
  Sparkles,
  LogOut,
  X,
} from "lucide-react";

import { NavLink } from "react-router-dom";

const menuItems = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Customers", path: "/customers", icon: Users },
  { name: "Products", path: "/products", icon: Package },
  { name: "Stock", path: "/stock", icon: Boxes },
  { name: "Purchases", path: "/purchases", icon: ShoppingCart },
  { name: "Reports", path: "/reports", icon: BarChart3 },
  { name: "AI Insights", path: "/ai-insights", icon: Sparkles },
];

function Sidebar({ onLogout, onNavigate, onClose }) {
  return (
    <aside className="flex h-full min-h-screen w-full flex-col
      overflow-y-auto bg-slate-900 text-white">

      {/* Logo */}
      <div className="flex min-h-16 items-center justify-between
        border-b border-slate-700 px-5 sm:px-6">

        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight">
            AI CRM
          </h1>
          <p className="text-xs text-slate-400">
            Business Management
          </p>
        </div>

        {/* Close button on mobile */}
        <button
          type="button"
          onClick={onClose || onNavigate}
          aria-label="Close navigation"
          className="rounded-lg p-2 text-slate-300
            hover:bg-slate-800 hover:text-white md:hidden"
        >
          <X size={22} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 sm:p-4">
        <p className="mb-3 px-3 text-xs font-semibold
          uppercase tracking-wider text-slate-500">
          Main Menu
        </p>

        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `flex w-full min-w-0 items-center gap-3
                  rounded-lg px-3 py-3 transition-colors
                  ${
                    isActive
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`
                }
              >
                <Icon size={20} className="shrink-0" />

                <span className="truncate text-sm font-medium">
                  {item.name}
                </span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Logout */}
      <div className="mt-auto border-t border-slate-700 p-3 sm:p-4">
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-lg
            px-3 py-3 text-slate-300 transition-colors
            hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut size={20} className="shrink-0" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
