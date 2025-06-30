import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Customer {
  id?: number;
  name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  occupation: string;
  annual_income: number;
  family_size: number;
  dependents: number;
  existing_insurance: any;
  health_conditions: string[];
  lifestyle_factors: string[];
  risk_appetite: 'low' | 'medium' | 'high';
  investment_goals: string[];
  created_at?: string;
  updated_at?: string;
}

export interface Insurer {
  id: number;
  name: string;
  logo_url?: string;
  website?: string;
  customer_care?: string;
  claim_settlement_ratio?: number;
  solvency_ratio?: number;
  irda_registration?: string;
  established_year?: number;
  headquarters?: string;
  rating?: string;
  rating_agency?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Product {
  id: number;
  name: string;
  insurer_id: number;
  product_type: string;
  description: string;
  features: string[];
  benefits: string[];
  exclusions: string[];
  min_age: number;
  max_age: number;
  min_sum_assured: number;
  max_sum_assured: number;
  min_premium: number;
  max_premium: number;
  premium_frequency: string[];
  policy_term_options: number[];
  premium_paying_term_options: number[];
  is_active: boolean;
  insurer?: Insurer;
  created_at?: string;
  updated_at?: string;
}

export const apiService = {
  // Customer endpoints
  createCustomer: async (customer: Customer): Promise<Customer> => {
    const response = await api.post<Customer>('/customers/', customer);
    return response.data;
  },

  getCustomer: async (id: number): Promise<Customer> => {
    const response = await api.get<Customer>(`/customers/${id}`);
    return response.data;
  },

  // Insurer endpoints
  getInsurers: async (): Promise<Insurer[]> => {
    const response = await api.get<Insurer[]>('/insurers/');
    return response.data;
  },

  // Product endpoints
  getProducts: async (): Promise<Product[]> => {
    const response = await api.get<Product[]>('/products/');
    return response.data;
  },

  getProduct: async (id: number): Promise<Product> => {
    const response = await api.get<Product>(`/products/${id}`);
    return response.data;
  },

  async getEnhancedNeedsAnalysis(customerId: number) {
    const response = await api.get(`/needs-analysis/enhanced/?customer_id=${customerId}`);
    return response.data;
  },

  async getRecommendations(customerId: number) {
    const response = await api.post(`/recommendations/generate/?customer_id=${customerId}`);
    return response.data;
  },

  async createNeedsAnalysis(customerId: number) {
    // Fetch customer data
    const response = await api.get<Customer>(`/customers/${customerId}`);
    const customer = response.data;
    // Build CalculatorInput
    const calculatorInput = {
      customer_id: customer.id,
      calculation_type: 'comprehensive',
      age: customer.age,
      gender: customer.gender,
      annual_income: customer.annual_income,
      family_size: customer.family_size,
      dependents: customer.dependents,
      existing_coverage: customer.existing_insurance?.total || 0,
      debt_obligations: 0,
      children_education_needs: 0,
      retirement_needs: 0,
      inflation_rate: 6.0,
      return_rate: 8.0
    };
    // Post to /needs-analysis/
    return api.post('/needs-analysis/', calculatorInput);
  },
};

export default api; 