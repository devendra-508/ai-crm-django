import { useEffect, useState } from "react";
import { Users, Package, ShoppingCart, IndianRupee, Boxes } from "lucide-react";

import api from "../api";

import StatCard from "../components/StatCard";
import RevenueChart from "../components/RevenueChart";
import SalesChart from "../components/SalesChart";

function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get("/dashboard/");

        console.log("Dashboard API:", response.data);

        setDashboard(response.data);
      } catch (err) {
        console.error(err);

        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <p className="text-slate-500">Loading dashboard...</p>
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>

        <p className="text-sm text-slate-500 mt-1">
          Overview of your CRM business activity
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-5">
        <StatCard
          title="Total Customers"
          value={dashboard?.total_customers ?? 0}
          description="Active customers"
          icon={Users}
        />

        <StatCard
          title="Total Products"
          value={dashboard?.total_products ?? 0}
          description="Products in inventory"
          icon={Package}
        />

        <StatCard
          title="Total Purchases"
          value={dashboard?.total_purchases ?? 0}
          description="Recorded purchases"
          icon={ShoppingCart}
        />

        <StatCard
          title="Total Revenue"
          value={`₹${dashboard?.total_revenue ?? 0}`}
          description="Total sales revenue"
          icon={IndianRupee}
        />

        <StatCard
          title="Low Stock"
          value={dashboard?.low_stock_products ?? 0}
          description="Products requiring attention"
          icon={Boxes}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <RevenueChart data={dashboard?.revenue_trend || []} />

        <SalesChart data={dashboard?.product_sales || []} />
      </div>

      {/* Recent Purchases */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="p-5 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">
            Recent Purchases
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Latest customer purchases
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left">
                <th className="px-5 py-3 font-medium text-slate-500">
                  Customer
                </th>

                <th className="px-5 py-3 font-medium text-slate-500">
                  Product
                </th>

                <th className="px-5 py-3 font-medium text-slate-500">
                  Quantity
                </th>

                <th className="px-5 py-3 font-medium text-slate-500">Amount</th>
              </tr>
            </thead>

            <tbody>
              {dashboard?.recent_purchases?.length > 0 ? (
                dashboard.recent_purchases.map((purchase) => (
                  <tr
                    key={purchase.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                  >
                    <td className="px-5 py-4 text-slate-800">
                      {purchase.customer}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {purchase.product}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {purchase.quantity}
                    </td>

                    <td className="px-5 py-4 font-medium text-slate-800">
                      ₹{purchase.total_amount}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="px-5 py-8 text-center text-slate-400"
                  >
                    No purchases found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
