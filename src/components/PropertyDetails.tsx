import React, { useState, useRef } from 'react';
import { Home, Calendar, Users, TrendingUp, TrendingDown, FileBarChart, Sun, LayoutDashboard, Download, Loader2 } from 'lucide-react';
import { Booking, PropertyData } from '../types/Booking';
import WeeklySummary from './WeeklySummary';
import BookingList from './BookingList';
import GuestAnalytics from './GuestAnalytics';
import RevenueChart from './RevenueChart';
import ExpenseDetails from './ExpenseDetails';
import Maintenance from './Maintenance';
import Reports from './Reports';
import AnalysisReport from './AnalysisReport';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { format } from 'date-fns';

interface PropertyDetailsProps {
  propertyName: string;
  bookings: Booking[];
  bookingsByProperty: { [property: string]: Booking[] };
  propertyStats: { [property: string]: { income: number; expenses: number } };
  chartData: { [property: string]: PropertyData };
  monthlyExpenses: { [property: string]: Array<{ month: string; expenses: { [category: string]: number } }> };
  expensesByProperty: { [category: string]: number };
  totalExpensesByProperty: number;
  initialSection?: string;
}

const PropertyDetails: React.FC<PropertyDetailsProps> = ({
  propertyName,
  bookings,
  bookingsByProperty,
  propertyStats,
  chartData,
  monthlyExpenses,
  expensesByProperty,
  totalExpensesByProperty,
  initialSection = 'daily'
}) => {
  const [activeSection, setActiveSection] = useState(initialSection);
  const [isExporting, setIsExporting] = useState(false);
  const contentRefs = {
    daily: useRef<HTMLDivElement>(null),
    overview: useRef<HTMLDivElement>(null),
    bookings: useRef<HTMLDivElement>(null),
    guests: useRef<HTMLDivElement>(null),
    revenue: useRef<HTMLDivElement>(null),
    expenses: useRef<HTMLDivElement>(null),
    maintenance: useRef<HTMLDivElement>(null),
    reports: useRef<HTMLDivElement>(null),
    analytics: useRef<HTMLDivElement>(null)
  };

  const propertyBookings = bookingsByProperty[propertyName] || [];

  const navigationItems = [
    { id: 'reports', icon: FileBarChart, label: 'Reports & Analytics' },
    { id: 'daily', icon: Sun, label: 'Daily Summary' },
    { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
    { id: 'bookings', icon: Calendar, label: 'Bookings' },
    { id: 'guests', icon: Users, label: 'Guests' },
    { id: 'revenue', icon: TrendingUp, label: 'Revenue' },
    { id: 'expenses', icon: TrendingDown, label: 'Expenses' },
    { id: 'maintenance', icon: Home, label: 'Maintenance' }
  ];

  const exportAllToPDF = async () => {
    setIsExporting(true);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const sections = Object.keys(contentRefs);
    let currentPage = 1;

    try {
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        setActiveSection(section);
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const ref = contentRefs[section as keyof typeof contentRefs];
        if (ref.current) {
          const canvas = await html2canvas(ref.current, {
            scale: 2,
            logging: false,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff'
          });

          const imgData = canvas.toDataURL('image/png');
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

          if (currentPage > 1) {
            pdf.addPage();
          }

          pdf.setFontSize(20);
          pdf.setTextColor(0, 0, 0);
          pdf.text(navigationItems.find(item => item.id === section)?.label || '', 20, 20);
          
          pdf.addImage(imgData, 'PNG', 0, 30, pdfWidth, pdfHeight);
          
          currentPage++;
        }
      }

      pdf.save(`${propertyName}-complete-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const renderContent = () => {
    const content = (() => {
      switch (activeSection) {
        case 'daily':
          return (
            <WeeklySummary 
              bookings={propertyBookings}
              bookingsByProperty={{ [propertyName]: propertyBookings }}
            />
          );
        case 'overview':
          return (
            <AnalysisReport
              propertyData={chartData[propertyName]}
              propertyName={propertyName}
            />
          );
        case 'bookings':
          return (
            <BookingList
              bookings={propertyBookings}
              title="Property Bookings"
              type="upcoming"
            />
          );
        case 'guests':
          return (
            <GuestAnalytics
              bookings={propertyBookings}
              selectedProperty={propertyName}
            />
          );
        case 'revenue':
          return (
            <RevenueChart
              propertyData={chartData}
              propertyName={propertyName}
            />
          );
        case 'expenses':
          return (
            <ExpenseDetails
              expensesByProperty={{ [propertyName]: expensesByProperty }}
              totalExpensesByProperty={{ [propertyName]: totalExpensesByProperty }}
              propertyName={propertyName}
              monthlyExpenses={monthlyExpenses}
            />
          );
        case 'maintenance':
          return (
            <Maintenance
              bookings={propertyBookings}
              bookingsByProperty={{ [propertyName]: propertyBookings }}
            />
          );
        case 'reports':
          return (
            <Reports 
              bookings={propertyBookings}
              chartData={{ [propertyName]: chartData[propertyName] }}
              propertyStats={{ [propertyName]: propertyStats[propertyName] }}
              bookingsByProperty={{ [propertyName]: propertyBookings }}
            />
          );
        default:
          return null;
      }
    })();

    return (
      <div ref={contentRefs[activeSection as keyof typeof contentRefs]}>
        {content}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto py-4 px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Home className="h-6 w-6 text-blue-600" />
              <h1 className="text-2xl font-semibold">{propertyName}</h1>
            </div>
            <button
              onClick={exportAllToPDF}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download className="h-5 w-5" />
                  Export Complete Report
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="mb-8 bg-white rounded-lg shadow p-4">
          <nav className="flex gap-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    activeSection === item.id
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {renderContent()}
      </div>
    </div>
  );
};

export default PropertyDetails;