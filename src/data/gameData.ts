export interface GameTransport {
  destinationId: string;
  type: string;
  cost: number;
  travelTimeHours: number;
  energyCost: number;
  eventTriggerOnTravel: boolean;
}

export interface GameActivity {
  id: string;
  name: string;
  description: string;
  energyCost: number;
  moneyCost: number;
  rewards: {
    experience: number;
    items?: Array<{
      itemId: string;
      chance: number;
    }>;
  };
}

export interface GameLocation {
  id: string;
  name: string;
  country: string;
  description: string;
  costOfLivingMultiplier: number;
  locationSpecificEvents: string[];
  activities: string[];
  availableTransport: GameTransport[];
}

export interface GameRandomEventChoice {
  choiceText: string;
  effects: {
    moneyDelta?: number;
    energyDelta?: number;
    timeDelayHours?: number;
    chanceToRecoverMoney?: number;
  };
}

export interface GameRandomEvent {
  id: string;
  title: string;
  description: string;
  category: string;
  triggerCondition: string;
  probabilityWeight: number;
  effects: {
    moneyDelta?: number;
    energyDelta?: number;
    timeDelayHours?: number;
    moneyPercentLoss?: number;
    removeRandomInventoryItem?: boolean;
    blockOutdoorActivities?: boolean;
  };
  choices: GameRandomEventChoice[];
}

export interface GameItem {
  id: string;
  name: string;
  type: 'KeyItem' | 'Consumable' | 'Souvenir';
  description: string;
  value: number;
  usable: boolean;
  effect?: {
    restoreEnergy?: number;
  };
}

export interface GameQuest {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  requirements: {
    type: string;
    targetValue: number;
  };
  rewards: {
    money: number;
    experience: number;
  };
}

export interface GameState {
  player: {
    name: string;
    currentLocation: string;
    money: number;
    energy: number;
    staminaMax: number;
    experience: number;
    level: number;
    inventory: Array<{
      itemId: string;
      quantity: number;
    }>;
    visitedLocations: string[];
    activeBuffs: string[];
  };
  completedQuests: string[];
  dayTurn: number;
}

