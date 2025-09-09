import React from 'react';
import { Objectives, MediaFigure, OSHAAlert, Tips, IconRow } from './blocks';

export type Section =
 | { kind:'objectives'; items:string[] }
 | { kind:'media'; src:string; alt:string; caption?:string }
 | { kind:'osha'; title:string; body:string }
 | { kind:'tips'; items:{label:string;body:string}[] }
 | { kind:'icons'; icons:{src:string;alt:string;label:string}[] };

export function ModuleContent({sections}:{sections:Section[]}){
  return (
    <div className="space-y-6">
      {sections.map((s,idx)=>{
        switch(s.kind){
          case 'objectives': return <Objectives key={idx} items={s.items}/>;
          case 'media': return <MediaFigure key={idx} src={s.src} alt={s.alt} caption={s.caption}/>;
          case 'osha': return <OSHAAlert key={idx} title={s.title} body={s.body}/>;
          case 'tips': return <Tips key={idx} items={s.items}/>;
          case 'icons': return <IconRow key={idx} icons={s.icons}/>;
        }
      })}
    </div>
  );
}
