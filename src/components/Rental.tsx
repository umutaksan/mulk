import React, { useState } from 'react';
import { Home, Download, Calendar, Users, Euro, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react';
import { Booking, ChartData } from '../types/Booking';
import PropertyDetails from './PropertyDetails';

interface RentalProps {
  bookings: Booking[];
  bookingsByProperty: { [property: string]: Booking[] };
  chartData: ChartData | null;
  propertyStats: { [property: string]: { income: number; expenses: number } };
}

const Rental: React.FC<RentalProps> = ({
  bookings,
  bookingsByProperty,
  chartData,
  propertyStats
}) => {
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);

  const properties = Object.keys(bookingsByProperty);

  const calculatePropertyStats = (property: string) => {
    const propertyBookings = bookingsByProperty[property] || [];
    const stats = propertyStats[property] || { income: 0, expenses: 0 };
    const profit = stats.income - stats.expenses;

    const totalBookings = propertyBookings.length;
    const totalGuests = propertyBookings.reduce((sum, b) => sum + b.people, 0);

    return {
      totalBookings,
      totalGuests,
      revenue: stats.income,
      expenses: stats.expenses,
      profit
    };
  };

  if (selectedProperty) {
    const expensesByProperty = chartData?.[selectedProperty]?.expensesByCategory || {};
    const totalExpensesByProperty = Object.values(expensesByProperty).reduce((sum, expense) => sum + expense, 0);

    return (
      <PropertyDetails
        propertyName={selectedProperty}
        bookings={bookings}
        bookingsByProperty={bookingsByProperty}
        propertyStats={propertyStats}
        chartData={chartData || {}}
        monthlyExpenses={{}}
        expensesByProperty={expensesByProperty}
        totalExpensesByProperty={totalExpensesByProperty}
        initialSection="reports"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Home className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-semibold">Properties</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {properties.map(property => {
          const stats = calculatePropertyStats(property);
          
          return (
            <div 
              key={property}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer"
              onClick={() => setSelectedProperty(property)}
            >
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Home className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-medium">{property}</h3>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-gray-600">Total Bookings</span>
                    </div>
                    <span className="text-lg font-semibold text-blue-700">
                      {stats.totalBookings}
                    </span>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="h-4 w-4 text-purple-600" />
                      <span className="text-sm text-gray-600">Total Guests</span>
                    </div>
                    <span className="text-lg font-semibold text-purple-700">
                      {stats.totalGuests}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-800">Revenue</span>
                    </div>
                    <span className="text-xl font-bold text-green-700">
                      €{stats.revenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingDown className="h-5 w-5 text-red-600" />
                      <span className="font-medium text-red-800">Expenses</span>
                    </div>
                    <span className="text-xl font-bold text-red-700">
                      €{stats.expenses.toLocaleString()}
                    </span>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <PiggyBank className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-blue-800">Profit</span>
                    </div>
                    <span className="text-xl font-bold text-blue-700">
                      €{stats.profit.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Rental;