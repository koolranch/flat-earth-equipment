import { cookies } from 'next/headers';
import ControlHotspots from '@/components/demos/ControlHotspots';

export default function Page(){
  const locale = (cookies().get('locale')?.value === 'es') ? 'es' : 'en';
  return <main className="container mx-auto p-4"><ControlHotspots locale={locale}/></main>;
}
