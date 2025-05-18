import React, { useState } from 'react';
import { TrendingUp, Filter, Calendar, Users, Home, TrendingDown, PiggyBank } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Booking } from '../types/Booking';

interface RevenueChartProps {
  propertyData: { [key: string]: any };
  propertyName: string;
}

const RevenueChart: React.FC<RevenueChartProps> = ({ propertyData, propertyName }) => {
  const [selectedProperty, setSelectedProperty] = useState(propertyName);
  const [selectedMonth, setSelectedMonth] = useState('all');

  const properties = ['All', ...Object.keys(propertyData).filter(name => name !== 'overall')];
  
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

  const getMonthlyStats = () => {
    const data = selectedProperty === 'All' ? propertyData.overall : propertyData[selectedProperty];
    if (!data) return [];

    const allBookings = [...(data.pastBookings || []), ...(data.futureBookings || [])];
    
    const monthlyStats = months.slice(1).map(month => {
      const monthDate = parseISO(`${month.value}-01`);
      const monthKey = format(monthDate, 'yyyy-MM');
      
      const monthBookings = allBookings.filter(booking => {
        const bookingMonth = format(parseISO(booking.dateArrival), 'yyyy-MM');
        return bookingMonth === monthKey;
      });

      const revenue = monthBookings.reduce((sum, booking) => sum + booking.totalAmount, 0);
      const expenses = monthBookings.reduce((sum, booking) => 
        sum + booking.expenses.reduce((expSum, exp) => expSum + exp.amount, 0), 0);

      return {
        month: monthKey,
        revenue,
        expenses,
        profit: revenue - expenses,
        bookings: monthBookings.length,
        nights: monthBookings.reduce((sum, booking) => sum + booking.nights, 0)
      };
    });

    if (selectedMonth === 'all') {
      return monthlyStats;
    }

    return monthlyStats.filter(stat => stat.month === selectedMonth);
  };

  const monthlyStats = getMonthlyStats();
  
  const totalStats = monthlyStats.reduce((acc, stat) => ({
    revenue: acc.revenue + stat.revenue,
    expenses: acc.expenses + stat.expenses,
    profit: acc.profit + stat.profit,
    bookings: acc.bookings + stat.bookings,
    nights: acc.nights + stat.nights
  }), { revenue: 0, expenses: 0, profit: 0, bookings: 0, nights: 0 });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-semibold">Revenue Analysis</h2>
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

      {/* Total Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <h3 className="font-medium text-green-800">Total Income</h3>
          </div>
          <p className="text-2xl font-bold text-green-700">
            €{totalStats.revenue.toLocaleString()}
          </p>
        </div>

        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="h-5 w-5 text-red-600" />
            <h3 className="font-medium text-red-800">Total Expenses</h3>
          </div>
          <p className="text-2xl font-bold text-red-700">
            €{totalStats.expenses.toLocaleString()}
          </p>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <PiggyBank className="h-5 w-5 text-purple-600" />
            <h3 className="font-medium text-purple-800">Total Profit</h3>
          </div>
          <p className="text-2xl font-bold text-purple-700">
            €{totalStats.profit.toLocaleString()}
          </p>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <h3 className="font-medium text-blue-800">Total Bookings</h3>
          </div>
          <p className="text-2xl font-bold text-blue-700">
            {totalStats.bookings}
          </p>
        </div>

        <div className="bg-indigo-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-5 w-5 text-indigo-600" />
            <h3 className="font-medium text-indigo-800">Total Nights</h3>
          </div>
          <p className="text-2xl font-bold text-indigo-700">
            {totalStats.nights}
          </p>
        </div>
      </div>

      {/* Monthly Stats */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="text-lg font-medium">Monthly Statistics</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Month
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Income
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expenses
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Profit
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bookings
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nights
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {monthlyStats.map((stat, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {format(parseISO(stat.month + '-01'), 'MMMM yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <div className="flex items-center justify-end gap-1">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-green-600 font-medium">
                        €{stat.revenue.toLocaleString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <div className="flex items-center justify-end gap-1">
                      <TrendingDown className="h-4 w-4 text-red-500" />
                      <span className="text-red-600 font-medium">
                        €{stat.expenses.toLocaleString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <div className="flex items-center justify-end gap-1">
                      <PiggyBank className="h-4 w-4 text-purple-500" />
                      <span className={`font-medium ${
                        stat.profit > 0 ? 'text-purple-600' : 'text-gray-600'
                      }`}>
                        €{stat.profit.toLocaleString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">{stat.bookings}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Users className="h-4 w-4 text-indigo-500" />
                      <span className="font-medium">{stat.nights}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RevenueChart;