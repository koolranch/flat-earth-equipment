export type SpecChip = {
  label: string;
  value: string;
};

function formatDimensions(raw: string): string {
  return raw
    .replace(/\s+/g, ' ')
    .replace(/(\d+)\s+1\/2/g, '$1½')
    .replace(/\s*[xX×]\s*/g, '×')
    .trim();
}

function parseForkSpecs(name: string, category?: string): SpecChip[] {
  const chips: SpecChip[] = [];
  const upper = name.toUpperCase();
  const isFork =
    upper.includes('FORK') || category?.toLowerCase().includes('fork') === true;

  if (!isFork) return chips;

  const classMatch = upper.match(/CLASS\s+(I{1,3}|IV|V)\b/);
  if (classMatch) {
    chips.push({ label: 'Class', value: classMatch[1] });
  }

  const dimMatch =
    name.match(/\(([\d./\s]+[xX×][\d./\s]+[xX×][\d./\s]+)\)/i) ??
    name.match(/([\d./\s]+[xX×][\d./\s]+[xX×][\d./\s]+)/i);

  if (dimMatch) {
    chips.push({ label: 'Size', value: formatDimensions(dimMatch[1]) });
  }

  return chips;
}

function parseChargerSpecs(
  name: string,
  category?: string,
  voltage?: number | null,
  amperage?: number | null,
): SpecChip[] {
  const chips: SpecChip[] = [];
  const upper = name.toUpperCase();
  const isCharger =
    upper.includes('CHARGER') ||
    category?.toLowerCase().includes('charger') === true;

  if (!isCharger) return chips;

  if (voltage) {
    chips.push({ label: 'Voltage', value: `${voltage}V` });
  } else {
    const voltMatch = name.match(/(\d+)\s*V(?:DC|AC)?\b/i);
    if (voltMatch) chips.push({ label: 'Voltage', value: `${voltMatch[1]}V` });
  }

  if (amperage) {
    chips.push({ label: 'Amps', value: `${amperage}A` });
  } else {
    const ampMatch = name.match(/(\d+)\s*A(?:MP(?:S)?)?\b/i);
    if (ampMatch) chips.push({ label: 'Amps', value: `${ampMatch[1]}A` });
  }

  return chips;
}

export function parsePartSpecs(input: {
  name: string;
  category?: string;
  voltage?: number | null;
  amperage?: number | null;
}): SpecChip[] {
  const fork = parseForkSpecs(input.name, input.category);
  if (fork.length > 0) return fork;

  const charger = parseChargerSpecs(
    input.name,
    input.category,
    input.voltage,
    input.amperage,
  );
  if (charger.length > 0) return charger;

  return [];
}
