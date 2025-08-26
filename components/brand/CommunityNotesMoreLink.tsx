import Link from 'next/link';

export default function CommunityNotesMoreLink({ href }: { href: string }){
  return (
    <div className='mt-3'>
      <Link className='text-sm underline hover:no-underline' href={href}>View more notes</Link>
    </div>
  );
}
