export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      properties: {
        Row: {
          id: string
          name: string
          type: 'L&D Guest' | 'L&D Guest Commission'
          lodgify_id: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          type: 'L&D Guest' | 'L&D Guest Commission'
          lodgify_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          type?: 'L&D Guest' | 'L&D Guest Commission'
          lodgify_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      bookings: {
        Row: {
          id: string
          property_id: string | null
          guest_name: string
          guest_email: string | null
          guest_phone: string | null
          guest_country: string | null
          arrival_date: string
          departure_date: string
          nights: number
          guests: number
          total_amount: number
          source: string | null
          status: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          property_id?: string | null
          guest_name: string
          guest_email?: string | null
          guest_phone?: string | null
          guest_country?: string | null
          arrival_date: string
          departure_date: string
          nights: number
          guests?: number
          total_amount?: number
          source?: string | null
          status?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          property_id?: string | null
          guest_name?: string
          guest_email?: string | null
          guest_phone?: string | null
          guest_country?: string | null
          arrival_date?: string
          departure_date?: string
          nights?: number
          guests?: number
          total_amount?: number
          source?: string | null
          status?: string
          created_at?: string | null
          updated_at?: string | null
        }
      }
      expenses: {
        Row: {
          id: string
          booking_id: string | null
          category: string
          amount: number
          description: string | null
          date: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          booking_id?: string | null
          category: string
          amount?: number
          description?: string | null
          date: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          booking_id?: string | null
          category?: string
          amount?: number
          description?: string | null
          date?: string
          created_at?: string | null
          updated_at?: string | null
        }
      }
      maintenance_tasks: {
        Row: {
          id: string
          property_id: string | null
          title: string
          description: string | null
          due_date: string
          priority: 'low' | 'medium' | 'high'
          status: 'pending' | 'in-progress' | 'completed'
          price: number
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          property_id?: string | null
          title: string
          description?: string | null
          due_date: string
          priority: 'low' | 'medium' | 'high'
          status?: 'pending' | 'in-progress' | 'completed'
          price?: number
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          property_id?: string | null
          title?: string
          description?: string | null
          due_date?: string
          priority?: 'low' | 'medium' | 'high'
          status?: 'pending' | 'in-progress' | 'completed'
          price?: number
          created_at?: string | null
          updated_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}