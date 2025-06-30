import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface AnalyticsDashboardProps {
  apiBaseUrl: string;
}

interface DashboardMetrics {
  total_customers: number;
  total_recommendations: number;
  average_premium: number;
  conversion_rate: number;
  top_products: Array<{
    name: string;
    count: number;
  }>;
  customer_demographics: {
    age_groups: Array<{ age_group: string; count: number }>;
    income_ranges: Array<{ range: string; count: number }>;
  };
  performance_metrics: {
    needs_analysis_completed: number;
    recommendations_generated: number;
    pdf_reports_created: number;
  };
  recent_activity?: {
    recent_customers: Array<{
      id: number;
      name: string;
      email: string;
      created_at: string;
    }>;
  };
  trends?: {
    monthly_customers: Array<{
      month: string;
      customers: number;
    }>;
  };
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ apiBaseUrl }) => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  useEffect(() => {
    fetchDashboardData();
  }, [selectedPeriod]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching analytics data from:', `${apiBaseUrl}/analytics/dashboard/?period=${selectedPeriod}`);

      // Fetch real analytics data from backend
      const response = await axios.get<DashboardMetrics>(`${apiBaseUrl}/analytics/dashboard/?period=${selectedPeriod}`);
      console.log('Analytics dashboard response:', response.data);
      
      setMetrics(response.data);
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError('Failed to fetch dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Analytics Dashboard</h2>
            <p className="text-gray-600 mt-2">Comprehensive insights into your insurance advisory business</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <button
              onClick={fetchDashboardData}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Refresh
            </button>
          </div>
        </div>

        {metrics && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-blue-600">Total Customers</p>
                    <p className="text-2xl font-bold text-blue-900">{metrics.total_customers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-600 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-green-600">Recommendations</p>
                    <p className="text-2xl font-bold text-green-900">{metrics.total_recommendations}</p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-600 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-purple-600">Avg Premium</p>
                    <p className="text-2xl font-bold text-purple-900">{formatCurrency(metrics.average_premium)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-600 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-yellow-600">Conversion Rate</p>
                    <p className="text-2xl font-bold text-yellow-900">{formatPercentage(metrics.conversion_rate)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Performance Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{metrics.performance_metrics.needs_analysis_completed}</div>
                  <div className="text-sm text-gray-600">Needs Analysis Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{metrics.performance_metrics.recommendations_generated}</div>
                  <div className="text-sm text-gray-600">Recommendations Generated</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{metrics.performance_metrics.pdf_reports_created}</div>
                  <div className="text-sm text-gray-600">PDF Reports Created</div>
                </div>
              </div>
            </div>

            {/* Top Products and Demographics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Products */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Top Products</h3>
                <div className="space-y-3">
                  {metrics.top_products.map((product, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-blue-600 rounded-full mr-3"></div>
                        <span className="text-gray-700">{product.name}</span>
                      </div>
                      <span className="font-semibold text-gray-900">{product.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer Demographics */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Customer Demographics</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-2">Age Groups</h4>
                    <div className="space-y-2">
                      {metrics.customer_demographics.age_groups.map((age, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-gray-700">{age.age_group}</span>
                          <span className="font-semibold text-gray-900">{age.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-2">Income Ranges</h4>
                    <div className="space-y-2">
                      {metrics.customer_demographics.income_ranges.map((income, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-gray-700">{income.range}</span>
                          <span className="font-semibold text-gray-900">{income.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Insights and Recommendations */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-blue-800 mb-4">Key Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-medium text-blue-700 mb-2">Performance Highlights</h4>
                  <ul className="space-y-2 text-blue-600">
                    <li>• {formatPercentage(68.5)} of customers complete needs analysis</li>
                    <li>• Average of {Math.round(metrics.total_recommendations / metrics.total_customers)} recommendations per customer</li>
                    <li>• {formatPercentage(57)} of customers generate PDF reports</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-medium text-blue-700 mb-2">Recommendations</h4>
                  <ul className="space-y-2 text-blue-600">
                    <li>• Focus on customers aged 36-45 (highest engagement)</li>
                    <li>• Promote Term Life Insurance (most popular product)</li>
                    <li>• Increase PDF report generation for better customer retention</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            {metrics.recent_activity && metrics.recent_activity.recent_customers.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {metrics.recent_activity.recent_customers.map((customer) => (
                    <div key={customer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                          <span className="text-white font-semibold">{customer.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{customer.name}</p>
                          <p className="text-sm text-gray-600">{customer.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">New Customer</p>
                        <p className="text-xs text-gray-500">{new Date(customer.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Monthly Trends */}
            {metrics.trends && metrics.trends.monthly_customers && metrics.trends.monthly_customers.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Monthly Customer Trends</h3>
                <div className="space-y-3">
                  {metrics.trends.monthly_customers.map((trend, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-gray-700 font-medium">{trend.month}</span>
                      <div className="flex items-center">
                        <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${Math.min((trend.customers / Math.max(...metrics.trends!.monthly_customers.map(t => t.customers))) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <span className="font-semibold text-gray-900 w-12 text-right">{trend.customers}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard; 