import fs from 'fs';
import path from 'path';

// Read the existing parts
const parts = JSON.parse(fs.readFileSync('data/parts.json', 'utf8'));

// Additional parts to reach 19 total
const additionalParts = [
  {
    name: "Volvo Penta Marine Engine",
    slug: "volvo-penta-marine-engine",
    price: 24999.99,
    category: "engines",
    brand: "Volvo Penta",
    description: "High-performance marine diesel engine",
    sku: "VP-6000"
  },
  {
    name: "Cummins ISX Turbocharger",
    slug: "cummins-isx-turbocharger",
    price: 1899.99,
    category: "engines",
    brand: "Cummins",
    description: "Heavy-duty turbocharger for diesel engines",
    sku: "CM-ISX"
  },
  {
    name: "Hitachi ZX200 Hydraulic Pump",
    slug: "hitachi-zx200-hydraulic-pump",
    price: 1599.99,
    category: "hydraulics",
    brand: "Hitachi",
    description: "High-pressure hydraulic pump for excavators",
    sku: "HIT-ZX200"
  },
  {
    name: "Liebherr R944 Track",
    slug: "liebherr-r944-track",
    price: 2999.99,
    category: "undercarriage",
    brand: "Liebherr",
    description: "Heavy-duty track assembly for excavators",
    sku: "LIE-R944"
  },
  {
    name: "Doosan DL200 Fuel Pump",
    slug: "doosan-dl200-fuel-pump",
    price: 899.99,
    category: "fuel-systems",
    brand: "Doosan",
    description: "High-pressure fuel injection pump",
    sku: "DOO-DL200"
  },
  {
    name: "JCB 3CX Water Pump",
    slug: "jcb-3cx-water-pump",
    price: 349.99,
    category: "cooling",
    brand: "JCB",
    description: "Coolant pump for backhoe loaders",
    sku: "JCB-3CX"
  },
  {
    name: "New Holland T7.315 ECU",
    slug: "new-holland-t7-ecu",
    price: 1299.99,
    category: "electrical",
    brand: "New Holland",
    description: "Engine control unit for tractors",
    sku: "NH-T7"
  },
  {
    name: "Case IH Magnum Transmission",
    slug: "case-ih-magnum-transmission",
    price: 8999.99,
    category: "transmissions",
    brand: "Case IH",
    description: "Heavy-duty transmission for agricultural equipment",
    sku: "CIH-MAG"
  },
  {
    name: "Fendt 1000 Vario Pump",
    slug: "fendt-1000-vario-pump",
    price: 2499.99,
    category: "hydraulics",
    brand: "Fendt",
    description: "Variable displacement pump for tractors",
    sku: "FEN-1000"
  },
  {
    name: "Claas Lexion Combine Sensor",
    slug: "claas-lexion-sensor",
    price: 599.99,
    category: "sensors",
    brand: "Claas",
    description: "Yield monitoring sensor for combines",
    sku: "CLA-LEX"
  },
  {
    name: "Massey Ferguson 8S Filter Kit",
    slug: "massey-ferguson-8s-filter-kit",
    price: 299.99,
    category: "filters",
    brand: "Massey Ferguson",
    description: "Complete filter kit for tractors",
    sku: "MF-8S"
  },
  {
    name: "Kubota M8X Hydraulic Valve",
    slug: "kubota-m8x-hydraulic-valve",
    price: 799.99,
    category: "hydraulics",
    brand: "Kubota",
    description: "Control valve for tractor hydraulics",
    sku: "KUB-M8X"
  },
  {
    name: "Yanmar 4TNV98 Engine Block",
    slug: "yanmar-4tnv98-engine-block",
    price: 4999.99,
    category: "engines",
    brand: "Yanmar",
    description: "Complete engine block for compact tractors",
    sku: "YAN-4TNV"
  },
  {
    name: "Deutz TCD 3.6 Injector",
    slug: "deutz-tcd-3-6-injector",
    price: 449.99,
    category: "fuel-systems",
    brand: "Deutz",
    description: "Fuel injector for diesel engines",
    sku: "DEU-TCD"
  }
];

// Combine existing and additional parts
const allParts = [...parts, ...additionalParts];

// Create ingest/json directory if it doesn't exist
const outputDir = 'ingest/json';
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Write each part to its own JSON file
allParts.forEach(part => {
  const filename = path.join(outputDir, `${part.slug}.json`);
  fs.writeFileSync(filename, JSON.stringify(part, null, 2));
  console.log(`Created ${filename}`);
});

console.log(`\n✅ Created ${allParts.length} JSON files in ${outputDir}`); 