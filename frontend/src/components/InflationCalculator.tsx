import React, { useState } from 'react';
import axios from 'axios';

interface InflationCalculatorProps {
  apiBaseUrl: string;
}

interface CalculationResult {
  scenarios: {
    fixed_returns: {
      nominal_value: number;
      inflation_adjusted_value: number;
      real_return_rate: number;
      inflation_impact: number;
    };
    sip_returns: {
      total_investment: number;
      nominal_value: number;
      inflation_adjusted_value: number;
      real_return_rate: number;
      inflation_impact: number;
    };
    step_up_sip: {
      total_investment: number;
      nominal_value: number;
      inflation_adjusted_value: number;
      real_return_rate: number;
      inflation_impact: number;
    };
  };
  yearly_breakdown: Array<{
    year: number;
    investment: number;
    nominal_value: number;
    inflation_adjusted_value: number;
    real_growth: number;
  }>;
  parameters: {
    initial_investment: number;
    monthly_contribution: number;
    investment_period_years: number;
    expected_return_rate: number;
    inflation_rate: number;
    investment_frequency: string;
  };
  insights: {
    inflation_impact_message: string;
    recommendation: string;
    tax_implications: string;
  };
}

const InflationCalculator: React.FC<InflationCalculatorProps> = ({ apiBaseUrl }) => {
  const [formData, setFormData] = useState({
    initial_investment: 100000,
    monthly_contribution: 10000,
    investment_period_years: 20,
    expected_return_rate: 8.0,
    inflation_rate: 6.0,
    investment_frequency: 'monthly'
  });
  
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('rate') || name.includes('years') ? parseFloat(value) : parseInt(value)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${apiBaseUrl}/calculator/inflation-adjusted-returns/`, formData);
      setResult(response.data);
    } catch (err) {
      setError('Failed to calculate inflation-adjusted returns. Please try again.');
      console.error('Error:', err);
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
    return `${value.toFixed(2)}%`;
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Inflation-Adjusted Returns Calculator</h2>
        <p className="text-gray-600 mb-6">
          Calculate how inflation affects your investment returns and compare different investment strategies.
        </p>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Initial Investment (₹)
            </label>
            <input
              type="number"
              name="initial_investment"
              value={formData.initial_investment}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monthly Contribution (₹)
            </label>
            <input
              type="number"
              name="monthly_contribution"
              value={formData.monthly_contribution}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Investment Period (Years)
            </label>
            <input
              type="number"
              name="investment_period_years"
              value={formData.investment_period_years}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
              max="50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expected Return Rate (%)
            </label>
            <input
              type="number"
              name="expected_return_rate"
              value={formData.expected_return_rate}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              max="20"
              step="0.1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Inflation Rate (%)
            </label>
            <input
              type="number"
              name="inflation_rate"
              value={formData.inflation_rate}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              max="15"
              step="0.1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Investment Frequency
            </label>
            <select
              name="investment_frequency"
              value={formData.investment_frequency}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          <div className="md:col-span-2 lg:col-span-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Calculating...' : 'Calculate Returns'}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{error}</p>
          </div>
        )}
      </div>

      {result && (
        <div className="space-y-6">
          {/* Insights Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-blue-800 mb-4">Key Insights</h3>
            <div className="space-y-3">
              <p className="text-blue-700">{result.insights.inflation_impact_message}</p>
              <p className="text-blue-700"><strong>Recommendation:</strong> {result.insights.recommendation}</p>
              <p className="text-blue-700"><strong>Tax Implications:</strong> {result.insights.tax_implications}</p>
            </div>
          </div>

          {/* Scenarios Comparison */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Investment Scenarios Comparison</h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Fixed Returns */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Fixed Returns</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nominal Value:</span>
                    <span className="font-semibold">{formatCurrency(result.scenarios.fixed_returns.nominal_value)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Inflation Adjusted:</span>
                    <span className="font-semibold">{formatCurrency(result.scenarios.fixed_returns.inflation_adjusted_value)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Real Return Rate:</span>
                    <span className="font-semibold">{formatPercentage(result.scenarios.fixed_returns.real_return_rate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Inflation Impact:</span>
                    <span className="font-semibold text-red-600">{formatCurrency(result.scenarios.fixed_returns.inflation_impact)}</span>
                  </div>
                </div>
              </div>

              {/* SIP Returns */}
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">SIP Returns</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Investment:</span>
                    <span className="font-semibold">{formatCurrency(result.scenarios.sip_returns.total_investment)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nominal Value:</span>
                    <span className="font-semibold">{formatCurrency(result.scenarios.sip_returns.nominal_value)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Inflation Adjusted:</span>
                    <span className="font-semibold">{formatCurrency(result.scenarios.sip_returns.inflation_adjusted_value)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Real Return Rate:</span>
                    <span className="font-semibold">{formatPercentage(result.scenarios.sip_returns.real_return_rate)}</span>
                  </div>
                </div>
              </div>

              {/* Step-up SIP */}
              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Step-up SIP</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Investment:</span>
                    <span className="font-semibold">{formatCurrency(result.scenarios.step_up_sip.total_investment)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nominal Value:</span>
                    <span className="font-semibold">{formatCurrency(result.scenarios.step_up_sip.nominal_value)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Inflation Adjusted:</span>
                    <span className="font-semibold">{formatCurrency(result.scenarios.step_up_sip.inflation_adjusted_value)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Real Return Rate:</span>
                    <span className="font-semibold">{formatPercentage(result.scenarios.step_up_sip.real_return_rate)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Yearly Breakdown */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Yearly Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Investment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nominal Value</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inflation Adjusted</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Real Growth</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {result.yearly_breakdown.slice(0, 10).map((year: any) => (
                    <tr key={year.year} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{year.year}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(year.investment)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(year.nominal_value)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(year.inflation_adjusted_value)}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${year.real_growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(year.real_growth)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InflationCalculator; 