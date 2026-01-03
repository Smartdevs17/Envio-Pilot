import React from "react";

interface StatsCardProps {
  icon: string;
  label: string;
  value: string;
  trend?: string;
  trendDirection?: "up" | "down";
}

export function StatsCard({ icon, label, value, trend, trendDirection }: StatsCardProps) {
  return (
    <div className="card">
      <div className="flex items-center gap-4">
        <div className="text-4xl">{icon}</div>
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold">{value}</p>
            {trend && (
              <span className={`text-sm font-medium ${trendDirection === "up" ? "text-success" : "text-error"}`}>
                {trendDirection === "up" ? "↑" : "↓"} {trend}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
