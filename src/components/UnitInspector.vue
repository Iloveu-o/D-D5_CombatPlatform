<template>
  <div class="inspector-panel" v-if="unit" :class="unit.faction">
    <div class="inspector-grid">
      
      <!-- Left Column: Notes -->
      <div class="side-column">
        <h3>Notes</h3>
        <textarea v-model="unit.customProps.notes" placeholder="General notes..." class="large-textarea"></textarea>
      </div>

      <!-- Center Column: Stats & Controls -->
      <div class="center-column">
        <div class="header" :class="unit.faction">
          <input class="name-input" v-model="unit.name" />
          <div class="header-controls">
            <select v-model="unit.faction" class="faction-select">
              <option value="player">Player</option>
              <option value="friendly">Friendly</option>
              <option value="neutral">Neutral</option>
              <option value="hostile">Hostile</option>
            </select>
            <div class="init-control">
              <span>Init:</span>
              <input type="number" v-model.number="unit.initiative" class="init-input" />
            </div>
          </div>
        </div>
        
        <div class="stats-grid">
          <div class="stat-box">
            <label>HP</label>
            <div class="hp-control">
              <input type="number" v-model.number="unit.hpCurrent" />
              <span>/</span>
              <input type="number" v-model.number="unit.hpMax" />
            </div>
            <div class="hp-bar">
              <div class="hp-fill" :style="{ width: hpPercentage + '%' }"></div>
            </div>
          </div>
          
          <div class="stat-box">
            <label>AC</label>
            <input type="number" v-model.number="unit.ac" class="ac-input" />
          </div>
        </div>

        <div class="stats-grid ability-scores" v-if="unit.stats">
          <div v-for="(val, key) in unit.stats" :key="key" class="ability-box">
            <label>{{ key.toUpperCase() }}</label>
            <input type="number" v-model.number="unit.stats[key]" min="0" class="ability-input" />
          </div>
        </div>

        <div class="details-section">
          <h3>Status Effects</h3>
          <div class="status-list">
            <div v-for="(status, idx) in unit.status" :key="idx" class="status-tag">
              {{ status }}
              <button @click="removeStatus(idx)" class="remove-btn">×</button>
            </div>
            <div class="add-status">
              <input 
                v-model="newStatus" 
                @keyup.enter="addStatus" 
                placeholder="Add status..." 
              />
              <button @click="addStatus">+</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: GM Notes -->
      <div class="side-column">
        <h3>Custom Props / GM Info</h3>
        <textarea v-model="unit.customProps.gmNotes" placeholder="Hidden info or custom properties..." class="large-textarea"></textarea>
      </div>

    </div>
  </div>
  <div v-else class="inspector-placeholder">
    Select a unit to view details
  </div>
</template>

<script>
import { computed, ref } from 'vue';
import { useCombat } from '../composables/useCombat';

export default {
  name: 'UnitInspector',
  props: {
    unitId: {
      type: String,
      default: null
    }
  },
  setup(props) {
    const { state } = useCombat();
    const newStatus = ref('');

    const unit = computed(() => {
      if (!props.unitId) return null;
      return state.units.find(u => u.id === props.unitId) || null;
    });

    const hpPercentage = computed(() => {
      if (!unit.value || unit.value.hpMax === 0) return 0;
      return Math.max(0, Math.min(100, (unit.value.hpCurrent / unit.value.hpMax) * 100));
    });

    const addStatus = () => {
      if (!newStatus.value.trim() || !unit.value) return;
      if (!unit.value.status) unit.value.status = [];
      unit.value.status.push(newStatus.value.trim());
      newStatus.value = '';
    };

    const removeStatus = (index) => {
      if (!unit.value) return;
      unit.value.status.splice(index, 1);
    };

    return {
      unit,
      hpPercentage,
      newStatus,
      addStatus,
      removeStatus
    };
  }
}
</script>

<style scoped>
.inspector-panel {
  background: #222;
  border: 1px solid #444;
  border-radius: 8px;
  padding: 20px;
  color: #eee;
  width: 98%;
  max-width: 1800px;
  margin: 0 auto;
  box-shadow: 0 -5px 20px rgba(0,0,0,0.5);
  transition: background-color 0.3s ease;
}

