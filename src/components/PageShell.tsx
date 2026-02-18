import { ReactNode } from "react";

interface PageShellProps {
  title: string;
  subtitle?: ReactNode;
  icon?: ReactNode;
  children: ReactNode;
}

export default function PageShell({ title, subtitle, icon, children }: PageShellProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-[#1A1F26] border border-[#2A2F36] rounded-lg p-8 shadow-xl">
          <div className="mb-8 border-b border-[#2A2F36] pb-6 flex items-center gap-4">
            {icon != null && (
              <div className="bg-[#12171D] p-3 rounded-lg border border-[#2A2F36] shrink-0">
                {icon}
              </div>
            )}
            <div className="min-w-0">
              <h1 className="text-[30px] font-medium text-white font-heading leading-tight">
                {title}
              </h1>
              {subtitle != null && (
                <p className="text-[#B0B5BA] text-base font-normal flex items-center gap-2 flex-wrap mt-2">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          <div className="pt-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
