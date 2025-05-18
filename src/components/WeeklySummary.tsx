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

  const getUrgentTasks = () => {
    const tasks = [];
    
    // Check for properties with no bookings this month
    const propertiesWithNoBookings = Object.keys(bookingsByProperty).filter(property => 
      !thisMonthBookings.some(b => b.houseName === property)
    );
    
    if (propertiesWithNoBookings.length > 0) {
      tasks.push({
        type: 'warning',
        message: `${propertiesWithNoBookings.length} properties have no bookings this month`,
        icon: AlertTriangle,
        details: propertiesWithNoBookings.map(property => ({
          type: 'property',
          property
        }))
      });
    }

    // Find booking gaps for each property
    Object.entries(bookingsByProperty).forEach(([property, propertyBookings]) => {
      // Sort bookings by arrival date
      const sortedBookings = [...propertyBookings].sort((a, b) => 
        parseISO(a.dateArrival).getTime() - parseISO(b.dateArrival).getTime()
      );

      // Check for gaps between bookings
      for (let i = 0; i < sortedBookings.length - 1; i++) {
        const currentBooking = sortedBookings[i];
        const nextBooking = sortedBookings[i + 1];
        
        const currentDeparture = parseISO(currentBooking.dateDeparture);
        const nextArrival = parseISO(nextBooking.dateArrival);
        
        const gapDays = differenceInDays(nextArrival, currentDeparture);
        
        if (gapDays > 0) {
          tasks.push({
            type: 'gap',
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

    // Check for upcoming arrivals in the next 48 hours
    const upcomingArrivals = bookings.filter(booking => {
      const arrivalDate = parseISO(booking.dateArrival);
      const hoursUntilArrival = differenceInHours(arrivalDate, today);
      return hoursUntilArrival > 0 && hoursUntilArrival <= 48;
    }).sort((a, b) => parseISO(a.dateArrival).getTime() - parseISO(b.dateArrival).getTime());

    if (upcomingArrivals.length > 0) {
      tasks.push({
        type: 'info',
        message: `${upcomingArrivals.length} guests arriving in the next 48 hours`,
        icon: LogIn,
        details: upcomingArrivals.map(booking => ({
          type: 'arrival',
          booking,
          hoursUntil: differenceInHours(parseISO(booking.dateArrival), today),
          needsChekin: true
        }))
      });
    }

    // Check for departures in the next 24 hours
    const upcomingDepartures = bookings.filter(booking => {
      const departureDate = parseISO(booking.dateDeparture);
      const hoursUntilDeparture = differenceInHours(departureDate, today);
      return hoursUntilDeparture > 0 && hoursUntilDeparture <= 24;
    }).sort((a, b) => parseISO(a.dateDeparture).getTime() - parseISO(b.dateDeparture).getTime());

    if (upcomingDepartures.length > 0) {
      tasks.push({
        type: 'info',
        message: `${upcomingDepartures.length} guests departing in the next 24 hours`,
        icon: LogOut,
        details: upcomingDepartures.map(booking => ({
          type: 'departure',
          booking,
          hoursUntil: differenceInHours(parseISO(booking.dateDeparture), today)
        }))
      });
    }

    // Add maintenance tasks
    const maintenanceTasks = [
      {
        id: '1',
        property: 'Marbella Old Town',
        title: 'AC Maintenance',
        description: 'Regular maintenance check for all AC units',
        dueDate: '2025-03-15',
        priority: 'medium',
        status: 'pending',
        price: 150
      },
      {
        id: '2',
        property: 'Jardines Tropicales-Puerto Banús',
        title: 'Pool Cleaning',
        description: 'Weekly pool maintenance and chemical balance check',
        dueDate: '2025-03-10',
        priority: 'high',
        status: 'in-progress',
        price: 80
      }
    ];

    if (maintenanceTasks.length > 0) {
      tasks.push({
        type: 'maintenance',
        message: `${maintenanceTasks.length} maintenance tasks scheduled`,
        icon: Tool,
        details: maintenanceTasks.map(task => ({
          type: 'maintenance',
          task
        }))
      });
    }

    return tasks;
  };

  const urgentTasks = getUrgentTasks();

  // Calculate upcoming guest financials
  const upcomingGuestStats = nextWeekBookings.reduce((acc, booking) => ({
    income: acc.income + booking.totalAmount,
    expenses: acc.expenses + booking.expenses.reduce((sum, exp) => sum + exp.amount, 0),
    profit: acc.profit + (booking.totalAmount - booking.expenses.reduce((sum, exp) => sum + exp.amount, 0))
  }), { income: 0, expenses: 0, profit: 0 });

  return (
    <div className="mb-8 space-y-6">
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
              <span className="font-medium text-purple-700">€{upcomingGuestStats.income.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Expected Expenses</span>
              <span className="font-medium text-purple-700">€{upcomingGuestStats.expenses.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Expected Profit</span>
              <span className="font-medium text-purple-700">€{upcomingGuestStats.profit.toLocaleString()}</span>
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

      {/* Urgent Tasks & Notifications */}
      {urgentTasks.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <h3 className="font-medium">Urgent Tasks & Notifications</h3>
          </div>
          <div className="space-y-4">
            {urgentTasks.map((task, index) => {
              const Icon = task.icon;
              return (
                <div key={index} className="space-y-2">
                  <div 
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      task.type === 'warning' ? 'bg-orange-50' : 
                      task.type === 'maintenance' ? 'bg-purple-50' : 
                      task.type === 'gap' ? 'bg-yellow-50' :
                      'bg-blue-50'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${
                      task.type === 'warning' ? 'text-orange-500' : 
                      task.type === 'maintenance' ? 'text-purple-500' : 
                      task.type === 'gap' ? 'text-yellow-500' :
                      'text-blue-500'
                    }`} />
                    <span className={`${
                      task.type === 'warning' ? 'text-orange-700' : 
                      task.type === 'maintenance' ? 'text-purple-700' : 
                      task.type === 'gap' ? 'text-yellow-700' :
                      'text-blue-700'
                    }`}>
                      {task.message}
                    </span>
                  </div>

                  {/* Detailed Information */}
                  <div className="pl-4">
                    {task.details?.map((detail, detailIndex) => {
                      if (detail.type === 'property') {
                        return (
                          <div key={detailIndex} className="flex items-center gap-2 p-2 text-sm text-gray-600">
                            <Home className="h-4 w-4" />
                            <span>{detail.property}</span>
                          </div>
                        );
                      }

                      if (detail.type === 'gap') {
                        return (
                          <div key={detailIndex} className="bg-white border border-yellow-100 rounded-lg p-3 mb-2">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-yellow-500" />
                                <span className="font-medium">{detail.property}</span>
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
                            <div className="text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <span>Gap Period:</span>
                                <span className="font-medium">
                                  {format(detail.startDate, 'MMM d')} - {format(detail.endDate, 'MMM d')}
                                </span>
                                <span className="text-yellow-600 ml-2">
                                  ({detail.days} days)
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      }

                      if (detail.type === 'arrival' || detail.type === 'departure') {
                        const booking = detail.booking;
                        const timeText = `in ${detail.hoursUntil} hours`;
                        const isArrival = detail.type === 'arrival';

                        return (
                          <div key={detailIndex} className="bg-gray-50 rounded-lg p-3 mb-2">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-gray-500" />
                                <span className="font-medium">{booking.name}</span>
                              </div>
                              <span className="text-sm text-gray-500">{timeText}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <div className="flex items-center gap-1 text-gray-600 mb-1">
                                  <Home className="h-4 w-4" />
                                  <span>{booking.houseName}</span>
                                </div>
                                <div className="flex items-center gap-1 text-gray-600">
                                  <Users className="h-4 w-4" />
                                  <span>{booking.people} guests</span>
                                </div>
                              </div>
                              <div>
                                <div className="flex items-center gap-1 text-gray-600 mb-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>
                                    {isArrival 
                                      ? format(parseISO(booking.dateArrival), 'MMM d, HH:mm')
                                      : format(parseISO(booking.dateDeparture), 'MMM d, HH:mm')}
                                  </span>
                                </div>
                                {booking.countryName && (
                                  <div className="flex items-center gap-1 text-gray-600">
                                    <MapPin className="h-4 w-4" />
                                    <span>{booking.countryName}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="mt-2 pt-2 border-t border-gray-200">
                              <div className="flex gap-4">
                                {booking.phone && (
                                  <a 
                                    href={`tel:${booking.phone}`}
                                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                                  >
                                    <Phone className="h-4 w-4" />
                                    <span>Call</span>
                                  </a>
                                )}
                                {booking.email && (
                                  <a 
                                    href={`mailto:${booking.email}`}
                                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                                  >
                                    <Mail className="h-4 w-4" />
                                    <span>Email</span>
                                  </a>
                                )}
                                {detail.needsChekin && (
                                  <a 
                                    href="https://dashboard.chekin.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-sm text-orange-600 hover:text-orange-800 ml-auto"
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                    <span>Submit to Police (Chekin)</span>
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      }

                      if (detail.type === 'maintenance') {
                        const task = detail.task;
                        return (
                          <div key={detailIndex} className="bg-purple-50 rounded-lg p-3 mb-2">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Tool className="h-4 w-4 text-purple-500" />
                                <span className="font-medium">{task.title}</span>
                              </div>
                              <span className="text-sm text-purple-600">€{task.price.toLocaleString()}</span>
                            </div>
                            <div className="text-sm text-purple-700">
                              <div className="flex items-center gap-1 mb-1">
                                <Calendar className="h-4 w-4" />
                                <span>Due: {format(new Date(task.dueDate), 'MMM d')}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Home className="h-4 w-4" />
                                <span>{task.property}</span>
                              </div>
                              <p className="mt-1 text-purple-600">{task.description}</p>
                            </div>
                          </div>
                        );
                      }

                      return null;
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklySummary;