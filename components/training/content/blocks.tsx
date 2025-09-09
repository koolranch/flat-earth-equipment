import Image from 'next/image';
import React from 'react';
import { assetUrl } from '@/lib/assets';

export function Objectives({items}:{items:string[]}){return(<ul className="space-y-2 list-disc ml-5">{items.map((t,i)=>(<li key={i} className="text-sm text-slate-700">{t}</li>))}</ul>)}

export function MediaFigure({src,alt,caption}:{src:string;alt:string;caption?:string}){const url=assetUrl(src);return(<figure className="rounded-xl bg-slate-50 border p-4"><img src={url} alt={alt} className="w-full h-auto"/><figcaption className="text-xs text-slate-500 mt-2">{caption}</figcaption></figure>)}

export function OSHAAlert({title,body}:{title:string;body:string}){return(<div className="rounded-xl border border-amber-300 bg-amber-50 p-4"><div className="text-amber-900 font-semibold">{title}</div><p className="text-sm text-amber-900/90 mt-1">{body}</p></div>)}

export function Tips({items}:{items:{label:string;body:string}[]}){return(<div className="grid gap-3 sm:grid-cols-2">{items.map((t,i)=>(<div key={i} className="rounded-xl border bg-white p-4"><div className="text-slate-900 font-medium">{t.label}</div><p className="text-sm text-slate-600 mt-1">{t.body}</p></div>))}</div>)}

export function IconRow({icons}:{icons:{src:string;alt:string;label:string}[]}){return(<div className="grid gap-3 sm:grid-cols-3">{icons.map((x,i)=>(<div key={i} className="rounded-xl border bg-white p-3 flex items-center gap-3"><img src={assetUrl(x.src)} alt={x.alt} className="w-12 h-12"/><div className="text-sm text-slate-700">{x.label}</div></div>))}</div>)}