export const INITIAL_GAME_DATA = {
  gameTitle: "Wanderlust Chronicles",
  version: "1.1",
  settings: {
    currency: "USD",
    startingMoney: 1000,
    startingEnergy: 100,
    maxInventorySlots: 10,
    globalEventChance: 0.35
  },
  player: {
    name: "Traveler",
    currentLocation: "loc_tirana",
    money: 1000,
    energy: 100,
    staminaMax: 100,
    experience: 0,
    level: 1,
    inventory: [
      { itemId: "item_passport", quantity: 1 },
      { itemId: "item_water_bottle", quantity: 2 }
    ],
    visitedLocations: ["loc_tirana"],
    activeBuffs: []
  },
  locations: [
    {
      id: "loc_tirana",
      name: "Tirana",
      country: "Albania",
      description: "A vibrant Balkan capital blending colorful pastel boulevards, Skanderbeg Square, Mount Dajti cable car, and lively cafe culture.",
      costOfLivingMultiplier: 1.0,
      locationSpecificEvents: ["evt_typhoon_warning"],
      activities: ["act_visit_shrine", "act_eat_ramen"],
      availableTransport: [
        {
          destinationId: "loc_ksamil",
          type: "Flight",
          cost: 150,
          travelTimeHours: 4,
          energyCost: 20,
          eventTriggerOnTravel: true
        },
        {
          destinationId: "loc_berat",
          type: "Coach",
          cost: 25,
          travelTimeHours: 2,
          energyCost: 10,
          eventTriggerOnTravel: true
        }
      ]
    },
    {
      id: "loc_ksamil",
      name: "Ksamil",
      country: "Albania",
      description: "The crown jewel of the Albanian Riviera, famous for crystal-clear turquoise lagoons and four uninhabited islands.",
      costOfLivingMultiplier: 1.1,
      locationSpecificEvents: [],
      activities: ["act_visit_eiffel"],
      availableTransport: [
        {
          destinationId: "loc_tirana",
          type: "Flight",
          cost: 150,
          travelTimeHours: 4,
          energyCost: 20,
          eventTriggerOnTravel: true
        }
      ]
    },
    {
      id: "loc_berat",
      name: "Berat",
      country: "Albania",
      description: "The City of a Thousand Windows, a UNESCO World Heritage citadel with tiered Ottoman houses along the Osum River gorge.",
      costOfLivingMultiplier: 0.9,
      locationSpecificEvents: [],
      activities: ["act_eat_ramen"],
      availableTransport: [
        {
          destinationId: "loc_tirana",
          type: "Coach",
          cost: 25,
          travelTimeHours: 2,
          energyCost: 10,
          eventTriggerOnTravel: true
        }
      ]
    }
  ] as GameLocation[],
  randomEvents: [
    {
      id: "evt_flight_delay",
      title: "Flight Delayed!",
      description: "Severe air traffic congestion has delayed your takeoff by 4 hours. You're stuck in the terminal.",
      category: "Travel",
      triggerCondition: "on_transport_type_Flight",
      probabilityWeight: 30,
      effects: {
        moneyDelta: -15,
        energyDelta: -15,
        timeDelayHours: 4
      },
      choices: [
        {
          choiceText: "Wait it out in the terminal (-$15, -15 Energy)",
          effects: {
            moneyDelta: -15,
            energyDelta: -15
          }
        },
        {
          choiceText: "Pay for VIP Airport Lounge Access (-$50, +10 Energy)",
          effects: {
            moneyDelta: -50,
            energyDelta: 10
          }
        }
      ]
    },
    {
      id: "evt_lost_wallet",
      title: "Pickpocket Attack!",
      description: "While navigating a crowded transit station, someone bumped into you and snatched some cash.",
      category: "Accident",
      triggerCondition: "on_location_arrival",
      probabilityWeight: 15,
      effects: {
        moneyPercentLoss: 0.15,
        energyDelta: -10
      },
      choices: [
        {
          choiceText: "Report to transit police (Takes 2 hrs, 40% chance to recover funds)",
          effects: {
            timeDelayHours: 2,
            chanceToRecoverMoney: 0.4
          }
        },
        {
          choiceText: "Cut your losses and focus on the trip",
          effects: {
            timeDelayHours: 0
          }
        }
      ]
    },
    {
      id: "evt_typhoon_warning",
      title: "Severe Weather Alert",
      description: "A sudden seasonal storm forces outdoor activities to suspend for the morning.",
      category: "Weather",
      triggerCondition: "on_daily_turn",
      probabilityWeight: 10,
      effects: {
        blockOutdoorActivities: true,
        energyDelta: -5
      },
      choices: [
        {
          choiceText: "Stay inside and rest with hot tea (+30 Energy)",
          effects: {
            energyDelta: 30
          }
        }
      ]
    }
  ] as GameRandomEvent[],
  activities: [
    {
      id: "act_visit_shrine",
      name: "Explore Skanderbeg Square & Bunk'Art",
      description: "Walk across the grand central square to explore the historic national museum and Cold War underground bunker art galleries.",
      energyCost: 15,
      moneyCost: 0,
      rewards: {
        experience: 50,
        items: [
          {
            itemId: "item_omamori_charm",
            chance: 0.6
          }
        ]
      }
    },
    {
      id: "act_eat_ramen",
      name: "Savor Traditional Tavë Kosi & Byrek",
      description: "Enjoy a clay pot of tender slow-baked lamb with garlic yogurt sauce and hot flaky spinach byrek.",
      energyCost: -20, // Restores 20 energy!
      moneyCost: 12,
      rewards: {
        experience: 15,
        items: []
      }
    },
    {
      id: "act_visit_eiffel",
      name: "Ksamil 4 Isles Wooden Boat Cruise",
      description: "Board a traditional wooden boat across turquoise Ionian lagoons and swim at secluded white-pebble coves.",
      energyCost: 25,
      moneyCost: 30,
      rewards: {
        experience: 100,
        items: []
      }
    }
  ] as GameActivity[],
  items: [
    {
      id: "item_passport",
      name: "Passport",
      type: "KeyItem",
      description: "Required for international border crossings.",
      value: 0,
      usable: false
    },
    {
      id: "item_water_bottle",
      name: "Reusable Water Bottle",
      type: "Consumable",
      description: "Restores 15 energy when used during your walks.",
      value: 15,
      usable: true,
      effect: {
        restoreEnergy: 15
      }
    },
    {
      id: "item_omamori_charm",
      name: "Albanian Eagle Heritage Talisman",
      type: "Souvenir",
      description: "A traditional handcrafted double-headed eagle artisan medallion from the Krujë & Berat Old Bazaars.",
      value: 20,
      usable: false
    }
  ] as GameItem[],
  quests: [
    {
      id: "quest_first_trip",
      title: "Albanian Circuit Scout",
      description: "Travel to at least 2 distinct destinations across Albania.",
      isCompleted: false,
      requirements: {
        type: "visit_count",
        targetValue: 2
      },
      rewards: {
        money: 200,
        experience: 100
      }
    },
    {
      id: "quest_world_gourmet",
      title: "Balkan Feast Explorer",
      description: "Taste authentic traditional cuisine (Tavë Kosi, Fergesë) across Albanian cities.",
      isCompleted: false,
      requirements: {
        type: "food_count",
        targetValue: 2
      },
      rewards: {
        money: 150,
        experience: 80
      }
    }
  ] as GameQuest[]
};
