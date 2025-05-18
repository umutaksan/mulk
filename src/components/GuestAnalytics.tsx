import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { Users, MapPin, TrendingUp, Calendar, Filter, Home } from 'lucide-react';
import { Booking } from '../types/Booking';

interface GuestAnalyticsProps {
  bookings: Booking[];
  selectedProperty: string;
}

const GuestAnalytics: React.FC<GuestAnalyticsProps> = ({ bookings, selectedProperty }) => {
  const { t } = useLanguage();
  const [filterProperty, setFilterProperty] = useState<string>('All');

  // Get unique properties from bookings
  const properties = ['All', ...new Set(bookings.map(b => b.houseName))];

  const filteredBookings = filterProperty === 'All' 
    ? bookings 
    : bookings.filter(b => b.houseName === filterProperty);

  const guestCountries = filteredBookings.reduce((acc, booking) => {
    const country = booking.countryName || 'Unknown';
    acc[country] = (acc[country] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topCountries = Object.entries(guestCountries)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const totalGuests = filteredBookings.reduce((sum, booking) => sum + booking.people, 0);
  const totalBookings = filteredBookings.length;
  const averageGuests = totalBookings > 0 ? totalGuests / totalBookings : 0;

  const sortedByAmount = [...filteredBookings].sort((a, b) => b.totalAmount - a.totalAmount);
  const highestSpender = sortedByAmount[0];
  const lowestSpender = sortedByAmount[sortedByAmount.length - 1];

  const averageStayLength = filteredBookings.reduce((sum, booking) => sum + booking.nights, 0) / totalBookings || 0;

  const repeatGuests = filteredBookings.reduce((acc, booking) => {
    acc[booking.name] = (acc[booking.name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const repeatGuestCount = Object.values(repeatGuests).filter(count => count > 1).length;

  // Calculate property-specific statistics
  const propertyStats = properties.reduce((acc, property) => {
    if (property === 'All') return acc;
    
    const propertyBookings = bookings.filter(b => b.houseName === property);
    const totalRevenue = propertyBookings.reduce((sum, b) => sum + b.totalAmount, 0);
    const avgNights = propertyBookings.reduce((sum, b) => sum + b.nights, 0) / propertyBookings.length || 0;
    
    acc[property] = {
      bookings: propertyBookings.length,
      revenue: totalRevenue,
      avgNights: avgNights,
      guests: propertyBookings.reduce((sum, b) => sum + b.people, 0)
    };
    
    return acc;
  }, {} as Record<string, { bookings: number; revenue: number; avgNights: number; guests: number }>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-semibold">Guest Analytics</h2>
        </div>
        <div className="flex items-center gap-2 bg-white rounded-lg shadow px-4 py-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            value={filterProperty}
            onChange={(e) => setFilterProperty(e.target.value)}
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

      {filterProperty !== 'All' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Home className="h-4 w-4 text-blue-600" />
              <h3 className="font-medium text-blue-900">Total Bookings</h3>
            </div>
            <p className="text-2xl font-bold text-blue-700">
              {propertyStats[filterProperty]?.bookings || 0}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <h3 className="font-medium text-green-900">Total Revenue</h3>
            </div>
            <p className="text-2xl font-bold text-green-700">
              €{(propertyStats[filterProperty]?.revenue || 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-purple-600" />
              <h3 className="font-medium text-purple-900">Avg. Stay Length</h3>
            </div>
            <p className="text-2xl font-bold text-purple-700">
              {propertyStats[filterProperty]?.avgNights.toFixed(1)} nights
            </p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-orange-600" />
              <h3 className="font-medium text-orange-900">Total Guests</h3>
            </div>
            <p className="text-2xl font-bold text-orange-700">
              {propertyStats[filterProperty]?.guests || 0}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-blue-600" />
            <h3 className="font-medium">Guest Overview</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Guests</span>
              <span className="font-medium">{totalGuests}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Bookings</span>
              <span className="font-medium">{totalBookings}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Average Guests/Booking</span>
              <span className="font-medium">{averageGuests.toFixed(1)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Average Stay Length</span>
              <span className="font-medium">{averageStayLength.toFixed(1)} nights</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Repeat Guests</span>
              <span className="font-medium">{repeatGuestCount}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-blue-600" />
            <h3 className="font-medium">Top Guest Countries</h3>
          </div>
          <div className="space-y-3">
            {topCountries.map(([country, count]) => (
              <div key={country} className="flex justify-between items-center">
                <span className="text-gray-600">{country}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">{count} bookings</span>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(count / totalBookings) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <h3 className="font-medium">Spending Analysis</h3>
          </div>
          {highestSpender && (
            <div className="space-y-4">
              <div className="bg-green-50 p-3 rounded-lg">
                <h4 className="text-sm font-medium text-green-800 mb-1">Highest Spender</h4>
                <p className="text-green-700">
                  {highestSpender.name}<br />
                  €{highestSpender.totalAmount.toLocaleString()}
                </p>
              </div>
              {lowestSpender && (
                <div className="bg-orange-50 p-3 rounded-lg">
                  <h4 className="text-sm font-medium text-orange-800 mb-1">Lowest Spender</h4>
                  <p className="text-orange-700">
                    {lowestSpender.name}<br />
                    €{lowestSpender.totalAmount.toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-blue-600" />
            <h3 className="font-medium">Booking Duration Analysis</h3>
          </div>
          <div className="space-y-3">
            {[...filteredBookings]
              .sort((a, b) => b.nights - a.nights)
              .slice(0, 5)
              .map((booking) => (
                <div key={booking.id} className="flex justify-between items-center">
                  <div>
                    <span className="text-gray-800">{booking.name}</span>
                    <p className="text-sm text-gray-500">{booking.countryName}</p>
                  </div>
                  <span className="font-medium">{booking.nights} nights</span>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-blue-600" />
            <h3 className="font-medium">Group Size Analysis</h3>
          </div>
          <div className="space-y-3">
            {[...filteredBookings]
              .sort((a, b) => b.people - a.people)
              .slice(0, 5)
              .map((booking) => (
                <div key={booking.id} className="flex justify-between items-center">
                  <div>
                    <span className="text-gray-800">{booking.name}</span>
                    <p className="text-sm text-gray-500">{booking.countryName}</p>
                  </div>
                  <span className="font-medium">{booking.people} guests</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestAnalytics;