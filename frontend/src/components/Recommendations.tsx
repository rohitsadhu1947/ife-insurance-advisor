import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';

interface RecommendationsProps {
  customerId: number;
  onBack: () => void;
}

interface Recommendation {
  id: number;
  product_id: number;
  sum_assured: number;
  premium_amount: number;
  policy_term: number;
  premium_paying_term: number;
  premium_frequency: string;
  reasoning: string;
  priority: string;
  product: {
    name: string;
    insurer: {
      name: string;
      logo_url?: string;
    };
    product_type: string;
    min_age: number;
    max_age: number;
    min_sum_assured: number;
    max_sum_assured: number;
  };
}

const Recommendations: React.FC<RecommendationsProps> = ({ customerId, onBack }) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const data = await apiService.getRecommendations(customerId);
        setRecommendations(data);
      } catch (err) {
        setError('Failed to fetch recommendations');
        console.error('Error fetching recommendations:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendations();
  }, [customerId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
          <p className="text-red-600">{error}</p>
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
      <div className="text-center">
        <button
          onClick={onBack}
          className="mb-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
        >
          ← Back to Needs Analysis
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Recommended Insurance Products
        </h1>
        <p className="text-lg text-gray-600">
          Our top picks for your profile
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {recommendations.map((rec, idx) => (
          <div
            key={rec.id}
            className={`relative bg-white rounded-xl shadow-lg p-6 border-2 ${
              idx === 0 ? 'border-green-500' : 'border-gray-200'
            }`}
          >
            {idx === 0 && (
              <span className="absolute top-4 right-4 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                Best Match
              </span>
            )}
            <div className="flex items-center mb-4">
              {rec.product.insurer.logo_url && (
                <img
                  src={rec.product.insurer.logo_url}
                  alt={rec.product.insurer.name}
                  className="h-10 w-10 object-contain rounded-full mr-3 border"
                />
              )}
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {rec.product.name}
                </h2>
                <p className="text-sm text-gray-600">{rec.product.insurer.name}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-xs text-gray-500">Sum Assured</div>
                <div className="text-lg font-semibold text-blue-700">
                  {formatCurrency(rec.sum_assured)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Premium (Annual)</div>
                <div className="text-lg font-semibold text-green-700">
                  {formatCurrency(rec.premium_amount)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Policy Term</div>
                <div className="text-lg text-gray-900">
                  {rec.policy_term} yrs
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Type</div>
                <div className="text-lg text-gray-900 capitalize">
                  {rec.product.product_type.replace('_', ' ')}
                </div>
              </div>
            </div>
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-1">Why this product?</h4>
              <p className="text-sm text-gray-700">{rec.reasoning}</p>
            </div>
            <div className="flex gap-2">
              <button className="btn-primary">View Details</button>
              <button className="btn-secondary">Compare</button>
              <button className="btn-secondary">Calculate Premium</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Recommendations; 