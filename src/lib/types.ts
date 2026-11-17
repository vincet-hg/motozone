export type Category = {
  id: string;
  name: string;
  slug: string;
  position: number;
  description: string;
};

export type ProductCard = {
  id: string;
  slug: string;
  name: string;
  price: number;
  sale_price: number | null;
  final_price: number;
  stock: number;
  images: string[];
};

export type Spec = { label: string; value: string };

export type Product = ProductCard & {
  category_id: string | null;
  description: string;
  specs: Spec[];
  compatibility: string;
  active: boolean;
  updated_at: string;
};

export type OrderStatus = "new" | "confirmed" | "shipped" | "delivered" | "cancelled";

export type Order = {
  id: number;
  customer_name: string;
  phone: string;
  city: string;
  address: string;
  note: string;
  total: number;
  status: OrderStatus;
  created_at: string;
};

export type OrderItem = {
  id: number;
  product_name: string;
  price: number;
  qty: number;
  unit_cost: number;
};

// Admin only. Kept in its own table because customers can read every products column.
export type ProductCost = {
  product_id: string;
  avg_cost: number;
  last_cost: number | null;
  low_stock_at: number;
};

export type Purchase = {
  id: number;
  product_id: string;
  qty: number;
  unit_cost: number;
  supplier: string;
  note: string;
  created_at: string;
};

export type StockAdjustment = {
  id: number;
  product_id: string;
  delta: number;
  reason: string;
  created_at: string;
};

export type AuditEntry = {
  id: number;
  at: string;
  actor: string | null;
  action: "insert" | "update" | "delete";
  entity: string;
  entity_id: string | null;
  details: Record<string, unknown>;
};

export type MonthReport = { month: string; orders: number; units: number; revenue: number; cost: number; profit: number };
export type TopProduct = { product_name: string; units: number; revenue: number; profit: number };

// A homepage slide. Photo, name and price come from the linked product.
export type Promotion = {
  id: string;
  product_id: string;
  title: string;
  description: string;
  badge: string;
  cta_label: string;
  ends_at: string | null;
  active: boolean;
  position: number;
};

export type PromotionSlide = Promotion & { product: ProductCard };

export type Subscriber = { id: number; email: string; created_at: string };
