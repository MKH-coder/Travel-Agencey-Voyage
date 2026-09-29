import JSZip from 'jszip';
import { ClientStorageManager } from './clientStorage.ts';
import { INITIAL_GAME_DATA } from '../data/gameData.ts';

export class ZipArchiveService {
  /**
   * Generates and triggers download of a complete Voyage Platform & Travel Archive ZIP
   */
  static async exportPlatformArchiveZip(): Promise<void> {
    const zip = new JSZip();
    const folder = zip.folder('Voyage-Travel-Agency-Archive');

    // 1. Listings & Destinations
    const listings = ClientStorageManager.getListings();
    folder?.file('listings.json', JSON.stringify(listings, null, 2));

    // 2. Reviews
    const reviews = ClientStorageManager.getReviews();
    folder?.file('reviews.json', JSON.stringify(reviews, null, 2));

    // 3. Custom Posts & Curation
    const customPosts = ClientStorageManager.getCustomPosts();
    folder?.file('custom_posts.json', JSON.stringify(customPosts, null, 2));

    // 4. Wanderlust Chronicles Game Data & State
    let gameState = INITIAL_GAME_DATA;
    try {
      const saved = localStorage.getItem('voyage_wanderlust_game_state_v1');
      if (saved) gameState = JSON.parse(saved);
    } catch {
      // ignore
    }
    folder?.file('wanderlust_game_state.json', JSON.stringify(gameState, null, 2));

    // 5. Site Content Manifest
    folder?.file('manifest.json', JSON.stringify({
      appName: 'Voyage Luxury Travel Platform',
      version: '1.2.0',
      exportedAt: new Date().toISOString(),
      itemCounts: {
        listings: listings.length,
        reviews: reviews.length,
        customPosts: customPosts.length
      }
    }, null, 2));

    // 6. Generate readable README
    folder?.file('README.txt', `Voyage Luxury Travel Platform - Archive Export
Exported at: ${new Date().toLocaleString()}
Includes curated travel stays, tour packages, reviews, itineraries, and Wanderlust Chronicles game progress.
`);

    // Generate zip blob
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Voyage-Travel-Agency-Backup-${new Date().toISOString().split('T')[0]}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Exports an individual package / itinerary as an offline travel zip bundle
   */
  static async exportTripPackageZip(packageTitle: string, packageDetails: any): Promise<void> {
    const zip = new JSZip();
    const sanitizedName = packageTitle.replace(/[^a-zA-Z0-9-_]/g, '_');
    const folder = zip.folder(sanitizedName);

    folder?.file('itinerary_summary.json', JSON.stringify(packageDetails, null, 2));
    folder?.file('itinerary_guide.txt', `VOYAGE CURATED TRAVEL PACKAGE: ${packageTitle}
Generated: ${new Date().toLocaleDateString()}
Destination: ${packageDetails.location || packageDetails.destination || 'Worldwide'}
Duration: ${packageDetails.duration || 'Custom Multi-Day'}
Inclusions: ${(packageDetails.amenities || packageDetails.inclusions || []).join(', ')}

Thank you for choosing Voyage Global!
`);

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sanitizedName}_Package_Bundle.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
