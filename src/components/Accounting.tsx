import React, { useState } from 'react';
import { Calculator, Filter, TrendingUp, TrendingDown, PiggyBank, Calendar, Edit2, Lock, Check } from 'lucide-react';
import { Booking } from '../types/Booking';
import { format, parseISO } from 'date-fns';

interface AccountingProps {
  bookings: Booking[];
  bookingsByProperty: { [property: string]: Booking[] };
  propertyStats: { [property: string]: { income: number; expenses: number } };
  monthlyExpenses: { [property: string]: Array<{ month: string; expenses: { [category: string]: number } }> };
}

const Accounting: React.FC<AccountingProps> = ({
  bookings,
  bookingsByProperty,
  propertyStats,
  monthlyExpenses
}) => {
  const [selectedProperty, setSelectedProperty] = useState<string>('All');
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'yyyy-MM'));
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editedValues, setEditedValues] = useState<{ [key: string]: number }>({});

  const properties = ['All', ...Object.keys(bookingsByProperty)];
  const months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(2025, i, 1);
    return {
      value: format(date, 'yyyy-MM'),
      label: format(date, 'MMMM yyyy')
    };
  });

  const handleEdit = (category: string, amount: number) => {
    setEditingCategory(category);
    setEditingValue(amount.toString());
    setShowPasswordModal(true);
  };

  const handlePasswordSubmit = () => {
    if (password === '290515') {
      setShowPasswordModal(false);
      // Keep editing mode active after password verification
    } else {
      alert('Incorrect password');
      setPassword('');
    }
  };

  const handleSaveEdit = (category: string) => {
    const newValue = parseFloat(editingValue);
    if (!isNaN(newValue)) {
      setEditedValues({ ...editedValues, [category]: newValue });
    }
    setEditingCategory(null);
    setEditingValue('');
  };

  const getFilteredData = () => {
    const propertyBookings = selectedProperty === 'All' 
      ? bookings 
      : bookingsByProperty[selectedProperty] || [];

    const monthlyData = propertyBookings
      .filter(booking => {
        const bookingMonth = booking.dateArrival.substring(0, 7);
        return selectedMonth === 'all' || bookingMonth === selectedMonth;
      })
      .reduce((acc, booking) => {
        // Income
        acc.income += booking.totalAmount;

        // Expenses
        booking.expenses.forEach(expense => {
          const category = expense.category;
          if (!acc.expensesByCategory[category]) {
            acc.expensesByCategory[category] = 0;
          }
          acc.expensesByCategory[category] += expense.amount;
          acc.totalExpenses += expense.amount;
        });

        return acc;
      }, {
        income: 0,
        totalExpenses: 0,
        expensesByCategory: {} as { [category: string]: number }
      });

    // Apply edited values
    Object.entries(editedValues).forEach(([category, value]) => {
      if (monthlyData.expensesByCategory[category]) {
        const diff = value - monthlyData.expensesByCategory[category];
        monthlyData.expensesByCategory[category] = value;
        monthlyData.totalExpenses += diff;
      }
    });

    return monthlyData;
  };

  const data = getFilteredData();
  const profit = data.income - data.totalExpenses;

  return (
    <div className="space-y-6">
      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Lock className="h-5 w-5 text-blue-500" />
              Enter Password
            </h3>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border-gray-300 mb-4"
              placeholder="Enter password to edit"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setEditingCategory(null);
                  setPassword('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calculator className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-semibold">Accounting</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white rounded-lg shadow px-4 py-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border-none bg-transparent focus:ring-0 text-sm"
            >
              <option value="all">All Months</option>
              {months.map(month => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 bg-white rounded-lg shadow px-4 py-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={selectedProperty}
              onChange={(e) => setSelectedProperty(e.target.value)}
              className="border-none bg-transparent focus:ring-0 text-sm"
            >
              {properties.map(property => (
                <option key={property} value={property}>
                  {property}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <h3 className="font-medium">Income</h3>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-green-600">
              €{data.income.toLocaleString()}
            </p>
            <button
              onClick={() => handleEdit('income', data.income)}
              className="p-2 text-gray-500 hover:text-blue-600"
            >
              <Edit2 className="h-4 w-4" />
            </button>
          </div>
          {editingCategory === 'income' && (
            <div className="mt-2 flex items-center gap-2">
              <input
                type="number"
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
                className="rounded-lg border-gray-300 text-sm"
                step="0.01"
              />
              <button
                onClick={() => handleSaveEdit('income')}
                className="p-1 text-green-600 hover:text-green-700"
              >
                <Check className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="h-5 w-5 text-red-600" />
            <h3 className="font-medium">Expenses</h3>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-red-600">
              €{data.totalExpenses.toLocaleString()}
            </p>
            <button
              onClick={() => handleEdit('expenses', data.totalExpenses)}
              className="p-2 text-gray-500 hover:text-blue-600"
            >
              <Edit2 className="h-4 w-4" />
            </button>
          </div>
          {editingCategory === 'expenses' && (
            <div className="mt-2 flex items-center gap-2">
              <input
                type="number"
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
                className="rounded-lg border-gray-300 text-sm"
                step="0.01"
              />
              <button
                onClick={() => handleSaveEdit('expenses')}
                className="p-1 text-green-600 hover:text-green-700"
              >
                <Check className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <PiggyBank className="h-5 w-5 text-purple-600" />
            <h3 className="font-medium">Profit</h3>
          </div>
          <p className="text-2xl font-bold text-purple-600">
            €{profit.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="text-lg font-medium">Expense Breakdown</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {Object.entries(data.expensesByCategory).map(([category, amount]) => (
              <div key={category} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">{category}</span>
                <div className="flex items-center gap-2">
                  <span className="text-red-600">
                    €{(editedValues[category] ?? amount).toLocaleString()}
                  </span>
                  <button
                    onClick={() => handleEdit(category, amount)}
                    className="p-1 text-gray-500 hover:text-blue-600"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                </div>
                {editingCategory === category && (
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="number"
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      className="rounded-lg border-gray-300 text-sm"
                      step="0.01"
                    />
                    <button
                      onClick={() => handleSaveEdit(category)}
                      className="p-1 text-green-600 hover:text-green-700"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Accounting;