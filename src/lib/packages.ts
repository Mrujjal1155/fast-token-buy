export interface CreditPackage {
  id: string;
  credits: number;
  price: number;
  currency: string;
  popular?: boolean;
  savings?: string;
}

export const packages: CreditPackage[] = [
  { id: "pkg-50", credits: 50, price: 40, currency: "BDT", savings: "Start here" },
  { id: "pkg-105", credits: 105, price: 80, currency: "BDT", popular: true, savings: "24% savings — best deal!" },
  { id: "pkg-300", credits: 300, price: 200, currency: "BDT", savings: "33% savings — max value!" },
];

export const paymentMethods = [
  { id: "bkash", name: "bKash", color: "hsl(340, 80%, 55%)", type: "auto" as const },
  { id: "nagad", name: "Nagad", color: "hsl(25, 90%, 55%)", type: "auto" as const },
  { id: "rocket", name: "Rocket", color: "hsl(270, 60%, 50%)", type: "auto" as const },
  { id: "crypto", name: "Crypto (USDT)", color: "hsl(145, 70%, 50%)", type: "crypto" as const },
] as const;

export const cryptoTokens = [
  { token: "USDT", network: "tron", label: "USDT (TRON)" },
  { token: "USDT", network: "bsc", label: "USDT (BSC)" },
  { token: "USDT", network: "ton", label: "USDT (TON)" },
  { token: "USDC", network: "tron", label: "USDC (TRON)" },
  { token: "TRX", network: "tron", label: "TRX" },
  { token: "BNB", network: "bsc", label: "BNB" },
  { token: "TON", network: "ton", label: "TON" },
] as const;
