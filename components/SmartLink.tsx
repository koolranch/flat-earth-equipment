import Link from 'next/link';
import { ComponentProps } from 'react';

// Drop-in wrapper to disable prefetch on heavy link lists
export default function SmartLink(props: ComponentProps<typeof Link>) {
  const { prefetch, ...rest } = props as any;
  return <Link prefetch={false} {...rest} />;
}

