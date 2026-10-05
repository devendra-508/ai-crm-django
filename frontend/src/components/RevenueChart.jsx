import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";

function RevenueChart({ data = [] }) {
    return (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            
            {/* Header */}
            <div className="mb-5">
                <h2 className="text-lg font-semibold text-slate-900">
                    Revenue Overview
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                    Revenue generated from purchases
                </p>
            </div>

            {/* Chart */}
            <div className="w-full h-80">
                {data.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-sm text-slate-400">
                        No revenue data available
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />

                            <XAxis dataKey="date" />

                            <YAxis />

                            <Tooltip
                                formatter={(value) => [
                                    `₹${value}`,
                                    "Revenue",
                                ]}
                            />

                            <Area
                                type="monotone"
                                dataKey="revenue"
                                stroke="#0f172a"
                                fill="#e2e8f0"
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}

export default RevenueChart;