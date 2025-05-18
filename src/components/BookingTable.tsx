import React, { useState } from 'react';
import { Booking } from '../types/Booking';
import { ChevronDown, ChevronUp, Search, User, Calendar, Euro, Home, MessageSquare, Star } from 'lucide-react';

interface BookingTableProps {
  bookings: Booking[];
}

type SortField = 'name' | 'dateArrival' | 'dateDeparture' | 'nights' | 'houseName' | 'totalAmount';
type SortDirection = 'asc' | 'desc';

const BookingTable: React.FC<BookingTableProps> = ({ bookings }) => {
  const [sortField, setSortField] = useState<SortField>('dateArrival');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [searchTerm, setSearchTerm] = useState('');

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedBookings = [...bookings].sort((a, b) => {
    let comparison = 0;
    
    switch (sortField) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'dateArrival':
        comparison = new Date(a.dateArrival).getTime() - new Date(b.dateArrival).getTime();
        break;
      case 'dateDeparture':
        comparison = new Date(a.dateDeparture).getTime() - new Date(b.dateDeparture).getTime();
        break;
      case 'nights':
        comparison = a.nights - b.nights;
        break;
      case 'houseName':
        comparison = a.houseName.localeCompare(b.houseName);
        break;
      case 'totalAmount':
        comparison = a.totalAmount - b.totalAmount;
        break;
      default:
        break;
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const filteredBookings = sortedBookings.filter(booking => 
    booking.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.houseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.dateArrival.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };

  const today = new Date();

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b">
        <h2 className="text-lg font-medium">Bookings</h2>
        <div className="mt-2 relative">
          <input
            type="text"
            placeholder="Search bookings..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  Guest
                  <SortIcon field="name" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('dateArrival')}
              >
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Arrival
                  <SortIcon field="dateArrival" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('dateDeparture')}
              >
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Departure
                  <SortIcon field="dateDeparture" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('nights')}
              >
                <div className="flex items-center">
                  Nights
                  <SortIcon field="nights" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('houseName')}
              >
                <div className="flex items-center">
                  <Home className="h-4 w-4 mr-1" />
                  Property
                  <SortIcon field="houseName" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('totalAmount')}
              >
                <div className="flex items-center">
                  <Euro className="h-4 w-4 mr-1" />
                  Amount
                  <SortIcon field="totalAmount" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredBookings.length > 0 ? (
              filteredBookings.map((booking) => {
                const isPast = new Date(booking.dateDeparture) < today;
                const statusClass = isPast ? 'bg-gray-100' : 'bg-blue-50';
                
                return (
                  <tr key={booking.id} className={`hover:bg-gray-50 ${statusClass}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{booking.name}</div>
                      <div className="text-xs text-gray-500">{booking.source}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{booking.dateArrival}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{booking.dateDeparture}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{booking.nights}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{booking.houseName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        €{booking.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {booking.guestNotes && (
                          <MessageSquare className="h-4 w-4 text-blue-500" title="Has notes" />
                        )}
                        {booking.hasReview && (
                          <Star className="h-4 w-4 text-yellow-500" title="Has review" />
                        )}
                        <span className="text-sm text-gray-500">
                          {isPast ? 'Past' : 'Upcoming'}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                  No bookings found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookingTable;