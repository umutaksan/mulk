import { createClient } from 'npm:@supabase/supabase-js@2.39.7';
import { parse } from 'npm:csv-parse/sync';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Required Supabase environment variables are not set');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function importCSVData(csvContent: string, guestDetails: any[] = []) {
  try {
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true
    });

    if (!records || records.length === 0) {
      return {
        success: false,
        error: 'No valid records found in CSV file'
      };
    }

    // Create a map of guest details for quick lookup
    const guestDetailsMap = new Map(
      guestDetails.map(guest => [
        `${guest.Name}-${guest.DateArrival}`,
        {
          birthplace: guest.Birthplace,
          nationality: guest.Nationality,
          passport: guest.Passport,
          address: guest.Address,
          accompanying_guests: guest.AccompanyingGuests ? JSON.parse(guest.AccompanyingGuests) : null
        }
      ])
    );

    let insertedCount = 0;
    let skippedCount = 0;
    const errors = [];

    for (const record of records) {
      try {
        // Get property ID
        const { data: property } = await supabase
          .from('properties')
          .select('id')
          .eq('name', record.HouseName)
          .single();

        if (!property) {
          errors.push(`Property not found: ${record.HouseName}`);
          continue;
        }

        // Check for existing booking
        const { data: existingBooking } = await supabase
          .from('bookings')
          .select('id')
          .eq('property_id', property.id)
          .eq('guest_name', record.Name)
          .eq('arrival_date', record.DateArrival)
          .eq('departure_date', record.DateDeparture)
          .single();

        if (!existingBooking) {
          // Get additional guest details if available
          const guestKey = `${record.Name}-${record.DateArrival}`;
          const additionalDetails = guestDetailsMap.get(guestKey) || {};

          const bookingData = {
            property_id: property.id,
            guest_name: record.Name,
            guest_email: record.Email || null,
            guest_phone: record.Phone || null,
            guest_country: record.CountryName || 'N/A',
            arrival_date: record.DateArrival,
            departure_date: record.DateDeparture,
            nights: parseInt(record.Nights),
            guests: parseInt(record.People) || 1,
            total_amount: parseFloat(record.TotalAmount.replace(',', '.')),
            source: record.Source || 'CSV Import',
            status: record.Status?.toLowerCase() || 'confirmed',
            // Add additional guest details
            guest_birthplace: additionalDetails.birthplace || null,
            guest_nationality: additionalDetails.nationality || null,
            guest_passport: additionalDetails.passport || null,
            guest_address: additionalDetails.address || null,
            accompanying_guests: additionalDetails.accompanying_guests || null
          };

          const { data: insertedBooking, error: bookingError } = await supabase
            .from('bookings')
            .insert(bookingData)
            .select()
            .single();

          if (bookingError) throw bookingError;

          insertedCount++;

          // Calculate and insert expenses
          const expenses = calculateExpenses(bookingData, insertedBooking.id);
          
          for (const expense of expenses) {
            const { error: expenseError } = await supabase
              .from('expenses')
              .insert(expense);

            if (expenseError) {
              errors.push(`Error inserting expense for booking ${insertedBooking.id}: ${expenseError.message}`);
            }
          }
        } else {
          skippedCount++;
        }
      } catch (error) {
        errors.push(`Error processing record: ${error.message}`);
      }
    }

    return {
      success: true,
      message: `Import completed: ${insertedCount} new bookings imported, ${skippedCount} existing bookings skipped`,
      warnings: errors.length > 0 ? errors : undefined
    };
  } catch (error) {
    console.error('Error in importCSVData:', error);
    return {
      success: false,
      error: error.message,
      details: 'Failed to process CSV data'
    };
  }
}

function calculateExpenses(booking: any, bookingId: string) {
  const expenses = [];
  const totalAmount = booking.total_amount;
  const guests = booking.guests;
  const isAloha = booking.property_id === 'ALOHA • Garden + Rooftop View Marbella Stay';

  // Transaction fee
  expenses.push({
    booking_id: bookingId,
    category: 'Management-Transaction',
    amount: totalAmount * 0.013,
    description: 'Payment processing fee (1.3%)',
    date: booking.arrival_date
  });

  // Commission
  const commissionRate = isAloha ? 0.18 : 0.22;
  const commission = totalAmount * commissionRate;
  expenses.push({
    booking_id: bookingId,
    category: 'Management-Commission',
    amount: commission,
    description: `Management commission (${commissionRate * 100}%)`,
    date: booking.arrival_date
  });

  // VAT on commission
  expenses.push({
    booking_id: bookingId,
    category: 'Management-VAT',
    amount: commission * 0.21,
    description: 'VAT on commission (21%)',
    date: booking.arrival_date
  });

  // Cleaning fee
  const cleaningFee = isAloha ? 100 : 
    booking.property_id === 'Marbella Old Town' ? 90 :
    booking.property_id === 'Playa de la Fontanilla Marbella' ? 60 : 30;

  expenses.push({
    booking_id: bookingId,
    category: 'Cleaning',
    amount: cleaningFee,
    description: 'Professional cleaning service',
    date: booking.arrival_date
  });

  // Welcome package
  expenses.push({
    booking_id: bookingId,
    category: 'Management-Wine',
    amount: 2.00,
    description: 'Welcome wine',
    date: booking.arrival_date
  });

  const perGuestItems = [
    { category: 'Management-Coffee', amount: 0.30, description: 'Coffee capsules per guest' },
    { category: 'Management-Water', amount: 0.36, description: 'Water bottles per guest' },
    { category: 'Management-Tea', amount: 0.30, description: 'Tea bags per guest' },
    { category: 'Management-Slippers', amount: 0.60, description: 'Guest slippers per guest' }
  ];

  perGuestItems.forEach(item => {
    expenses.push({
      booking_id: bookingId,
      category: item.category,
      amount: item.amount * guests,
      description: item.description,
      date: booking.arrival_date
    });
  });

  return expenses;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    if (req.method !== 'POST') {
      throw new Error('Method not allowed');
    }

    const { csvData, guestDetails } = await req.json();
    
    if (!csvData) {
      throw new Error('No CSV data provided');
    }

    const result = await importCSVData(csvData, guestDetails);
    
    return new Response(
      JSON.stringify(result),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: result.success ? 200 : 500
      }
    );
  } catch (error) {
    console.error('Edge function error:', error);
    
    const errorResponse = {
      success: false,
      error: error.message,
      details: 'An error occurred while processing the request',
      type: error.name,
      timestamp: new Date().toISOString()
    };

    return new Response(
      JSON.stringify(errorResponse),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500
      }
    );
  }
});