import { ArrowUpRight } from "lucide-react";

function StatCard({
    title,
    value,
    icon: Icon,
    description,
}) {
    return (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition">
            <div className="flex items-start justify-between">
                
                {/* Icon */}
                <div className="w-11 h-11 rounded-lg bg-slate-100 flex items-center justify-center">
                    <Icon size={22} className="text-slate-700" />
                </div>

                {/* Arrow */}
                <ArrowUpRight
                    size={18}
                    className="text-slate-400"
                />
            </div>

            {/* Title */}
            <p className="text-sm text-slate-500 mt-4">
                {title}
            </p>

            {/* Value */}
            <h2 className="text-2xl font-bold text-slate-900 mt-1">
                {value}
            </h2>

            {/* Description */}
            {description && (
                <p className="text-xs text-slate-400 mt-2">
                    {description}
                </p>
            )}
        </div>
    );
}

export default StatCard;