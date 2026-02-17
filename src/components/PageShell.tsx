import { ReactNode } from "react";

interface PageShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export default function PageShell({ title, subtitle, children }: PageShellProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-[#1A1F26] border border-[#2A2F36] rounded-lg p-8 shadow-lg">
          <div className="mb-6">
            <h1 className="text-3xl font-medium text-white font-heading mb-2">
              {title}
            </h1>
            {subtitle && (
              <p className="text-[#B0B5BA] text-base">
                {subtitle}
              </p>
            )}
          </div>
          <div className="border-t border-[#2A2F36] pt-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
