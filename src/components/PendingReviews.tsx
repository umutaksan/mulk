import React, { useState, useEffect } from 'react';
import { Star, Mail, Phone, Calendar, Home } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';

interface PendingReview {
  id: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  arrival_date: string;
  departure_date: string;
  property_name: string;
}

const PendingReviews: React.FC = () => {
  const [pendingReviews, setPendingReviews] = useState<PendingReview[]>([]);
  const [loading, setLoading] = useState(true);

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
          properties (
            name
          )
        `)
        .eq('source', 'Booking.com')
        .is('guest_rating', null)
        .order('departure_date', { ascending: false });

      if (error) throw error;

      setPendingReviews(data.map(booking => ({
        id: booking.id,
        guest_name: booking.guest_name,
        guest_email: booking.guest_email,
        guest_phone: booking.guest_phone,
        arrival_date: booking.arrival_date,
        departure_date: booking.departure_date,
        property_name: booking.properties.name
      })));
    } catch (error) {
      console.error('Error fetching pending reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Star className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-semibold">Pending Reviews</h2>
      </div>

      {pendingReviews.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-600">No pending reviews found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pendingReviews.map((review) => (
            <div key={review.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">{review.guest_name}</h3>
                <div className="flex items-center gap-1 text-yellow-500">
                  <Star className="h-4 w-4" />
                  <span className="text-sm">Pending</span>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-gray-500" />
                  <span>{review.property_name}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>
                    {format(new Date(review.arrival_date), 'MMM d, yyyy')} - {format(new Date(review.departure_date), 'MMM d, yyyy')}
                  </span>
                </div>

                {review.guest_email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <a
                      href={`mailto:${review.guest_email}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {review.guest_email}
                    </a>
                  </div>
                )}

                {review.guest_phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <a
                      href={`tel:${review.guest_phone}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {review.guest_phone}
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingReviews;