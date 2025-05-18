import React, { useState, useEffect } from 'react';
import { 
  parseCSVData, 
  groupBookingsByProperty, 
  calculateFinancialSummary,
  generateChartData
} from './utils/csvParser';
import { Booking, FinancialSummaryType, ChartData } from './types/Booking';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Settings from './components/Settings';
import PropertyFilter from './components/PropertyFilter';
import BookingList from './components/BookingList';
import RevenueChart from './components/RevenueChart';
import ExpenseDetails from './components/ExpenseDetails';
import GuestAnalytics from './components/GuestAnalytics';
import Reports from './components/Reports';
import WeeklySummary from './components/WeeklySummary';
import Maintenance from './components/Maintenance';
import Rental from './components/Rental';
import SqlEditor from './components/SqlEditor';
import { DUMMY_CSV } from './components/DummyData';

function App() {
  const [activeSection, setActiveSection] = useState('daily');
  const [csvData, setCsvData] = useState<string>('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [financialSummary, setFinancialSummary] = useState<FinancialSummaryType>({
    totalEarnings: 0,
    earnedToDate: 0,
    expenses: 0,
    expensesByCategory: {}
  });
  const [bookingsByProperty, setBookingsByProperty] = useState<{ [property: string]: Booking[] }>({});
  const [properties, setProperties] = useState<string[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>('All');
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [pastBookings, setPastBookings] = useState<Booking[]>([]);
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [propertyStats, setPropertyStats] = useState<{ [property: string]: { income: number; expenses: number } }>({});
  const [monthlyExpenses, setMonthlyExpenses] = useState<{ [property: string]: Array<{ month: string; expenses: { [category: string]: number } }> }>({});

  useEffect(() => {
    const handleNavigation = (event: CustomEvent) => {
      setActiveSection(event.detail);
    };

    window.addEventListener('navigateToSection', handleNavigation as EventListener);

    return () => {
      window.removeEventListener('navigateToSection', handleNavigation as EventListener);
    };
  }, []);

  useEffect(() => {
    if (!csvData) {
      handleFileLoaded(DUMMY_CSV);
    }
  }, []);

  const handleFileLoaded = (data: string) => {
    setCsvData(data);
    const parsedBookings = parseCSVData(data);
    setBookings(parsedBookings);
    
    const groupedBookings = groupBookingsByProperty(parsedBookings);
    setBookingsByProperty(groupedBookings);
    
    const propertyNames = Object.keys(groupedBookings);
    setProperties(propertyNames);
    
    const summary = calculateFinancialSummary(parsedBookings);
    setFinancialSummary(summary);
    
    setFilteredBookings(parsedBookings);
    
    const chartData = generateChartData(groupedBookings);
    setChartData(chartData);

    const monthlyExpensesByProperty: { [property: string]: Array<{ month: string; expenses: { [category: string]: number } }> } = {};
    
    Object.entries(groupedBookings).forEach(([property, bookings]) => {
      const monthlyData: { [month: string]: { [category: string]: number } } = {};
      
      bookings.forEach(booking => {
        booking.expenses.forEach(expense => {
          const month = expense.date.substring(0, 7);
          if (!monthlyData[month]) {
            monthlyData[month] = {};
          }
          if (!monthlyData[month][expense.category]) {
            monthlyData[month][expense.category] = 0;
          }
          monthlyData[month][expense.category] += expense.amount;
        });
      });
      
      monthlyExpensesByProperty[property] = Object.entries(monthlyData).map(([month, expenses]) => ({
        month,
        expenses
      }));
    });
    
    setMonthlyExpenses(monthlyExpensesByProperty);

    const stats: { [property: string]: { income: number; expenses: number } } = {
      'All': { income: summary.totalEarnings, expenses: summary.expenses }
    };

    Object.entries(groupedBookings).forEach(([property, bookings]) => {
      const propertyStats = calculateFinancialSummary(bookings);
      stats[property] = {
        income: propertyStats.totalEarnings,
        expenses: propertyStats.expenses
      };
    });

    setPropertyStats(stats);

    const today = new Date();
    setPastBookings(parsedBookings.filter(b => new Date(b.dateDeparture) < today));
    setUpcomingBookings(parsedBookings.filter(b => new Date(b.dateArrival) >= today));
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'rental':
        return (
          <Rental
            bookings={bookings}
            bookingsByProperty={bookingsByProperty}
            chartData={chartData}
            propertyStats={propertyStats}
          />
        );
      case 'daily':
        return (
          <WeeklySummary 
            bookings={bookings}
            bookingsByProperty={bookingsByProperty}
          />
        );
      case 'overview':
        return (
          <>
            <PropertyFilter 
              properties={properties}
              selectedProperty={selectedProperty}
              onSelectProperty={setSelectedProperty}
              propertyStats={propertyStats}
              bookingsByProperty={bookingsByProperty}
              showDetails={true}
            />
          </>
        );
      case 'bookings':
        return (
          <>
            <div className="space-y-8">
              <BookingList
                bookings={upcomingBookings}
                title="Upcoming Bookings"
                type="upcoming"
              />
              <BookingList
                bookings={pastBookings}
                title="Past Bookings"
                type="past"
              />
            </div>
          </>
        );
      case 'guests':
        return (
          <>
            <GuestAnalytics
              bookings={bookings}
              selectedProperty={selectedProperty}
            />
          </>
        );
      case 'revenue':
        return (
          <>
            {chartData && (
              <RevenueChart 
                propertyData={chartData}
                propertyName={selectedProperty}
              />
            )}
          </>
        );
      case 'expenses':
        return (
          <>
            {chartData && (
              <ExpenseDetails
                expensesByProperty={Object.entries(chartData).reduce((acc, [property, data]) => {
                  acc[property] = data.expensesByCategory;
                  return acc;
                }, {} as { [property: string]: { [category: string]: number } })}
                totalExpensesByProperty={Object.entries(chartData).reduce((acc, [property, data]) => {
                  acc[property] = data.totalExpenses;
                  return acc;
                }, {} as { [property: string]: number })}
                propertyName={selectedProperty}
                monthlyExpenses={monthlyExpenses}
              />
            )}
          </>
        );
      case 'maintenance':
        return (
          <Maintenance
            bookings={bookings}
            bookingsByProperty={bookingsByProperty}
          />
        );
      case 'reports':
        return (
          <Reports 
            bookings={bookings}
            chartData={chartData}
            propertyStats={propertyStats}
            bookingsByProperty={bookingsByProperty}
          />
        );
      case 'advertising':
        return <Advertising />;
      case 'pending-reviews':
        return <PendingReviews />;
      case 'sql':
        return <SqlEditor />;
      case 'settings':
        return <Settings onFileLoaded={handleFileLoaded} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      
      <main className="ml-64 pt-16">
        <div className="container mx-auto py-8 px-6">
          {bookings.length > 0 && renderContent()}
        </div>
        <footer className="text-center py-4 text-gray-600 border-t">
          L&D GUEST MANAGEMENT by Umut Aksan
        </footer>
      </main>
    </div>
  );
}

export default App;