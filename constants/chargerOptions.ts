export interface Offer {
  label: "Reman Exchange" | "Repair & Return";
  sku: string;           // Stripe PriceID
  price: number;         // cents
  coreInfo?: string;     // explanatory text (for exchange)
  desc: string;          // marketing sub-copy
}

export interface ChargerModule {
  id: string;            // product UUID
  brand: "Enersys" | "Hawker";
  partNumber: string;    // part number (e.g., "6LA20671")
  title: string;         // full marketing title
  imgExchange: string;
  imgRepair: string;
  offers: Offer[];
}

export const CHARGER_MODULES: ChargerModule[] = [
  {
    id: "7e1b5a1d-3b0a-42be-8ec2-dcd3670ec601",
    brand: "Enersys",
    partNumber: "6LA20671",
    title: "Enersys Forklift Charger Module – 6LA20671",
    imgExchange: "https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/products//enersys.png",
    imgRepair: "https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/products//enersys.png", // using same image for consistent formatting
    offers: [
      {
        label: "Reman Exchange",
        sku: "price_1RsZDCHJI548rO8JlVhsTFBT",
        price: 84900,
        coreInfo: "+ $350 refundable core deposit",
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
    imgExchange: "https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/products//hawker.png",
    imgRepair: "https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/products//hawker.png", // using same image for now
    offers: [
      {
        label: "Reman Exchange",
        sku: "price_1RsZDAHJI548rO8J7mw3OJhS",
        price: 84900,
        coreInfo: "+ $350 refundable core deposit",
        desc: "Ships today if ordered before 3 PM EST.",
      },
      {
        label: "Repair & Return",
        sku: "price_1RsZDBHJI548rO8J6EAKJcSg", // Hawker-specific repair price
        price: 70000,
        desc: "Ship your unit in (prepaid label), we refurbish & return in 3-5 business days.",
      },
    ],
  },
]; 