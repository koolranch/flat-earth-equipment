import clsx from "clsx";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  variant?: "primary"|"secondary"|"ghost"|"danger"|"outline";
  asChild?: boolean;
};

export function Button({variant="primary", className, asChild, children, ...props}:Props){
  const base = "inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-semibold transition-colors focus:outline-none focus-visible:shadow-ring disabled:opacity-50 disabled:cursor-not-allowed";
  const map = {
    primary: "bg-accent text-white hover:bg-accent-hover active:bg-accent-active",
    secondary: "bg-gray-100 text-ink hover:bg-gray-200",
    outline: "bg-transparent text-ink border border-gray-300 hover:bg-gray-50",
    ghost: "bg-transparent text-white ring-1 ring-white/20 hover:ring-white/40",
    danger: "bg-danger text-white hover:bg-red-600"
  } as const;
  
  if (asChild) {
    return <div className={clsx(base, map[variant], className)}>{children}</div>;
  }
  return <button className={clsx(base, map[variant], className)} {...props}>{children}</button>;
}

export default Button;
