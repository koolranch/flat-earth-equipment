export default function SpecTable({
  specs,
}: {
  specs: {
    family: string;
    voltage: string;
    current: string;
    phase: string;
    chemistries: string;
  };
}) {
  const rows = [
    ["Family", specs.family],
    ["DC Voltage", specs.voltage],
    ["DC Current", specs.current],
    ["Input Phase", specs.phase],
    ["Supported Chemistries", specs.chemistries],
  ];

  return (
    <div className="overflow-hidden rounded-2xl border bg-white">
      <table className="w-full border-separate border-spacing-0">
        <tbody>
          {rows.map(([k, v], i) => (
            <tr key={k} className={i % 2 ? "bg-neutral-50" : ""}>
              <td className="w-48 border-b px-4 py-3 text-sm font-medium text-neutral-700">{k}</td>
              <td className="border-b px-4 py-3 text-sm text-neutral-800">{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


