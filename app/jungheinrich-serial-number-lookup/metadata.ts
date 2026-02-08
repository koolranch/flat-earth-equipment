import { generatePageAlternates } from "@/app/seo-defaults";

export const metadata = {
  title: "Jungheinrich Serial Number Lookup (EFG, ETV/ETM, ETVQ, EJE, EKS, EKX) | Flat Earth Equipment",
  description: "Find Jungheinrich data/ID plate locations by family and capture the correct truck serial/PIN for parts or service. No year decoding.",
  alternates: generatePageAlternates("/jungheinrich-serial-number-lookup"),
  openGraph: {
    title: "Jungheinrich Serial Number Lookup",
    description: "Plate locations and serial best practices for EFG (electric CB), DFG/TFG (IC), ETV/ETM/ETVQ (reach), EJE (pallet), EJC/EJD/ERC (stackers), EKS (order pickers), EKX (VNA).",
    url: "/jungheinrich-serial-number-lookup",
    type: "website"
  }
};
