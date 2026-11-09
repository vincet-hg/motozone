export type Category = {
  id: string;
  name: string;
  slug: string;
  position: number;
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
};
