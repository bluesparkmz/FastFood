// FastFood API Types for SkyVenda

export interface Drink {
  id: number;
  name: string;
  stock: number;
  price: number;
  photo: string | null;
}

export interface CatalogProduct {
  id: number;
  name: string;
  description: string | null;
  category: string | null;
  price: number;
  image: string | null;
  emoji: string | null;
  is_fastfood: boolean;
  is_available?: boolean;
}

export interface MenuItem extends CatalogProduct { }

export interface Restaurant {
  id: number;
  name: string;
  cover_image: string | null;
  province: string | null;
  district: string | null;
  images: string | null;
  location_google_maps: string | null;
  neighborhood: string | null;
  avenue: string | null;
  min_delivery_value: number;
  opening_time: string | null;
  closing_time: string | null;
  open_days: string | null;
  user_id: number | null;
  category: string | null;
  slug: string | null;
  latitude: number | null;
  longitude: number | null;
  is_open: boolean;
  is_disabled?: boolean;
  rating: number;
  total_reviews: number;
  likes: number;
  user_liked: boolean | null;
  catalog?: CatalogProduct[];
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id?: number;
  item_type: 'menu_item' | 'drink';
  item_id: number;
  quantity: number;
  price?: number;
  name?: string; // Added for frontend cart display
}

export interface FastFoodOrder {
  id: number;
  restaurant_id: number;
  user_id: number;
  customer_name?: string;
  customer_phone?: string;
  status: 'pending' | 'preparing' | 'ready' | 'delivering' | 'completed' | 'cancelled' | 'rejected';
  order_type: 'local' | 'distance';
  total_value: number;
  payment_method: 'cash' | 'skywallet' | 'pos' | 'mpesa';
  payment_status?: 'pending' | 'paid' | 'refunded';
  paid_at?: string | null;
  delivery_address: string | null;
  estimated_delivery_time?: number | null;
  tab_id?: number | null;
  table_id?: number | null;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface OrderDetailedResponse extends FastFoodOrder {
  restaurant_name: string;
  restaurant_phone?: string;
  restaurant_location?: string;
  restaurant_neighborhood?: string;
  restaurant_province?: string;
  customer_name: string;
  customer_phone?: string;
}

export interface SalesOverview {
  total_orders: number;
  total_revenue: number;
  average_order_value: number;
  pending_orders: number;
  completed_orders: number;
  cancelled_orders: number;
}

// Create/Update Schemas
export interface RestaurantCreate {
  name: string;
  cover_image?: string;
  province?: string;
  district?: string;
  images?: string;
  location_google_maps?: string;
  neighborhood?: string;
  avenue?: string;
  min_delivery_value?: number | string;
  opening_time?: string;
  closing_time?: string;
  open_days?: string;
  category?: string;
  slug?: string;
}

export interface RestaurantUpdate {
  name?: string;
  cover_image?: string;
  category?: string;
  slug?: string;
  min_delivery_value?: number;
  opening_time?: string;
  closing_time?: string;
  is_open?: boolean;
}

export interface MenuCreate {
  name: string;
  slug?: string;
}

export interface MenuItemCreate {
  name: string;
  description?: string;
  price: number;
  image?: string;
}

export interface MenuItemUpdate {
  name?: string;
  description?: string;
  price?: number;
  image?: string;
  is_available?: boolean;
}

export interface DrinkCreate {
  name: string;
  stock: number;
  price: number;
  photo?: string;
}

export interface OrderCreate {
  restaurant_id: number;
  order_type: 'local' | 'distance';
  payment_method: 'cash' | 'skywallet' | 'pos' | 'mpesa';
  delivery_address?: string;
  tab_id?: number | null;
  table_id?: number | null;
  items: OrderItem[];
}

export interface OrderStatusUpdate {
  status: 'pending' | 'preparing' | 'ready' | 'delivering' | 'completed' | 'cancelled' | 'rejected';
}

export interface RestaurantReview {
  rating: number;
  comment?: string;
}

// Search & Filter Types
export interface RestaurantSearchParams {
  search?: string;
  category?: string;
  province?: string;
  district?: string;
  is_open?: boolean;
  skip?: number;
  limit?: number;
}

export interface RestaurantDashboardSummary {
  restaurant: Restaurant;
  sales_overview: SalesOverview;
  recent_orders: FastFoodOrder[];
}

// --- Table Management Types ---
export type TableShape = 'square' | 'rectangle' | 'circle';
export type TableStatus = 'available' | 'occupied' | 'reserved';

export interface RestaurantTable {
  id: number;
  restaurant_id: number;
  table_number: string;
  seats: number;
  position_x: number;
  position_y: number;
  shape: TableShape;
  width?: number;
  height?: number;
  status: TableStatus;
  created_at: string;
  updated_at: string;
}

export interface TableCreate {
  table_number: string;
  seats: number;
  shape?: TableShape;
  width?: number;
  height?: number;
  position_x: number;
  position_y: number;
}

export interface TableUpdate {
  table_number?: string;
  seats?: number;
  shape?: TableShape;
  width?: number;
  height?: number;
  status?: TableStatus;
  position_x?: number;
  position_y?: number;
}

export interface TablePositionUpdate {
  position_x: number;
  position_y: number;
}

// --- Customer Account (Tab) Types ---
export interface Tab {
  id: number;
  restaurant_id: number;
  client_name: string;
  client_phone?: string;
  status: 'open' | 'closed';
  current_balance: number;
  created_at: string;
  updated_at: string;
}

export interface TabCreate {
  client_name: string;
  client_phone?: string;
}

export interface TabUpdate {
  client_name?: string;
  client_phone?: string;
  status?: 'open' | 'closed';
}

export interface ExploreFeed {
  featured_products?: (CatalogProduct & {
    restaurant_id: number;
    restaurant_name: string;
    restaurant_slug: string | null;
    restaurant_cover_image: string | null;
  })[];
  popular_restaurants: Restaurant[];
  new_restaurants: Restaurant[];
}
