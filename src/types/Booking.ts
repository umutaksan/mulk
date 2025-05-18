export interface Booking {
  id: string;
  type: string;
  source: string;
  sourceText: string;
  name: string;
  dateArrival: string;
  dateDeparture: string;
  nights: number;
  houseName: string;
  houseId: string;
  roomTypes: string;
  people: number;
  dateCreated: string;
  totalAmount: number;
  currency: string;
  status: string;
  email: string;
  phone: string;
  countryName: string;
  roomRatesTotal: number;
  promotionsTotal: number;
  feesTotal: number;
  taxesTotal: number;
  addOnsTotal: number;
  amountPaid: number;
  balanceDue: number;
  ownerFirstName: string;
  ownerLastName: string;
  ownerEmail: string;
  ownerPayout: number;
  guestNotes: string[];
  hasReview: boolean;
  rating?: {
    booking?: number;
    airbnb?: number;
  };
  expenses: BookingExpense[];
  isFirstBookingOfStay: boolean;
  isConsecutiveStay: boolean;
  previousStay?: {
    houseName: string;
    dateDeparture: string;
    daysGap: number;
  };
}

export interface BookingExpense {
  id: string;
  category: 'Cleaning' | 'Maintenance' | 'Utilities' | 'Supplies' | 'Management' | 'Other';
  amount: number;
  description: string;
  date: string;
}

export interface BookingsByProperty {
  [property: string]: Booking[];
}

export interface FinancialSummary {
  totalEarnings: number;
  earnedToDate: number;
  expenses: number;
  netProfit: number;
  expensesByCategory: { [category: string]: number };
}

export interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
  netProfit: number;
  expenseDetails: { [category: string]: number };
}

export interface PropertyData {
  name: string;
  monthlyRevenue: Array<{ month: string; revenue: number }>;
  monthlyExpenses: Array<{ month: string; expenses: number }>;
  monthlyOccupancy: Array<{ month: string; occupancy: number }>;
  totalRevenue: number;
  totalExpenses: number;
  expensesByCategory: { [category: string]: number };
  pastBookings: Booking[];
  futureBookings: Booking[];
}

export interface ChartData {
  [property: string]: PropertyData;
  overall: PropertyData;
}