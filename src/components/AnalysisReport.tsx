import React from 'react';
import { PropertyData } from '../types/Booking';
import { TrendingUp, TrendingDown, DollarSign, Users, Home, Calendar } from 'lucide-react';

interface AnalysisReportProps {
  propertyData: PropertyData;
  propertyName: string;
}

const AnalysisReport: React.FC<AnalysisReportProps> = ({ propertyData, propertyName }) => {
  const metrics = [
    {
      title: 'Total Revenue',
      value: `$${propertyData?.revenue?.toLocaleString() ?? '0'}`,
      icon: DollarSign,
      trend: propertyData?.revenueGrowth ?? 0,
      isPositive: (propertyData?.revenueGrowth ?? 0) >= 0
    },
    {
      title: 'Occupancy Rate',
      value: `${propertyData?.occupancyRate ?? 0}%`,
      icon: Home,
      trend: propertyData?.occupancyGrowth ?? 0,
      isPositive: (propertyData?.occupancyGrowth ?? 0) >= 0
    },
    {
      title: 'Total Bookings',
      value: propertyData?.totalBookings ?? 0,
      icon: Calendar,
      trend: propertyData?.bookingsGrowth ?? 0,
      isPositive: (propertyData?.bookingsGrowth ?? 0) >= 0
    },
    {
      title: 'Unique Guests',
      value: propertyData?.uniqueGuests ?? 0,
      icon: Users,
      trend: propertyData?.guestsGrowth ?? 0,
      isPositive: (propertyData?.guestsGrowth ?? 0) >= 0
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-semibold mb-6">Property Analysis Report</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          const TrendIcon = metric.isPositive ? TrendingUp : TrendingDown;
          
          return (
            <div key={index} className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <Icon className="h-8 w-8 text-blue-600" />
                <div className={`flex items-center ${metric.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  <TrendIcon className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">{Math.abs(metric.trend)}%</span>
                </div>
              </div>
              <h3 className="text-gray-500 text-sm font-medium mb-2">{metric.title}</h3>
              <p className="text-2xl font-semibold">{metric.value}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AnalysisReport;