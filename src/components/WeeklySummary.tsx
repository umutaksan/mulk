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
      {urgentTasks.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <h3 className="font-medium">Booking Gaps by Property</h3>
          </div>
          <div className="space-y-4">
            {urgentTasks.map((task, index) => (
              <div key={index} className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4 text-yellow-600" />
                    <span className="font-medium text-yellow-800">{task.property}</span>
                  </div>
                  <a 
                    href="https://app.pricelabs.co/pricing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Check PriceLabs</span>
                  </a>
                </div>
                {task.details.map((detail, detailIndex) => (
                  detail.type === 'gap' && (
                    <div key={detailIndex} className="text-sm text-yellow-700">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {format(detail.startDate, 'MMM d')} - {format(detail.endDate, 'MMM d')}
                        </span>
                        <span className="ml-2 font-medium">
                          ({detail.days} days available)
                        </span>
                      </div>
                    </div>
                  )
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklySummary;