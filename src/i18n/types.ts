export type Language = 'en' | 'tr' | 'es';

export interface Translations {
  [key: string]: {
    header: {
      title: string;
      subtitle: string;
    };
    propertyFilter: {
      title: string;
      allProperties: string;
      totalIncome: string;
      totalExpenses: string;
      totalProfit: string;
      month: string;
      income: string;
      expenses: string;
      profit: string;
      occupancy: string;
      bookings: string;
      days: string;
    };
    revenueAnalysis: {
      title: string;
      financialPerformance: string;
      totalRevenue: string;
      netProfit: string;
      occupancyAnalysis: string;
      averageOccupancy: string;
      peakSeason: string;
      lowSeason: string;
      monthlyRevenue: string;
      monthlyOccupancy: string;
      insights: string;
      revenueTrends: string;
      revenueTrendsDescription: string;
      occupancyPatterns: string;
      occupancyPatternsDescription: string;
      optimization: string;
      optimizationDescription: string;
    };
    bookings: {
      upcoming: string;
      past: string;
      all: string;
      rated: string;
      unrated: string;
      noRatings: string;
      guests: string;
      addNote: string;
      guestNotes: string;
      showExpenses: string;
      hideExpenses: string;
      previousStay: string;
      daysAgo: string;
      addNoteButton: string;
      contactInfo: string;
      rating: {
        bookingCom: string;
        airbnb: string;
        clear: string;
      };
    };
    expenses: {
      title: string;
      total: string;
      categories: {
        cleaning: string;
        management: string;
        welcomePackage: string;
        other: string;
      };
      welcomeItems: {
        wine: string;
        coffee: string;
        water: string;
        tea: string;
        slippers: string;
      };
    };
  };
}