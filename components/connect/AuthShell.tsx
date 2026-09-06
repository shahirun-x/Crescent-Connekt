import Link from "next/link";

export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-14">
      <div className="w-full max-w-md">
        <div className="rounded-card border border-slate-200 bg-white p-7 shadow-sm sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-crescent-600">
            Crescent Connect
          </p>
          <h1 className="mt-1 text-2xl font-bold text-crescent-800">{title}</h1>
          {subtitle && (
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{subtitle}</p>
          )}
          <div className="mt-6">{children}</div>
        </div>
        {footer && (
          <div className="mt-4 text-center text-sm text-slate-500">{footer}</div>
        )}
        <p className="mt-4 text-center text-xs text-slate-400">
          <Link href="/connect" className="hover:text-slate-600">
            ← Back to Crescent Connect
          </Link>
        </p>
      </div>
    </div>
  );
}
