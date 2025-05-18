import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Phone, Star, Calendar, Home, Filter, Check } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface PendingReview {
  id: string;
  guest_name: string;
  guest_email: string | null;
  guest_phone: string | null;
  arrival_date: string;
  departure_date: string;
  source: string;
  properties: {
    name: string;
  };
}

const PendingReviews: React.FC = () => {
  const [pendingReviews, setPendingReviews] = useState<PendingReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'booking' | 'airbnb'>('all');
  const [selectedReview, setSelectedReview] = useState<string | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState<string>('');

  useEffect(() => {
    fetchPendingReviews();
  }, [filter]);

  const fetchPendingReviews = async () => {
    try {
      let query = supabase
        .from('bookings')
        .select(`
          id,
          guest_name,
          guest_email,
          guest_phone,
          arrival_date,
          departure_date,
          source,
          properties(name)
        `)
        .is('review_text', null)
        .order('departure_date', { ascending: false });

      if (filter === 'booking') {
        query = query.eq('source', 'Booking.com').is('booking_rating', null);
      } else if (filter === 'airbnb') {
        query = query.eq('source', 'Airbnb').is('airbnb_rating', null);
      }

      const { data, error } = await query;

      if (error) throw error;

      setPendingReviews(data || []);
    } catch (err: any) {
      console.error('Error fetching pending reviews:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRating = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          [filter === 'booking' ? 'booking_rating' : 'airbnb_rating']: rating,
          review_text: reviewText,
          review_date: new Date().toISOString()
        })
        .eq('id', bookingId);

      if (error) throw error;

      setPendingReviews(reviews => reviews.filter(r => r.id !== bookingId));
      setSelectedReview(null);
      setRating(0);
      setReviewText('');
    } catch (err: any) {
      console.error('Error submitting rating:', err.message);
      alert('Failed to submit rating');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-lg">
        <p>Error fetching pending reviews: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Star className="h-6 w-6 text-yellow-500" />
          Pending Reviews
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white rounded-lg shadow px-4 py-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'booking' | 'airbnb')}
              className="border-none bg-transparent focus:ring-0 text-sm"
            >
              <option value="all">All Sources</option>
              <option value="booking">Booking.com</option>
              <option value="airbnb">Airbnb</option>
            </select>
          </div>
          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
            {pendingReviews.length} pending
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pendingReviews.map((review) => (
          <div key={review.id} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">{review.guest_name}</h3>
              <div className="flex items-center gap-1 text-yellow-500">
                <Star className="h-5 w-5" />
                <span className="text-sm">Pending {review.source} Review</span>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Home className="h-4 w-4 text-gray-500" />
                <span>{review.properties.name}</span>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>
                  {format(parseISO(review.arrival_date), 'MMM d, yyyy')} - {format(parseISO(review.departure_date), 'MMM d, yyyy')}
                </span>
              </div>

              {review.guest_email && (
                <a
                  href={`mailto:${review.guest_email}`}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                >
                  <Mail className="h-4 w-4" />
                  {review.guest_email}
                </a>
              )}

              {review.guest_phone && (
                <a
                  href={`tel:${review.guest_phone}`}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                >
                  <Phone className="h-4 w-4" />
                  {review.guest_phone}
                </a>
              )}

              {selectedReview === review.id ? (
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rating ({review.source === 'Booking.com' ? '1-10' : '1-5'})
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={review.source === 'Booking.com' ? 10 : 5}
                      value={rating}
                      onChange={(e) => setRating(parseInt(e.target.value))}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Review Text
                    </label>
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      rows={3}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setSelectedReview(null);
                        setRating(0);
                        setReviewText('');
                      }}
                      className="px-3 py-2 text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSubmitRating(review.id)}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Check className="h-4 w-4" />
                      Submit Rating
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setSelectedReview(review.id)}
                  className="mt-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-full"
                >
                  Add Rating & Review
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PendingReviews;