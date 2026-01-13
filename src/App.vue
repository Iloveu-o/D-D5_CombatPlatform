<template>
  <div id="app" class="bg3-theme">
    <div class="app-nav">
      <button 
        class="nav-btn" 
        :class="{ active: viewMode === 'combat' }"
        @click="viewMode = 'combat'"
      >
        Combat Tracker
      </button>
      <button 
        class="nav-btn" 
        :class="{ active: viewMode === 'rules' }"
        @click="viewMode = 'rules'"
      >
        Rules Knowledge Base
      </button>
    </div>

    <div v-if="viewMode === 'combat'" class="combat-view">
      <header class="top-bar">
      <div class="turn-info">
        <div class="turn-count">Turn: {{ state.turnCount }}</div>
        <div class="round-count">Round: {{ state.roundCount }}</div>
      </div>
      <div class="combat-controls">
        <button v-if="!isReordering" @click="toggleReorder" class="btn btn-secondary">
          Adjust Order
        </button>
        <button v-else @click="toggleReorder" class="btn btn-confirm">
          Confirm Order
        </button>
        
        <button @click="sortByInitiative" class="btn btn-secondary">
          Auto Sort
        </button>

        <button @click="nextTurn" class="btn btn-primary end-turn-btn">
          End Turn 
          <span class="sub-text">(Next Unit)</span>
        </button>
      </div>
      <div class="add-unit-btn">
        <button @click="showAddModal = true" class="btn btn-icon">+</button>
      </div>
    </header>

    <div class="initiative-section">
      <InitiativeBar 
        :units="state.units"
        :activeUnitId="state.activeUnitId"
        :selectedUnitId="state.selectedUnitId"
        :isReordering="isReordering"
        @select="handleSelect"
        @reorder="handleReorder"
      />
    </div>

    <div class="main-workspace">
      <div class="back-to-active-container" v-if="showBackToActive">
        <button @click="backToActive" class="btn btn-highlight">
          Back to Active Unit
        </button>
      </div>

      <UnitInspector :unitId="state.selectedUnitId" />
    </div>

    </div>

    <div v-if="viewMode === 'rules'" class="rules-view">
      <RulesPage />
    </div>

    <!-- Add Unit Modal -->
    <div v-if="showAddModal" class="modal-overlay">
      <div class="modal-content">
        <h3>Add Reinforcement</h3>
        <div class="form-group">
          <label>Name</label>
          <input v-model="newUnitForm.name" placeholder="Goblin Scrapper" />
        </div>
        <div class="form-group">
          <label>Initiative</label>
          <input type="number" v-model.number="newUnitForm.initiative" />
        </div>
        <div class="form-group">
          <label>HP Max</label>
          <input type="number" v-model.number="newUnitForm.hpMax" />
        </div>
        <div class="form-group">
          <label>Faction</label>
          <select v-model="newUnitForm.faction">
            <option value="player">Player</option>
            <option value="friendly">Friendly NPC</option>
            <option value="neutral">Neutral</option>
            <option value="hostile">Hostile</option>
          </select>
        </div>
        <div class="modal-actions">
          <button @click="showAddModal = false" class="btn btn-secondary">Cancel</button>
          <button @click="confirmAddUnit" class="btn btn-primary">Add Unit</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useCombat } from './composables/useCombat';
import { useRulesTooltip } from './composables/useRulesTooltip';
import { Unit, Faction } from './models/Unit';
import InitiativeBar from './components/InitiativeBar.vue';
import UnitInspector from './components/UnitInspector.vue';
import RulesPage from './components/RulesKnowledgeBase/RulesPage.vue';

