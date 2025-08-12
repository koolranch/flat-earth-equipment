export type BatteryCharger = {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  description: string | null;
  image_url: string | null;
  price: string | null;
  price_cents: number | null;
  sku: string | null;
  category_slug: string | null;
  stripe_price_id: string | null;
  has_core_charge: boolean | null;
  core_charge: string | null;
};

export type ChargerSpecs = {
  voltage: number | null;
  current: number | null;
  phase: "1P" | "3P" | "unknown";
  chemistry: string[];
  inputVoltage: string[];
};

export type FilterOptions = {
  voltages: number[];
  currentAmps: number[];
  phases: string[];
  chemistries: string[];
};

export type SelectorFilters = {
  voltage: number | null;
  current: number | null;
  phase: string | null;
  chemistry: string[];
};

// Parse charger specs from name/description/slug
export function parseChargerSpecs(charger: BatteryCharger): ChargerSpecs {
  const name = charger.name.toLowerCase();
  const desc = charger.description?.toLowerCase() || "";
  const slug = charger.slug.toLowerCase();
  
  // Extract voltage (24v, 36v, 48v, 80v, 96v)
  const voltageMatch = (name + " " + desc + " " + slug).match(/(\d{2,3})v/);
  const voltage = voltageMatch ? parseInt(voltageMatch[1]) : null;
  
  // Extract current (amperage)
  const currentMatch = (name + " " + desc + " " + slug).match(/(\d{2,3})a/);
  const current = currentMatch ? parseInt(currentMatch[1]) : null;
  
  // Determine phase from description or family
  let phase: "1P" | "3P" | "unknown" = "unknown";
  if (desc.includes("single") || desc.includes("1p") || name.includes("green2") || name.includes("green4")) {
    phase = "1P";
  } else if (desc.includes("three") || desc.includes("3p") || name.includes("green6") || name.includes("green8") || name.includes("greenx")) {
    phase = "3P";
  }
  
  // Extract chemistry support from description
  const chemistry: string[] = [];
  if (desc.includes("lead") || desc.includes("agm") || desc.includes("flooded")) {
    chemistry.push("Lead-Acid/AGM");
  }
  if (desc.includes("lithium") || desc.includes("li-ion")) {
    chemistry.push("Lithium");
  }
  if (chemistry.length === 0) {
    chemistry.push("Lead-Acid/AGM"); // Default assumption
  }
  
  // Extract input voltage options
  const inputVoltage: string[] = [];
  if (desc.includes("208") || desc.includes("240")) {
    inputVoltage.push("208-240V");
  }
  if (desc.includes("480")) {
    inputVoltage.push("480V");
  }
  if (inputVoltage.length === 0) {
    // Default based on phase
    if (phase === "1P") {
      inputVoltage.push("208-240V");
    } else if (phase === "3P") {
      inputVoltage.push("480V");
    }
  }
  
  return {
    voltage,
    current,
    phase,
    chemistry,
    inputVoltage,
  };
}

// Generate filter options from charger list
export function generateFilterOptions(chargers: BatteryCharger[]): FilterOptions {
  const voltages = new Set<number>();
  const currentAmps = new Set<number>();
  const phases = new Set<string>();
  const chemistries = new Set<string>();
  
  chargers.forEach(charger => {
    const specs = parseChargerSpecs(charger);
    
    if (specs.voltage) voltages.add(specs.voltage);
    if (specs.current) currentAmps.add(specs.current);
    if (specs.phase !== "unknown") phases.add(specs.phase);
    specs.chemistry.forEach(chem => chemistries.add(chem));
  });
  
  return {
    voltages: Array.from(voltages).sort((a, b) => a - b),
    currentAmps: Array.from(currentAmps).sort((a, b) => a - b),
    phases: Array.from(phases).sort(),
    chemistries: Array.from(chemistries).sort(),
  };
}

// Filter chargers based on selector criteria
export function filterChargers(chargers: BatteryCharger[], filters: SelectorFilters): BatteryCharger[] {
  return chargers.filter(charger => {
    const specs = parseChargerSpecs(charger);
    
    // Voltage filter
    if (filters.voltage && specs.voltage !== filters.voltage) {
      return false;
    }
    
    // Current filter
    if (filters.current && specs.current !== filters.current) {
      return false;
    }
    
    // Phase filter
    if (filters.phase && specs.phase !== filters.phase) {
      return false;
    }
    
    // Chemistry filter (at least one must match)
    if (filters.chemistry.length > 0) {
      const hasMatchingChemistry = filters.chemistry.some(filterChem => 
        specs.chemistry.some(specChem => specChem.includes(filterChem))
      );
      if (!hasMatchingChemistry) {
        return false;
      }
    }
    
    return true;
  });
}

// Calculate estimated charge time
export function calculateChargeTime(batteryAh: number, chargerAmps: number): string {
  if (!batteryAh || !chargerAmps) return "N/A";
  
  // Typical charge time calculation with efficiency factor
  const chargeTimeHours = (batteryAh / chargerAmps) * 1.15; // 15% efficiency loss
  
  if (chargeTimeHours < 1) {
    return `${Math.round(chargeTimeHours * 60)} min`;
  } else if (chargeTimeHours < 10) {
    return `${chargeTimeHours.toFixed(1)} hr`;
  } else {
    return `${Math.round(chargeTimeHours)} hr`;
  }
}

// Format price display
export function formatPrice(price: string | null, priceCents: number | null): string {
  if (priceCents && priceCents > 0) {
    return (priceCents / 100).toLocaleString(undefined, {
      style: "currency",
      currency: "USD",
    });
  }
  
  if (price && price !== "0" && price !== "0.00") {
    const num = parseFloat(price);
    if (!isNaN(num) && num > 0) {
      return num.toLocaleString(undefined, {
        style: "currency", 
        currency: "USD",
      });
    }
  }
  
  return "Call for pricing";
}

// Check if charger qualifies for quick ship
export function isQuickShip(charger: BatteryCharger): boolean {
  // Quick ship criteria - you can adjust these
  const quickShipSlugs = new Set([
    "green2-24v-20a", "green2-36v-20a", "green2-48v-20a",
    "green4-24v-35a", "green4-36v-35a", "green4-48v-35a",
  ]);
  
  return quickShipSlugs.has(charger.slug) || 
         charger.name.toLowerCase().includes("green2") ||
         charger.name.toLowerCase().includes("green4");
}
