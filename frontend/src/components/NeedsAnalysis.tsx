import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

interface NeedsAnalysisProps {
  customerId: number;
  onBack: () => void;
}

interface NeedsAnalysisData {
  customer: {
    name: string;
    age: number;
    annual_income: number;
    family_size: number;
    dependents: number;
    risk_appetite: string;
  };
  needs_analysis: {
    human_life_value: number;
    recommended_coverage: number;
    additional_coverage_needed: number;
    breakdown: {
      income_replacement: number;
      family_expenses: number;
      emergency_fund: number;
    };
  };
  premium_estimates: {
    term_life: number;
    endowment: number;
    ulip: number;
  };
  recommendations: {
    primary_recommendation: string;
    reasoning: string;
    next_steps: string[];
  };
  market_insights: {
    inflation_impact: string;
    tax_benefits: string;
    claim_settlement: string;
  };
}

const NeedsAnalysis: React.FC<NeedsAnalysisProps> = ({ customerId, onBack }) => {
  const [data, setData] = useState<NeedsAnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const createAndFetchNeedsAnalysis = async () => {
      try {
        setLoading(true);
        // 1. Create needs analysis in DB (persist)
        await apiService.createNeedsAnalysis(customerId);
      } catch (err) {
        // Ignore error if already exists
      }
      try {
        // 2. Fetch enhanced needs analysis for display
        const result = await apiService.getEnhancedNeedsAnalysis(customerId);
        setData(result);
      } catch (err) {
        setError('Failed to fetch needs analysis');
        console.error('Error fetching needs analysis:', err);
      } finally {
        setLoading(false);
      }
    };
    createAndFetchNeedsAnalysis();
  }, [customerId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
          <p className="text-red-600">{error || 'Failed to load needs analysis'}</p>
          <button
            onClick={onBack}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <button
          onClick={onBack}
          className="mb-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
        >
          ← Back to Customer Form
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Insurance Needs Analysis
        </h1>
        <p className="text-lg text-gray-600">
          Personalized analysis for {data.customer.name}
        </p>
      </div>

      {/* Customer Summary Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Customer Profile</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{data.customer.age}</div>
            <div className="text-sm text-gray-600">Age</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(data.customer.annual_income)}</div>
            <div className="text-sm text-gray-600">Annual Income</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{data.customer.family_size}</div>
            <div className="text-sm text-gray-600">Family Size</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 capitalize">{data.customer.risk_appetite}</div>
            <div className="text-sm text-gray-600">Risk Appetite</div>
          </div>
        </div>
      </div>

      {/* Needs Analysis Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Human Life Value */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Human Life Value</h3>
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-sm font-bold">₹</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-green-600 mb-2">
            {formatCurrency(data.needs_analysis.human_life_value)}
          </div>
          <p className="text-sm text-gray-600">
            Your economic value based on future earnings potential
          </p>
        </div>

        {/* Recommended Coverage */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recommended Coverage</h3>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-sm font-bold">🛡️</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {formatCurrency(data.needs_analysis.recommended_coverage)}
          </div>
          <p className="text-sm text-gray-600">
            Total insurance coverage you should consider
          </p>
        </div>

        {/* Additional Coverage Needed */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Additional Coverage</h3>
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-orange-600 text-sm font-bold">+</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-orange-600 mb-2">
            {formatCurrency(data.needs_analysis.additional_coverage_needed)}
          </div>
          <p className="text-sm text-gray-600">
            Additional coverage needed beyond existing policies
          </p>
        </div>
      </div>

      {/* Coverage Breakdown */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Coverage Breakdown</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Income Replacement</h4>
              <p className="text-sm text-gray-600">12 months of income for family support</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-gray-900">
                {formatCurrency(data.needs_analysis.breakdown.income_replacement)}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Family Expenses</h4>
              <p className="text-sm text-gray-600">10 years of support for dependents</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-gray-900">
                {formatCurrency(data.needs_analysis.breakdown.family_expenses)}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Emergency Fund</h4>
              <p className="text-sm text-gray-600">10% of annual income for emergencies</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-gray-900">
                {formatCurrency(data.needs_analysis.breakdown.emergency_fund)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Estimates */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Premium Estimates (Annual)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Term Life</h4>
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {formatCurrency(data.premium_estimates.term_life)}
            </div>
            <p className="text-sm text-blue-700">Pure protection, lowest premium</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-2">Endowment</h4>
            <div className="text-2xl font-bold text-green-600 mb-2">
              {formatCurrency(data.premium_estimates.endowment)}
            </div>
            <p className="text-sm text-green-700">Protection + savings</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <h4 className="font-semibold text-purple-900 mb-2">ULIP</h4>
            <div className="text-2xl font-bold text-purple-600 mb-2">
              {formatCurrency(data.premium_estimates.ulip)}
            </div>
            <p className="text-sm text-purple-700">Protection + investment</p>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Our Recommendation</h2>
        <div className="mb-4">
          <div className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium mb-2">
            {data.recommendations.primary_recommendation === 'term_life' ? 'Term Life Insurance' : 'ULIP'}
          </div>
          <p className="text-gray-700">{data.recommendations.reasoning}</p>
        </div>
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Next Steps:</h4>
          <ul className="space-y-1">
            {data.recommendations.next_steps.map((step, index) => (
              <li key={index} className="flex items-center text-gray-700">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                {step}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Market Insights */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Market Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-yellow-50 rounded-lg">
            <h4 className="font-medium text-yellow-900 mb-2">Inflation Impact</h4>
            <p className="text-sm text-yellow-800">{data.market_insights.inflation_impact}</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Tax Benefits</h4>
            <p className="text-sm text-blue-800">{data.market_insights.tax_benefits}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Claim Settlement</h4>
            <p className="text-sm text-green-800">{data.market_insights.claim_settlement}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors">
          Download Full Report
        </button>
        <button className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors">
          Schedule Consultation
        </button>
        <button className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors">
          Compare Products
        </button>
      </div>
    </div>
  );
};

export default NeedsAnalysis; 