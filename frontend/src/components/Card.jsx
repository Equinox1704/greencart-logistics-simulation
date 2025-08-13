export default function Card({ title, action, children, className = "" }) {
  return (
    <div
      className={`w-full rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}
    >
      {title && (
        <div className="flex items-center justify-between border-b px-5 py-3">
          <h3 className="font-semibold">{title}</h3>
          {action}
        </div>
      )}
      <div className="p-5 w-full">{children}</div>
    </div>
  );
}
