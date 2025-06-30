import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ShareButton from './ShareButton';

interface Customer {
  id: number;
  name: string;
  email: string;
  age: number;
  annual_income: number;
  family_size: number;
}

interface PDFReportsProps {
  apiBaseUrl: string;
}

const PDFReports: React.FC<PDFReportsProps> = ({ apiBaseUrl }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${apiBaseUrl}/customers/`);
      setCustomers(response.data as Customer[]);
    } catch (err) {
      setError('Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async (reportType: string) => {
    if (!selectedCustomer) return;
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      let url: string;
      let response: any;

      if (reportType === 'needs-analysis') {
        url = `${apiBaseUrl}/pdf/needs-analysis/${selectedCustomer}`;
        response = await axios.get(url, { responseType: 'blob' });
      } else if (reportType === 'comprehensive') {
        url = `${apiBaseUrl}/pdf/comprehensive-report/${selectedCustomer}`;
        response = await axios.get(url, { responseType: 'blob' });
      } else {
        throw new Error('Invalid report type');
      }

      // Create download link
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url_download = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url_download;
      
      const customer = customers.find(c => c.id === selectedCustomer);
      const customerName = customer ? customer.name.replace(/\s+/g, '_') : 'customer';
      const timestamp = new Date().toISOString().split('T')[0];
      
      if (reportType === 'needs-analysis') {
        link.download = `needs_analysis_${customerName}_${timestamp}.pdf`;
      } else {
        link.download = `comprehensive_report_${customerName}_${timestamp}.pdf`;
      }
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url_download);

      setSuccess(`${reportType.replace('-', ' ')} PDF generated successfully!`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to generate PDF');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          📄 PDF Report Generation
        </h2>
        
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">
            Select Customer
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customers.map((customer) => (
              <div
                key={customer.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedCustomer === customer.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
                onClick={() => setSelectedCustomer(customer.id)}
              >
                <h4 className="font-semibold text-gray-800">{customer.name}</h4>
                <p className="text-sm text-gray-600">{customer.email}</p>
                <div className="mt-2 text-xs text-gray-500">
                  <span>Age: {customer.age}</span>
                  <span className="mx-2">•</span>
                  <span>Income: ₹{(customer.annual_income / 100000).toFixed(1)}L</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedCustomer && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">
                  📊 Needs Analysis Report
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  Comprehensive insurance needs assessment with recommendations.
                </p>
                <div className="flex gap-2 items-center">
                  <button
                    onClick={() => generatePDF('needs-analysis')}
                    disabled={loading}
                    className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Generating...' : 'Generate PDF'}
                  </button>
                  <ShareButton
                    shareText={`Check out this Needs Analysis Report for ${customers.find(c => c.id === selectedCustomer)?.name || 'Customer'} (Age: ${customers.find(c => c.id === selectedCustomer)?.age}, Income: ₹${customers.find(c => c.id === selectedCustomer)?.annual_income}). Download your personalized report at:`}
                    shareUrl={window.location.href}
                    customerName={customers.find(c => c.id === selectedCustomer)?.name}
                    customerEmail={customers.find(c => c.id === selectedCustomer)?.email}
                    buttonLabel="Share"
                  />
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">
                  📋 Comprehensive Report
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  Complete insurance portfolio analysis with market insights.
                </p>
                <div className="flex gap-2 items-center">
                  <button
                    onClick={() => generatePDF('comprehensive')}
                    disabled={loading}
                    className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {loading ? 'Generating...' : 'Generate PDF'}
                  </button>
                  <ShareButton
                    shareText={`Comprehensive Insurance Report for ${customers.find(c => c.id === selectedCustomer)?.name || 'Customer'} (Age: ${customers.find(c => c.id === selectedCustomer)?.age}, Income: ₹${customers.find(c => c.id === selectedCustomer)?.annual_income}). Download your personalized report at:`}
                    shareUrl={window.location.href}
                    customerName={customers.find(c => c.id === selectedCustomer)?.name}
                    customerEmail={customers.find(c => c.id === selectedCustomer)?.email}
                    buttonLabel="Share"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-700">{success}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFReports; 