'use client';
import { useReduced } from '@/components/a11y/ReducedMotionProvider';

export default function ReducedMotionToggle(){
  const { reduced, setReduced } = useReduced();
  
  return (
    <label className="inline-flex items-center gap-2 text-xs">
      <input 
        type="checkbox" 
        checked={reduced} 
        onChange={e => setReduced(e.target.checked)} 
      /> 
      Reduce motion
    </label>
  );
}