/* Faction Backgrounds */
.inspector-panel.player { background: rgba(59, 130, 246, 0.15); border-color: #3b82f6; }
.inspector-panel.friendly { background: rgba(34, 197, 94, 0.15); border-color: #22c55e; }
.inspector-panel.neutral { background: rgba(234, 179, 8, 0.15); border-color: #eab308; }
.inspector-panel.hostile { background: rgba(239, 68, 68, 0.15); border-color: #ef4444; }

.inspector-grid {
  display: grid;
  grid-template-columns: 1fr 500px 1fr;
  gap: 20px;
  align-items: stretch;
}

.center-column {
  display: flex;
  flex-direction: column;
}

.side-column {
  display: flex;
  flex-direction: column;
}

.side-column h3 {
  font-size: 16px;
  border-bottom: 1px solid #444;
  padding-bottom: 5px;
  margin-bottom: 10px;
  color: #aaa;
}

.large-textarea {
  width: 90%;
  flex: 1;
  min-height: 400px;
  background: #333;
  border: 1px solid #555;
  color: #fff;
  padding: 10px;
  border-radius: 4px;
  resize: vertical;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.5;
  align-self: center;
}

.header {
  border-bottom: 2px solid #444;
  padding-bottom: 10px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header.player { border-color: #3b82f6; }
.header.friendly { border-color: #22c55e; }
.header.neutral { border-color: #eab308; }
.header.hostile { border-color: #ef4444; }

.name-input {
  background: transparent;
  border: none;
  border-bottom: 1px solid #666;
  color: #fff;
  font-size: 24px;
  font-weight: bold;
  width: 200px;
}

.header-controls {
  display: flex;
  gap: 10px;
  align-items: center;
}

.faction-select {
  background: #333;
  color: #eee;
  border: 1px solid #555;
  padding: 4px;
  border-radius: 4px;
}

.init-control {
  display: flex;
  align-items: center;
  gap: 5px;
  background: #333;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #555;
  font-size: 12px;
  text-transform: uppercase;
}

.init-input {
  width: 40px;
  background: transparent;
  border: none;
  color: #fff;
  text-align: center;
  font-weight: bold;
}

.stats-grid {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.stat-box {
  background: #333;
  padding: 10px;
  border-radius: 6px;
  flex: 1;
}

.hp-control {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 18px;
  font-weight: bold;
}

.hp-control input {
  width: 60px;
  background: transparent;
  border: none;
  border-bottom: 1px solid #666;
  color: #fff;
  text-align: center;
  font-size: 18px;
}

.hp-bar {
  height: 6px;
  background: #555;
  margin-top: 5px;
  border-radius: 3px;
  overflow: hidden;
}

.hp-fill {
  height: 100%;
  background: #e11d48;
  transition: width 0.3s ease;
}

.ac-input {
  width: 50px;
  background: transparent;
  border: 1px solid #555;
  color: #fff;
  padding: 5px;
  text-align: center;
  font-size: 16px;
  border-radius: 4px;
}

.ability-scores {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 10px;
}

.ability-box {
  background: #333;
  padding: 8px 4px;
  border-radius: 6px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.ability-box label {
  font-size: 10px;
  color: #aaa;
  margin-bottom: 4px;
  font-weight: bold;
}

.ability-input {
  width: 30px;
  background: transparent;
  border: none;
  border-bottom: 1px solid #555;
  color: #fff;
  text-align: center;
  font-size: 14px;
  font-weight: bold;
}

.details-section {
  margin-top: 20px;
}

.details-section h3 {
  font-size: 16px;
  border-bottom: 1px solid #444;
  padding-bottom: 5px;
  margin-bottom: 10px;
  color: #aaa;
}

.status-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.status-tag {
  background: #4b5563;
  padding: 4px 8px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.remove-btn {
  background: none;
  border: none;
  color: #ff9999;
  cursor: pointer;
  padding: 0;
}

.add-status {
  display: flex;
  gap: 5px;
}

.add-status input {
  background: #333;
  border: 1px solid #555;
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
}

textarea {
  width: 100%;
  height: 80px;
  background: #333;
  border: 1px solid #555;
  color: #fff;
  padding: 8px;
  border-radius: 4px;
  resize: vertical;
}

.inspector-placeholder {
  text-align: center;
  padding: 40px;
  color: #666;
  font-style: italic;
}
</style>
