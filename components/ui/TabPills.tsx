export function TabPills({tabs, active, onChange}:{tabs:{key:string;label:string;done?:boolean;}[], active:string, onChange:(k:string)=>void}){
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map(t=>(
        <button key={t.key}
          onClick={()=>onChange(t.key)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium border
            ${active===t.key ? "bg-gray-100 border-gray-300 text-ink" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-100"}
          `}>
          {t.label}{t.done && <span className="ml-1 inline-block size-1.5 rounded-full bg-success align-middle" />}
        </button>
      ))}
    </div>
  );
}
