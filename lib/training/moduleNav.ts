export type UIModule = { id: string; order: number; title: string; content_slug: string | null };

export function sortByOrder<T extends {order:number}>(mods:T[]):T[]{ return [...mods].sort((a,b)=>a.order-b.order); }
export function firstContentOrder(mods:UIModule[]):number|null{ const m=sortByOrder(mods).find(x=>!!x.content_slug); return m?m.order:null; }
export function nextPlayableOrder(mods:UIModule[], done:number[]):number|null{ for(const m of sortByOrder(mods)){ if(!done.includes(m.order)) return m.order; } return null; }
export function hrefForOrder(order:number, courseSlug:string){ return `/training/module/${order}?courseId=${encodeURIComponent(courseSlug)}`; }
