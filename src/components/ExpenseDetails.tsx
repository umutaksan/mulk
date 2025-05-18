import React, { useState } from 'react';
import { Euro, Filter, Calendar, TrendingDown, Wine, Coffee, Droplets, CreditCard, Receipt, Calculator, Footprints, Package } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface ExpenseDetailsProps {
  expensesByProperty: { [property: string]: { [category: string]: number } };
  totalExpensesByProperty: { [property: string]: number };
  propertyName: string;
  monthlyExpenses: { [property: string]: Array<{ month: string; expenses: { [category: string]: number } }> };
}

const ExpenseDetails: React.FC<ExpenseDetailsProps> = ({
  expensesByProperty,
  totalExpensesByProperty,
  propertyName,
  monthlyExpenses
}) => {
  const [selectedProperty, setSelectedProperty] = useState(propertyName);
  const [selectedMonth, setSelectedMonth] = useState('all');

  const properties = ['All', ...Object.keys(expensesByProperty)];
  
  const months = [
    { value: 'all', label: 'All Months' },
    { value: '2025-01', label: 'January 2025' },
    { value: '2025-02', label: 'February 2025' },
    { value: '2025-03', label: 'March 2025' },
    { value: '2025-04', label: 'April 2025' },
    { value: '2025-05', label: 'May 2025' },
    { value: '2025-06', label: 'June 2025' },
    { value: '2025-07', label: 'July 2025' },
    { value: '2025-08', label: 'August 2025' },
    { value: '2025-09', label: 'September 2025' },
    { value: '2025-10', label: 'October 2025' },
    { value: '2025-11', label: 'November 2025' },
    { value: '2025-12', label: 'December 2025' }
  ];

  const getFilteredExpenses = () => {
    if (selectedMonth === 'all') {
      if (selectedProperty === 'All') {
        // Sum up all expenses across all properties
        const totalExpenses: { [category: string]: number } = {};
        const propertiesToSum = Object.keys(expensesByProperty);
        
        propertiesToSum.forEach(property => {
          const propertyExpenses = expensesByProperty[property] || {};
          Object.entries(propertyExpenses).forEach(([category, amount]) => {
            totalExpenses[category] = (totalExpenses[category] || 0) + amount;
          });
        });
        return totalExpenses;
      }
      return expensesByProperty[selectedProperty] || {};
    }

    // For specific month
    if (selectedProperty === 'All') {
      // Sum up expenses for the selected month across all properties
      const monthlyTotals: { [category: string]: number } = {};
      Object.keys(monthlyExpenses).forEach(property => {
        const monthData = monthlyExpenses[property]?.find(m => m.month === selectedMonth);
        if (monthData) {
          Object.entries(monthData.expenses).forEach(([category, amount]) => {
            monthlyTotals[category] = (monthlyTotals[category] || 0) + amount;
          });
        }
      });
      return monthlyTotals;
    }

    // Get expenses for specific property and month
    const monthData = monthlyExpenses[selectedProperty]?.find(m => m.month === selectedMonth);
    return monthData?.expenses || {};
  };

  const expenses = getFilteredExpenses();

  // Group expenses by category
  const expenseGroups = {
    'Management Fees': {
      'Management-Transaction': expenses['Management-Transaction'] || 0,
      'Management-Commission': expenses['Management-Commission'] || 0,
      'Management-VAT': expenses['Management-VAT'] || 0
    },
    'Welcome Package': {
      'Management-Wine': expenses['Management-Wine'] || 0,
      'Management-Coffee': expenses['Management-Coffee'] || 0,
      'Management-Water': expenses['Management-Water'] || 0,
      'Management-Tea': expenses['Management-Tea'] || 0,
      'Management-Slippers': expenses['Management-Slippers'] || 0
    },
    'Services': {
      'Cleaning': expenses['Cleaning'] || 0
    }
  };

  // Calculate group totals
  const groupTotals = {
    'Management Fees': Object.values(expenseGroups['Management Fees']).reduce((sum, amount) => sum + amount, 0),
    'Welcome Package': Object.values(expenseGroups['Welcome Package']).reduce((sum, amount) => sum + amount, 0),
    'Services': Object.values(expenseGroups['Services']).reduce((sum, amount) => sum + amount, 0)
  };

  const totalExpenses = Object.values(groupTotals).reduce((sum, amount) => sum + amount, 0);

  const getIcon = (category: string) => {
    switch (category) {
      case 'Transaction': return <CreditCard className="h-4 w-4" />;
      case 'Commission': return <Receipt className="h-4 w-4" />;
      case 'VAT': return <Calculator className="h-4 w-4" />;
      case 'Wine': return <Wine className="h-4 w-4" />;
      case 'Coffee': return <Coffee className="h-4 w-4" />;
      case 'Water': return <Droplets className="h-4 w-4" />;
      case 'Tea': return <Coffee className="h-4 w-4" />;
      case 'Slippers': return <Footprints className="h-4 w-4" />;
      case 'Welcome Package': return <Package className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Euro className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-semibold">Expense Analysis</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white rounded-lg shadow px-4 py-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border-none bg-transparent focus:ring-0 text-sm"
            >
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

      {/* Total Expenses Card */}
      <div className="bg-red-50 p-6 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <TrendingDown className="h-6 w-6 text-red-600" />
          <h3 className="text-lg font-medium text-red-800">Total Expenses</h3>
        </div>
        <p className="text-3xl font-bold text-red-700">
          €{totalExpenses.toLocaleString()}
        </p>
      </div>

      {/* Expense Categories */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="text-lg font-medium">Expense Categories</h3>
        </div>
        <div className="p-4 space-y-6">
          {Object.entries(expenseGroups).map(([groupName, categories]) => (
            <div key={groupName} className="space-y-2">
              <div className="flex justify-between items-center p-3 bg-gray-100 rounded-lg">
                <span className="font-semibold">{groupName}</span>
                <span className="text-red-600 font-semibold">€{groupTotals[groupName].toLocaleString()}</span>
              </div>
              <div className="pl-4 space-y-2">
                {Object.entries(categories).map(([category, amount]) => {
                  const displayCategory = category.replace('Management-', '');
                  const icon = getIcon(displayCategory);

                  return (
                    <div key={category} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        {icon}
                        <span className="font-medium">{displayCategory}</span>
                      </div>
                      <span className="text-red-600">€{amount.toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExpenseDetails;