import { useMemo } from "react";
import type { Tables } from "@/integrations/supabase/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { TrendingUp, TrendingDown, ShoppingCart, DollarSign, Zap } from "lucide-react";

type Order = Tables<"orders">;

interface Props {
  orders: Order[];
}

const chartConfig: ChartConfig = {
  orders: { label: "অর্ডার", color: "hsl(var(--primary))" },
  revenue: { label: "রেভিনিউ (৳)", color: "hsl(142, 71%, 45%)" },
  credits: { label: "ক্রেডিট", color: "hsl(280, 80%, 60%)" },
};

function getLast30Days() {
  const days: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

export default function AdminSalesAnalytics({ orders }: Props) {
  const { dailyData, summaryCards } = useMemo(() => {
    const days = getLast30Days();
    const completed = orders.filter((o) => o.status === "completed");

    const byDay = new Map<string, { orders: number; revenue: number; credits: number }>();
    days.forEach((d) => byDay.set(d, { orders: 0, revenue: 0, credits: 0 }));

    completed.forEach((o) => {
      const day = o.created_at.slice(0, 10);
      const entry = byDay.get(day);
      if (entry) {
        entry.orders++;
        entry.revenue += Number(o.amount);
        entry.credits += o.credits;
      }
    });

    const dailyData = days.map((d) => {
      const v = byDay.get(d)!;
      return { date: d, label: `${parseInt(d.slice(8))}/${parseInt(d.slice(5, 7))}`, ...v };
    });

    // This week vs last week comparison
    const now = new Date();
    const thisWeekStart = new Date(now);
    thisWeekStart.setDate(now.getDate() - 6);
    const lastWeekStart = new Date(now);
    lastWeekStart.setDate(now.getDate() - 13);

    const thisWeek = completed.filter((o) => new Date(o.created_at) >= thisWeekStart);
    const lastWeek = completed.filter(
      (o) => new Date(o.created_at) >= lastWeekStart && new Date(o.created_at) < thisWeekStart
    );

    const twOrders = thisWeek.length;
    const lwOrders = lastWeek.length;
    const twRevenue = thisWeek.reduce((s, o) => s + Number(o.amount), 0);
    const lwRevenue = lastWeek.reduce((s, o) => s + Number(o.amount), 0);
    const twCredits = thisWeek.reduce((s, o) => s + o.credits, 0);
    const lwCredits = lastWeek.reduce((s, o) => s + o.credits, 0);

    const pct = (curr: number, prev: number) =>
      prev === 0 ? (curr > 0 ? 100 : 0) : Math.round(((curr - prev) / prev) * 100);

    const summaryCards = [
      {
        title: "এই সপ্তাহের অর্ডার",
        value: twOrders,
        change: pct(twOrders, lwOrders),
        icon: ShoppingCart,
      },
      {
        title: "এই সপ্তাহের রেভিনিউ",
        value: `৳${twRevenue.toLocaleString()}`,
        change: pct(twRevenue, lwRevenue),
        icon: DollarSign,
      },
      {
        title: "এই সপ্তাহের ক্রেডিট",
        value: twCredits.toLocaleString(),
        change: pct(twCredits, lwCredits),
        icon: Zap,
      },
    ];

    return { dailyData, summaryCards };
  }, [orders]);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {summaryCards.map((card) => (
          <div key={card.title} className="bg-card border border-border/30 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">{card.title}</span>
              <card.icon className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold text-foreground">{card.value}</p>
            <div className="flex items-center gap-1 mt-1">
              {card.change >= 0 ? (
                <TrendingUp className="w-3.5 h-3.5 text-green-400" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 text-destructive" />
              )}
              <span className={`text-xs font-medium ${card.change >= 0 ? "text-green-400" : "text-destructive"}`}>
                {card.change >= 0 ? "+" : ""}
                {card.change}% গত সপ্তাহের তুলনায়
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Orders Bar Chart */}
        <Card className="bg-card border-border/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-foreground">দৈনিক অর্ডার (৩০ দিন)</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[280px] w-full">
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/20" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} className="text-muted-foreground" interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Revenue Area Chart */}
        <Card className="bg-card border-border/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-foreground">দৈনিক রেভিনিউ (৳)</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[280px] w-full">
              <AreaChart data={dailyData}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/20" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(142, 71%, 45%)" fill="url(#revenueGrad)" strokeWidth={2} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Credits Line Chart */}
        <Card className="bg-card border-border/30 lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-foreground">দৈনিক ক্রেডিট সোল্ড</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[280px] w-full">
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/20" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="credits" stroke="hsl(280, 80%, 60%)" strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
