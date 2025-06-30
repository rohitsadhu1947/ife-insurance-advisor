import React, { useState } from 'react';
import { apiService } from '../services/api';
import type { Customer } from '../services/api';

interface CustomerFormProps {
  onSubmit: (customer: Customer) => void;
  loading?: boolean;
}

function calculateAge(dob: string): number | null {
  if (!dob) return null;
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age >= 0 ? age : null;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ onSubmit, loading = false }) => {
  const [formData, setFormData] = useState<Partial<Customer>>({
    name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    age: undefined,
    gender: 'male',
    occupation: '',
    annual_income: 0,
    family_size: 1,
    dependents: 0,
    existing_insurance: {},
    health_conditions: [],
    lifestyle_factors: [],
    risk_appetite: 'low',
    investment_goals: [],
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'date_of_birth') {
      const age = calculateAge(value);
      setFormData(prev => ({ ...prev, date_of_birth: value, age: age ?? undefined }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'annual_income' || name === 'family_size' || name === 'dependents' 
          ? parseInt(value) || 0 
          : value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.phone && formData.date_of_birth && formData.age !== undefined) {
      onSubmit(formData as Customer);
    }
  };

  return (
    <div className="card max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Customer Information</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="input-field"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth *
            </label>
            <input
              type="date"
              name="date_of_birth"
              value={formData.date_of_birth}
              onChange={handleInputChange}
              className="input-field"
              required
            />
            {formData.date_of_birth && (
              <div className="mt-2 text-sm text-gray-600">
                Age: <span className="font-semibold">{formData.age ?? '--'}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gender
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className="input-field"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Occupation
            </label>
            <input
              type="text"
              name="occupation"
              value={formData.occupation}
              onChange={handleInputChange}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Annual Income (₹)
            </label>
            <input
              type="number"
              name="annual_income"
              value={formData.annual_income}
              onChange={handleInputChange}
              className="input-field"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Family Size
            </label>
            <input
              type="number"
              name="family_size"
              value={formData.family_size}
              onChange={handleInputChange}
              className="input-field"
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dependents
            </label>
            <input
              type="number"
              name="dependents"
              value={formData.dependents}
              onChange={handleInputChange}
              className="input-field"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Risk Appetite
            </label>
            <select
              name="risk_appetite"
              value={formData.risk_appetite}
              onChange={handleInputChange}
              className="input-field"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Customer'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CustomerForm; 