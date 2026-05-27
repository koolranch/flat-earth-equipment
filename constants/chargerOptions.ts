export interface Offer {
  label: "Reman Exchange" | "Repair & Return";
  sku: string;           // Stripe PriceID
  price: number;         // cents
  coreInfo?: string;     // explanatory text (for exchange)
  coreCharge?: number;   // core charge amount in dollars
  desc: string;          // marketing sub-copy
}

export interface ChargerModule {
  id: string;            // product UUID
  brand: "Enersys" | "Hawker" | "ACT";
  partNumber: string;    // part number (e.g., "6LA20671")
  title: string;         // full marketing title
  imgExchange: string;
  imgRepair: string;
  offers: Offer[];
}

const ACT_QUANTUM_IMAGE =
  "https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/products/act-quantum.png";

export const CHARGER_MODULES: ChargerModule[] = [
  {
    id: "7e1b5a1d-3b0a-42be-8ec2-dcd3670ec601",
    brand: "Enersys",
    partNumber: "6LA20671",
    title: "Enersys Forklift Charger Module – 6LA20671",
    imgExchange: "https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/products/enersys.png",
    imgRepair: "https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/products/enersys.png",
    offers: [
      {
        label: "Reman Exchange",
        sku: "price_1TVz7dHJI548rO8J6EyQMzlr",
        price: 74900,
        coreInfo: "+ $350 refundable core deposit",
        coreCharge: 350,
        desc: "Ships today if ordered before 3 PM EST.",
      },
      {
        label: "Repair & Return",
        sku: "price_1RsZDBHJI548rO8JhS1sUEAQ",
        price: 70000,
        desc: "Ship your unit in (prepaid label), we refurbish & return in 3-5 business days.",
      },
    ],
  },
  {
    id: "4f9d4d95-2d86-4b65-a1d3-5726e5802b6a",
    brand: "Hawker",
    partNumber: "6LA20671",
    title: "Hawker Forklift Charger Module – 6LA20671",
    imgExchange: "https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/products/hawker.png",
    imgRepair: "https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/products/hawker.png",
    offers: [
      {
        label: "Reman Exchange",
        sku: "price_1TVz7eHJI548rO8JLoKh6iIk",
        price: 74900,
        coreInfo: "+ $350 refundable core deposit",
        coreCharge: 350,
        desc: "Ships today if ordered before 3 PM EST.",
      },
      {
        label: "Repair & Return",
        sku: "price_1TbkeEHJI548rO8JRm07O00v",
        price: 65000,
        desc: "Ship your unit in (prepaid label), we refurbish & return in 3-5 business days.",
      },
    ],
  },
  {
    id: "3da197f5-be07-418e-a94d-441855a21f7b",
    brand: "ACT",
    partNumber: "Quantum 36VDC",
    title: "ACT Quantum 36VDC Charger Module – 480VAC In",
    imgExchange: ACT_QUANTUM_IMAGE,
    imgRepair: ACT_QUANTUM_IMAGE,
    offers: [
      {
        label: "Reman Exchange",
        sku: "price_1TWyysHJI548rO8JuLkbioA4",
        price: 80000,
        coreInfo: "+ $350 refundable core deposit",
        coreCharge: 350,
        desc: "Ships today if ordered before 3 PM EST. Cross-references Hyster/Yale Premier 81063658R.",
      },
      {
        label: "Repair & Return",
        sku: "price_1TWyysHJI548rO8JTuY3l7cN",
        price: 70000,
        desc: "Ship your unit in (prepaid label), we refurbish & return in 3-5 business days.",
      },
    ],
  },
  {
    id: "9019608e-9051-49a3-846b-0d8787fa3ea8",
    brand: "ACT",
    partNumber: "Quantum 48VDC",
    title: "ACT Quantum 48VDC Charger Module – 480VAC In",
    imgExchange: ACT_QUANTUM_IMAGE,
    imgRepair: ACT_QUANTUM_IMAGE,
    offers: [
      {
        label: "Reman Exchange",
        sku: "price_1TWyyuHJI548rO8J1rqhn4G5",
        price: 80000,
        coreInfo: "+ $350 refundable core deposit",
        coreCharge: 350,
        desc: "Ships today if ordered before 3 PM EST. Cross-references Hyster/Yale Premier 81063577R.",
      },
      {
        label: "Repair & Return",
        sku: "price_1TWyytHJI548rO8Jm2H5xc3v",
        price: 70000,
        desc: "Ship your unit in (prepaid label), we refurbish & return in 3-5 business days.",
      },
    ],
  },
  {
    id: "f4fcbadf-b3ee-4d26-bb8b-d54570e74cf1",
    brand: "ACT",
    partNumber: "Quantum 80VDC",
    title: "ACT Quantum 80VDC Industrial Charger Module – 480VAC In",
    imgExchange: ACT_QUANTUM_IMAGE,
    imgRepair: ACT_QUANTUM_IMAGE,
    offers: [
      {
        label: "Reman Exchange",
        sku: "price_1TWyyvHJI548rO8JOYD7C9LJ",
        price: 80000,
        coreInfo: "+ $350 refundable core deposit",
        coreCharge: 350,
        desc: "Ships today if ordered before 3 PM EST. Cross-references Hyster/Yale Premier 81063578R.",
      },
      {
        label: "Repair & Return",
        sku: "price_1TWyyuHJI548rO8JEuIC4XWW",
        price: 70000,
        desc: "Ship your unit in (prepaid label), we refurbish & return in 3-5 business days.",
      },
    ],
  },
];
