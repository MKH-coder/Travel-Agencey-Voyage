import React, { useState, useEffect } from 'react';
import {
  X,
  Compass,
  Plane,
  Train,
  MapPin,
  DollarSign,
  Zap,
  Award,
  Package,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  Coffee,
  CheckCircle2,
  ChevronRight,
  Shield,
  Utensils,
  Landmark,
  Luggage,
  Trophy
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext.tsx';
import {
  INITIAL_GAME_DATA,
  GameLocation,
  GameActivity,
  GameTransport,
  GameRandomEvent,
  GameRandomEventChoice,
  GameState
} from '../data/gameData.ts';

interface WanderlustGameModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STORAGE_KEY = 'voyage_wanderlust_game_state_v1';

export const WanderlustGameModal: React.FC<WanderlustGameModalProps> = ({ isOpen, onClose }) => {
  const { styles } = useTheme();

  // Game state
  const [gameState, setGameState] = useState<GameState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load saved game state:', e);
    }
    return {
      player: { ...INITIAL_GAME_DATA.player },
      completedQuests: [],
      dayTurn: 1
    };
  });

  // Current active event (if triggered)
  const [activeEvent, setActiveEvent] = useState<GameRandomEvent | null>(null);
  const [journalLogs, setJournalLogs] = useState<string[]>([
    'Welcome to Wanderlust Chronicles! Arrived in Tokyo. Ready for adventure.'
  ]);
  const [actionFeedback, setActionFeedback] = useState<{ message: string; type: 'success' | 'info' | 'warn' } | null>(null);
  const [activeTab, setActiveTab] = useState<'explore' | 'transport' | 'inventory' | 'quests'>('explore');

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
    } catch (e) {
      console.warn('Failed to save game state:', e);
    }
  }, [gameState]);

  // Current location helper
  const currentLocation: GameLocation =
    INITIAL_GAME_DATA.locations.find(l => l.id === gameState.player.currentLocation) ||
    INITIAL_GAME_DATA.locations[0];

  const addLog = (msg: string) => {
    setJournalLogs(prev => [msg, ...prev.slice(0, 25)]);
  };

  const showNotification = (message: string, type: 'success' | 'info' | 'warn' = 'info') => {
    setActionFeedback({ message, type });
    setTimeout(() => {
      setActionFeedback(null);
    }, 3500);
  };

  // Rest & Recover Energy
  const handleRestAtHotel = () => {
    const cost = Math.round(45 * currentLocation.costOfLivingMultiplier);
    if (gameState.player.money < cost) {
      showNotification(`Not enough money to stay at hotel ($${cost} needed).`, 'warn');
      return;
    }

    setGameState(prev => ({
      ...prev,
      player: {
        ...prev.player,
        money: prev.player.money - cost,
        energy: Math.min(prev.player.staminaMax, prev.player.energy + 40)
      },
      dayTurn: prev.dayTurn + 1
    }));

    addLog(`Rested at hotel in ${currentLocation.name} (-$${cost}, +40 Energy). Day ${gameState.dayTurn + 1} begins!`);
    showNotification(`Rested well! Energy restored +40 (-$${cost})`, 'success');
  };

  // Perform a local activity
  const handleDoActivity = (activity: GameActivity) => {
    if (gameState.player.energy < activity.energyCost && activity.energyCost > 0) {
      showNotification("You're exhausted! Rest at a hotel or drink water first.", 'warn');
      return;
    }

    if (gameState.player.money < activity.moneyCost) {
      showNotification(`You need $${activity.moneyCost} for this activity.`, 'warn');
      return;
    }

    // Energy change (if negative, it actually restores energy, like eating ramen!)
    const energyDelta = -activity.energyCost;
    const newEnergy = Math.max(0, Math.min(gameState.player.staminaMax, gameState.player.energy + energyDelta));
    const newMoney = gameState.player.money - activity.moneyCost;
    const newXp = gameState.player.experience + activity.rewards.experience;
    const newLevel = Math.floor(newXp / 100) + 1;

    // Check item drops
    const newInventory = [...gameState.player.inventory];
    let dropMsg = '';
    if (activity.rewards.items && activity.rewards.items.length > 0) {
      for (const itemReward of activity.rewards.items) {
        if (Math.random() <= itemReward.chance) {
          const itemDef = INITIAL_GAME_DATA.items.find(i => i.id === itemReward.itemId);
          if (itemDef) {
            const existing = newInventory.find(i => i.itemId === itemDef.id);
            if (existing) {
              existing.quantity += 1;
            } else {
              newInventory.push({ itemId: itemDef.id, quantity: 1 });
            }
            dropMsg = ` Found item: ${itemDef.name}!`;
          }
        }
      }
    }

    setGameState(prev => ({
      ...prev,
      player: {
        ...prev.player,
        energy: newEnergy,
        money: newMoney,
        experience: newXp,
        level: newLevel,
        inventory: newInventory
      }
    }));

    addLog(`Enjoyed "${activity.name}" in ${currentLocation.name}! (+${activity.rewards.experience} XP${dropMsg})`);
    showNotification(`Activity completed! +${activity.rewards.experience} XP${dropMsg}`, 'success');

    // Check quest progress (e.g. food quest)
    if (activity.id === 'act_eat_ramen' && !gameState.completedQuests.includes('quest_world_gourmet')) {
      checkQuestCompletion('quest_world_gourmet');
    }
  };

  // Travel to another destination
  const handleTravel = (transport: GameTransport) => {
    if (gameState.player.energy < transport.energyCost) {
      showNotification(`Need at least ${transport.energyCost} Energy to travel.`, 'warn');
      return;
    }

    if (gameState.player.money < transport.cost) {
      showNotification(`Ticket costs $${transport.cost}. Insufficient funds!`, 'warn');
      return;
    }

    const targetLoc = INITIAL_GAME_DATA.locations.find(l => l.id === transport.destinationId);
    if (!targetLoc) return;

    // Random Event Check
    const shouldTriggerEvent = transport.eventTriggerOnTravel && Math.random() < INITIAL_GAME_DATA.settings.globalEventChance;

    const newVisited = Array.from(new Set([...gameState.player.visitedLocations, targetLoc.id]));
    const newEnergy = Math.max(0, gameState.player.energy - transport.energyCost);
    const newMoney = gameState.player.money - transport.cost;

    setGameState(prev => ({
      ...prev,
      player: {
        ...prev.player,
        currentLocation: targetLoc.id,
        money: newMoney,
        energy: newEnergy,
        visitedLocations: newVisited
      }
    }));

    addLog(`Boarded ${transport.type} to ${targetLoc.name}! (-$${transport.cost}, -${transport.energyCost} Energy).`);
    showNotification(`Arrived safely in ${targetLoc.name}!`, 'success');

    // Check quests
    if (newVisited.length >= 2 && !gameState.completedQuests.includes('quest_first_trip')) {
      checkQuestCompletion('quest_first_trip');
    }

    if (shouldTriggerEvent) {
      // Pick random event matching transport or arrival
      const possibleEvents = INITIAL_GAME_DATA.randomEvents.filter(
        e => e.triggerCondition === `on_transport_type_${transport.type}` || e.triggerCondition === 'on_location_arrival'
      );
      if (possibleEvents.length > 0) {
        const picked = possibleEvents[Math.floor(Math.random() * possibleEvents.length)];
        setActiveEvent(picked);
      }
    }
  };

  // Handle Event Choice
  const handleResolveEventChoice = (choice: GameRandomEventChoice) => {
    if (!activeEvent) return;

    let moneyChange = choice.effects.moneyDelta || 0;
    let energyChange = choice.effects.energyDelta || 0;

    if (choice.effects.chanceToRecoverMoney && Math.random() <= choice.effects.chanceToRecoverMoney) {
      moneyChange += 80;
      addLog(`Police report succeeded! Retrieved $80.`);
      showNotification('Transit police recovered part of your lost funds!', 'success');
    }

    setGameState(prev => ({
      ...prev,
      player: {
        ...prev.player,
        money: Math.max(0, prev.player.money + moneyChange),
        energy: Math.max(0, Math.min(prev.player.staminaMax, prev.player.energy + energyChange))
      }
    }));

    addLog(`Resolved "${activeEvent.title}": ${choice.choiceText}`);
    setActiveEvent(null);
  };

  // Use an Inventory item
  const handleUseItem = (itemId: string) => {
    const itemDef = INITIAL_GAME_DATA.items.find(i => i.id === itemId);
    if (!itemDef || !itemDef.usable) return;

    if (itemDef.effect?.restoreEnergy) {
      const restored = itemDef.effect.restoreEnergy;
      setGameState(prev => {
        const nextInv = prev.player.inventory
          .map(inv => (inv.itemId === itemId ? { ...inv, quantity: inv.quantity - 1 } : inv))
          .filter(inv => inv.quantity > 0);

        return {
          ...prev,
          player: {
            ...prev.player,
            energy: Math.min(prev.player.staminaMax, prev.player.energy + restored),
            inventory: nextInv
          }
        };
      });

      addLog(`Used ${itemDef.name} (+${restored} Energy). Feeling refreshed!`);
      showNotification(`Used ${itemDef.name}: Energy +${restored}`, 'success');
    }
  };

  // Check quest completion
  const checkQuestCompletion = (questId: string) => {
    const questDef = INITIAL_GAME_DATA.quests.find(q => q.id === questId);
    if (!questDef) return;

    setGameState(prev => {
      if (prev.completedQuests.includes(questId)) return prev;
      return {
        ...prev,
        completedQuests: [...prev.completedQuests, questId],
        player: {
          ...prev.player,
          money: prev.player.money + questDef.rewards.money,
          experience: prev.player.experience + questDef.rewards.experience,
          level: Math.floor((prev.player.experience + questDef.rewards.experience) / 100) + 1
        }
      };
    });

    addLog(`🏆 Quest Completed: "${questDef.title}"! Awarded +$${questDef.rewards.money} & +${questDef.rewards.experience} XP!`);
    showNotification(`🏆 Quest Completed: "${questDef.title}"!`, 'success');
  };

  // Reset Game
  const handleResetGame = () => {
    if (window.confirm('Reset Wanderlust Chronicles to starting day?')) {
      const freshState: GameState = {
        player: { ...INITIAL_GAME_DATA.player },
        completedQuests: [],
        dayTurn: 1
      };
      setGameState(freshState);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(freshState));
      setJournalLogs(['Game restarted. Arrived in Tokyo with fresh passport and full stamina.']);
      showNotification('Game reset successfully!', 'info');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className={`relative w-full max-w-4xl rounded-3xl border ${styles.border} ${styles.cardBg} shadow-2xl flex flex-col max-h-[92vh] overflow-hidden`}>
        
        {/* Game Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200/60 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-sky-500/10 via-amber-500/10 to-indigo-500/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-md">
              <Compass className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`text-base font-extrabold ${styles.textPrimary}`}>
                  {INITIAL_GAME_DATA.gameTitle}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  v{INITIAL_GAME_DATA.version}
                </span>
              </div>
              <p className={`text-xs ${styles.textMuted}`}>
                Day {gameState.dayTurn} • Location: <strong className="text-sky-500">{currentLocation.name}, {currentLocation.country}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetGame}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
              title="Reset Game"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Player HUD & Vitals */}
        <div className="px-5 py-3.5 bg-slate-50/70 dark:bg-slate-900/60 border-b border-slate-200/60 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {/* Money */}
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/60 shadow-xs">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-medium">Funds</div>
              <div className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400 font-mono">
                ${gameState.player.money}
              </div>
            </div>
          </div>

          {/* Energy / Stamina */}
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/60 shadow-xs">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
              <Zap className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                <span>Energy</span>
                <span>{gameState.player.energy}/{gameState.player.staminaMax}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-300"
                  style={{ width: `${(gameState.player.energy / gameState.player.staminaMax) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Level & XP */}
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/60 shadow-xs">
            <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-500">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-medium">Level {gameState.player.level}</div>
              <div className="font-bold text-xs text-sky-600 dark:text-sky-400">
                {gameState.player.experience} XP
              </div>
            </div>
          </div>

          {/* Rest Button */}
          <button
            onClick={handleRestAtHotel}
            className="flex items-center justify-center gap-2 p-2 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-600 text-white font-bold hover:opacity-95 transition-all shadow-xs cursor-pointer"
          >
            <Coffee className="w-4 h-4" />
            <span>Rest Hotel ($45)</span>
          </button>
        </div>

        {/* Action feedback flash */}
        {actionFeedback && (
          <div
            className={`px-4 py-2 text-xs font-semibold flex items-center justify-between border-b ${
              actionFeedback.type === 'success'
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                : actionFeedback.type === 'warn'
                ? 'bg-rose-500/15 border-rose-500/30 text-rose-600 dark:text-rose-400'
                : 'bg-sky-500/15 border-sky-500/30 text-sky-600 dark:text-sky-400'
            }`}
          >
            <span>{actionFeedback.message}</span>
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-200/60 dark:border-slate-800 px-4 pt-2 gap-2 text-xs">
          <button
            onClick={() => setActiveTab('explore')}
            className={`pb-2.5 px-3 font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'explore'
                ? 'border-sky-500 text-sky-500'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Landmark className="w-3.5 h-3.5" />
            <span>City & Activities</span>
          </button>

          <button
            onClick={() => setActiveTab('transport')}
            className={`pb-2.5 px-3 font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'transport'
                ? 'border-sky-500 text-sky-500'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Plane className="w-3.5 h-3.5" />
            <span>Travel & Transit</span>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`pb-2.5 px-3 font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'inventory'
                ? 'border-sky-500 text-sky-500'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Luggage className="w-3.5 h-3.5" />
            <span>Backpack ({gameState.player.inventory.reduce((a, b) => a + b.quantity, 0)})</span>
          </button>

          <button
            onClick={() => setActiveTab('quests')}
            className={`pb-2.5 px-3 font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'quests'
                ? 'border-sky-500 text-sky-500'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Quests ({gameState.completedQuests.length}/{INITIAL_GAME_DATA.quests.length})</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* TAB 1: EXPLORE & ACTIVITIES */}
          {activeTab === 'explore' && (
            <div className="space-y-5">
              {/* City Hero Card */}
              <div className="relative rounded-2xl p-5 overflow-hidden bg-gradient-to-r from-slate-900 to-indigo-950 text-white shadow-md">
                <div className="relative z-10 space-y-1.5 max-w-xl">
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/10 text-sky-300 text-[10px] font-bold">
                    <MapPin className="w-3 h-3" />
                    <span>{currentLocation.country}</span>
                  </div>
                  <h4 className="text-xl font-black">{currentLocation.name}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {currentLocation.description}
                  </p>
                  <div className="text-[11px] text-amber-300 font-semibold pt-1">
                    Cost of Living Multiplier: {currentLocation.costOfLivingMultiplier}x
                  </div>
                </div>
              </div>

              {/* Local Activities List */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Available Activities in {currentLocation.name}
                </h5>

                {currentLocation.activities.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-xs text-slate-400">
                    No special activities right now. Rest or take a train to explore other cities!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentLocation.activities.map(actId => {
                      const act = INITIAL_GAME_DATA.activities.find(a => a.id === actId);
                      if (!act) return null;

                      return (
                        <div
                          key={act.id}
                          className={`p-4 rounded-2xl border ${styles.border} ${styles.cardBg} shadow-xs hover:border-sky-500/50 transition-all flex flex-col justify-between gap-3`}
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <h6 className="font-bold text-xs">{act.name}</h6>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500/10 text-sky-500">
                                +{act.rewards.experience} XP
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-1">{act.description}</p>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                            <div className="text-[10px] font-medium text-slate-400 flex items-center gap-2">
                              <span>Cost: <strong className="text-emerald-500">${act.moneyCost}</strong></span>
                              <span>
                                Energy:{' '}
                                <strong className={act.energyCost > 0 ? 'text-amber-500' : 'text-emerald-500'}>
                                  {act.energyCost > 0 ? `-${act.energyCost}` : `+${Math.abs(act.energyCost)}`}
                                </strong>
                              </span>
                            </div>

                            <button
                              onClick={() => handleDoActivity(act)}
                              className="px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
                            >
                              Experience
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: TRANSPORTATION */}
          {activeTab === 'transport' && (
            <div className="space-y-4">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Transit from {currentLocation.name}
              </h5>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentLocation.availableTransport.map(tr => {
                  const dest = INITIAL_GAME_DATA.locations.find(l => l.id === tr.destinationId);
                  if (!dest) return null;

                  return (
                    <div
                      key={tr.destinationId + tr.type}
                      className={`p-4 rounded-2xl border ${styles.border} ${styles.cardBg} shadow-xs flex flex-col justify-between gap-3`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-500">
                          {tr.type === 'Flight' ? <Plane className="w-5 h-5" /> : <Train className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400 font-semibold">{tr.type} to</div>
                          <div className="font-bold text-sm text-sky-600 dark:text-sky-400">
                            {dest.name}, {dest.country}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 py-2 text-[10px] font-mono bg-slate-50 dark:bg-slate-900/60 rounded-xl p-2 text-center">
                        <div>
                          <span className="text-slate-400 block">Ticket</span>
                          <span className="font-bold text-emerald-500">${tr.cost}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Duration</span>
                          <span className="font-bold">{tr.travelTimeHours}h</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Energy</span>
                          <span className="font-bold text-amber-500">-{tr.energyCost}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleTravel(tr)}
                        className="w-full py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:opacity-90 text-white text-xs font-bold shadow-xs cursor-pointer"
                      >
                        Book & Travel (${tr.cost})
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: INVENTORY */}
          {activeTab === 'inventory' && (
            <div className="space-y-4">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Traveler's Backpack ({gameState.player.inventory.length}/{INITIAL_GAME_DATA.settings.maxInventorySlots} Slots)
              </h5>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {gameState.player.inventory.map(invItem => {
                  const itemDef = INITIAL_GAME_DATA.items.find(i => i.id === invItem.itemId);
                  if (!itemDef) return null;

                  return (
                    <div
                      key={invItem.itemId}
                      className={`p-3.5 rounded-2xl border ${styles.border} ${styles.cardBg} shadow-xs flex flex-col justify-between gap-2`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs">{itemDef.name}</span>
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800">
                            x{invItem.quantity}
                          </span>
                        </div>
                        <div className="text-[9px] uppercase font-bold text-sky-500 tracking-wider mt-0.5">
                          {itemDef.type}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">{itemDef.description}</p>
                      </div>

                      {itemDef.usable && (
                        <button
                          onClick={() => handleUseItem(itemDef.id)}
                          className="mt-2 w-full py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                        >
                          Use Item (+15 Energy)
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: QUESTS & REWARDS */}
          {activeTab === 'quests' && (
            <div className="space-y-4">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Active Expeditions & Quests
              </h5>

              <div className="space-y-3">
                {INITIAL_GAME_DATA.quests.map(quest => {
                  const isDone = gameState.completedQuests.includes(quest.id);

                  return (
                    <div
                      key={quest.id}
                      className={`p-4 rounded-2xl border ${
                        isDone ? 'border-emerald-500/40 bg-emerald-500/5' : `${styles.border} ${styles.cardBg}`
                      } shadow-xs flex items-center justify-between gap-4`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h6 className="font-bold text-xs">{quest.title}</h6>
                          {isDone ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white">
                              Completed!
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400">
                              In Progress
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500">{quest.description}</p>
                      </div>

                      <div className="text-right shrink-0 text-xs font-mono font-bold">
                        <span className="text-emerald-500">+${quest.rewards.money}</span>
                        <span className="text-slate-400 ml-2">+{quest.rewards.experience} XP</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Real-time Travel Journal */}
          <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800 space-y-2">
            <h6 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Traveler's Log
            </h6>
            <div className="p-3 rounded-2xl bg-slate-900 text-slate-300 font-mono text-[11px] max-h-28 overflow-y-auto space-y-1">
              {journalLogs.map((log, idx) => (
                <div key={idx} className="leading-tight">
                  <span className="text-sky-400">❯</span> {log}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RANDOM EVENT MODAL POPUP */}
        {activeEvent && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-30 flex items-center justify-center p-4">
            <div className={`w-full max-w-md rounded-3xl p-5 border ${styles.border} ${styles.cardBg} shadow-2xl space-y-4 animate-in zoom-in-95`}>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-500">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-500 tracking-wider">
                    {activeEvent.category} Event
                  </span>
                  <h4 className="font-extrabold text-sm">{activeEvent.title}</h4>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {activeEvent.description}
              </p>

              <div className="space-y-2 pt-2">
                {activeEvent.choices.map((choice, i) => (
                  <button
                    key={i}
                    onClick={() => handleResolveEventChoice(choice)}
                    className="w-full text-left p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-sky-500 bg-white dark:bg-slate-800/80 text-xs font-semibold hover:bg-sky-500/5 transition-all cursor-pointer flex items-center justify-between"
                  >
                    <span>{choice.choiceText}</span>
                    <ChevronRight className="w-4 h-4 opacity-50 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
