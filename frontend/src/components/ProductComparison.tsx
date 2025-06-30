import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ShareButton from './ShareButton';

interface Product {
  id: number;
  name: string;
  insurer: {
    name: string;
    rating: number;
    claim_settlement_ratio: number;
  };
  product_type: string;
  features: string[];
  benefits: string[];
  exclusions: string[];
}

interface ProductComparisonResult {
  product_id: number;
  product_name: string;
  insurer_name: string;
  product_type: string;
  premium_amount: number;
  premium_rate_per_1000: number;
  features: string[];
  benefits: string[];
  exclusions: string[];
  rating: number;
  claim_settlement_ratio: number;
  recommendation_score: number;
}

interface ProductComparisonResponse {
  comparison_data: ProductComparisonResult[];
  summary: {
    total_products: number;
    total_premium: number;
    average_premium: number;
    min_premium: number;
    max_premium: number;
    premium_range: number;
    best_value_product: string;
    lowest_premium_product: string;
  };
  recommendations: string[];
  generated_at: string;
}

const ProductComparison: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [customerProfile, setCustomerProfile] = useState({
    age: 30,
    gender: 'male',
    annual_income: 1000000,
    risk_appetite: 'medium'
  });
  const [comparisonParams, setComparisonParams] = useState({
    sum_assured: 5000000,
    policy_term: 20,
    premium_frequency: 'yearly'
  });
  const [comparisonResult, setComparisonResult] = useState<ProductComparisonResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get<Product[]>('http://localhost:8000/products/');
      setProducts(response.data);
    } catch (err) {
      setError('Failed to fetch products');
      console.error('Error fetching products:', err);
    }
  };

  const handleProductSelection = (productId: number) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleCompare = async () => {
    if (selectedProducts.length < 2) {
      setError('Please select at least 2 products to compare');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post<ProductComparisonResponse>('http://localhost:8000/products/compare/', {
        product_ids: selectedProducts,
        customer_profile: customerProfile,
        sum_assured: comparisonParams.sum_assured,
        policy_term: comparisonParams.policy_term,
        premium_frequency: comparisonParams.premium_frequency
      });

      setComparisonResult(response.data);
    } catch (err) {
      setError('Failed to compare products');
      console.error('Error comparing products:', err);
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

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Product Comparison Tool</h2>
        
        {/* Customer Profile Section */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Customer Profile</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
              <input
                type="number"
                value={customerProfile.age}
                onChange={(e) => setCustomerProfile(prev => ({ ...prev, age: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                value={customerProfile.gender}
                onChange={(e) => setCustomerProfile(prev => ({ ...prev, gender: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Annual Income (₹)</label>
              <input
                type="number"
                value={customerProfile.annual_income}
                onChange={(e) => setCustomerProfile(prev => ({ ...prev, annual_income: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Risk Appetite</label>
              <select
                value={customerProfile.risk_appetite}
                onChange={(e) => setCustomerProfile(prev => ({ ...prev, risk_appetite: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
        </div>

        {/* Comparison Parameters */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Comparison Parameters</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sum Assured (₹)</label>
              <input
                type="number"
                value={comparisonParams.sum_assured}
                onChange={(e) => setComparisonParams(prev => ({ ...prev, sum_assured: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Policy Term (Years)</label>
              <input
                type="number"
                value={comparisonParams.policy_term}
                onChange={(e) => setComparisonParams(prev => ({ ...prev, policy_term: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Premium Frequency</label>
              <select
                value={comparisonParams.premium_frequency}
                onChange={(e) => setComparisonParams(prev => ({ ...prev, premium_frequency: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="yearly">Yearly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Selection */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Select Products to Compare</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedProducts.includes(product.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onClick={() => handleProductSelection(product.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-800">{product.name}</h4>
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.id)}
                    onChange={() => {}}
                    className="h-4 w-4 text-blue-600"
                  />
                </div>
                <p className="text-sm text-gray-600">{product.insurer.name}</p>
                <p className="text-xs text-gray-500 capitalize">{product.product_type.replace('_', ' ')}</p>
                <div className="mt-2 flex items-center space-x-2">
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    ⭐ {product.insurer.rating}/10
                  </span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    📊 {product.insurer.claim_settlement_ratio}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Compare Button */}
        <div className="flex justify-center">
          <button
            onClick={handleCompare}
            disabled={loading || selectedProducts.length < 2}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Comparing...' : 'Compare Products'}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
      </div>

      {/* Comparison Results */}
      {comparisonResult && (
        <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Comparison Results</h3>
          
          {/* Summary */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-700 mb-3">Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Total Products</p>
                <p className="text-lg font-semibold">{comparisonResult.summary.total_products}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Average Premium</p>
                <p className="text-lg font-semibold">{formatCurrency(comparisonResult.summary.average_premium)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Premium Range</p>
                <p className="text-lg font-semibold">{formatCurrency(comparisonResult.summary.premium_range)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Best Value</p>
                <p className="text-lg font-semibold text-green-600">{comparisonResult.summary.best_value_product}</p>
              </div>
            </div>
          </div>

          {/* Product Comparison Table */}
          <div className="mb-6 overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-3 text-left">Product</th>
                  <th className="border border-gray-300 p-3 text-center">Premium</th>
                  <th className="border border-gray-300 p-3 text-center">Rate/1000</th>
                  <th className="border border-gray-300 p-3 text-center">Score</th>
                  <th className="border border-gray-300 p-3 text-center">Rating</th>
                  <th className="border border-gray-300 p-3 text-center">Claim Ratio</th>
                </tr>
              </thead>
              <tbody>
                {comparisonResult.comparison_data.map((product, index) => (
                  <tr key={product.product_id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border border-gray-300 p-3">
                      <div>
                        <p className="font-semibold">{product.product_name}</p>
                        <p className="text-sm text-gray-600">{product.insurer_name}</p>
                        <p className="text-xs text-gray-500 capitalize">{product.product_type.replace('_', ' ')}</p>
                      </div>
                    </td>
                    <td className="border border-gray-300 p-3 text-center font-semibold">
                      {formatCurrency(product.premium_amount)}
                    </td>
                    <td className="border border-gray-300 p-3 text-center">
                      ₹{product.premium_rate_per_1000.toFixed(2)}
                    </td>
                    <td className="border border-gray-300 p-3 text-center">
                      <span className={`px-2 py-1 rounded text-sm font-semibold ${
                        product.recommendation_score >= 15 ? 'bg-green-100 text-green-800' :
                        product.recommendation_score >= 10 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {product.recommendation_score}/20
                      </span>
                    </td>
                    <td className="border border-gray-300 p-3 text-center">
                      ⭐ {product.rating}/10
                    </td>
                    <td className="border border-gray-300 p-3 text-center">
                      {product.claim_settlement_ratio}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Recommendations */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-700 mb-3">Recommendations</h4>
            <div className="space-y-2">
              {comparisonResult.recommendations.map((recommendation, index) => (
                <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-gray-800">{recommendation}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Features Comparison */}
          <div>
            <h4 className="text-lg font-semibold text-gray-700 mb-3">Features Comparison</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {comparisonResult.comparison_data.map((product) => (
                <div key={product.product_id} className="border border-gray-300 rounded-lg p-4">
                  <h5 className="font-semibold text-gray-800 mb-3">{product.product_name}</h5>
                  
                  <div className="mb-4">
                    <h6 className="text-sm font-medium text-gray-700 mb-2">Features</h6>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {product.features.slice(0, 3).map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mb-4">
                    <h6 className="text-sm font-medium text-gray-700 mb-2">Benefits</h6>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {product.benefits.slice(0, 3).map((benefit, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-blue-500 mr-2">→</span>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h6 className="text-sm font-medium text-gray-700 mb-2">Exclusions</h6>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {product.exclusions.slice(0, 2).map((exclusion, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-red-500 mr-2">✗</span>
                          {exclusion}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-col md:flex-row md:items-center gap-4">
            <ShareButton
              shareText={`Insurance Product Comparison for ${customerProfile.age} y/o ${customerProfile.gender}, Income: ₹${customerProfile.annual_income}. Compared: ${comparisonResult.comparison_data.map(p => p.product_name).join(', ')}. Best Value: ${comparisonResult.summary.best_value_product}. See more at:`}
              shareUrl={window.location.href}
              customerName={undefined}
              customerEmail={undefined}
              buttonLabel="Share Comparison"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductComparison; 