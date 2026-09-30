import Link from 'next/link';
import { machineShelfHref } from '@/lib/parts/machineShelf';

type ShopMachineShelfLinkProps = {
  brand: string;
  model?: string | null;
  className?: string;
};

export default function ShopMachineShelfLink({
  brand,
  model,
  className,
}: ShopMachineShelfLinkProps) {
  const modelName = model?.trim() ?? '';
  const label = modelName ? `Shop ${modelName} parts` : `Shop ${brand} by machine`;

  return (
    <Link
      href={machineShelfHref(brand, modelName)}
      className={
        className ??
        'inline-flex min-h-[44px] items-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:border-slate-900'
      }
    >
      {label}
    </Link>
  );
}
