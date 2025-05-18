import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Phone, Star, Calendar, Home } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface PendingReview {
  id: string;
  guest_name: string;
  guest_email: string | null;
  guest_phone: string | null;
  arrival_date: string;
  departure_date: string;
  properties: {
    name: string;
  };
}

const PendingReviews: React.FC = () => {
  const [pendingReviews, setPendingReviews] = useState<PendingReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingReviews();
  }, []);

  const fetchPendingReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          guest_name,
          guest_email,
          guest_phone,
          arrival_date,
          departure_date,
          properties(name)
        `)
        .eq('source', 'Booking.com')
        .is('guest_rating', null)
        .order('departure_date', { ascending: false });

      if (error) throw error;

      setPendingReviews(data || []);
    } catch (err: any) {
      console.error('Error fetching pending reviews:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
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

  if (pendingReviews.length === 0) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg text-center">
        <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No pending reviews found</p>
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
        <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
          {pendingReviews.length} pending
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pendingReviews.map((review) => (
          <div key={review.id} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">{review.guest_name}</h3>
              <div className="flex items-center gap-1 text-yellow-500">
                <Star className="h-5 w-5" />
                <span className="text-sm">Pending</span>
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
                  {format(parseISO(review.departure_date), 'MMM d, yyyy')}
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PendingReviews;