export interface CreditPackage {
  id: string;
  credits: number;
  price: number;
  currency: string;
  popular?: boolean;
  savings?: string;
}

export const packages: CreditPackage[] = [
  { id: "pkg-50", credits: 50, price: 40, currency: "BDT" },
  { id: "pkg-105", credits: 105, price: 80, currency: "BDT", popular: true, savings: "Save 24%" },
  { id: "pkg-300", credits: 300, price: 200, currency: "BDT", savings: "Save 33%" },
];

export const paymentMethods = [
  { id: "bkash", name: "bKash", number: "01XXXXXXXXX", color: "hsl(340, 80%, 55%)" },
  { id: "nagad", name: "Nagad", number: "01XXXXXXXXX", color: "hsl(25, 90%, 55%)" },
  { id: "rocket", name: "Rocket", number: "01XXXXXXXXX", color: "hsl(270, 60%, 50%)" },
] as const;
