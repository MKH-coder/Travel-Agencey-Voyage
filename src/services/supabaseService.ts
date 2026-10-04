import { supabase } from '../supabaseClient.js';
import { Listing, Review, Booking, PriceAlert } from '../types.ts';

export class SupabaseService {
  /**
   * Fetch all published listings from Supabase PostgreSQL
   */
  static async getListings(): Promise<Listing[]> {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase getListings error:', error);
        return [];
      }
      return (data || []) as unknown as Listing[];
    } catch (err) {
      console.warn('Supabase getListings failed:', err);
      return [];
    }
  }

  /**
   * Save or upsert a listing in Supabase
   */
  static async saveListing(listing: Listing): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('listings')
        .upsert({
          id: listing.id,
          title: listing.title,
          description: listing.description,
          category: listing.category,
          location: listing.location,
          country: listing.country,
          price: Number(listing.price),
          rating: Number(listing.rating),
          images: listing.images,
          status: listing.status,
          tags: listing.tags,
          amenities: listing.amenities,
          duration: listing.duration,
          created_by: listing.createdBy,
          created_by_name: listing.createdByName,
          listing_ids: listing.listingIds,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.warn('Supabase saveListing error:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('Supabase saveListing exception:', err);
      return false;
    }
  }

  /**
   * Delete a listing from Supabase
   */
  static async deleteListing(listingId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', listingId);

      if (error) {
        console.warn('Supabase deleteListing error:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('Supabase deleteListing exception:', err);
      return false;
    }
  }

  /**
   * Fetch bookings from Supabase
   */
  static async getBookings(userId?: string): Promise<Booking[]> {
    try {
      let query = supabase.from('bookings').select('*').order('created_at', { ascending: false });
      if (userId) {
        query = query.eq('user_id', userId);
      }
      const { data, error } = await query;
      if (error) {
        console.warn('Supabase getBookings error:', error);
        return [];
      }
      return (data || []) as unknown as Booking[];
    } catch (err) {
      console.warn('Supabase getBookings exception:', err);
      return [];
    }
  }

  /**
   * Save or upsert a booking in Supabase
   */
  static async saveBooking(booking: Booking): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('bookings')
        .upsert({
          id: booking.id,
          user_id: booking.userId,
          user_email: booking.userEmail,
          listing_id: booking.listingId,
          listing_title: booking.listingTitle,
          listing_image: booking.listingImage,
          check_in_date: booking.checkInDate,
          check_out_date: booking.checkOutDate,
          guests: booking.guests,
          total_price: Number(booking.totalPrice),
          status: booking.status,
          promo_code: booking.promoCode,
          discount_amount: booking.discountAmount || 0,
          created_at: booking.createdAt || new Date().toISOString()
        });

      if (error) {
        console.warn('Supabase saveBooking error:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('Supabase saveBooking exception:', err);
      return false;
    }
  }

  /**
   * Fetch reviews for a specific listing
   */
  static async getReviews(listingId: string): Promise<Review[]> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('listing_id', listingId)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase getReviews error:', error);
        return [];
      }
      return (data || []) as unknown as Review[];
    } catch (err) {
      console.warn('Supabase getReviews exception:', err);
      return [];
    }
  }

  /**
   * Submit a new review to Supabase
   */
  static async addReview(review: Review): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('reviews')
        .insert({
          id: review.id,
          listing_id: review.listingId,
          user_id: review.userId,
          user_name: review.userName,
          user_email: review.userEmail,
          user_avatar: review.userAvatar,
          rating: review.rating,
          comment: review.comment,
          created_at: review.createdAt || new Date().toISOString()
        });

      if (error) {
        console.warn('Supabase addReview error:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('Supabase addReview exception:', err);
      return false;
    }
  }

  /**
   * Fetch price alerts for user
   */
  static async getPriceAlerts(userId: string): Promise<PriceAlert[]> {
    try {
      const { data, error } = await supabase
        .from('price_alerts')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.warn('Supabase getPriceAlerts error:', error);
        return [];
      }
      return (data || []) as unknown as PriceAlert[];
    } catch (err) {
      console.warn('Supabase getPriceAlerts exception:', err);
      return [];
    }
  }

  /**
   * Save or upsert price alert
   */
  static async savePriceAlert(alert: PriceAlert): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('price_alerts')
        .upsert({
          id: alert.id,
          user_id: alert.userId,
          user_email: alert.userEmail,
          listing_id: alert.listingId,
          listing_title: alert.listingTitle,
          target_price: Number(alert.targetPrice),
          active: alert.active,
          created_at: alert.createdAt || new Date().toISOString()
        });

      if (error) {
        console.warn('Supabase savePriceAlert error:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('Supabase savePriceAlert exception:', err);
      return false;
    }
  }

  /**
   * Health ping to check database status
   */
  static async ping(): Promise<{ connected: boolean; latencyMs: number }> {
    const start = Date.now();
    try {
      const { error } = await supabase.from('listings').select('id').limit(1);
      const latencyMs = Date.now() - start;
      return {
        connected: !error,
        latencyMs
      };
    } catch {
      return {
        connected: false,
        latencyMs: Date.now() - start
      };
    }
  }
}
