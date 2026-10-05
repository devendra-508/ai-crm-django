import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";

function SalesChart({ data = [] }) {
    return (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">

            {/* Header */}
            <div className="mb-5">
                <h2 className="text-lg font-semibold text-slate-900">
                    Product Sales
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                    Units sold by product
                </p>
            </div>

            {/* Chart */}
            <div className="w-full h-80">
                {data.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-sm text-slate-400">
                        No sales data available
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />

                            <XAxis
                                dataKey="product"
                                tick={{ fontSize: 12 }}
                            />

                            <YAxis />

                            <Tooltip
                                formatter={(value) => [
                                    value,
                                    "Units Sold",
                                ]}
                            />

                            <Bar
                                dataKey="quantity"
                                fill="#0f172a"
                                radius={[6, 6, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}

export default SalesChart;