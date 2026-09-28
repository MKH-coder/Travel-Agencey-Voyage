import { CustomTripRequest, Listing } from '../types.ts';

const STORAGE_KEY = 'voyage_custom_trips';

export const customTripService = {
  async getTrips(userEmail?: string, token?: string): Promise<CustomTripRequest[]> {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      
      const url = userEmail ? `/api/custom-trips?email=${encodeURIComponent(userEmail)}` : '/api/custom-trips';
      const res = await fetch(url, { headers });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          return data;
        }
      }
    } catch (e) {
      console.warn('Network fetch for custom trips failed, reading from localStorage fallback:', e);
    }

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const list: CustomTripRequest[] = JSON.parse(saved);
        if (userEmail) {
          return list.filter(t => t.userEmail.toLowerCase() === userEmail.toLowerCase());
        }
        return list;
      }
    } catch {
      // ignore
    }
    return [];
  },

  async createTrip(tripData: Partial<CustomTripRequest>, token?: string): Promise<CustomTripRequest> {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/custom-trips', {
        method: 'POST',
        headers,
        body: JSON.stringify(tripData),
      });

      if (res.ok) {
        const created: CustomTripRequest = await res.json();
        // Update local cache
        const local = await this.getTrips();
        localStorage.setItem(STORAGE_KEY, JSON.stringify([created, ...local.filter(t => t.id !== created.id)]));
        return created;
      }
    } catch (e) {
      console.warn('Failed to post custom trip to server, creating locally:', e);
    }

    // Local fallback creation
    const fallback: CustomTripRequest = {
      id: `ctrip_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: tripData.userId || 'guest_user',
      userEmail: tripData.userEmail || 'traveler@guest.voyage',
      userName: tripData.userName || 'Curated Traveler',
      tripTitle: tripData.tripTitle || 'Custom Luxury Trip',
      destination: tripData.destination || 'Mannanthala, Trivandrum',
      country: tripData.country || 'India',
      travelStyle: tripData.travelStyle || 'LUXURY_WELLNESS',
      budgetTier: tripData.budgetTier || 'PREMIUM',
      startDate: tripData.startDate || new Date().toISOString().split('T')[0],
      endDate: tripData.endDate || new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
      durationDays: tripData.durationDays || 4,
      adults: tripData.adults || 2,
      children: tripData.children || 0,
      selectedListingIds: tripData.selectedListingIds || [],
      selectedListings: tripData.selectedListings || [],
      itinerary: tripData.itinerary || [],
      inclusions: tripData.inclusions || ['Luxury Boutique Accommodation', '24/7 Concierge Support'],
      specialRequests: tripData.specialRequests || '',
      dietaryPreferences: tripData.dietaryPreferences || [],
      estimatedTotal: tripData.estimatedTotal || 500,
      bundleDiscount: tripData.bundleDiscount || 15,
      finalPrice: tripData.finalPrice || 425,
      status: 'SUBMITTED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const local = await this.getTrips();
    localStorage.setItem(STORAGE_KEY, JSON.stringify([fallback, ...local]));
    return fallback;
  },

  async updateTrip(id: string, updates: Partial<CustomTripRequest> & { convertToPackage?: boolean; packageTitle?: string; packagePrice?: number; packageDescription?: string }, token?: string): Promise<CustomTripRequest | null> {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/custom-trips/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updates),
      });

      if (res.ok) {
        const updated: CustomTripRequest = await res.json();
        const local = await this.getTrips();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(local.map(t => t.id === id ? updated : t)));
        return updated;
      }
    } catch (e) {
      console.warn('Failed to update trip on server, updating local fallback:', e);
    }

    const local = await this.getTrips();
    const idx = local.findIndex(t => t.id === id);
    if (idx >= 0) {
      const updated = { ...local[idx], ...updates, updatedAt: new Date().toISOString() };
      local[idx] = updated;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(local));
      return updated;
    }
    return null;
  },

  async deleteTrip(id: string, token?: string): Promise<boolean> {
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      await fetch(`/api/custom-trips/${id}`, {
        method: 'DELETE',
        headers,
      });
    } catch (e) {
      console.warn('Failed to delete on server:', e);
    }

    const local = await this.getTrips();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(local.filter(t => t.id !== id)));
    return true;
  }
};
