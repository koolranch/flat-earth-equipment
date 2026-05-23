type ForkSection = {
  thickness: number;
  width: number;
  capacityLbs: number;
};

/** Approximate rated capacity at 24" load center by ITA class and fork section. */
const CLASS_SECTION_CAPACITY: Record<string, ForkSection[]> = {
  II: [
    { thickness: 1.5, width: 4, capacityLbs: 5500 },
    { thickness: 1.5, width: 5, capacityLbs: 7700 },
    { thickness: 1.75, width: 4, capacityLbs: 7700 },
    { thickness: 1.75, width: 5, capacityLbs: 11000 },
    { thickness: 2, width: 5, capacityLbs: 11000 },
    { thickness: 2, width: 6, capacityLbs: 14300 },
  ],
  III: [
    { thickness: 1.75, width: 5, capacityLbs: 11000 },
    { thickness: 2, width: 5, capacityLbs: 11000 },
    { thickness: 2, width: 6, capacityLbs: 14300 },
    { thickness: 2.5, width: 6, capacityLbs: 17600 },
  ],
  IV: [
    { thickness: 2, width: 6, capacityLbs: 14300 },
    { thickness: 2.5, width: 6, capacityLbs: 17600 },
    { thickness: 3, width: 7, capacityLbs: 22000 },
  ],
};

type SpecsStructured = {
  thickness?: number;
  width?: number;
  length?: number;
  capacity_lbs?: number;
};

function parseThickness(raw: string): number | null {
  const mixed = raw.match(/(\d+)\s+(\d+)\/(\d+)/);
  if (mixed) {
    return Number(mixed[1]) + Number(mixed[2]) / Number(mixed[3]);
  }
  const decimal = raw.match(/(\d+(?:\.\d+)?)/);
  return decimal ? Number(decimal[1]) : null;
}

function parseCapacityFromDescription(description?: string): number | null {
  if (!description) return null;

  const explicit = description.match(/(\d{1,2},?\d{3})\s*(?:lb|lbs|#)\b/i);
  if (explicit) {
    return Number(explicit[1].replace(/,/g, ''));
  }

  return null;
}

function parseCapacityFromMetadata(metadata?: Record<string, unknown> | null): number | null {
  if (!metadata) return null;

  const direct = metadata.capacity_lbs;
  if (typeof direct === 'number' && direct > 0) return direct;

  const specs = metadata.specs_structured as SpecsStructured | undefined;
  if (specs?.capacity_lbs && specs.capacity_lbs > 0) return specs.capacity_lbs;

  return null;
}

function parseClassFromName(name: string): string | null {
  const match = name.toUpperCase().match(/CLASS\s+(I{1,3}|IV|V)\b/);
  return match?.[1] ?? null;
}

function estimateFromSection(
  forkClass: string,
  thickness: number,
  width: number,
  length?: number,
): number | null {
  const sections = CLASS_SECTION_CAPACITY[forkClass];
  if (!sections) return null;

  const match = sections.find(
    (section) =>
      Math.abs(section.thickness - thickness) < 0.01 &&
      section.width === width,
  );
  if (!match) return null;

  if (!length || length <= 48) return match.capacityLbs;

  const derated = match.capacityLbs * (48 / length);
  return Math.round(derated / 100) * 100;
}

export function getForkCapacityLbs(input: {
  name: string;
  description?: string;
  metadata?: Record<string, unknown> | null;
}): number | null {
  const fromMetadata = parseCapacityFromMetadata(input.metadata);
  if (fromMetadata) return fromMetadata;

  const fromDescription = parseCapacityFromDescription(input.description);
  if (fromDescription) return fromDescription;

  const specs = input.metadata?.specs_structured as SpecsStructured | undefined;
  const forkClass = parseClassFromName(input.name);
  if (!forkClass) return null;

  let thickness = specs?.thickness;
  let width = specs?.width;
  const length = specs?.length;

  const dimSource =
    (input.metadata?.specifications as { dimensions?: string } | undefined)
      ?.dimensions ?? input.name;

  if (!thickness || !width) {
    const dimMatch = dimSource.match(
      /([\d./\s]+)[xX×]([\d./\s]+)[xX×]([\d./\s]+)/i,
    );
    if (dimMatch) {
      thickness = parseThickness(dimMatch[1].trim()) ?? undefined;
      width = parseThickness(dimMatch[2].trim()) ?? undefined;
    }
  }

  if (!thickness || !width) return null;

  return estimateFromSection(forkClass, thickness, width, length);
}

export function formatCapacityLbs(lbs: number): string {
  return `${lbs.toLocaleString()} lbs`;
}
