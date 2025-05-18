import React from 'react';
import { Calendar, TrendingUp, TrendingDown, Users, ArrowRight, ArrowLeft, Clock, Home, PiggyBank, AlertTriangle, CheckCircle2, CalendarClock, LogIn, LogOut, User, Phone, Mail, MapPin, PenTool as Tool, ExternalLink } from 'lucide-react';
import { Booking } from '../types/Booking';
import { format, parseISO, startOfWeek, endOfWeek, addWeeks, subWeeks, isWithinInterval, startOfMonth, endOfMonth, differenceInHours, addHours, differenceInDays, addDays } from 'date-fns';

interface WeeklySummaryProps {
  bookings: Booking[];
  bookingsByProperty: { [property: string]: Booking[] };
}

const WeeklySummary: React.FC<WeeklySummaryProps> = ({
  bookings,
  bookingsByProperty
}) => {
  const today = new Date();
  
  // Calculate week ranges
  const thisWeekStart = startOfWeek(today);
  const thisWeekEnd = endOfWeek(today);
  const lastWeekStart = startOfWeek(subWeeks(today, 1));
  const lastWeekEnd = endOfWeek(subWeeks(today, 1));
  const nextWeekStart = startOfWeek(addWeeks(today, 1));
  const nextWeekEnd = endOfWeek(addWeeks(today, 1));
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);

  // Helper function to get bookings within a date range
  const getBookingsInRange = (start: Date, end: Date) => {
    return bookings.filter(booking => {
      const arrivalDate = parseISO(booking.dateArrival);
      const departureDate = parseISO(booking.dateDeparture);
      return isWithinInterval(arrivalDate, { start, end }) || 
             isWithinInterval(departureDate, { start, end }) ||
             (arrivalDate <= start && departureDate >= end);
    });
  };

  // Get bookings for each period
  const thisWeekBookings = getBookingsInRange(thisWeekStart, thisWeekEnd);
  const lastWeekBookings = getBookingsInRange(lastWeekStart, lastWeekEnd);
  const nextWeekBookings = getBookingsInRange(nextWeekStart, nextWeekEnd);
  const thisMonthBookings = getBookingsInRange(monthStart, monthEnd);

  // Calculate stats for a given set of bookings
  const calculateStats = (periodBookings: Booking[]) => {
    const totalRevenue = periodBookings.reduce((sum, booking) => sum + booking.totalAmount, 0);
    const totalExpenses = periodBookings.reduce((sum, booking) => 
      sum + booking.expenses.reduce((expSum, exp) => expSum + exp.amount, 0), 0);
    const totalGuests = periodBookings.reduce((sum, booking) => sum + booking.people, 0);
    const arrivals = periodBookings.filter(b => 
      isWithinInterval(parseISO(b.dateArrival), { start: thisWeekStart, end: thisWeekEnd }));
    const departures = periodBookings.filter(b => 
      isWithinInterval(parseISO(b.dateDeparture), { start: thisWeekStart, end: thisWeekEnd }));

    return {
      revenue: totalRevenue,
      expenses: totalExpenses,
      profit: totalRevenue - totalExpenses,
      guests: totalGuests,
      arrivals: arrivals.length,
      departures: departures.length,
      occupiedProperties: new Set(periodBookings.map(b => b.houseName)).size
    };
  };

  const thisWeekStats = calculateStats(thisWeekBookings);
  const lastWeekStats = calculateStats(lastWeekBookings);
  const nextWeekStats = calculateStats(nextWeekBookings);
  const thisMonthStats = calculateStats(thisMonthBookings);

  // Get urgent tasks and notifications
  const getUrgentTasks = () => {
    const tasks = [];

    // Find booking gaps for each property
    Object.entries(bookingsByProperty).forEach(([property, propertyBookings]) => {
      // Sort bookings by arrival date
      const sortedBookings = [...propertyBookings]
        .filter(booking => parseISO(booking.dateDeparture) >= today) // Only future bookings
        .sort((a, b) => parseISO(a.dateArrival).getTime() - parseISO(b.dateArrival).getTime());

      // Check for gaps between bookings
      for (let i = 0; i < sortedBookings.length - 1; i++) {
        const currentBooking = sortedBookings[i];
        const nextBooking = sortedBookings[i + 1];
        
        const currentDeparture = parseISO(currentBooking.dateDeparture);
        const nextArrival = parseISO(nextBooking.dateArrival);
        
        const gapDays = differenceInDays(nextArrival, currentDeparture);
        
        // Only show gaps of 2 or more days
        if (gapDays >= 2) {
          tasks.push({
            type: 'gap',
            property,
            message: `${gapDays} day gap at ${property}`,
            icon: Calendar,
            details: [{
              type: 'gap',
              property,
              startDate: currentDeparture,
              endDate: nextArrival,
              days: gapDays
            }]
          });
        }
      }
    });

    // Sort gaps by property
    tasks.sort((a, b) => a.property.localeCompare(b.property));

    return tasks;
  };

  const urgentTasks = getUrgentTasks();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* This Week */}
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <h3 className="font-medium">This Week</h3>
            </div>
            <span className="text-sm text-blue-600">
              {format(thisWeekStart, 'MMM d')} - {format(thisWeekEnd, 'MMM d')}
            </span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Revenue</span>
              <span className="font-medium text-blue-700">€{thisWeekStats.revenue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Arrivals</span>
              <span className="font-medium text-blue-700">{thisWeekStats.arrivals}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Departures</span>
              <span className="font-medium text-blue-700">{thisWeekStats.departures}</span>
            </div>
          </div>
        </div>

        {/* Last Week */}
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
              <h3 className="font-medium">Last Week</h3>
            </div>
            <span className="text-sm text-gray-600">
              {format(lastWeekStart, 'MMM d')} - {format(lastWeekEnd, 'MMM d')}
            </span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Revenue</span>
              <span className="font-medium">€{lastWeekStats.revenue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Profit</span>
              <span className="font-medium text-green-600">€{lastWeekStats.profit.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Occupancy</span>
              <span className="font-medium">{lastWeekStats.occupiedProperties} properties</span>
            </div>
          </div>
        </div>

        {/* Next Week */}
        <div className="bg-purple-50 rounded-xl p-6 border border-purple-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ArrowRight className="h-5 w-5 text-purple-600" />
              <h3 className="font-medium">Next Week</h3>
            </div>
            <span className="text-sm text-purple-600">
              {format(nextWeekStart, 'MMM d')} - {format(nextWeekEnd, 'MMM d')}
            </span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Expected Income</span>
              <span className="font-medium text-purple-700">€{nextWeekStats.revenue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Expected Expenses</span>
              <span className="font-medium text-purple-700">€{nextWeekStats.expenses.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Expected Profit</span>
              <span className="font-medium text-purple-700">€{nextWeekStats.profit.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* This Month */}
        <div className="bg-green-50 rounded-xl p-6 border border-green-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-green-600" />
              <h3 className="font-medium">This Month</h3>
            </div>
            <span className="text-sm text-green-600">{format(today, 'MMMM yyyy')}</span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Revenue</span>
              <span className="font-medium text-green-700">€{thisMonthStats.revenue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Bookings</span>
              <span className="font-medium text-green-700">{thisMonthBookings.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active Properties</span>
              <span className="font-medium text-green-700">{thisMonthStats.occupiedProperties}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Gaps (Compact Version) */}
      {urgentTasks.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-yellow-500" />
              <h3 className="text-sm font-medium">Available Dates</h3>
            </div>
            <a 
              href="https://app.pricelabs.co/pricing"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <ExternalLink className="h-3 w-3" />
              PriceLabs
            </a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {urgentTasks.map((task, index) => (
              task.details.map((detail, detailIndex) => (
                detail.type === 'gap' && (
                  <div key={`${index}-${detailIndex}`} className="bg-yellow-50 rounded p-2 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-yellow-800">{detail.property}</span>
                      <span className="text-yellow-700">{detail.days}d</span>
                    </div>
                    <div className="text-yellow-700">
                      {format(detail.startDate, 'MMM d')} - {format(detail.endDate, 'MMM d')}
                    </div>
                  </div>
                )
              ))
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklySummary;