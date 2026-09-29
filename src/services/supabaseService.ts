import { supabase } from '../supabaseClient.js';
import { Listing, User, CustomPost, Review, Booking } from '../types.ts';

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
   * Health ping to check database status
   */
  static async ping(): Promise<{ connected: boolean; latencyMs: number }> {
    const start = Date.now();
    try {
      const { data, error } = await supabase.from('listings').select('id').limit(1);
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
