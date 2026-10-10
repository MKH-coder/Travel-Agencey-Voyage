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
  // Game Level Pass Redeem Offers - Mode & Level specific
  // Flight Level 1: Ksamil
  'KSAMIL-CRUISE-12': { code: 'KSAMIL-CRUISE-12', discountPercent: 12, description: '12% OFF Ksamil Scenic Explorer Pass' },
  'KSAMIL-STORM-20': { code: 'KSAMIL-STORM-20', discountPercent: 20, description: '20% OFF Ksamil Balkan Storm Pass' },
  'KSAMIL-APEX-30': { code: 'KSAMIL-APEX-30', discountPercent: 30, description: '30% OFF Ksamil Nightmare Apex VIP Pass' },
  'ALBANIA-RIVIERA-PASS': { code: 'ALBANIA-RIVIERA-PASS', discountPercent: 15, description: '15% OFF Ksamil Isles & Saranda Riviera Bookings' },
  'KSAMIL-IONIAN-15': { code: 'KSAMIL-IONIAN-15', discountPercent: 15, description: '15% OFF Ksamil Turquoise Isles & Beachfront Suites' },

  // Flight Level 2: Alps / Theth
  'ALPS-EXPLORER-12': { code: 'ALPS-EXPLORER-12', discountPercent: 12, description: '12% OFF Albanian Alps Scenic Explorer Pass' },
  'BALKAN-PEAK-20': { code: 'BALKAN-PEAK-20', discountPercent: 20, description: '20% OFF Theth & Valbona Alpine Expeditions' },
  'ACCURSED-TITAN-30': { code: 'ACCURSED-TITAN-30', discountPercent: 30, description: '30% OFF Accursed Mountains Nightmare Titan Pass' },

  // Flight Level 3: Berat
  'BERAT-TRAIL-12': { code: 'BERAT-TRAIL-12', discountPercent: 12, description: '12% OFF Berat Scenic Explorer Trail Pass' },
  'BERAT-CITADEL-20': { code: 'BERAT-CITADEL-20', discountPercent: 20, description: '20% OFF Berat Citadel Storm Master Pass' },
  'BERAT-LEGEND-30': { code: 'BERAT-LEGEND-30', discountPercent: 30, description: '30% OFF Berat 1,000 Windows Nightmare Legend Pass' },
  'BERAT-CITADEL-15': { code: 'BERAT-CITADEL-15', discountPercent: 15, description: '15% OFF Berat City of 1,000 Windows Stays' },

  // Flight Level 4: Gjirokastër & Blue Eye
  'GJIROKASTER-CRUISE-15': { code: 'GJIROKASTER-CRUISE-15', discountPercent: 15, description: '15% OFF Gjirokastër Scenic Explorer Pass' },
  'BLUE-EYE-SPEED-22': { code: 'BLUE-EYE-SPEED-22', discountPercent: 22, description: '22% OFF Syri i Kaltër Balkan Storm Pass' },
  'STONE-FORTRESS-32': { code: 'STONE-FORTRESS-32', discountPercent: 32, description: '32% OFF Stone Fortress Nightmare VIP Pass' },
  'GJIROKASTER-STONE-18': { code: 'GJIROKASTER-STONE-18', discountPercent: 18, description: '18% OFF Gjirokastër Stone City VIP' },

  // Flight Level 5: Tirana Capital
  'TIRANA-DISCOVERY-15': { code: 'TIRANA-DISCOVERY-15', discountPercent: 15, description: '15% OFF Tirana Discovery Explorer Pass' },
  'TIRANA-CAPITAL-25': { code: 'TIRANA-CAPITAL-25', discountPercent: 25, description: '25% OFF Tirana Balkan Storm Capital VIP' },
  'SKANDERBEG-GODMODE-35': { code: 'SKANDERBEG-GODMODE-35', discountPercent: 35, description: '35% OFF Skanderbeg Nightmare Godmode Supreme VIP' },
  'TIRANA-SKANDERBEG-18': { code: 'TIRANA-SKANDERBEG-18', discountPercent: 18, description: '18% OFF Tirana Skanderbeg Square & Dajti Luxury Escapes' },

  // Coastal Rally Stages
  'RALLY-KSAMIL-12': { code: 'RALLY-KSAMIL-12', discountPercent: 12, description: '12% OFF Ksamil Coastal Rally Explorer Pass' },
  'RIVIERA-DRIFT-15': { code: 'RIVIERA-DRIFT-15', discountPercent: 15, description: '15% OFF Riviera Drift Pass' },
  'RIVIERA-DRIFT-20': { code: 'RIVIERA-DRIFT-20', discountPercent: 20, description: '20% OFF Riviera Drift Storm Champion Pass' },
  'IONIAN-TURBO-30': { code: 'IONIAN-TURBO-30', discountPercent: 30, description: '30% OFF Ionian Nightmare Turbo Master Pass' },

  'LLOGARA-CRUISE-15': { code: 'LLOGARA-CRUISE-15', discountPercent: 15, description: '15% OFF Llogara Pass Scenic Explorer Pass' },
  'LLOGARA-PASS-20': { code: 'LLOGARA-PASS-20', discountPercent: 20, description: '20% OFF Llogara Mountain Safari Pass' },
  'LLOGARA-PASS-22': { code: 'LLOGARA-PASS-22', discountPercent: 22, description: '22% OFF Llogara Hairpin Storm Racer Pass' },
  'LLOGARA-NIGHTMARE-32': { code: 'LLOGARA-NIGHTMARE-32', discountPercent: 32, description: '32% OFF Llogara 1,043m Nightmare Grand Prix Pass' },

  'BERAT-RALLY-15': { code: 'BERAT-RALLY-15', discountPercent: 15, description: '15% OFF Berat Osum Valley Scenic Rally Pass' },
  'BERAT-RALLY-18': { code: 'BERAT-RALLY-18', discountPercent: 18, description: '18% OFF Berat Cultural Roadtrip Pass' },
  'BERAT-DRIFT-22': { code: 'BERAT-DRIFT-22', discountPercent: 22, description: '22% OFF Berat Canyon Drift Storm Pass' },
  'CITADEL-CHAMPION-30': { code: 'CITADEL-CHAMPION-30', discountPercent: 30, description: '30% OFF Berat Citadel Nightmare Champion Pass' },

  'SARANDA-SPEED-18': { code: 'SARANDA-SPEED-18', discountPercent: 18, description: '18% OFF Saranda Coastal Highway Explorer Pass' },
  'BLUE-EYE-HARD-25': { code: 'BLUE-EYE-HARD-25', discountPercent: 25, description: '25% OFF Blue Eye Expressway Storm Pass' },
  'BALKAN-GRANDPRIX-35': { code: 'BALKAN-GRANDPRIX-35', discountPercent: 35, description: '35% OFF Balkan Grand Prix Nightmare Apex Master Pass' },

  // General & Geo Detective
  'DHERMI-RIVIERA-12': { code: 'DHERMI-RIVIERA-12', discountPercent: 12, description: '12% OFF Dhërmi & Llogara Clifftop Boutique Hotels' },
  'GEODETECTIVE-PERK': { code: 'GEODETECTIVE-PERK', discountPercent: 15, description: '15% OFF Any Cultural Mystery Experience' },
  'AVIATOR-HERO-25': { code: 'AVIATOR-HERO-25', discountPercent: 25, description: '25% OFF Ultimate Grand Tour Master Package' },
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
