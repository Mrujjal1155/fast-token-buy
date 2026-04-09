import type { Tables } from "@/integrations/supabase/types";

type Order = Tables<"orders">;

export const isTimeoutOrder = (order: Order): boolean =>
  order.status === "failed" && (order.admin_notes?.includes("payment timeout") ?? false);

export const getDisplayStatus = (order: Order): string =>
  isTimeoutOrder(order) ? "timeout" : order.status;
