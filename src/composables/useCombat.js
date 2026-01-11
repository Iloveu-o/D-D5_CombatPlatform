import { computed, reactive } from 'vue';
import { Unit } from '../models/Unit';

// Global state to persist across components if needed (or just use provide/inject)
// For simplicity in this demo, I'll keep state inside the function but could be lifted out if multiple instances needed sharing.
// But usually there is only one Combat instance.
// I will create a singleton state pattern.

const state = reactive({
  units: [],
  activeUnitId: null,
  selectedUnitId: null,
  turnCount: 0,
  roundCount: 1
});

export function useCombat() {
  
  const activeUnit = computed(() => state.units.find(u => u.id === state.activeUnitId) || null);
  const selectedUnit = computed(() => state.units.find(u => u.id === state.selectedUnitId) || null);

  // Initialize with some dummy data if empty
  const initDemoData = () => {
    if (state.units.length > 0) return;
    
    state.units = [
      new Unit({ name: 'Lae\'zel', faction: 'player', initiative: 18, hpMax: 40, hpCurrent: 35 }),
      new Unit({ name: 'Shadowheart', faction: 'player', initiative: 14, hpMax: 30, hpCurrent: 30 }),
      new Unit({ name: 'Goblin Boss', faction: 'hostile', initiative: 12, hpMax: 50, hpCurrent: 50 }),
      new Unit({ name: 'Goblin Archer', faction: 'hostile', initiative: 8, hpMax: 15, hpCurrent: 15 }),
    ];
    
    // Sort by initiative descending
    state.units.sort((a, b) => b.initiative - a.initiative);
    
    state.activeUnitId = state.units[0].id;
    state.selectedUnitId = state.units[0].id;
    state.turnCount = 1;
    state.roundCount = 1;
  };

  const nextTurn = () => {
    if (state.units.length === 0) return;

    const currentIndex = state.units.findIndex(u => u.id === state.activeUnitId);
    let nextIndex = currentIndex + 1;

    // Circular Logic
    if (nextIndex >= state.units.length) {
      nextIndex = 0;
      state.roundCount++;
    }

    state.activeUnitId = state.units[nextIndex].id;
    state.selectedUnitId = state.activeUnitId; // Requirement: Selected Unit = Active Unit
    state.turnCount++;
  };

  const selectUnit = (unitOrId) => {
    const id = typeof unitOrId === 'string' ? unitOrId : unitOrId.id;
    state.selectedUnitId = id;
  };

  const backToActive = () => {
    state.selectedUnitId = state.activeUnitId;
  };

  const addUnit = (unit, index = -1) => {
    if (index === -1) {
        // Add to end by default
        state.units.push(unit);
    } else {
        state.units.splice(index, 0, unit);
    }
    
    // If no active unit, set this as active
    if (!state.activeUnitId) {
        state.activeUnitId = unit.id;
        state.selectedUnitId = unit.id;
    }
  };

  const removeUnit = (unitId) => {
      const index = state.units.findIndex(u => u.id === unitId);
      if (index === -1) return;

      // If removing active unit, move active to next?
      // Or just let user handle it? BG3 usually handles death by skipping.
      // For now, let's just remove.
      if (state.activeUnitId === unitId) {
          // Move to next before removing to keep flow?
          // Or just standard removal.
          // If we remove the active unit, who becomes active? The next one.
          const nextIndex = (index + 1) % state.units.length;
           // If it was the only unit
          if (state.units.length === 1) {
              state.activeUnitId = null;
              state.selectedUnitId = null;
          } else {
              state.activeUnitId = state.units[nextIndex].id;
              if (state.selectedUnitId === unitId) {
                  state.selectedUnitId = state.activeUnitId;
              }
          }
      }
      
      state.units.splice(index, 1);
  };
  
  const setUnits = (newUnits) => {
      state.units = newUnits;
  };

  const sortByInitiative = () => {
    // Stable random sort for ties:
    // 1. Map to object with random value
    // 2. Sort
    // 3. Map back
    const mapped = state.units.map((u, i) => ({ 
      u, 
      r: Math.random(),
      originalIndex: i // Keep stable if truly equal and not wanting random? But requirement says random.
    }));

    mapped.sort((a, b) => {
      // Primary: Initiative Descending
      if (b.u.initiative !== a.u.initiative) {
        return b.u.initiative - a.u.initiative;
      }
      // Secondary: Random
      return a.r - b.r;
    });

    state.units = mapped.map(item => item.u);
  };

  return {
    state,
    activeUnit,
    selectedUnit,
    nextTurn,
    selectUnit,
    backToActive,
    addUnit,
    removeUnit,
    setUnits,
    sortByInitiative,
    initDemoData
  };
}
