import Papa from 'papaparse';
import { Booking, BookingExpense } from '../types/Booking';
import { isAfter, isBefore, parseISO, format, differenceInDays, getDaysInMonth } from 'date-fns';

const initialExpenseCategories = {
  'Cleaning': 0,
  'Management-Transaction': 0,
  'Management-Commission': 0,
  'Management-VAT': 0,
  'Management-Wine': 0,
  'Management-Coffee': 0,
  'Management-Water': 0,
  'Management-Tea': 0,
  'Management-Slippers': 0,
  'Other': 0
};

export const parseCSVData = (csvString: string): Booking[] => {
  const result = Papa.parse(csvString, {
    header: true,
    skipEmptyLines: true,
  });

  if (result.errors.length > 0) {
    console.error('CSV parsing errors:', result.errors);
  }

  // First, group bookings by guest name and sort by arrival date
  const bookingsByName: { [name: string]: any[] } = {};
  result.data.forEach((row: any) => {
    const name = row.Name || '';
    if (!bookingsByName[name]) {
      bookingsByName[name] = [];
    }
    bookingsByName[name].push(row);
  });

  // Sort bookings by arrival date for each guest
  Object.values(bookingsByName).forEach(bookings => {
    bookings.sort((a, b) => new Date(a.DateArrival).getTime() - new Date(b.DateArrival).getTime());
  });

  // Process each booking
  return result.data.map((row: any) => {
    const houseName = row.HouseName || '';
    const guestName = row.Name || '';
    const totalAmount = parseFloat(row.TotalAmount?.replace(',', '.')) || 0;
    const guestCount = parseInt(row.People) || 1;
    const currentArrival = new Date(row.DateArrival);
    const guestBookings = bookingsByName[guestName];
    const countryName = row.CountryName || 'N/A';
    
    // Find if this is a consecutive stay
    const isConsecutiveStay = guestBookings.some((prevBooking, index) => {
      if (prevBooking === row) return false;
      const prevDeparture = new Date(prevBooking.DateDeparture);
      return prevDeparture.toDateString() === currentArrival.toDateString();
    });

    // Check for previous stays (not just consecutive ones)
    let previousStay = null;
    const currentBookingIndex = guestBookings.findIndex(b => b === row);
    if (currentBookingIndex > 0) {
      const prevBooking = guestBookings[currentBookingIndex - 1];
      const prevDeparture = new Date(prevBooking.DateDeparture);
      const daysGap = differenceInDays(currentArrival, prevDeparture);
      
      // Only show warning if it's not a consecutive stay
      if (!isConsecutiveStay) {
        previousStay = {
          houseName: prevBooking.HouseName,
          dateDeparture: prevBooking.DateDeparture,
          daysGap
        };
      }
    }

    // Calculate all fees
    const cleaningFee = (() => {
      if (isConsecutiveStay) return 0; // No cleaning fee for consecutive stays
      switch (houseName) {
        case 'Marbella Old Town': return 90;
        case 'Playa de la Fontanilla Marbella': return 60;
        case 'Jardines Tropicales-Puerto Banús': return 30;
        case 'ALOHA • Garden + Rooftop View Marbella Stay': return 100;
        default: return 0;
      }
    })();

    // Only apply welcome package to the first booking of consecutive stays
    const isFirstBookingOfStay = !guestBookings.some((prevBooking, index) => {
      if (prevBooking === row) return false;
      const prevDeparture = new Date(prevBooking.DateDeparture);
      return prevDeparture.toDateString() === currentArrival.toDateString();
    });
    
    const transactionFee = totalAmount * 0.013; // 1.3% transaction fee
    const commission = houseName === 'Marbella Old Town' ? totalAmount * 0.22 : totalAmount * 0.18;
    const vat = commission * 0.21;
    
    // Per-guest welcome package costs - only for first booking of stay
    const welcomePackage = {
      wine: (isFirstBookingOfStay) ? 2.00 : 0,
      coffee: (isFirstBookingOfStay) ? 0.30 * guestCount : 0,
      water: (isFirstBookingOfStay) ? 0.36 * guestCount : 0,
      tea: (isFirstBookingOfStay) ? 0.30 * guestCount : 0,
      slippers: (isFirstBookingOfStay) ? 0.60 * guestCount : 0
    };

    const expenses: BookingExpense[] = [
      {
        id: `transaction-${row.Id}`,
        category: 'Management-Transaction',
        amount: transactionFee,
        description: 'Payment processing fee (1.3%)',
        date: row.DateArrival
      },
      {
        id: `commission-${row.Id}`,
        category: 'Management-Commission',
        amount: commission,
        description: `Management commission (${houseName === 'Marbella Old Town' ? '22%' : '18%'})`,
        date: row.DateArrival
      },
      {
        id: `vat-${row.Id}`,
        category: 'Management-VAT',
        amount: vat,
        description: 'VAT on commission (21%)',
        date: row.DateArrival
      }
    ];

    // Add cleaning fee if not a consecutive stay
    if (!isConsecutiveStay && cleaningFee > 0) {
      expenses.push({
        id: `cleaning-${row.Id}`,
        category: 'Cleaning',
        amount: cleaningFee,
        description: 'Professional cleaning service',
        date: row.DateArrival
      });
    }

    // Add L&D Guest Commission for ALOHA property
    if (houseName === 'ALOHA • Garden + Rooftop View Marbella Stay' && totalAmount > 0) {
      const ldCommission = (totalAmount - cleaningFee) * 0.15;
      expenses.push({
        id: `ld-commission-${row.Id}`,
        category: 'Other',
        amount: ldCommission,
        description: 'L&D Guest Commission (15%)',
        date: row.DateArrival
      });
    }

    // Only add welcome package expenses for first booking of stay
    if (isFirstBookingOfStay) {
      if (welcomePackage.wine > 0) {
        expenses.push({
          id: `welcome-wine-${row.Id}`,
          category: 'Management-Wine',
          amount: welcomePackage.wine,
          description: 'Welcome wine (one-time)',
          date: row.DateArrival
        });
      }
      if (welcomePackage.coffee > 0) {
        expenses.push({
          id: `welcome-coffee-${row.Id}`,
          category: 'Management-Coffee',
          amount: welcomePackage.coffee,
          description: `Coffee capsules (${guestCount} guests, one-time)`,
          date: row.DateArrival
        });
      }
      if (welcomePackage.water > 0) {
        expenses.push({
          id: `welcome-water-${row.Id}`,
          category: 'Management-Water',
          amount: welcomePackage.water,
          description: `Water bottles (${guestCount} guests, one-time)`,
          date: row.DateArrival
        });
      }
      if (welcomePackage.tea > 0) {
        expenses.push({
          id: `welcome-tea-${row.Id}`,
          category: 'Management-Tea',
          amount: welcomePackage.tea,
          description: `Tea bags (${guestCount} guests, one-time)`,
          date: row.DateArrival
        });
      }
      if (welcomePackage.slippers > 0) {
        expenses.push({
          id: `welcome-slippers-${row.Id}`,
          category: 'Management-Slippers',
          amount: welcomePackage.slippers,
          description: `Guest slippers (${guestCount} pairs, one-time)`,
          date: row.DateArrival
        });
      }
    }

    const booking: Booking = {
      id: row.Id || '',
      type: row.Type || '',
      source: row.Source || '',
      sourceText: row.SourceText || '',
      name: guestName,
      dateArrival: row.DateArrival || '',
      dateDeparture: row.DateDeparture || '',
      nights: parseInt(row.Nights) || 0,
      houseName: houseName,
      houseId: row.House_Id || '',
      roomTypes: row.RoomTypes || '',
      people: guestCount,
      dateCreated: row.DateCreated || '',
      totalAmount: totalAmount,
      currency: row.Currency || '',
      status: row.Status || '',
      email: row.Email || '',
      phone: row.Phone || '',
      countryName: countryName,
      roomRatesTotal: parseFloat(row.RoomRatesTotal?.replace(',', '.')) || 0,
      promotionsTotal: parseFloat(row.PromotionsTotal?.replace(',', '.')) || 0,
      feesTotal: parseFloat(row.FeesTotal?.replace(',', '.')) || 0,
      taxesTotal: parseFloat(row.TaxesTotal?.replace(',', '.')) || 0,
      addOnsTotal: parseFloat(row.AddOnsTotal?.replace(',', '.')) || 0,
      amountPaid: parseFloat(row.AmountPaid?.replace(',', '.')) || 0,
      balanceDue: parseFloat(row.BalanceDue?.replace(',', '.')) || 0,
      ownerFirstName: row.OwnerFirstName || '',
      ownerLastName: row.OwnerLastName || '',
      ownerEmail: row.OwnerEmail || '',
      ownerPayout: parseFloat(row.OwnerPayout?.replace(',', '.')) || 0,
      guestNotes: row.Notes ? [row.Notes] : [],
      hasReview: false,
      expenses: expenses,
      isFirstBookingOfStay: isFirstBookingOfStay,
      isConsecutiveStay: isConsecutiveStay,
      previousStay: previousStay
    };

    return booking;
  });
};