export default {
  name: 'App',
  components: {
    InitiativeBar,
    UnitInspector,
    RulesPage
  },
  setup() {
    const viewMode = ref('combat');
    const { 
      state, 
      activeUnit, 
      selectedUnit, 
      nextTurn, 
      selectUnit, 
      backToActive, 
      addUnit, 
      setUnits,
      sortByInitiative,
      initDemoData 
    } = useCombat();

    const { init: initTooltips } = useRulesTooltip();

    const isReordering = ref(false);
    const showAddModal = ref(false);

    const newUnitForm = ref({
      name: '',
      initiative: 10,
      hpMax: 20,
      faction: Faction.HOSTILE
    });

    onMounted(() => {
      initDemoData();
      initTooltips();
    });

    const toggleReorder = () => {
      isReordering.value = !isReordering.value;
    };

    const handleSelect = (unit) => {
      selectUnit(unit);
    };

    const handleReorder = ({ sourceIndex, targetIndex }) => {
      const newUnits = [...state.units];
      const [movedUnit] = newUnits.splice(sourceIndex, 1);
      newUnits.splice(targetIndex, 0, movedUnit);
      setUnits(newUnits);
    };

    const confirmAddUnit = () => {
      const unit = new Unit({
        name: newUnitForm.value.name || 'Unknown',
        initiative: newUnitForm.value.initiative,
        hpMax: newUnitForm.value.hpMax,
        hpCurrent: newUnitForm.value.hpMax,
        faction: newUnitForm.value.faction
      });
      
      addUnit(unit); // Adds to end
      showAddModal.value = false;
      
      // Reset form
      newUnitForm.value = {
        name: '',
        initiative: 10,
        hpMax: 20,
        faction: Faction.HOSTILE
      };
    };

    const showBackToActive = computed(() => {
      return state.activeUnitId && state.selectedUnitId && state.activeUnitId !== state.selectedUnitId;
    });

    return {
      viewMode,
      state,
      activeUnit,
      selectedUnit,
      nextTurn,
      backToActive,
      isReordering,
      toggleReorder,
      handleSelect,
      handleReorder,
      showAddModal,
      newUnitForm,
      confirmAddUnit,
      showBackToActive,
      sortByInitiative
    };
  }
}
</script>

<style>
/* Global Dark Theme */
body {
  margin: 0;
  background-color: #111;
  color: #eee;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

#app {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  background: #1a1a1a;
  border-bottom: 1px solid #333;
}

.turn-info {
  display: flex;
  gap: 20px;
  font-size: 18px;
  font-weight: bold;
  color: #ccc;
}

.combat-controls {
  display: flex;
  gap: 15px;
}

.btn {
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: bold;
  transition: background 0.2s;
  color: #fff;
}

.btn-primary { background: #d97706; } /* Amber/Gold for BG3 feel */
.btn-primary:hover { background: #b45309; }

.btn-secondary { background: #4b5563; }
.btn-secondary:hover { background: #374151; }

.btn-confirm { background: #22c55e; }

.btn-icon { font-size: 24px; padding: 0 12px; background: #444; }

.end-turn-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 5px 20px;
}
.sub-text { font-size: 10px; font-weight: normal; opacity: 0.8; }

.initiative-section {
  padding: 10px 0;
  background: #000;
}

.main-workspace {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  overflow-y: auto;
}

.back-to-active-container {
  margin-bottom: 20px;
}

.btn-highlight {
  background: #3b82f6;
  box-shadow: 0 0 15px rgba(59, 130, 246, 0.5);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal-content {
  background: #2a2a2a;
  padding: 30px;
  border-radius: 8px;
  width: 300px;
  border: 1px solid #444;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #aaa;
}

.form-group input, .form-group select {
  width: 100%;
  padding: 8px;
  background: #111;
  border: 1px solid #444;
  color: #fff;
  border-radius: 4px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

  /* Custom Scrollbar for Webkit */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  ::-webkit-scrollbar-track {
    background: #1a1a1a; 
  }
  ::-webkit-scrollbar-thumb {
    background: #555; 
    border-radius: 4px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: #777; 
  }

  .app-nav {
    display: flex;
    background: #111;
    border-bottom: 1px solid #333;
  }

  .nav-btn {
    flex: 1;
    background: #111;
    color: #888;
    border: none;
    padding: 15px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s;
    border-bottom: 3px solid transparent;
  }

  .nav-btn:hover {
    color: #ccc;
    background: #1a1a1a;
  }

  .nav-btn.active {
    color: #fff;
    border-bottom-color: #e11d48; /* Red accent */
    background: #1a1a1a;
  }

  .combat-view, .rules-view {
    height: calc(100vh - 54px); /* Subtract nav height */
    display: flex;
    flex-direction: column;
  }
</style>
