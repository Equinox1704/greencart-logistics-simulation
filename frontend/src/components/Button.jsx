export default function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60";
  
  const styles = {
    primary: "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-600",
    outline: "border border-slate-300 hover:bg-slate-50",
    subtle: "bg-slate-100 hover:bg-slate-200",
  };

  return (
    <button className={`${base} ${styles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
