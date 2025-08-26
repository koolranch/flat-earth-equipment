export interface Brand {
  name: string;
  slug: string;
  colors?: {
    primary?: string;
  };
}

export const brands: Brand[] = [
  { name: "Bobcat", slug: "bobcat", colors: { primary: 'var(--brand-accent)' } },
  { name: "Case", slug: "case", colors: { primary: 'var(--brand-accent)' } },
  { name: "Case Construction", slug: "case-construction" },
  { name: "Caterpillar", slug: "caterpillar" },
  { name: "Clark", slug: "clark" },
  { name: "Crown", slug: "crown" },
  { name: "Doosan", slug: "doosan" },
  { name: "Enersys", slug: "enersys" },
  { name: "EP Equipment", slug: "ep-equipment" },
  { name: "FactoryCat", slug: "factorycat" },
  { name: "Gehl", slug: "gehl" },
  { name: "Genie", slug: "genie" },
  { name: "Hangcha", slug: "hangcha" },
  { name: "Heli", slug: "heli" },
  { name: "Hyster", slug: "hyster" },
  { name: "Hyundai", slug: "hyundai" },
  { name: "JCB", slug: "jcb" },
  { name: "JLG", slug: "jlg" },
  { name: "John Deere", slug: "john-deere" },
  { name: "Jungheinrich", slug: "jungheinrich", colors: { primary: 'var(--brand-accent)' } },
  { name: "Kärcher", slug: "karcher" },
  { name: "Komatsu", slug: "komatsu" },
  { name: "Kubota", slug: "kubota", colors: { primary: 'var(--brand-accent)' } },
  { name: "LCMG", slug: "lcmg" },
  { name: "Linde", slug: "linde", colors: { primary: 'var(--brand-accent)' } },
  { name: "LiuGong", slug: "liugong" },
  { name: "Lull", slug: "lull" },
  { name: "MEC", slug: "mec" },
  { name: "Mitsubishi Forklift", slug: "mitsubishi" },
  { name: "Moffett", slug: "moffett" },
  { name: "New Holland", slug: "new-holland", colors: { primary: 'var(--brand-accent)' } },
  { name: "Nissan Forklift", slug: "nissan" },
  { name: "PowerBoss", slug: "powerboss" },
  { name: "Raymond", slug: "raymond" },
  { name: "Skyjack", slug: "skyjack" },
  { name: "SkyTrak", slug: "skytrak" },
  { name: "Snorkel", slug: "snorkel" },
  { name: "Tailift", slug: "tailift" },
  { name: "Takeuchi", slug: "takeuchi", colors: { primary: 'var(--brand-accent)' } },
  { name: "TCM", slug: "tcm" },
  { name: "Tennant", slug: "tennant" },
  { name: "Toro", slug: "toro" },
  { name: "Toyota Material Handling", slug: "toyota" },
  { name: "UniCarriers", slug: "unicarriers" },
  { name: "XCMG", slug: "xcmg" }
]; 