'use client';
import { createContext, useContext, useEffect, useState } from 'react';

const Ctx = createContext<{ reduced: boolean; setReduced: (v: boolean) => void }>({ 
  reduced: false, 
  setReduced: () => {} 
});

export const useReduced = () => useContext(Ctx);

export default function ReducedMotionProvider({ children }: { children: React.ReactNode }){
  const [reduced, setReduced] = useState(false);
  
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const init = mq.matches || localStorage.getItem('reduce-motion') === '1';
    setReduced(init);
    document.body.dataset.reduceMotion = init ? '1' : '0';
    
    const onChange = (e: MediaQueryListEvent) => { 
      setReduced(e.matches); 
      document.body.dataset.reduceMotion = e.matches ? '1' : '0'; 
    };
    
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);
  
  useEffect(() => { 
    localStorage.setItem('reduce-motion', reduced ? '1' : '0'); 
    document.body.dataset.reduceMotion = reduced ? '1' : '0'; 
  }, [reduced]);
  
  return <Ctx.Provider value={{ reduced, setReduced }}>{children}</Ctx.Provider>;
}
