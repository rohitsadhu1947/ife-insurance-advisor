import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import type { Product } from '../services/api';

const ProductsList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await apiService.getProducts();
        setProducts(data);
      } catch (err) {
        setError('Failed to fetch products');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-lg text-gray-600">Loading products...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">{error}</div>
        <button 
          onClick={() => window.location.reload()} 
          className="btn-primary"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Available Insurance Products</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="card hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
              <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {product.product_type}
              </span>
            </div>
            
            <p className="text-gray-600 mb-4 line-clamp-3">{product.description}</p>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Min Age:</span>
                <span className="font-medium">{product.min_age} years</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Max Age:</span>
                <span className="font-medium">{product.max_age} years</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Min Premium:</span>
                <span className="font-medium">₹{product.min_premium.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Max Sum Assured:</span>
                <span className="font-medium">₹{product.max_sum_assured.toLocaleString()}</span>
              </div>
            </div>

            {product.insurer && (
              <div className="border-t pt-3">
                <div className="text-sm text-gray-500">Insurer</div>
                <div className="font-medium text-gray-800">{product.insurer.name}</div>
              </div>
            )}

            <div className="mt-4">
              <button className="btn-primary w-full">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductsList; 