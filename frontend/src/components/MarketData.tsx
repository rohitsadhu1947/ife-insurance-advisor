import React, { useState, useEffect } from "react";
import axios from "axios";

interface MarketDataItem {
  id: number;
  insurer_id?: number;
  date: string;
  claim_settlement_ratio?: number;
  rating?: number;
  market_share?: number;
  premium_growth?: number;
  customer_satisfaction?: number;
  inflation_rate: number;
  repo_rate: number;
  gdp_growth: number;
  market_cap: number;
  created_at: string;
}

interface MarketTrends {
  inflation_trend: number;
  repo_rate_trend: number;
  gdp_growth_trend: number;
  market_cap_trend: number;
  top_performers: string[];
  market_insights: string[];
}

interface MarketInsights {
  key_insights: string[];
  recommendations: string[];
  risk_factors: string[];
}

const MarketData: React.FC<{ apiBaseUrl: string }> = ({ apiBaseUrl }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'insights'>('overview');
  const [marketData, setMarketData] = useState<MarketDataItem[]>([]);
  const [trends, setTrends] = useState<MarketTrends | null>(null);
  const [insights, setInsights] = useState<MarketInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMarketData();
  }, []);

  const fetchMarketData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching market data from:', `${apiBaseUrl}/market-data/latest/`);

      // Fetch latest market data
      const latestResponse = await axios.get<MarketDataItem[]>(`${apiBaseUrl}/market-data/latest/`);
      console.log('Latest market data response:', latestResponse.data);
      setMarketData(latestResponse.data);

      // Fetch trends
      const trendsResponse = await axios.get<MarketTrends>(`${apiBaseUrl}/market-data/trends/`);
      console.log('Trends response:', trendsResponse.data);
      setTrends(trendsResponse.data);

      // Fetch insights
      const insightsResponse = await axios.get<MarketInsights>(`${apiBaseUrl}/market-data/insights/`);
      console.log('Insights response:', insightsResponse.data);
      setInsights(insightsResponse.data);

    } catch (err) {
      console.error('Error fetching market data:', err);
      setError('Failed to fetch market data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Market Data & Analytics</h1>
            <p className="text-gray-600 mt-1">Real-time market insights and trends for life insurance industry</p>
          </div>
          <button
            onClick={fetchMarketData}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'overview', name: 'Market Overview', icon: '📊' },
              { id: 'trends', name: 'Trends & Analysis', icon: '📈' },
              { id: 'insights', name: 'Insights', icon: '💡' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Market Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-blue-100 text-sm font-medium">Inflation Rate</p>
                      <p className="text-2xl font-bold">{marketData[0]?.inflation_rate ? formatPercentage(marketData[0].inflation_rate) : 'N/A'}</p>
                    </div>
                    <div className="text-blue-200">
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-green-100 text-sm font-medium">Repo Rate</p>
                      <p className="text-2xl font-bold">{marketData[0]?.repo_rate ? formatPercentage(marketData[0].repo_rate) : 'N/A'}</p>
                    </div>
                    <div className="text-green-200">
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-purple-100 text-sm font-medium">GDP Growth</p>
                      <p className="text-2xl font-bold">{marketData[0]?.gdp_growth ? formatPercentage(marketData[0].gdp_growth) : 'N/A'}</p>
                    </div>
                    <div className="text-purple-200">
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-orange-100 text-sm font-medium">Market Cap</p>
                      <p className="text-2xl font-bold">{marketData[0]?.market_cap ? formatCurrency(marketData[0].market_cap) : 'N/A'}</p>
                    </div>
                    <div className="text-orange-200">
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Market Data Table */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Latest Market Data</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inflation Rate</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Repo Rate</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GDP Growth</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Market Cap</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {marketData.slice(0, 5).map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(item.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatPercentage(item.inflation_rate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatPercentage(item.repo_rate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatPercentage(item.gdp_growth)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(item.market_cap)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Trends Tab */}
          {activeTab === 'trends' && trends && (
            <div className="space-y-6">
              {/* Trend Indicators */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Trends</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Inflation Trend</span>
                      <span className={`text-sm font-medium ${trends.inflation_trend > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {trends.inflation_trend > 0 ? '+' : ''}{formatPercentage(trends.inflation_trend)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Repo Rate Trend</span>
                      <span className={`text-sm font-medium ${trends.repo_rate_trend > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {trends.repo_rate_trend > 0 ? '+' : ''}{formatPercentage(trends.repo_rate_trend)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">GDP Growth Trend</span>
                      <span className={`text-sm font-medium ${trends.gdp_growth_trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {trends.gdp_growth_trend > 0 ? '+' : ''}{formatPercentage(trends.gdp_growth_trend)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Market Cap Trend</span>
                      <span className={`text-sm font-medium ${trends.market_cap_trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {trends.market_cap_trend > 0 ? '+' : ''}{formatPercentage(trends.market_cap_trend)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performers</h3>
                  <div className="space-y-2">
                    {trends.top_performers.map((performer, index) => (
                      <div key={index} className="flex items-center">
                        <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mr-3">
                          {index + 1}
                        </span>
                        <span className="text-sm text-gray-900">{performer}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Market Insights */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Insights</h3>
                <div className="space-y-3">
                  {trends.market_insights.map((insight, index) => (
                    <div key={index} className="flex items-start">
                      <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                      <p className="text-sm text-gray-700">{insight}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Insights Tab */}
          {activeTab === 'insights' && insights && (
            <div className="space-y-6">
              {/* Key Insights */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
                <div className="space-y-3">
                  {insights.key_insights.map((insight, index) => (
                    <div key={index} className="flex items-start">
                      <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
                      <p className="text-sm text-gray-700">{insight}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
                <div className="space-y-3">
                  {insights.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start">
                      <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                      <p className="text-sm text-gray-700">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk Factors */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Factors</h3>
                <div className="space-y-3">
                  {insights.risk_factors.map((risk, index) => (
                    <div key={index} className="flex items-start">
                      <div className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full mt-2 mr-3"></div>
                      <p className="text-sm text-gray-700">{risk}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketData; 