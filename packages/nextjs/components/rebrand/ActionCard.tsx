import React from "react";
import Link from "next/link";

interface ActionCardProps {
  title: string;
  description: string;
  action: string;
  href: string;
  icon: string;
  variant?: "primary" | "secondary";
}

export function ActionCard({ title, description, action, href, icon, variant = "primary" }: ActionCardProps) {
  return (
    <div className="card group cursor-pointer">
      <Link href={href} className="block">
        <div className="text-center">
          <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform">{icon}</div>
          <h3 className="text-xl font-bold mb-2">{title}</h3>
          <p className="text-gray-600 mb-4">{description}</p>
          <button className={`btn-${variant} w-full`}>{action}</button>
        </div>
      </Link>
    </div>
  );
}
