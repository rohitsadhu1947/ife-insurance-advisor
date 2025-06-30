import React, { useState } from 'react';
import CustomerForm from './components/CustomerForm';
import ProductsList from './components/ProductsList';
import NeedsAnalysis from './components/NeedsAnalysis';
import Recommendations from './components/Recommendations';
import ProductComparison from './components/ProductComparison';
import PDFReports from './components/PDFReports';
import InflationCalculator from './components/InflationCalculator';
import MarketData from './components/MarketData';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import { apiService } from './services/api';
import type { Customer } from './services/api';

type ViewType = 'customer' | 'products' | 'needs-analysis' | 'recommendations' | 'product-comparison' | 'pdf-reports' | 'inflation-calculator' | 'market-data' | 'analytics-dashboard';

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('customer');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [currentCustomerId, setCurrentCustomerId] = useState<number | null>(null);

  const handleCustomerSubmit = async (customer: Customer) => {
    try {
      setLoading(true);
      setMessage(null);
      const savedCustomer = await apiService.createCustomer(customer);
      setCurrentCustomerId(savedCustomer.id!);
      setMessage({ type: 'success', text: 'Customer saved successfully! Generating needs analysis...' });
      setCurrentView('needs-analysis');
    } catch (error) {
      console.error('Error saving customer:', error);
      setMessage({ type: 'error', text: 'Failed to save customer. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleBackToCustomer = () => {
    setCurrentView('customer');
    setMessage(null);
  };

  const handleBackToProducts = () => {
    setCurrentView('products');
    setMessage(null);
  };

  const handleShowRecommendations = () => {
    setCurrentView('recommendations');
  };

  const handleBackToNeedsAnalysis = () => {
    setCurrentView('needs-analysis');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Life Insurance Advisor
            </h1>
            <div className="flex space-x-4">
              <button
                onClick={() => setCurrentView('customer')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'customer'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Customer Info
              </button>
              <button
                onClick={() => setCurrentView('products')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'products'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Products
              </button>
              <button
                onClick={() => setCurrentView('product-comparison')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'product-comparison'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Compare Products
              </button>
              <button
                onClick={() => setCurrentView('pdf-reports')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'pdf-reports'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                PDF Reports
              </button>
              <button
                onClick={() => setCurrentView('inflation-calculator')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'inflation-calculator'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Inflation Calculator
              </button>
              <button
                onClick={() => setCurrentView('market-data')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'market-data'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Market Data
              </button>
              <button
                onClick={() => setCurrentView('analytics-dashboard')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'analytics-dashboard'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Analytics Dashboard
              </button>
              {currentCustomerId && (
                <>
                  <button
                    onClick={() => setCurrentView('needs-analysis')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      currentView === 'needs-analysis'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Needs Analysis
                  </button>
                  <button
                    onClick={() => setCurrentView('recommendations')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      currentView === 'recommendations'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Recommendations
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        {/* Content */}
        {currentView === 'customer' ? (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Customer Information</h2>
            <CustomerForm onSubmit={handleCustomerSubmit} loading={loading} />
          </div>
        ) : currentView === 'products' ? (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Available Products</h2>
            <ProductsList />
          </div>
        ) : currentView === 'product-comparison' ? (
          <ProductComparison />
        ) : currentView === 'pdf-reports' ? (
          <PDFReports apiBaseUrl="http://localhost:8000" />
        ) : currentView === 'needs-analysis' ? (
          currentCustomerId && (
            <NeedsAnalysis 
              customerId={currentCustomerId} 
              onBack={handleBackToCustomer} 
            />
          )
        ) : currentView === 'inflation-calculator' ? (
          <InflationCalculator apiBaseUrl="http://localhost:8000" />
        ) : currentView === 'market-data' ? (
          <MarketData apiBaseUrl="http://localhost:8000" />
        ) : currentView === 'analytics-dashboard' ? (
          <AnalyticsDashboard apiBaseUrl="http://localhost:8000" />
        ) : (
          currentCustomerId && (
            <Recommendations
              customerId={currentCustomerId}
              onBack={handleBackToNeedsAnalysis}
            />
          )
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-500 text-sm">
            © 2024 Life Insurance Advisor. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
