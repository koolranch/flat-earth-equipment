export function Badge({children, className=""}:{children:React.ReactNode; className?:string;}){
  return <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-success-soft text-success ${className}`}>{children}</span>;
}