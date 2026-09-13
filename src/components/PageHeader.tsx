import React, { type ReactNode } from "react";

export default function PageHeader({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle?: ReactNode;
  icon?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="prem-page-header px-5 sm:px-8 py-6 sm:py-7">
      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          {icon && (
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-[#F3D879] shrink-0">
              {icon}
            </div>
          )}
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white leading-snug">{title}</h1>
            {subtitle && (
              <p className="text-emerald-100/80 text-xs sm:text-sm mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
        {children && (
          <div className="relative flex flex-wrap items-center gap-2">{children}</div>
        )}
      </div>
    </div>
  );
}