import React, { useState, useMemo } from 'react';
import { 
  ChevronDown, ChevronUp, Search, User, Calendar, Euro, Home, MessageSquare, Star, Plus, Users, PiggyBank, TrendingDown, Info, AlertTriangle, Send, Mail, Phone, Trash2, LogOut, LogIn, Filter 
} from 'lucide-react';
import { format, parseISO, isWithinInterval, startOfWeek, endOfWeek, addDays } from 'date-fns';
import { Booking, BookingExpense } from '../types/Booking';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../i18n/LanguageContext';

interface BookingListProps {
  bookings: Booking[];
  title: string;
  type: 'past' | 'upcoming';
}

const BookingList: React.FC<BookingListProps> = ({ bookings, title, type }) => {
  const { t } = useLanguage();
  const [expandedBookingId, setExpandedBookingId] = useState<string | null>(null);
  const [showExpenses, setShowExpenses] = useState<{ [key: string]: boolean }>({});
  const [newNote, setNewNote] = useState<string>('');
  const [showPastBookings, setShowPastBookings] = useState(false);
  const [expandedProperty, setExpandedProperty] = useState<string | null>(null);
  const [bookingsState, setBookingsState] = useState(bookings);
  const [selectedProperty, setSelectedProperty] = useState<string>('All');
  const [rating, setRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState<string>('');
  const [editingRating, setEditingRating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const properties = ['All', ...new Set(bookings.map(b => b.houseName))];

  const filteredBookings = useMemo(() => {
    return selectedProperty === 'All' 
      ? bookingsState 
      : bookingsState.filter(b => b.houseName === selectedProperty);
  }, [bookingsState, selectedProperty]);

  const thisWeeksActivity = useMemo(() => {
    const today = new Date();
    const weekStart = startOfWeek(today);
    const weekEnd = endOfWeek(today);

    const arrivals = filteredBookings.filter(booking => {
      const arrivalDate = parseISO(booking.dateArrival);
      return isWithinInterval(arrivalDate, { start: weekStart, end: weekEnd });
    }).sort((a, b) => new Date(a.dateArrival).getTime() - new Date(b.dateArrival).getTime());

    const departures = filteredBookings.filter(booking => {
      const departureDate = parseISO(booking.dateDeparture);
      return isWithinInterval(departureDate, { start: weekStart, end: weekEnd });
    }).sort((a, b) => new Date(a.dateDeparture).getTime() - new Date(b.dateDeparture).getTime());

    return { arrivals, departures };
  }, [filteredBookings]);

  const bookingsByDay = useMemo(() => {
    const days: { [key: string]: Booking[] } = {};
    const today = new Date();
    const weekStart = startOfWeek(today);

    for (let i = 0; i < 7; i++) {
      const day = addDays(weekStart, i);
      days[format(day, 'EEEE')] = [];
    }

    thisWeeksActivity.arrivals.forEach(booking => {
      const arrivalDate = parseISO(booking.dateArrival);
      const dayName = format(arrivalDate, 'EEEE');
      days[dayName].push(booking);
    });

    return days;
  }, [thisWeeksActivity.arrivals]);

  const bookingsByProperty = filteredBookings.reduce((acc, booking) => {
    if (!acc[booking.houseName]) {
      acc[booking.houseName] = [];
    }
    acc[booking.houseName].push(booking);
    return acc;
  }, {} as { [key: string]: Booking[] });

  Object.values(bookingsByProperty).forEach(propertyBookings => {
    propertyBookings.sort((a, b) => {
      if (type === 'upcoming') {
        return new Date(a.dateArrival).getTime() - new Date(b.dateArrival).getTime();
      }
      return new Date(b.dateDeparture).getTime() - new Date(a.dateDeparture).getTime();
    });
  });

  const handleDeleteBooking = (bookingId: string) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      setBookingsState(prev => prev.filter(booking => booking.id !== bookingId));
    }
  };

  const calculateTotalExpenses = (expenses: BookingExpense[]) => {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  };

  const handleAddNote = (booking: Booking) => {
    if (!newNote.trim()) return;
    const updatedBookings = bookingsState.map(b => {
      if (b.id === booking.id) {
        const currentNotes = Array.isArray(b.guestNotes) ? b.guestNotes : b.guestNotes ? [b.guestNotes] : [];
        return { ...b, guestNotes: [...currentNotes, newNote] };
      }
      return b;
    });
    setBookingsState(updatedBookings);
    setNewNote('');
  };

  const toggleExpenses = (bookingId: string) => {
    setShowExpenses(prev => ({
      ...prev,
      [bookingId]: !prev[bookingId]
    }));
  };

  const isValidUUID = (uuid: string): boolean => {
    if (!uuid) return false;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  };

  const handleAddRating = async (bookingId: string, source: string) => {
    try {
      setError(null);

      if (!bookingId || !isValidUUID(bookingId)) {
        setError('Invalid booking ID format');
        return;
      }

      if (!rating || (source === 'Booking.com' && (rating < 1 || rating > 10)) || 
          (source === 'Airbnb' && (rating < 1 || rating > 5))) {
        setError(`Please enter a valid rating (${source === 'Booking.com' ? '1-10' : '1-5'})`);
        return;
      }

      const { error: supabaseError } = await supabase
        .from('bookings')
        .update({
          [source === 'Booking.com' ? 'booking_rating' : 'airbnb_rating']: rating,
          review_text: reviewText,
          review_date: new Date().toISOString()
        })
        .eq('id', bookingId);

      if (supabaseError) throw supabaseError;

      setBookingsState(prevBookings =>
        prevBookings.map(booking =>
          booking.id === bookingId
            ? {
                ...booking,
                [source === 'Booking.com' ? 'booking_rating' : 'airbnb_rating']: rating,
                review_text: reviewText,
                review_date: new Date().toISOString()
              }
            : booking
        )
      );

      setEditingRating(null);
      setRating(0);
      setReviewText('');
    } catch (error) {
      console.error('Error adding rating:', error);
      setError(error instanceof Error ? error.message : 'Failed to add rating');
    }
  };

  if (type === 'past' && !showPastBookings) {
    return (
      <div className="mt-8">
        <button
          onClick={() => setShowPastBookings(true)}
          className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
        >
          <Calendar className="h-5 w-5" />
          Show Past Bookings
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          {error}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Home className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-medium">Filter by Property</h2>
        </div>
        <div className="flex items-center gap-2 bg-white rounded-lg shadow px-4 py-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            value={selectedProperty}
            onChange={(e) => setSelectedProperty(e.target.value)}
            className="border-none bg-transparent focus:ring-0 text-sm"
          >
            {properties.map(property => (
              <option key={property} value={property}>
                {property}
              </option>
            ))}
          </select>
        </div>
      </div>

      {type === 'upcoming' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-blue-100 p-4">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <LogIn className="h-5 w-5 text-blue-500" />
              This Week's Arrivals
            </h3>
            
            <div className="space-y-2">
              {thisWeeksActivity.arrivals.length > 0 ? (
                thisWeeksActivity.arrivals.map(booking => (
                  <div key={booking.id} className="bg-blue-50 p-2 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="font-medium text-blue-900">{booking.name}</div>
                        <div className="text-sm text-blue-700 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(parseISO(booking.dateArrival), 'EEE, MMM d')}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-4">
                        <div className="text-sm font-medium text-blue-900">{booking.houseName}</div>
                        <div className="text-xs text-blue-700">{booking.people} guests • {booking.nights} nights</div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500 italic text-center py-2">
                  No arrivals this week
                </div>
              )}
            </div>

            <div className="mt-3 pt-3 border-t">
              <div className="text-sm text-gray-600">
                Total: {thisWeeksActivity.arrivals.length} arrivals
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-purple-100 p-4">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <LogOut className="h-5 w-5 text-purple-500" />
              This Week's Departures
            </h3>
            
            <div className="space-y-2">
              {thisWeeksActivity.departures.length > 0 ? (
                thisWeeksActivity.departures.map(booking => (
                  <div key={booking.id} className="bg-purple-50 p-2 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="font-medium text-purple-900">{booking.name}</div>
                        <div className="text-sm text-purple-700 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(parseISO(booking.dateDeparture), 'EEE, MMM d')}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-4">
                        <div className="text-sm font-medium text-purple-900">{booking.houseName}</div>
                        <div className="text-xs text-purple-700">{booking.people} guests • {booking.nights} nights</div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500 italic text-center py-2">
                  No departures this week
                </div>
              )}
            </div>

            <div className="mt-3 pt-3 border-t">
              <div className="text-sm text-gray-600">
                Total: {thisWeeksActivity.departures.length} departures
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{title}</h2>
          {type === 'past' && (
            <button
              onClick={() => setShowPastBookings(false)}
              className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
            >
              <ChevronUp className="h-5 w-5" />
              Hide Past Bookings
            </button>
          )}
        </div>

        {Object.entries(bookingsByProperty).map(([property, propertyBookings]) => (
          <div key={property} className="bg-white rounded-lg shadow-sm border border-gray-100">
            <div 
              className="p-4 cursor-pointer hover:bg-gray-50"
              onClick={() => setExpandedProperty(expandedProperty === property ? null : property)}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Home className="h-5 w-5 text-gray-500" />
                  <div>
                    <h3 className="font-medium">{property}</h3>
                    <p className="text-sm text-gray-500">
                      {propertyBookings.length} bookings
                    </p>
                  </div>
                </div>
                <ChevronDown className={`h-5 w-5 transition-transform ${
                  expandedProperty === property ? 'rotate-180' : ''
                }`} />
              </div>
            </div>

            {expandedProperty === property && (
              <div className="border-t">
                {propertyBookings.map((booking) => (
                  <div key={booking.id} className="border-b last:border-b-0">
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <User className="h-5 w-5 text-gray-500" />
                          <div>
                            <h3 className="font-medium">{booking.name}</h3>
                            <p className="text-sm text-gray-500">
                              {format(parseISO(booking.dateArrival), 'MMM d, yyyy')} - {format(parseISO(booking.dateDeparture), 'MMM d, yyyy')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => handleDeleteBooking(booking.id)}
                            className="text-red-500 hover:text-red-700 p-2"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => setExpandedBookingId(expandedBookingId === booking.id ? null : booking.id)}
                            className="p-2"
                          >
                            <ChevronDown className={`h-5 w-5 transition-transform ${
                              expandedBookingId === booking.id ? 'rotate-180' : ''
                            }`} />
                          </button>
                        </div>
                      </div>

                      {expandedBookingId === booking.id && (
                        <div className="mt-4 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-gray-500" />
                                <span>{booking.people} guests</span>
                              </div>
                              
                              <div>
                                <h4 className="font-medium mb-2">Contact Information</h4>
                                {booking.email && (
                                  <a 
                                    href={`mailto:${booking.email}`}
                                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                                  >
                                    <Mail className="h-4 w-4" />
                                    {booking.email}
                                  </a>
                                )}
                                {booking.phone && (
                                  <a 
                                    href={`https://wa.me/${booking.phone.replace(/\D/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-green-600 hover:text-green-800"
                                  >
                                    <Phone className="h-4 w-4" />
                                    {booking.phone}
                                  </a>
                                )}
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-blue-600">
                                <span>Total Income:</span>
                                <span>€{booking.totalAmount.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center justify-between text-red-600">
                                <span>Total Expenses:</span>
                                <span>€{calculateTotalExpenses(booking.expenses).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <MessageSquare className="h-5 w-5 text-blue-500" />
                              <h4 className="font-medium">Guest Notes</h4>
                            </div>
                            
                            <div className="space-y-2">
                              {(Array.isArray(booking.guestNotes) ? booking.guestNotes : booking.guestNotes ? [booking.guestNotes] : []).map((note, index) => (
                                <div key={index} className="bg-gray-50 p-3 rounded-lg text-sm">
                                  {note}
                                </div>
                              ))}
                              
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={newNote}
                                  onChange={(e) => setNewNote(e.target.value)}
                                  placeholder="Add a note..."
                                  className="flex-1 rounded-lg border-gray-300 text-sm focus:ring-blue-500 focus:border-blue-500"
                                />
                                <button
                                  onClick={() => handleAddNote(booking)}
                                  className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
                                >
                                  <Send className="h-4 w-4" />
                                  Add Note
                                </button>
                              </div>
                            </div>
                          </div>

                          <div>
                            <button
                              onClick={() => toggleExpenses(booking.id)}
                              className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                            >
                              {showExpenses[booking.id] ? 'Hide Expenses' : 'Show Expenses'}
                              <ChevronDown className={`h-4 w-4 transition-transform ${
                                showExpenses[booking.id] ? 'rotate-180' : ''
                              }`} />
                            </button>

                            {showExpenses[booking.id] && (
                              <div className="mt-3 space-y-3">
                                {booking.expenses.map((expense) => (
                                  <div key={expense.id} className="bg-gray-50 p-3 rounded-lg">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <span className="font-medium">{expense.category}</span>
                                        <p className="text-sm text-gray-600">{expense.description}</p>
                                      </div>
                                      <div className="text-right">
                                        <div className="font-medium">€{expense.amount.toLocaleString()}</div>
                                        <div className="text-sm text-gray-600">{expense.date}</div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Add Rating Section */}
                          <div className="mt-4 border-t pt-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Star className="h-5 w-5 text-yellow-500" />
                              <h4 className="font-medium">Ratings & Reviews</h4>
                            </div>
                            
                            {booking.source === 'Booking.com' && (
                              <div className="mb-4">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-600">Booking.com Rating</span>
                                  {booking.booking_rating ? (
                                    <span className="font-medium">{booking.booking_rating}/10</span>
                                  ) : (
                                    <button
                                      onClick={() => setEditingRating(booking.id)}
                                      className="text-blue-600 hover:text-blue-800 text-sm"
                                    >
                                      Add Rating
                                    </button>
                                  )}
                                </div>
                                {editingRating === booking.id && (
                                  <div className="mt-2 space-y-2">
                                    <input
                                      type="number"
                                      min="1"
                                      max="10"
                                      value={rating}
                                      onChange={(e) => setRating(parseInt(e.target.value))}
                                      className="w-full rounded-lg border-gray-300 text-sm"
                                      placeholder="Rating (1-10)"
                                    />
                                    <textarea
                                      value={reviewText}
                                      onChange={(e) => setReviewText(e.target.value)}
                                      className="w-full rounded-lg border-gray-300 text-sm"
                                      placeholder="Review text"
                                      rows={3}
                                    />
                                    <div className="flex justify-end gap-2">
                                      <button
                                        onClick={() => setEditingRating(null)}
                                        className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        onClick={() => handleAddRating(booking.id, 'Booking.com')}
                                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                      >
                                        Save Rating
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {booking.source === 'Airbnb' && (
                              <div className="mb-4">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-600">Airbnb Rating</span>
                                  {booking.airbnb_rating ? (
                                    <span className="font-medium">{booking.airbnb_rating}/5</span>
                                  ) : (
                                    <button
                                      onClick={() => setEditingRating(booking.id)}
                                      className="text-blue-600 hover:text-blue-800 text-sm"
                                    >
                                      Add Rating
                                    </button>
                                  )}
                                </div>
                                {editingRating === booking.id && (
                                  <div className="mt-2 space-y-2">
                                    <input
                                      type="number"
                                      min="1"
                                      max="5"
                                      value={rating}
                                      onChange={(e) => setRating(parseInt(e.target.value))}
                                      className="w-full rounded-lg border-gray-300 text-sm"
                                      placeholder="Rating (1-5)"
                                    />
                                    <textarea
                                      value={reviewText}
                                      onChange={(e) => setReviewText(e.target.value)}
                                      className="w-full rounded-lg border-gray-300 text-sm"
                                      placeholder="Review text"
                                      rows={3}
                                    />
                                    <div className="flex justify-end gap-2">
                                      <button
                                        onClick={() => setEditingRating(null)}
                                        className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        onClick={() => handleAddRating(booking.id, 'Airbnb')}
                                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                      >
                                        Save Rating
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {(booking.booking_rating || booking.airbnb_rating) && booking.review_text && (
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-sm text-gray-700">{booking.review_text}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Added on {format(parseISO(booking.review_date), 'MMM d, yyyy')}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookingList;