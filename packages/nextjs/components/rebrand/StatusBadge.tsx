import React from "react";

type Status = "success" | "pending" | "failed";

interface StatusBadgeProps {
  status: Status;
}

const STATUS_CONFIG = {
  success: {
    label: "✅ Complete",
    className: "badge-success",
  },
  pending: {
    label: "⏳ Pending",
    className: "badge-warning",
  },
  failed: {
    label: "❌ Failed",
    className: "badge-error",
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return <span className={config.className}>{config.label}</span>;
}
