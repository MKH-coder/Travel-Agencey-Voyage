import { AuthAudit } from './authAudit.ts';
import { Listing } from '../types.ts';

export interface ItineraryStatusUpdate {
  tripId: string;
  tripTitle: string;
  status: 'Confirmed' | 'Pending Review' | 'Guide Assigned' | 'Schedule Updated';
  message: string;
  timestamp: string;
}

export const ItineraryNotificationService = {
  /**
   * Triggers a notification toast when a saved trip itinerary is updated or status changes
   */
  notifyItineraryUpdate(tripTitle: string, updateType: 'reorder' | 'status_change' | 'guide_assigned' | 'flight_confirmed', details?: string) {
    let title = 'Itinerary Update';
    let message = `Your saved trip "${tripTitle}" has been updated.`;
    let type: 'success' | 'info' | 'warning' = 'success';

    if (updateType === 'reorder') {
      title = 'Timeline Reordered Successfully';
      message = `Your itinerary sequence for "${tripTitle}" was successfully synchronized and saved.`;
      type = 'success';
    } else if (updateType === 'status_change') {
      title = 'Itinerary Status: Confirmed';
      message = details || `All reservations for "${tripTitle}" have been verified by concierge.`;
      type = 'success';
    } else if (updateType === 'guide_assigned') {
      title = 'Private Tour Guide Assigned';
      message = details || `A certified local expert has been assigned to your journey "${tripTitle}".`;
      type = 'info';
    } else if (updateType === 'flight_confirmed') {
      title = 'Flights & Transfers Confirmed';
      message = details || `Return flights and private airport transfers for "${tripTitle}" are locked in.`;
      type = 'success';
    }

    AuthAudit.showToast({
      title,
      message,
      type,
      duration: 8000,
      action: {
        label: 'View Saved Trips',
        onClick: () => {
          const btn = document.getElementById('nav-saved-trips-btn') || document.querySelector('[title="Saved Trips"]');
          if (btn instanceof HTMLElement) btn.click();
        }
      }
    });
  },

  /**
   * Simulates checking for live itinerary updates from concierge
   */
  checkForUpdates(savedListings: Listing[]) {
    if (savedListings.length === 0) {
      AuthAudit.showToast({
        title: 'Itinerary Status',
        message: 'No saved trips in your wishlist to check for updates.',
        type: 'info',
        duration: 5000,
      });
      return;
    }

    const randomListing = savedListings[Math.floor(Math.random() * savedListings.length)];
    const updateTypes: ('status_change' | 'guide_assigned' | 'flight_confirmed')[] = ['status_change', 'guide_assigned', 'flight_confirmed'];
    const chosenType = updateTypes[Math.floor(Math.random() * updateTypes.length)];

    let details = '';
    if (chosenType === 'status_change') {
      details = `Status for "${randomListing.title}" updated to VIP Confirmed. All vouchers generated.`;
    } else if (chosenType === 'guide_assigned') {
      details = `Guide Arben Krasniqi assigned for your tour in ${randomListing.location}.`;
    } else {
      details = `Flight tickets & 4-star boutique lodging confirmed for ${randomListing.title}.`;
    }

    this.notifyItineraryUpdate(randomListing.title, chosenType, details);
  }
};
