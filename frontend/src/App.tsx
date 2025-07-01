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
import Customer360 from './components/Customer360';
import { apiService } from './services/api';
import type { Customer } from './services/api';

type ViewType = 'analytics-dashboard' | 'customer' | 'customers-360' | 'products' | 'needs-analysis' | 'recommendations' | 'product-comparison' | 'pdf-reports' | 'inflation-calculator' | 'market-data';

interface MenuItem {
  id: ViewType;
  label: string;
  icon: string;
  description: string;
  category: 'main' | 'customer' | 'tools' | 'analytics';
}

const menuItems: MenuItem[] = [
  {
    id: 'analytics-dashboard',
    label: 'Analytics Dashboard',
    icon: '📊',
    description: 'View business insights and performance metrics',
    category: 'analytics'
  },
  {
    id: 'customers-360',
    label: 'Customers 360°',
    icon: '👥',
    description: 'Comprehensive customer management and insights',
    category: 'main'
  },
  {
    id: 'customer',
    label: 'New Customer',
    icon: '➕',
    description: 'Add a new customer to the system',
    category: 'customer'
  },
  {
    id: 'products',
    label: 'Products Catalog',
    icon: '📋',
    description: 'Browse available insurance products',
    category: 'main'
  },
  {
    id: 'product-comparison',
    label: 'Compare Products',
    icon: '⚖️',
    description: 'Compare different insurance products side by side',
    category: 'tools'
  },
  {
    id: 'pdf-reports',
    label: 'PDF Reports',
    icon: '📄',
    description: 'Generate and download PDF reports',
    category: 'tools'
  },
  {
    id: 'inflation-calculator',
    label: 'Inflation Calculator',
    icon: '🧮',
    description: 'Calculate inflation-adjusted returns',
    category: 'tools'
  },
  {
    id: 'market-data',
    label: 'Market Data',
    icon: '📈',
    description: 'View market trends and data',
    category: 'analytics'
  }
];

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('analytics-dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
    setIsMenuOpen(false);
    setMessage(null);
  };

  const handleGoToProductComparison = () => {
    setCurrentView('product-comparison');
  };

  const getCurrentMenuItem = () => {
    return menuItems.find(item => item.id === currentView) || menuItems[0];
  };

  const getMenuItemsByCategory = (category: string) => {
    return menuItems.filter(item => item.category === category);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo and Title */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">LI</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Life Insurance Advisor</h1>
                  <p className="text-sm text-gray-500">Professional Insurance Solutions</p>
                </div>
              </div>
            </div>

            {/* Current Page Title */}
            <div className="hidden md:flex items-center space-x-2">
              <span className="text-2xl">{getCurrentMenuItem().icon}</span>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{getCurrentMenuItem().label}</h2>
                <p className="text-sm text-gray-500">{getCurrentMenuItem().description}</p>
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-500">
                <span>Welcome back!</span>
              </div>
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">A</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Menu */}
        <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="flex flex-col h-full">
            {/* Menu Header */}
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Navigation</h3>
              <p className="text-sm text-gray-500 mt-1">Choose your destination</p>
            </div>

            {/* Menu Items */}
            <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
              {/* Analytics Section */}
              <div>
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Analytics</h4>
                <div className="space-y-2">
                  {getMenuItemsByCategory('analytics').map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleViewChange(item.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                        currentView === item.id
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <div className="flex-1">
                        <div className="font-medium">{item.label}</div>
                        <div className={`text-xs ${currentView === item.id ? 'text-blue-100' : 'text-gray-500'}`}>
                          {item.description}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Section */}
              <div>
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Main</h4>
                <div className="space-y-2">
                  {getMenuItemsByCategory('main').map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleViewChange(item.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                        currentView === item.id
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <div className="flex-1">
                        <div className="font-medium">{item.label}</div>
                        <div className={`text-xs ${currentView === item.id ? 'text-blue-100' : 'text-gray-500'}`}>
                          {item.description}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Customer Section */}
              <div>
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Customer</h4>
                <div className="space-y-2">
                  {getMenuItemsByCategory('customer').map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleViewChange(item.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                        currentView === item.id
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <div className="flex-1">
                        <div className="font-medium">{item.label}</div>
                        <div className={`text-xs ${currentView === item.id ? 'text-blue-100' : 'text-gray-500'}`}>
                          {item.description}
                        </div>
                      </div>
                    </button>
                  ))}
                  
                  {/* Conditional Customer Items */}
                  {currentCustomerId && (
                    <>
                      <button
                        onClick={() => handleViewChange('needs-analysis')}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                          currentView === 'needs-analysis'
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <span className="text-lg">📊</span>
                        <div className="flex-1">
                          <div className="font-medium">Needs Analysis</div>
                          <div className={`text-xs ${currentView === 'needs-analysis' ? 'text-blue-100' : 'text-gray-500'}`}>
                            Analyze customer insurance needs
                          </div>
                        </div>
                      </button>
                      
                      <button
                        onClick={() => handleViewChange('recommendations')}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                          currentView === 'recommendations'
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <span className="text-lg">💡</span>
                        <div className="flex-1">
                          <div className="font-medium">Recommendations</div>
                          <div className={`text-xs ${currentView === 'recommendations' ? 'text-blue-100' : 'text-gray-500'}`}>
                            View personalized recommendations
                          </div>
                        </div>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Tools Section */}
              <div>
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Tools</h4>
                <div className="space-y-2">
                  {getMenuItemsByCategory('tools').map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleViewChange(item.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                        currentView === item.id
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <div className="flex-1">
                        <div className="font-medium">{item.label}</div>
                        <div className={`text-xs ${currentView === item.id ? 'text-blue-100' : 'text-gray-500'}`}>
                          {item.description}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Chatbot Section */}
              <div className="mt-8">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Tools</h3>
                <ul className="space-y-2">
                  <li>
                    <button
                      className={`flex items-center w-full px-3 py-2 rounded-lg transition hover:bg-blue-100 text-gray-700`}
                      onClick={() => handleViewChange('inflation-calculator')}
                    >
                      <span className="mr-3">📈</span>
                      Inflation Calculator
                    </button>
                  </li>
                  <li>
                    <button
                      className={`flex items-center w-full px-3 py-2 rounded-lg transition hover:bg-blue-100 text-gray-700`}
                      onClick={() => handleViewChange('market-data')}
                    >
                      <span className="mr-3">💹</span>
                      Market Data
                    </button>
                  </li>
                  <li>
                    <button
                      className="flex items-center w-full px-3 py-2 rounded-lg transition hover:bg-blue-100 text-gray-700"
                      onClick={() => window.open('https://gpt.ensuredit.com', '_blank', 'noopener,noreferrer')}
                      title="Open AI Chatbot for customers to get live quotes"
                    >
                      <span className="mr-3">💬</span>
                      AI Chatbot (Get Live Quotes)
                    </button>
                  </li>
                </ul>
              </div>
            </nav>

            {/* Menu Footer */}
            <div className="p-4 border-t border-gray-200">
              <div className="text-center">
                <p className="text-xs text-gray-500">Life Insurance Advisor</p>
                <p className="text-xs text-gray-400">v1.0.0</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {isMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setIsMenuOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Message Display */}
            {message && (
              <div className={`mb-6 p-4 rounded-xl shadow-lg border-l-4 ${
                message.type === 'success' 
                  ? 'bg-green-50 border-green-400 text-green-800' 
                  : 'bg-red-50 border-red-400 text-red-800'
              }`}>
                <div className="flex items-center">
                  <span className="text-lg mr-2">
                    {message.type === 'success' ? '✅' : '❌'}
                  </span>
                  {message.text}
                </div>
              </div>
            )}

            {/* Content */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              {currentView === 'customers-360' ? (
                <Customer360 />
              ) : currentView === 'customer' ? (
                <div className="p-8">
                  <div className="flex items-center space-x-3 mb-8">
                    <span className="text-3xl">➕</span>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">New Customer</h2>
                      <p className="text-gray-500">Add a new customer to the system</p>
                    </div>
                  </div>
                  <CustomerForm onSubmit={handleCustomerSubmit} loading={loading} />
                </div>
              ) : currentView === 'products' ? (
                <div className="p-8">
                  <div className="flex items-center space-x-3 mb-8">
                    <span className="text-3xl">📋</span>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Products Catalog</h2>
                      <p className="text-gray-500">Browse available insurance products</p>
                    </div>
                  </div>
                  <ProductsList />
                </div>
              ) : currentView === 'product-comparison' ? (
                <div className="p-8">
                  <div className="flex items-center space-x-3 mb-8">
                    <span className="text-3xl">⚖️</span>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Compare Products</h2>
                      <p className="text-gray-500">Compare different insurance products side by side</p>
                    </div>
                  </div>
                  <ProductComparison />
                </div>
              ) : currentView === 'pdf-reports' ? (
                <div className="p-8">
                  <div className="flex items-center space-x-3 mb-8">
                    <span className="text-3xl">📄</span>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">PDF Reports</h2>
                      <p className="text-gray-500">Generate and download PDF reports</p>
                    </div>
                  </div>
                  <PDFReports apiBaseUrl="http://localhost:8000" />
                </div>
              ) : currentView === 'needs-analysis' ? (
                currentCustomerId && (
                  <div className="p-8">
                    <div className="flex items-center space-x-3 mb-8">
                      <span className="text-3xl">📊</span>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Needs Analysis</h2>
                        <p className="text-gray-500">Analyze customer insurance needs</p>
                      </div>
                    </div>
                    <NeedsAnalysis 
                      customerId={currentCustomerId} 
                      onBack={handleBackToCustomer} 
                      goToProductComparison={handleGoToProductComparison}
                    />
                  </div>
                )
              ) : currentView === 'inflation-calculator' ? (
                <div className="p-8">
                  <div className="flex items-center space-x-3 mb-8">
                    <span className="text-3xl">🧮</span>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Inflation Calculator</h2>
                      <p className="text-gray-500">Calculate inflation-adjusted returns</p>
                    </div>
                  </div>
                  <InflationCalculator apiBaseUrl="http://localhost:8000" />
                </div>
              ) : currentView === 'market-data' ? (
                <div className="p-8">
                  <div className="flex items-center space-x-3 mb-8">
                    <span className="text-3xl">📈</span>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Market Data</h2>
                      <p className="text-gray-500">View market trends and data</p>
                    </div>
                  </div>
                  <MarketData apiBaseUrl="http://localhost:8000" />
                </div>
              ) : currentView === 'analytics-dashboard' ? (
                <div className="p-8">
                  <div className="flex items-center space-x-3 mb-8">
                    <span className="text-3xl">📊</span>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
                      <p className="text-gray-500">View business insights and performance metrics</p>
                    </div>
                  </div>
                  <AnalyticsDashboard apiBaseUrl="http://localhost:8000" />
                </div>
              ) : (
                currentCustomerId && (
                  <div className="p-8">
                    <div className="flex items-center space-x-3 mb-8">
                      <span className="text-3xl">💡</span>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Recommendations</h2>
                        <p className="text-gray-500">View personalized recommendations</p>
                      </div>
                    </div>
                    <Recommendations
                      customerId={currentCustomerId}
                      onBack={handleBackToNeedsAnalysis}
                    />
                  </div>
                )
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-md border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
              © 2024 Life Insurance Advisor. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <span className="text-gray-400 text-sm">Privacy Policy</span>
              <span className="text-gray-400 text-sm">Terms of Service</span>
              <span className="text-gray-400 text-sm">Support</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
