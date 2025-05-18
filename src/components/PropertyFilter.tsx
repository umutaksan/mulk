import React, { useState } from 'react';
import { Home, Filter, PiggyBank, TrendingUp, TrendingDown, Calendar, Moon, BookOpen, X, PieChart } from 'lucide-react';
import { format, parseISO, getDaysInMonth } from 'date-fns';
import { calculateMonthlyStats } from '../utils/csvParser';
import { Booking } from '../types/Booking';
import { useLanguage } from '../i18n/LanguageContext';

interface PropertyFilterProps {
  properties: string[];
  selectedProperty: string;
  onSelectProperty: (property: string) => void;
  propertyStats: { [property: string]: { income: number; expenses: number } };
  bookingsByProperty: { [property: string]: Booking[] };
  showDetails?: boolean;
}

const PropertyFilter: React.FC<PropertyFilterProps> = ({
  properties,
  selectedProperty,
  onSelectProperty,
  propertyStats,
  bookingsByProperty,
  showDetails = false
}) => {
  const { t } = useLanguage();
  const [hoveredProperty, setHoveredProperty] = useState<string | null>(null);
  const [expandedProperty, setExpandedProperty] = useState<string | null>(null);

  const ldGuestProperties = [
    'Marbella Old Town',
    'Jardines Tropicales-Puerto Banús',
    'Playa de la Fontanilla Marbella'
  ];

  const ldGuestCommissionProperties = [
    'ALOHA • Garden + Rooftop View Marbella Stay'
  ];

  const handlePropertyClick = (property: string) => {
    // Only navigate to revenue section without setting selected property
    window.dispatchEvent(new CustomEvent('navigateToSection', { detail: 'revenue' }));
  };

  // Calculate L&D Guest Commission Income
  const calculateCommissionIncome = () => {
    const commissionProperty = 'ALOHA • Garden + Rooftop View Marbella Stay';
    const propertyBookings = bookingsByProperty[commissionProperty] || [];
    return propertyBookings.reduce((total, booking) => {
      const commission = booking.expenses.find(exp => exp.category === 'Other')?.amount || 0;
      return total + commission;
    }, 0);
  };

  const commissionIncome = calculateCommissionIncome();

  const calculateYTDStats = (properties: string[]) => {
    const today = new Date();
    let ytdIncome = 0;
    let ytdExpenses = 0;

    properties.forEach(property => {
      const propertyBookings = bookingsByProperty[property] || [];
      const ytdBookings = propertyBookings.filter(booking => {
        const departureDate = new Date(booking.dateDeparture);
        return departureDate <= today;
      });

      ytdIncome += ytdBookings.reduce((sum, booking) => sum + booking.totalAmount, 0);
      ytdExpenses += ytdBookings.reduce((sum, booking) => 
        sum + booking.expenses.reduce((expSum, exp) => expSum + exp.amount, 0), 0);
    });

    return { income: ytdIncome, expenses: ytdExpenses };
  };

  // Calculate stats for each group
  const calculateGroupStats = (groupProperties: string[]) => {
    const totalStats = {
      income: groupProperties.reduce((sum, property) => 
        sum + (propertyStats[property]?.income || 0), 0),
      expenses: groupProperties.reduce((sum, property) => 
        sum + (propertyStats[property]?.expenses || 0), 0)
    };

    const ytdStats = calculateYTDStats(groupProperties);

    return {
      total: totalStats,
      ytd: ytdStats
    };
  };

  const ldGuestStats = calculateGroupStats(ldGuestProperties);
  const ldGuestCommissionStats = calculateGroupStats(ldGuestCommissionProperties);

  const GroupStats = ({ stats, title, colorScheme }: { 
    stats: { 
      total: { income: number; expenses: number }; 
      ytd: { income: number; expenses: number } 
    }; 
    title: string;
    colorScheme: 'blue' | 'purple'
  }) => {
    const totalProfit = stats.total.income - stats.total.expenses;
    const ytdProfit = stats.ytd.income - stats.ytd.expenses;

    return (
      <div className={`mb-8 bg-white rounded-xl shadow-md p-6 border-l-4 ${
        colorScheme === 'blue' ? 'border-blue-500' : 'border-purple-500'
      }`}>
        <h3 className={`text-lg font-semibold mb-4 ${
          colorScheme === 'blue' ? 'text-blue-600' : 'text-purple-600'
        }`}>{title}</h3>
        
        <div className="space-y-6">
          {/* Total Stats */}
          <div>
            <h4 className="text-sm font-medium mb-2 text-gray-600">Total Performance</h4>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-green-50 p-2 rounded-lg">
                <div className="flex items-center mb-1">
                  <TrendingUp className="h-4 w-4 mr-1 text-green-600" />
                  <span className="font-medium text-xs text-gray-700">Total Income</span>
                </div>
                <span className="text-sm font-bold text-green-700">
                  €{stats.total.income.toLocaleString()}
                </span>
              </div>
              
              <div className="bg-red-50 p-2 rounded-lg">
                <div className="flex items-center mb-1">
                  <TrendingDown className="h-4 w-4 mr-1 text-red-600" />
                  <span className="font-medium text-xs text-gray-700">Total Expenses</span>
                </div>
                <span className="text-sm font-bold text-red-700">
                  €{stats.total.expenses.toLocaleString()}
                </span>
              </div>
              
              <div className={`${totalProfit > 0 ? 'bg-purple-50' : 'bg-gray-50'} p-2 rounded-lg`}>
                <div className="flex items-center mb-1">
                  <PiggyBank className={`h-4 w-4 mr-1 ${totalProfit > 0 ? 'text-purple-600' : 'text-gray-600'}`} />
                  <span className="font-medium text-xs text-gray-700">Total Profit</span>
                </div>
                <span className={`text-sm font-bold ${totalProfit > 0 ? 'text-purple-700' : 'text-gray-700'}`}>
                  €{totalProfit.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* YTD Stats */}
          <div>
            <h4 className="text-sm font-medium mb-2 text-gray-600">Year to Date</h4>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-green-50 p-2 rounded-lg">
                <div className="flex items-center mb-1">
                  <TrendingUp className="h-4 w-4 mr-1 text-green-600" />
                  <span className="font-medium text-xs text-gray-700">YTD Income</span>
                </div>
                <span className="text-sm font-bold text-green-700">
                  €{stats.ytd.income.toLocaleString()}
                </span>
              </div>
              
              <div className="bg-red-50 p-2 rounded-lg">
                <div className="flex items-center mb-1">
                  <TrendingDown className="h-4 w-4 mr-1 text-red-600" />
                  <span className="font-medium text-xs text-gray-700">YTD Expenses</span>
                </div>
                <span className="text-sm font-bold text-red-700">
                  €{stats.ytd.expenses.toLocaleString()}
                </span>
              </div>
              
              <div className={`${ytdProfit > 0 ? 'bg-purple-50' : 'bg-gray-50'} p-2 rounded-lg`}>
                <div className="flex items-center mb-1">
                  <PiggyBank className={`h-4 w-4 mr-1 ${ytdProfit > 0 ? 'text-purple-600' : 'text-gray-600'}`} />
                  <span className="font-medium text-xs text-gray-700">YTD Profit</span>
                </div>
                <span className={`text-sm font-bold ${ytdProfit > 0 ? 'text-purple-700' : 'text-gray-700'}`}>
                  €{ytdProfit.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const PropertyStats = ({ stats, property }: { stats: { income: number; expenses: number }, property: string }) => {
    const netProfit = stats.income - stats.expenses;
    const isPositive = netProfit > 0;
    const isHovered = hoveredProperty === property;
    const isExpanded = expandedProperty === property;

    const propertyBookings = bookingsByProperty[property] || [];
    const ytdStats = calculateYTDStats([property]);

    return (
      <div className="mt-3 space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <div className={`${isHovered || isExpanded ? 'bg-blue-600' : 'bg-green-50'} p-2 rounded-lg transition-colors duration-200`}>
            <div className={`flex items-center mb-1`}>
              <TrendingUp className={`h-4 w-4 mr-1 ${isHovered || isExpanded ? 'text-white' : 'text-green-600'}`} />
              <span className={`font-medium text-xs ${isHovered || isExpanded ? 'text-white' : 'text-gray-700'}`}>
                Total Income
              </span>
            </div>
            <span className={`text-sm font-bold ${isHovered || isExpanded ? 'text-white' : 'text-green-700'}`}>
              €{stats.income.toLocaleString()}
            </span>
          </div>
          
          <div className={`${isHovered || isExpanded ? 'bg-blue-600' : 'bg-red-50'} p-2 rounded-lg transition-colors duration-200`}>
            <div className={`flex items-center mb-1`}>
              <TrendingDown className={`h-4 w-4 mr-1 ${isHovered || isExpanded ? 'text-white' : 'text-red-600'}`} />
              <span className={`font-medium text-xs ${isHovered || isExpanded ? 'text-white' : 'text-gray-700'}`}>
                Total Expenses
              </span>
            </div>
            <span className={`text-sm font-bold ${isHovered || isExpanded ? 'text-white' : 'text-red-700'}`}>
              €{stats.expenses.toLocaleString()}
            </span>
          </div>
          
          <div className={`${isHovered || isExpanded ? 'bg-blue-600' : isPositive ? 'bg-purple-50' : 'bg-gray-50'} p-2 rounded-lg transition-colors duration-200`}>
            <div className={`flex items-center mb-1`}>
              <PiggyBank className={`h-4 w-4 mr-1 ${isHovered || isExpanded ? 'text-white' : isPositive ? 'text-purple-600' : 'text-gray-600'}`} />
              <span className={`font-medium text-xs ${isHovered || isExpanded ? 'text-white' : 'text-gray-700'}`}>
                Total Profit
              </span>
            </div>
            <span className={`text-sm font-bold ${isHovered || isExpanded ? 'text-white' : isPositive ? 'text-purple-700' : 'text-gray-700'}`}>
              €{netProfit.toLocaleString()}
            </span>
          </div>
        </div>

        {showDetails && (
          <div>
            <h4 className={`text-sm font-medium mb-2 ${isHovered || isExpanded ? 'text-white' : 'text-gray-700'}`}>
              Year to Date
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <div className={`${isHovered || isExpanded ? 'bg-blue-700' : 'bg-green-50'} p-2 rounded-lg transition-colors duration-200`}>
                <div className={`flex items-center mb-1`}>
                  <TrendingUp className={`h-4 w-4 mr-1 ${isHovered || isExpanded ? 'text-white' : 'text-green-600'}`} />
                  <span className={`font-medium text-xs ${isHovered || isExpanded ? 'text-white' : 'text-gray-700'}`}>
                    YTD Income
                  </span>
                </div>
                <span className={`text-sm font-bold ${isHovered || isExpanded ? 'text-white' : 'text-green-700'}`}>
                  €{ytdStats.income.toLocaleString()}
                </span>
              </div>
              
              <div className={`${isHovered || isExpanded ? 'bg-blue-700' : 'bg-red-50'} p-2 rounded-lg transition-colors duration-200`}>
                <div className={`flex items-center mb-1`}>
                  <TrendingDown className={`h-4 w-4 mr-1 ${isHovered || isExpanded ? 'text-white' : 'text-red-600'}`} />
                  <span className={`font-medium text-xs ${isHovered || isExpanded ? 'text-white' : 'text-gray-700'}`}>
                    YTD Expenses
                  </span>
                </div>
                <span className={`text-sm font-bold ${isHovered || isExpanded ? 'text-white' : 'text-red-700'}`}>
                  €{ytdStats.expenses.toLocaleString()}
                </span>
              </div>
              
              <div className={`${isHovered || isExpanded ? 'bg-blue-700' : (ytdStats.income - ytdStats.expenses) > 0 ? 'bg-purple-50' : 'bg-gray-50'} p-2 rounded-lg transition-colors duration-200`}>
                <div className={`flex items-center mb-1`}>
                  <PiggyBank className={`h-4 w-4 mr-1 ${isHovered || isExpanded ? 'text-white' : (ytdStats.income - ytdStats.expenses) > 0 ? 'text-purple-600' : 'text-gray-600'}`} />
                  <span className={`font-medium text-xs ${isHovered || isExpanded ? 'text-white' : 'text-gray-700'}`}>
                    YTD Profit
                  </span>
                </div>
                <span className={`text-sm font-bold ${isHovered || isExpanded ? 'text-white' : (ytdStats.income - ytdStats.expenses) > 0 ? 'text-purple-700' : 'text-gray-700'}`}>
                  €{(ytdStats.income - ytdStats.expenses).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mb-8">
      {/* L&D Guest Commission Income Section */}
      <div className="mb-8 bg-purple-50 rounded-xl p-6 border border-purple-100">
        <div className="flex items-center gap-2 mb-4">
          <PiggyBank className="h-6 w-6 text-purple-600" />
          <h2 className="text-xl font-semibold text-purple-900">L&D Guest Commission Income</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Total Commission Income</h3>
            <p className="text-3xl font-bold text-purple-600">
              €{commissionIncome.toLocaleString()}
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Commission Properties</h3>
            <div className="flex items-center justify-between">
              <span className="text-gray-800">ALOHA • Garden + Rooftop View Marbella Stay</span>
              <span className="font-semibold text-purple-600">€{commissionIncome.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center mb-6">
        <Filter className="h-6 w-6 mr-2 text-blue-500" />
        <h2 className="text-xl font-semibold text-gray-800">{t('propertyFilter.title')}</h2>
      </div>

      {/* L&D Guest Properties Summary */}
      <GroupStats 
        stats={ldGuestStats}
        title="L&D Guest Properties"
        colorScheme="blue"
      />

      {/* L&D Guest Commission Properties Summary */}
      <GroupStats 
        stats={ldGuestCommissionStats}
        title="L&D Guest Commission Properties"
        colorScheme="purple"
      />

      {/* Individual L&D Guest Properties */}
      <div className="mb-8">
        <h4 className="text-md font-medium mb-4 text-gray-600">L&D Guest Properties</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ldGuestProperties.map((property) => (
            <div
              key={property}
              className={`p-4 rounded-xl transition-all duration-200 cursor-pointer ${
                selectedProperty === property
                  ? 'bg-blue-500'
                  : 'bg-white shadow-md hover:shadow-lg'
              }`}
              onClick={() => handlePropertyClick(property)}
              onMouseEnter={() => setHoveredProperty(property)}
              onMouseLeave={() => setHoveredProperty(null)}
            >
              <div className="flex items-center">
                <Home className={`h-5 w-5 mr-2 ${selectedProperty === property ? 'text-white' : 'text-gray-700'}`} />
                <span className={`font-semibold ${selectedProperty === property ? 'text-white' : 'text-gray-700'}`}>
                  {property}
                </span>
              </div>
              {showDetails && propertyStats[property] && (
                <PropertyStats stats={propertyStats[property]} property={property} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Individual L&D Guest Commission Properties */}
      <div>
        <h4 className="text-md font-medium mb-4 text-gray-600">L&D Guest Commission Properties</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ldGuestCommissionProperties.map((property) => (
            <div
              key={property}
              className={`p-4 rounded-xl transition-all duration-200 cursor-pointer ${
                selectedProperty === property
                  ? 'bg-purple-500'
                  : 'bg-white shadow-md hover:shadow-lg'
              }`}
              onClick={() => handlePropertyClick(property)}
              onMouseEnter={() => setHoveredProperty(property)}
              onMouseLeave={() => setHoveredProperty(null)}
            >
              <div className="flex items-center">
                <Home className={`h-5 w-5 mr-2 ${selectedProperty === property ? 'text-white' : 'text-gray-700'}`} />
                <span className={`font-semibold ${selectedProperty === property ? 'text-white' : 'text-gray-700'}`}>
                  {property}
                </span>
              </div>
              {showDetails && propertyStats[property] && (
                <PropertyStats stats={propertyStats[property]} property={property} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PropertyFilter;