export const calculateFinancialSummary = (bookings: Booking[]) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let totalEarnings = 0;
  let earnedToDate = 0;
  let expenses = 0;
  const expensesByCategory = { ...initialExpenseCategories };
  const bookingsByGuest: { [name: string]: number } = {};

  bookings.forEach(booking => {
    const departureDate = parseISO(booking.dateDeparture);
    
    if (!bookingsByGuest[booking.name]) {
      bookingsByGuest[booking.name] = 0;
    }
    bookingsByGuest[booking.name] += booking.totalAmount;
    
    totalEarnings += booking.totalAmount;
    
    if (isBefore(departureDate, today)) {
      earnedToDate += booking.totalAmount;
    }
    
    booking.expenses.forEach(expense => {
      expenses += expense.amount;
      expensesByCategory[expense.category] = (expensesByCategory[expense.category] || 0) + expense.amount;
    });
  });

  const netProfit = earnedToDate - expenses;

  return {
    totalEarnings,
    earnedToDate,
    expenses,
    netProfit,
    expensesByCategory,
    bookingsByGuest
  };
};

export const calculateMonthlyStats = (bookings: Booking[]) => {
  const monthlyStats: { [key: string]: {
    income: number;
    expenses: number;
    profit: number;
    occupiedDays: Set<string>;
    bookingCount: number;
    totalDays: number;
    emptyDays: number;
  }} = {};

  // Initialize all months of 2025
  for (let month = 0; month < 12; month++) {
    const date = new Date(2025, month, 1);
    const monthKey = format(date, 'yyyy-MM');
    const daysInMonth = getDaysInMonth(date);
    monthlyStats[monthKey] = {
      income: 0,
      expenses: 0,
      profit: 0,
      occupiedDays: new Set(),
      bookingCount: 0,
      totalDays: daysInMonth,
      emptyDays: daysInMonth
    };
  }

  bookings.forEach(booking => {
    const arrivalDate = parseISO(booking.dateArrival);
    const departureDate = parseISO(booking.dateDeparture);
    const monthKey = format(arrivalDate, 'yyyy-MM');

    // Calculate occupied days
    let currentDate = arrivalDate;
    while (currentDate <= departureDate) {
      const currentMonthKey = format(currentDate, 'yyyy-MM');
      if (monthlyStats[currentMonthKey]) {
        monthlyStats[currentMonthKey].occupiedDays.add(format(currentDate, 'yyyy-MM-dd'));
        monthlyStats[currentMonthKey].emptyDays = 
          monthlyStats[currentMonthKey].totalDays - monthlyStats[currentMonthKey].occupiedDays.size;
      }
      currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
    }

    // Add financial data and increment booking count
    if (monthlyStats[monthKey]) {
      monthlyStats[monthKey].income += booking.totalAmount;
      monthlyStats[monthKey].bookingCount += 1;

      booking.expenses.forEach(expense => {
        monthlyStats[monthKey].expenses += expense.amount;
      });

      monthlyStats[monthKey].profit = 
        monthlyStats[monthKey].income - monthlyStats[monthKey].expenses;
    }
  });

  // Convert to array and sort chronologically
  return Object.entries(monthlyStats)
    .map(([key, stats]) => ({
      month: format(parseISO(key + '-01'), 'MMMM yyyy'),
      income: stats.income,
      expenses: stats.expenses,
      profit: stats.profit,
      occupiedDays: stats.occupiedDays.size,
      emptyDays: stats.emptyDays,
      totalDays: stats.totalDays,
      bookingCount: stats.bookingCount
    }))
    .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
};

