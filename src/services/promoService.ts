export interface PromoVoucher {
  code: string;
  discountPercent: number;
  description: string;
  minSpend?: number;
}

export const OFFICIAL_PROMOS: Record<string, PromoVoucher> = {
  VOYAGE10: {
    code: 'VOYAGE10',
    discountPercent: 10,
    description: '10% OFF Any Luxury Stay or Guided Tour',
  },
  ALBANIA15: {
    code: 'ALBANIA15',
    discountPercent: 15,
    description: '15% OFF Riviera & Balkan Expeditions',
  },
  SKYMASTER20: {
    code: 'SKYMASTER20',
    discountPercent: 20,
    description: '20% OFF VIP Luxury Custom Itineraries',
  },
  // Game Level Pass Redeem Offers
  'ALBANIA-RIVIERA-PASS': {
    code: 'ALBANIA-RIVIERA-PASS',
    discountPercent: 15,
    description: '15% OFF Ksamil Isles & Saranda Riviera Bookings',
  },
  'AMALFI-VIP-PILOT': {
    code: 'AMALFI-VIP-PILOT',
    discountPercent: 12,
    description: '12% OFF Amalfi Coast Cliffside Packages',
  },
  'BALKAN-PEAK-20': {
    code: 'BALKAN-PEAK-20',
    discountPercent: 20,
    description: '20% OFF Theth & Valbona Alpine Expeditions',
  },
  'TOKYO-SKIES-15': {
    code: 'TOKYO-SKIES-15',
    discountPercent: 15,
    description: '15% OFF Tokyo & Mount Fuji Escapes',
  },
  'PARIS-STARLIGHT-10': {
    code: 'PARIS-STARLIGHT-10',
    discountPercent: 10,
    description: '10% OFF City of Light Boutique Hotels',
  },
  'PHARAOH-DUNE-18': {
    code: 'PHARAOH-DUNE-18',
    discountPercent: 18,
    description: '18% OFF Giza Pyramids & Nile Luxury Cruises',
  },
  'GEODETECTIVE-PERK': {
    code: 'GEODETECTIVE-PERK',
    discountPercent: 15,
    description: '15% OFF Any Cultural Mystery Experience',
  },
  'AVIATOR-HERO-25': {
    code: 'AVIATOR-HERO-25',
    discountPercent: 25,
    description: '25% OFF Ultimate Grand Tour Master Package',
  },
};

const STORAGE_KEY_PROMO = 'voyage_active_promo_voucher';

export class PromoService {
  public static getActivePromo(): PromoVoucher | null {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROMO);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return null;
  }

  public static setActivePromo(code: string): PromoVoucher | null {
    const cleanCode = code.trim().toUpperCase();
    const promo = OFFICIAL_PROMOS[cleanCode];
    if (promo) {
      try {
        localStorage.setItem(STORAGE_KEY_PROMO, JSON.stringify(promo));
      } catch {
        // ignore
      }
      return promo;
    }
    return null;
  }

  public static clearActivePromo(): void {
    try {
      localStorage.removeItem(STORAGE_KEY_PROMO);
    } catch {
      // ignore
    }
  }

  public static validateCode(code: string): {
    valid: boolean;
    promo?: PromoVoucher;
    message: string;
  } {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      return { valid: false, message: 'Please enter a voucher code.' };
    }
    const promo = OFFICIAL_PROMOS[cleanCode];
    if (promo) {
      return {
        valid: true,
        promo,
        message: `Success! ${promo.discountPercent}% discount applied (${promo.code}).`,
      };
    }
    return {
      valid: false,
      message: 'Invalid promo code. Play Voyage Globetrotter to unlock valid vouchers!',
    };
  }
}
