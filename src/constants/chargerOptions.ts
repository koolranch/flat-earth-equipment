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
  name: string;
  imgExchange: string;
  imgRepair: string;
  offers: Offer[];
}

export const CHARGER_MODULES: ChargerModule[] = [
  {
    id: "7e1b5a1d-3b0a-42be-8ec2-dcd3670ec601",
    brand: "Enersys",
    name: "Enersys Forklift Charger Module – 6LA20671",
    imgExchange: "https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/products//enersys.png",
    imgRepair: "https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/products//enersys_module_repair.png",
    offers: [
      {
        label: "Reman Exchange",
        sku: "price_1RQJNjHJI548rO8JKJclmS56",
        price: 74900,
        coreInfo: "+ $350 refundable core deposit",
        desc: "Ships today if ordered before 3 PM MT.",
      },
      {
        label: "Repair & Return",
        sku: "price_1Rbo2pHJI548rO8JJZBG5o7L",
        price: 60000,
        desc: "Ship your unit in, we refurbish & return in 3-5 business days.",
      },
    ],
  },
  {
    id: "4f9d4d95-2d86-4b65-a1d3-5726e5802b6a",
    brand: "Hawker",
    name: "Hawker Forklift Charger Module – 6LA20671",
    imgExchange: "https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/products//hawker.png",
    imgRepair: "https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/products//hawker.png", // using same image for now
    offers: [
      {
        label: "Reman Exchange",
        sku: "price_1RQJNjHJI548rO8JFFATEXkd",
        price: 74900,
        coreInfo: "+ $350 refundable core deposit",
        desc: "Ships today if ordered before 3 PM MT.",
      },
      {
        label: "Repair & Return",
        sku: "price_1Rbo2pHJI548rO8JJZBG5o7L", // using same $600 price for now
        price: 60000,
        desc: "Ship your unit in, we refurbish & return in 3-5 business days.",
      },
    ],
  },
]; 