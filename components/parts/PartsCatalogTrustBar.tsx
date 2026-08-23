import { ShieldCheck, Truck, Wrench } from 'lucide-react';

type Props = {
  labels: {
    warranty: string;
    oem: string;
    ship: string;
  };
};

/**
 * Slim restatement of the trust block that also lives below the grid — these
 * are purchase-decision facts, and the full version sits under 90 pages of
 * pagination where a shopper never reaches it.
 */
export default function PartsCatalogTrustBar({ labels }: Props) {
  const items = [
    { icon: ShieldCheck, text: labels.warranty },
    { icon: Wrench, text: labels.oem },
    { icon: Truck, text: labels.ship },
  ];

  return (
    <ul className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-600">
      {items.map(({ icon: Icon, text }) => (
        <li key={text} className="flex items-center gap-1.5">
          <Icon className="h-4 w-4 shrink-0 text-[#F76511]" aria-hidden="true" />
          <span className="font-medium">{text}</span>
        </li>
      ))}
    </ul>
  );
}
