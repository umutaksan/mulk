import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Phone, Star, Calendar, Home, Filter, Check, Send } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface Review {
  id: string;
  guest_name: string;
  guest_email: string | null;
  guest_phone: string | null;
  arrival_date: string;
  departure_date: string;
  source: string;
  booking_rating: number | null;
  airbnb_rating: number | null;
  review_text: string | null;
  review_date: string | null;
  email_marketing_sent: boolean;
  properties: {
    name: string;
  };
}

const PendingReviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'rated' | 'unrated'>('unrated');
  const [selectedReview, setSelectedReview] = useState<string | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState<string>('');

  useEffect(() => {
    fetchReviews();
  }, [filter]);

  const fetchReviews = async () => {
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
          booking_rating,
          airbnb_rating,
          review_text,
          review_date,
          email_marketing_sent,
          properties(name)
        `)
        .order('departure_date', { ascending: false });

      if (filter === 'rated') {
        query = query.or('booking_rating.not.is.null,airbnb_rating.not.is.null');
      } else if (filter === 'unrated') {
        query = query.or('and(source.eq.Booking.com,booking_rating.is.null),and(source.eq.Airbnb,airbnb_rating.is.null)');
      }

      const { data, error } = await query;

      if (error) throw error;

      setReviews(data || []);
    } catch (err: any) {
      console.error('Error fetching reviews:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRating = async (bookingId: string, source: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          [source === 'Booking.com' ? 'booking_rating' : 'airbnb_rating']: rating,
          review_text: reviewText,
          review_date: new Date().toISOString()
        })
        .eq('id', bookingId);

      if (error) throw error;

      await fetchReviews();
      setSelectedReview(null);
      setRating(0);
      setReviewText('');
    } catch (err: any) {
      console.error('Error submitting rating:', err.message);
      alert('Failed to submit rating');
    }
  };

  const handleMarkEmailSent = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ email_marketing_sent: true })
        .eq('id', bookingId);

      if (error) throw error;

      await fetchReviews();
    } catch (err: any) {
      console.error('Error marking email as sent:', err.message);
      alert('Failed to update email status');
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
        <p>Error fetching reviews: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Star className="h-6 w-6 text-yellow-500" />
          Guest Reviews
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white rounded-lg shadow px-4 py-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'rated' | 'unrated')}
              className="border-none bg-transparent focus:ring-0 text-sm"
            >
              <option value="unrated">Pending Reviews</option>
              <option value="rated">Rated</option>
              <option value="all">All Reviews</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">{review.guest_name}</h3>
              <div className="flex items-center gap-2">
                {review.source === 'Booking.com' ? (
                  review.booking_rating ? (
                    <span className="text-green-600">{review.booking_rating}/10</span>
                  ) : (
                    <span className="text-yellow-500">Pending Booking.com Review</span>
                  )
                ) : review.airbnb_rating ? (
                  <span className="text-green-600">{review.airbnb_rating}/5</span>
                ) : (
                  <span className="text-yellow-500">Pending Airbnb Review</span>
                )}
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

              {review.review_text && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-gray-700">{review.review_text}</p>
                  {review.review_date && (
                    <p className="text-xs text-gray-500 mt-1">
                      Added on {format(parseISO(review.review_date), 'MMM d, yyyy')}
                    </p>
                  )}
                </div>
              )}

              <div className="flex justify-between items-center pt-2">
                {!review.email_marketing_sent && review.guest_email && (
                  <button
                    onClick={() => handleMarkEmailSent(review.id)}
                    className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:text-blue-800"
                  >
                    <Send className="h-4 w-4" />
                    Mark Email Sent
                  </button>
                )}
                {review.email_marketing_sent && (
                  <span className="text-green-600 flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Email Sent
                  </span>
                )}

                {!review.review_text && (
                  <button
                    onClick={() => setSelectedReview(review.id)}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add Rating & Review
                  </button>
                )}
              </div>

              {selectedReview === review.id && (
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
                      onClick={() => handleSubmitRating(review.id, review.source)}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Check className="h-4 w-4" />
                      Submit Rating
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PendingReviews;