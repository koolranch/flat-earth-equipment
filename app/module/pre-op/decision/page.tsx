import { cookies } from 'next/headers';
import PreOpDecisionTree from '@/components/demos/PreOpDecisionTree';

export default function Page(){
  const locale = (cookies().get('locale')?.value === 'es') ? 'es' : 'en';
  return <main className="container mx-auto p-4"><PreOpDecisionTree locale={locale}/></main>;
}
