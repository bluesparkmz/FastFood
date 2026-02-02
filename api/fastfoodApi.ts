import api from './api';
import type {
  Restaurant,
  RestaurantCreate,
  RestaurantUpdate,
  CatalogProduct,
  Drink,
  DrinkCreate,
  FastFoodOrder,
  OrderCreate,
  OrderStatusUpdate,
  OrderDetailedResponse,
  SalesOverview,
  RestaurantSearchParams,
  RestaurantDashboardSummary,
  RestaurantTable,
  TableCreate,
  TableUpdate,
  TablePositionUpdate,
  Tab,
  TabCreate,
  TabUpdate,
  ExploreFeed
} from '@/types/fastfood';

// Restaurant APIs
export const fastfoodApi = {
  // ========== Restaurants ==========
  async createRestaurant(data: RestaurantCreate): Promise<Restaurant> {
    const response = await api.post('/fastfood/restaurants/', data);
    return response.data;
  },

  async getRestaurants(skip = 0, limit = 100, province?: string): Promise<Restaurant[]> {
    const response = await api.get('/fastfood/restaurants/explore', {
      params: { skip, limit, province }
    });
    return response.data;
  },

  async getMyRestaurants(): Promise<Restaurant[]> {
    const response = await api.get('/fastfood/restaurants/mine');
    return response.data;
  },

  async getRestaurant(id: number): Promise<Restaurant> {
    const response = await api.get(`/fastfood/restaurants/${id}`);
    return response.data;
  },

  async getRestaurantBySlug(slug: string): Promise<Restaurant> {
    const response = await api.get(`/fastfood/restaurants/s/${slug}`);
    return response.data;
  },

  async searchRestaurants(params: RestaurantSearchParams): Promise<Restaurant[]> {
    const response = await api.get('/fastfood/restaurants/search/', { params });
    return response.data;
  },

  async updateRestaurant(id: number, data: RestaurantUpdate): Promise<Restaurant> {
    const response = await api.put(`/fastfood/restaurants/${id}`, data);
    return response.data;
  },

  async toggleRestaurantStatus(id: number): Promise<{ message: string; is_open: boolean }> {
    const response = await api.post(`/fastfood/restaurants/${id}/toggle`);
    return response.data;
  },

  async getRestaurantOverview(id: number): Promise<SalesOverview> {
    const response = await api.get(`/fastfood/restaurants/${id}/overview`);
    return response.data;
  },

  async getPopularItems(id: number, limit = 5): Promise<any[]> {
    const response = await api.get(`/fastfood/restaurants/${id}/popular-items`, {
      params: { limit }
    });
    return response.data;
  },

  async getRestaurantDashboard(id: number): Promise<RestaurantDashboardSummary> {
    const response = await api.get(`/fastfood/restaurants/${id}/dashboard`);
    return response.data;
  },

  async getCatalog(restaurantId: number): Promise<CatalogProduct[]> {
    const response = await api.get(`/fastfood/restaurants/${restaurantId}/catalog`);
    return response.data;
  },


  // ========== Orders ==========
  async createOrder(data: OrderCreate): Promise<FastFoodOrder> {
    const response = await api.post('/fastfood/orders/', data);
    return response.data;
  },

  async getExploreFeed(province?: string): Promise<ExploreFeed> {
    const response = await api.get('/fastfood/explore', {
      params: { province }
    });
    return response.data;
  },

  async getUserOrders(): Promise<FastFoodOrder[]> {
    const response = await api.get('/fastfood/orders/');
    return response.data;
  },

  async getRestaurantOrders(restaurantId: number): Promise<FastFoodOrder[]> {
    const response = await api.get(`/fastfood/restaurants/${restaurantId}/orders/`);
    return response.data;
  },

  async getOrderDetails(orderId: number): Promise<FastFoodOrder> {
    const response = await api.get(`/fastfood/orders/${orderId}`);
    return response.data;
  },

  async acceptOrder(orderId: number): Promise<FastFoodOrder> {
    const response = await api.put(`/fastfood/orders/${orderId}/accept`);
    return response.data;
  },

  async updateOrderStatus(orderId: number, status: OrderStatusUpdate): Promise<FastFoodOrder> {
    const response = await api.put(`/fastfood/orders/${orderId}/status`, status);
    return response.data;
  },

  async completeOrder(orderId: number): Promise<FastFoodOrder> {
    const response = await api.put(`/fastfood/orders/${orderId}/complete`);
    return response.data;
  },

  async cancelOrder(orderId: number): Promise<FastFoodOrder> {
    const response = await api.put(`/fastfood/orders/${orderId}/cancel`);
    return response.data;
  },

  async rejectOrder(orderId: number): Promise<FastFoodOrder> {
    const response = await api.put(`/fastfood/orders/${orderId}/reject`);
    return response.data;
  },

  // ========== Tables ==========
  async getTables(restaurantId: number): Promise<RestaurantTable[]> {
    const response = await api.get(`/fastfood/restaurants/${restaurantId}/tables`);
    return response.data;
  },

  async createTable(restaurantId: number, data: TableCreate): Promise<RestaurantTable> {
    const response = await api.post(`/fastfood/restaurants/${restaurantId}/tables`, data);
    return response.data;
  },

  async updateTable(restaurantId: number, tableId: number, data: TableUpdate): Promise<RestaurantTable> {
    const response = await api.put(`/fastfood/restaurants/${restaurantId}/tables/${tableId}`, data);
    return response.data;
  },

  async updateTablePosition(restaurantId: number, tableId: number, position: TablePositionUpdate): Promise<RestaurantTable> {
    const response = await api.patch(`/fastfood/restaurants/${restaurantId}/tables/${tableId}/position`, position);
    return response.data;
  },

  async deleteTable(restaurantId: number, tableId: number): Promise<{ message: string; success: boolean }> {
    const response = await api.delete(`/fastfood/restaurants/${restaurantId}/tables/${tableId}`);
    return response.data;
  },

  // ========== Tabs (Customer Accounts) ==========
  async createTab(restaurantId: number, data: TabCreate): Promise<Tab> {
    const response = await api.post(`/fastfood/restaurants/${restaurantId}/tabs`, data);
    return response.data;
  },

  async getTabs(restaurantId: number, status?: 'open' | 'closed'): Promise<Tab[]> {
    const response = await api.get(`/fastfood/restaurants/${restaurantId}/tabs`, {
      params: { status }
    });
    return response.data;
  },

  async updateTab(restaurantId: number, tabId: number, data: TabUpdate): Promise<Tab> {
    const response = await api.put(`/fastfood/restaurants/${restaurantId}/tabs/${tabId}`, data);
    return response.data;
  },

  async closeTab(restaurantId: number, tabId: number, paymentMethod?: string): Promise<Tab> {
    return this.updateTab(restaurantId, tabId, { status: 'closed' });
  },

  async getTabOrders(restaurantId: number, tabId: number): Promise<FastFoodOrder[]> {
    const response = await api.get(`/fastfood/restaurants/${restaurantId}/tabs/${tabId}/orders`);
    return response.data;
  },

  // ========== Explorer & Search ==========
  async searchAll(query: string): Promise<{ restaurants: Restaurant[], products: any[] }> {
    const response = await api.get('/fastfood/search/all', {
      params: { q: query }
    });
    return response.data;
  },

  // ========== Profile & Auth ==========
  async getProfile(): Promise<any> {
    const response = await api.get('/user/profile');
    return response.data;
  }
};

export default fastfoodApi;
