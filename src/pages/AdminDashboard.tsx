import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LogOut, Search, Package, DollarSign, Clock, CheckCircle, Tag, Filter, BarChart3, Bell, Power, CreditCard } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import type { Tables } from "@/integrations/supabase/types";
import AdminCoupons from "@/components/AdminCoupons";
import AdminReserves from "@/components/AdminReserves";
import AdminNotifications from "@/components/AdminNotifications";
import AdminPackages from "@/components/AdminPackages";
import AdminAjkerPay from "@/components/AdminAjkerPay";

type Order = Tables<"orders">;

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<"orders" | "coupons" | "reserves" | "notifications" | "packages" | "ajkerpay">("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [operatorOnline, setOperatorOnline] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
    fetchOrders();
    fetchOperatorStatus();
  }, []);

  const fetchOperatorStatus = async () => {
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "operator_status")
      .maybeSingle();
    if (data) setOperatorOnline(data.value === "online");
  };

  const toggleOperator = async (checked: boolean) => {
    setOperatorOnline(checked);
    const { error } = await supabase
      .from("site_settings")
      .update({ value: checked ? "online" : "offline", updated_at: new Date().toISOString() })
      .eq("key", "operator_status");
    if (error) {
      toast({ title: "Failed to update", variant: "destructive" });
      setOperatorOnline(!checked);
    } else {
      toast({ title: checked ? "অপারেটর অনলাইন" : "অপারেটর অফলাইন" });
    }
  };

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/admin"); return; }
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleData) { navigate("/admin"); }
  };

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setOrders(data);
    if (error) toast({ title: "Error loading orders", variant: "destructive" });
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: status as Order["status"] })
      .eq("id", id);
    if (error) {
      toast({ title: "Failed to update", variant: "destructive" });
    } else {
      toast({ title: "Status updated" });
      fetchOrders();
    }
  };

  const updateNotes = async (id: string, notes: string) => {
    await supabase.from("orders").update({ admin_notes: notes }).eq("id", id);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin");
  };

  const filtered = orders.filter((o) => {
    const matchesSearch =
      o.order_id.toLowerCase().includes(search.toLowerCase()) ||
      o.email.toLowerCase().includes(search.toLowerCase()) ||
      o.transaction_id.toLowerCase().includes(search.toLowerCase());
    const matchesPayment =
      paymentFilter === "all" ||
      (paymentFilter === "crypto" ? o.payment_method.startsWith("crypto") : o.payment_method === paymentFilter);
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    return matchesSearch && matchesPayment && matchesStatus;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    completed: orders.filter((o) => o.status === "completed").length,
    revenue: orders.filter((o) => o.status === "completed").reduce((s, o) => s + Number(o.amount), 0),
  };

  const statusColors: Record<string, string> = {
    pending: "text-yellow-400 bg-yellow-400/10",
    processing: "text-blue-400 bg-blue-400/10",
    completed: "text-primary bg-primary/10",
    failed: "text-destructive bg-destructive/10",
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/30 bg-card">
        <div className="container flex items-center justify-between h-16">
          <h1 className="text-xl font-bold text-foreground">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Power className={`w-4 h-4 ${operatorOnline ? "text-green-400" : "text-red-400"}`} />
              <span className="text-sm text-muted-foreground hidden sm:inline">অপারেটর</span>
              <Switch checked={operatorOnline} onCheckedChange={toggleOperator} />
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          </div>
        </div>
        <div className="container flex gap-1 -mb-px">
          {[
            { id: "orders" as const, label: "Orders", icon: Package },
            { id: "coupons" as const, label: "Coupons", icon: Tag },
            { id: "packages" as const, label: "Packages", icon: Package },
            { id: "reserves" as const, label: "Reserves", icon: BarChart3 },
            { id: "notifications" as const, label: "Notifications", icon: Bell },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <div className="container py-8 space-y-8">
        {activeTab === "orders" ? (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Total Orders", value: stats.total, icon: Package, color: "text-foreground" },
                { label: "Pending", value: stats.pending, icon: Clock, color: "text-yellow-400" },
                { label: "Completed", value: stats.completed, icon: CheckCircle, color: "text-primary" },
                { label: "Revenue", value: `৳${stats.revenue}`, icon: DollarSign, color: "text-primary" },
              ].map((s) => (
                <div key={s.label} className="bg-card border border-border/30 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <s.icon className={`w-5 h-5 ${s.color}`} />
                    <span className="text-sm text-muted-foreground">{s.label}</span>
                  </div>
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by order ID, email, or transaction ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 h-12 bg-secondary border-border/50"
                />
              </div>
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger className="w-full sm:w-40 h-12 bg-secondary border-border/50">
                  <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Payment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="bkash">bKash</SelectItem>
                  <SelectItem value="nagad">Nagad</SelectItem>
                  <SelectItem value="rocket">Rocket</SelectItem>
                  <SelectItem value="crypto">Crypto</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-36 h-12 bg-secondary border-border/50">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Orders table */}
            <div className="bg-card border border-border/30 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/30 text-muted-foreground">
                      <th className="text-left p-4 font-medium">Order ID</th>
                      <th className="text-left p-4 font-medium">Email</th>
                      <th className="text-left p-4 font-medium">Credits</th>
                      <th className="text-left p-4 font-medium">Amount</th>
                      <th className="text-left p-4 font-medium">Payment</th>
                      <th className="text-left p-4 font-medium">Txn ID</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Notes</th>
                      <th className="text-left p-4 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={9} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
                    ) : filtered.length === 0 ? (
                      <tr><td colSpan={9} className="p-8 text-center text-muted-foreground">No orders found</td></tr>
                    ) : (
                      filtered.map((order) => (
                        <tr key={order.id} className="border-b border-border/10 hover:bg-secondary/30 transition">
                          <td className="p-4 font-mono text-xs text-foreground">
                            <button onClick={() => { navigator.clipboard.writeText(order.order_id); }} className="hover:text-primary transition" title="Copy">{order.order_id}</button>
                          </td>
                          <td className="p-4 text-foreground">{order.email}</td>
                          <td className="p-4 text-foreground">{order.credits}</td>
                          <td className="p-4 text-foreground">৳{order.amount}</td>
                          <td className="p-4 text-foreground capitalize">{order.payment_method}</td>
                          <td className="p-4 font-mono text-xs text-muted-foreground">{order.transaction_id}</td>
                          <td className="p-4">
                            <Select
                              value={order.status}
                              onValueChange={(val) => updateStatus(order.id, val)}
                            >
                              <SelectTrigger className={`w-32 h-8 text-xs border-0 ${statusColors[order.status]}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="processing">Processing</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="failed">Failed</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="p-4">
                            <Input
                              defaultValue={order.admin_notes || ""}
                              placeholder="Add note..."
                              className="h-8 text-xs bg-transparent border-border/30 w-32"
                              onBlur={(e) => updateNotes(order.id, e.target.value)}
                            />
                          </td>
                          <td className="p-4 text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(order.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : activeTab === "coupons" ? (
          <AdminCoupons />
        ) : activeTab === "packages" ? (
          <AdminPackages />
        ) : activeTab === "reserves" ? (
          <AdminReserves />
        ) : (
          <AdminNotifications />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