export const groupBookingsByProperty = (bookings: Booking[]): { [property: string]: Booking[] } => {
  return bookings.reduce((acc: { [property: string]: Booking[] }, booking: Booking) => {
    const property = booking.houseName;
    if (!acc[property]) {
      acc[property] = [];
    }
    acc[property].push(booking);
    return acc;
  }, {});
};

export const generateChartData = (bookingsByProperty: { [property: string]: Booking[] }) => {
  const chartData: { [property: string]: {
    monthlyRevenue: Array<{ month: string; revenue: number }>;
    monthlyExpenses: Array<{ month: string; expenses: number }>;
    monthlyOccupancy: Array<{ month: string; occupancy: number }>;
    totalRevenue: number;
    totalExpenses: number;
    expensesByCategory: { [category: string]: number };
    pastBookings: Booking[];
    futureBookings: Booking[];
  }} = {};

  // Process data for each property
  Object.entries(bookingsByProperty).forEach(([property, bookings]) => {
    const monthlyData: { [month: string]: {
      revenue: number;
      expenses: number;
      occupiedDays: Set<string>;
    }} = {};

    // Initialize all months
    for (let month = 0; month < 12; month++) {
      const date = new Date(2025, month, 1);
      const monthKey = format(date, 'yyyy-MM');
      monthlyData[monthKey] = {
        revenue: 0,
        expenses: 0,
        occupiedDays: new Set()
      };
    }

    let totalRevenue = 0;
    let totalExpenses = 0;
    const expensesByCategory: { [category: string]: number } = { ...initialExpenseCategories };
    const today = new Date();
    const pastBookings: Booking[] = [];
    const futureBookings: Booking[] = [];

    // Process each booking
    bookings.forEach(booking => {
      const arrivalDate = parseISO(booking.dateArrival);
      const departureDate = parseISO(booking.dateDeparture);
      const monthKey = format(arrivalDate, 'yyyy-MM');

      // Separate past and future bookings
      if (departureDate < today) {
        pastBookings.push(booking);
      } else {
        futureBookings.push(booking);
      }

      // Calculate occupied days
      let currentDate = arrivalDate;
      while (currentDate <= departureDate) {
        const currentMonthKey = format(currentDate, 'yyyy-MM');
        if (monthlyData[currentMonthKey]) {
          monthlyData[currentMonthKey].occupiedDays.add(format(currentDate, 'yyyy-MM-dd'));
        }
        currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
      }

      // Add revenue and expenses
      if (monthlyData[monthKey]) {
        monthlyData[monthKey].revenue += booking.totalAmount;
        totalRevenue += booking.totalAmount;

        booking.expenses.forEach(expense => {
          const expenseMonth = format(parseISO(expense.date), 'yyyy-MM');
          if (monthlyData[expenseMonth]) {
            monthlyData[expenseMonth].expenses += expense.amount;
          }
          totalExpenses += expense.amount;
          expensesByCategory[expense.category] = (expensesByCategory[expense.category] || 0) + expense.amount;
        });
      }
    });

    // Convert monthly data to arrays
    const monthlyRevenue = Object.entries(monthlyData).map(([month, data]) => ({
      month: format(parseISO(month + '-01'), 'MMM yyyy'),
      revenue: data.revenue
    }));

    const monthlyExpenses = Object.entries(monthlyData).map(([month, data]) => ({
      month,
      expenses: data.expenses
    }));

    const monthlyOccupancy = Object.entries(monthlyData).map(([month, data]) => ({
      month: format(parseISO(month + '-01'), 'MMM yyyy'),
      occupancy: (data.occupiedDays.size / getDaysInMonth(parseISO(month + '-01'))) * 100
    }));

    chartData[property] = {
      monthlyRevenue,
      monthlyExpenses,
      monthlyOccupancy,
      totalRevenue,
      totalExpenses,
      expensesByCategory,
      pastBookings,
      futureBookings
    };
  });

  // Calculate overall statistics
  const overall = {
    monthlyRevenue: Array.from({ length: 12 }, (_, i) => {
      const date = new Date(2025, i, 1);
      const month = format(date, 'MMM yyyy');
      const revenue = Object.values(chartData).reduce((sum, propertyData) => 
        sum + (propertyData.monthlyRevenue.find(m => m.month === month)?.revenue || 0), 0);
      return { month, revenue };
    }),
    monthlyExpenses: Array.from({ length: 12 }, (_, i) => {
      const date = new Date(2025, i, 1);
      const month = format(date, 'yyyy-MM');
      const expenses = Object.values(chartData).reduce((sum, propertyData) => 
        sum + (propertyData.monthlyExpenses.find(m => m.month === month)?.expenses || 0), 0);
      return { month, expenses };
    }),
    monthlyOccupancy: Array.from({ length: 12 }, (_, i) => {
      const date = new Date(2025, i, 1);
      const month = format(date, 'MMM yyyy');
      const occupancy = Object.values(chartData).reduce((sum, propertyData) => 
        sum + (propertyData.monthlyOccupancy.find(m => m.month === month)?.occupancy || 0), 0) / Object.keys(chartData).length;
      return { month, occupancy };
    }),
    totalRevenue: Object.values(chartData).reduce((sum, propertyData) => sum + propertyData.totalRevenue, 0),
    totalExpenses: Object.values(chartData).reduce((sum, propertyData) => sum + propertyData.totalExpenses, 0),
    expensesByCategory: Object.keys(initialExpenseCategories).reduce((acc, category) => {
      acc[category] = Object.values(chartData).reduce((sum, propertyData) => 
        sum + (propertyData.expensesByCategory[category] || 0), 0);
      return acc;
    }, {} as { [category: string]: number }),
    pastBookings: Object.values(chartData).reduce((all, propertyData) => [...all, ...propertyData.pastBookings], [] as Booking[]),
    futureBookings: Object.values(chartData).reduce((all, propertyData) => [...all, ...propertyData.futureBookings], [] as Booking[])
  };

  return { ...chartData, overall };
};