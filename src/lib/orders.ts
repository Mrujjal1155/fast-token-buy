export interface Order {
  id: string;
  email: string;
  packageId: string;
  credits: number;
  amount: number;
  currency: string;
  paymentMethod: string;
  transactionId: string;
  status: "pending" | "processing" | "completed" | "failed";
  createdAt: string;
}

// In-memory store for demo purposes (replace with DB later)
const orders: Order[] = [];

export function createOrder(data: Omit<Order, "id" | "status" | "createdAt">): Order {
  const order: Order = {
    ...data,
    id: `ORD-${Date.now().toString(36).toUpperCase()}`,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  orders.push(order);
  return order;
}

export function findOrder(query: string): Order | undefined {
  return orders.find(
    (o) => o.id === query || o.email.toLowerCase() === query.toLowerCase()
  );
}

export function getAllOrders(): Order[] {
  return [...orders];
}

export function updateOrderStatus(id: string, status: Order["status"]): Order | undefined {
  const order = orders.find((o) => o.id === id);
  if (order) order.status = status;
  return order;
}
