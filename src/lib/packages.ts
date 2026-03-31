export interface CreditPackage {
  id: string;
  credits: number;
  price: number;
  currency: string;
  popular?: boolean;
  savings?: string;
}

export const packages: CreditPackage[] = [
  { id: "pkg-50", credits: 50, price: 40, currency: "BDT", savings: "শুরু করুন এখানে" },
  { id: "pkg-105", credits: 105, price: 80, currency: "BDT", popular: true, savings: "২৪% সাশ্রয় — সেরা ডিল!" },
  { id: "pkg-300", credits: 300, price: 200, currency: "BDT", savings: "৩৩% সাশ্রয় — ম্যাক্স ভ্যালু!" },
];

export const paymentMethods = [
  { id: "bkash", name: "bKash", number: "01XXXXXXXXX", color: "hsl(340, 80%, 55%)", type: "manual" as const },
  { id: "nagad", name: "Nagad", number: "01XXXXXXXXX", color: "hsl(25, 90%, 55%)", type: "manual" as const },
  { id: "rocket", name: "Rocket", number: "01XXXXXXXXX", color: "hsl(270, 60%, 50%)", type: "manual" as const },
  { id: "crypto", name: "Crypto (USDT)", number: "", color: "hsl(145, 70%, 50%)", type: "crypto" as const },
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
