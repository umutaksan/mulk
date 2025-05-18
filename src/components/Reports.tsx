import React, { useState } from 'react';
import { 
  FileBarChart, 
  TrendingUp, 
  Users, 
  Calendar,
  PieChart,
  Download,
  Home,
  Filter,
  TrendingDown,
  PiggyBank,
  Target,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  CheckCircle2,
  Info,
  MapPin,
  Globe,
  Clock,
  CreditCard,
  Star,
  UserCheck,
  Repeat,
  CalendarRange
} from 'lucide-react';
import { Booking, ChartData } from '../types/Booking';
import { Pie, Line } from 'react-chartjs-2';
import { format, parseISO, differenceInDays } from 'date-fns';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement
);

interface ReportsProps {
  bookings: Booking[];
  chartData: ChartData | null;
  propertyStats: { [property: string]: { income: number; expenses: number } };
  bookingsByProperty: { [property: string]: Booking[] };
}

const Reports: React.FC<ReportsProps> = ({
  bookings,
  chartData,
  propertyStats,
  bookingsByProperty
}) => {
  const [selectedProperty, setSelectedProperty] = useState<string>('All');
  const [selectedYear, setSelectedYear] = useState<string>('2025');

  const properties = ['All', ...Object.keys(bookingsByProperty)];

  const ldGuestProperties = [
    'Marbella Old Town',
    'Jardines Tropicales-Puerto Banús',
    'Playa de la Fontanilla Marbella'
  ];

  const ldGuestCommissionProperties = [
    'ALOHA • Garden + Rooftop View Marbella Stay'
  ];

  // Filter bookings based on selected property
  const filteredBookings = selectedProperty === 'All' 
    ? bookings 
    : bookingsByProperty[selectedProperty] || [];

  // Calculate guest analytics
  const guestAnalytics = {
    totalGuests: filteredBookings.reduce((sum, b) => sum + b.people, 0),
    averageGroupSize: filteredBookings.length > 0 
      ? filteredBookings.reduce((sum, b) => sum + b.people, 0) / filteredBookings.length 
      : 0,
    averageStayLength: filteredBookings.length > 0
      ? filteredBookings.reduce((sum, b) => sum + b.nights, 0) / filteredBookings.length
      : 0,
    countries: filteredBookings.reduce((acc, booking) => {
      const country = booking.countryName || 'Unknown';
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    repeatGuests: filteredBookings.reduce((acc, booking) => {
      acc[booking.name] = (acc[booking.name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };

  const topCountries = Object.entries(guestAnalytics.countries)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const repeatGuestCount = Object.values(guestAnalytics.repeatGuests)
    .filter(count => count > 1).length;

  const repeatGuestRate = filteredBookings.length > 0
    ? (repeatGuestCount / Object.keys(guestAnalytics.repeatGuests).length) * 100
    : 0;

  // Calculate booking patterns
  const bookingPatterns = {
    weekdayBookings: filteredBookings.filter(b => 
      new Date(b.dateArrival).getDay() >= 1 && new Date(b.dateArrival).getDay() <= 5
    ).length,
    weekendBookings: filteredBookings.filter(b => 
      new Date(b.dateArrival).getDay() === 0 || new Date(b.dateArrival).getDay() === 6
    ).length,
    advanceBookings: filteredBookings.filter(b => 
      differenceInDays(new Date(b.dateArrival), new Date(b.dateCreated)) > 30
    ).length,
    lastMinuteBookings: filteredBookings.filter(b => 
      differenceInDays(new Date(b.dateArrival), new Date(b.dateCreated)) <= 7
    ).length
  };

  // Calculate revenue metrics
  const revenueMetrics = {
    averageBookingValue: filteredBookings.length > 0
      ? filteredBookings.reduce((sum, b) => sum + b.totalAmount, 0) / filteredBookings.length
      : 0,
    totalRevenue: filteredBookings.reduce((sum, b) => sum + b.totalAmount, 0),
    revenuePerGuest: guestAnalytics.totalGuests > 0
      ? filteredBookings.reduce((sum, b) => sum + b.totalAmount, 0) / guestAnalytics.totalGuests
      : 0
  };

  // Prepare data for guest origin chart with safety checks
  const guestOriginData = {
    labels: topCountries.length > 0 ? topCountries.map(([country]) => country) : ['No Data'],
    datasets: [{
      data: topCountries.length > 0 ? topCountries.map(([, count]) => count) : [1],
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(147, 51, 234, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(245, 158, 11, 0.8)'
      ]
    }]
  };

  // Calculate seasonal trends
  const seasonalTrends = filteredBookings.reduce((acc, booking) => {
    const month = new Date(booking.dateArrival).getMonth();
    if (!acc[month]) {
      acc[month] = {
        bookings: 0,
        revenue: 0,
        occupancyDays: 0
      };
    }
    acc[month].bookings++;
    acc[month].revenue += booking.totalAmount;
    acc[month].occupancyDays += booking.nights;
    return acc;
  }, {} as Record<number, { bookings: number; revenue: number; occupancyDays: number }>);

  // Prepare data for seasonal trends chart
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const seasonalTrendsData = {
    labels: monthNames,
    datasets: [
      {
        label: 'Revenue',
        data: monthNames.map((_, i) => seasonalTrends[i]?.revenue || 0),
        borderColor: 'rgb(59, 130, 246)',
        tension: 0.1
      },
      {
        label: 'Bookings',
        data: monthNames.map((_, i) => seasonalTrends[i]?.bookings || 0),
        borderColor: 'rgb(147, 51, 234)',
        tension: 0.1
      }
    ]
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileBarChart className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-semibold">Comprehensive Performance Analysis</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white rounded-lg shadow px-4 py-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="border-none bg-transparent focus:ring-0 text-sm"
            >
              <option value="2025">2025</option>
              <option value="2024">2024</option>
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
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="h-5 w-5" />
            Export Report
          </button>
        </div>
      </div>

      {/* Guest Analytics Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-6">
          <Users className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-medium">Guest Analytics</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-blue-600" />
              <h4 className="font-medium text-blue-900">Total Guests</h4>
            </div>
            <p className="text-2xl font-bold text-blue-700">
              {guestAnalytics.totalGuests}
            </p>
            <p className="text-sm text-blue-600 mt-1">
              Across all bookings
            </p>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <UserCheck className="h-5 w-5 text-purple-600" />
              <h4 className="font-medium text-purple-900">Average Group Size</h4>
            </div>
            <p className="text-2xl font-bold text-purple-700">
              {guestAnalytics.averageGroupSize.toFixed(1)}
            </p>
            <p className="text-sm text-purple-600 mt-1">
              Guests per booking
            </p>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CalendarRange className="h-5 w-5 text-green-600" />
              <h4 className="font-medium text-green-900">Average Stay</h4>
            </div>
            <p className="text-2xl font-bold text-green-700">
              {guestAnalytics.averageStayLength.toFixed(1)} nights
            </p>
            <p className="text-sm text-green-600 mt-1">
              Length of stay
            </p>
          </div>

          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Repeat className="h-5 w-5 text-orange-600" />
              <h4 className="font-medium text-orange-900">Repeat Guests</h4>
            </div>
            <p className="text-2xl font-bold text-orange-700">
              {repeatGuestRate.toFixed(1)}%
            </p>
            <p className="text-sm text-orange-600 mt-1">
              Return rate
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Guest Origins */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="h-5 w-5 text-blue-600" />
              <h4 className="font-medium">Guest Origins</h4>
            </div>
            <div className="h-64">
              <Pie 
                data={guestOriginData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false
                }}
              />
            </div>
          </div>

          {/* Booking Patterns */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-purple-600" />
              <h4 className="font-medium">Booking Patterns</h4>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <span>Weekday Bookings</span>
                </div>
                <span className="font-medium">{bookingPatterns.weekdayBookings}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-purple-500" />
                  <span>Weekend Bookings</span>
                </div>
                <span className="font-medium">{bookingPatterns.weekendBookings}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-green-500" />
                  <span>Advance Bookings (&gt;30 days)</span>
                </div>
                <span className="font-medium">{bookingPatterns.advanceBookings}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <span>Last-minute Bookings (≤7 days)</span>
                </div>
                <span className="font-medium">{bookingPatterns.lastMinuteBookings}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seasonal Trends */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-medium">Seasonal Trends</h3>
        </div>
        <div className="h-80">
          <Line 
            data={seasonalTrendsData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true
                }
              }
            }}
          />
        </div>
      </div>

      {/* Revenue Analysis */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-6">
          <CreditCard className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-medium">Revenue Analysis</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              <h4 className="font-medium text-blue-900">Average Booking Value</h4>
            </div>
            <p className="text-2xl font-bold text-blue-700">
              €{revenueMetrics.averageBookingValue.toLocaleString()}
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <h4 className="font-medium text-green-900">Total Revenue</h4>
            </div>
            <p className="text-2xl font-bold text-green-700">
              €{revenueMetrics.totalRevenue.toLocaleString()}
            </p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-purple-600" />
              <h4 className="font-medium text-purple-900">Revenue per Guest</h4>
            </div>
            <p className="text-2xl font-bold text-purple-700">
              €{revenueMetrics.revenuePerGuest.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-6">
          <Star className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-medium">Strategic Recommendations</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Pricing Strategy</h4>
            <p className="text-blue-700">
              {guestAnalytics.averageGroupSize > 3 
                ? "Consider offering group discounts and family packages to capitalize on larger group bookings."
                : "Focus on couples and small group amenities to enhance value proposition."}
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-medium text-purple-800 mb-2">Marketing Focus</h4>
            <p className="text-purple-700">
              {topCountries.length >= 2 
                ? `Target marketing efforts in ${topCountries[0]?.[0]} and ${topCountries[1]?.[0]} to capitalize on strong demand.`
                : "Diversify marketing across multiple regions to build market presence."}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">Seasonal Optimization</h4>
            <p className="text-green-700">
              {bookingPatterns.weekendBookings > bookingPatterns.weekdayBookings
                ? "Implement midweek special offers to increase occupancy during slower periods."
                : "Optimize weekend pricing to maximize revenue during peak demand."}
            </p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <h4 className="font-medium text-orange-800 mb-2">Guest Retention</h4>
            <p className="text-orange-700">
              {repeatGuestRate > 25
                ? "Implement a loyalty program to further increase the strong repeat guest rate."
                : "Develop targeted follow-up campaigns to encourage return visits."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;