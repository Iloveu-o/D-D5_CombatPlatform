<template>
  <div class="initiative-bar-container" @wheel.prevent="handleWheel" ref="scrollContainer">
    <div 
      class="initiative-track" 
    >
      <div 
        v-for="(unit, index) in units" 
        :key="unit.id"
        class="unit-card"
        :class="[
          unit.faction, 
          { 
            active: unit.id === activeUnitId,
            selected: unit.id === selectedUnitId,
            draggable: isReordering,
            'is-dragging': index === draggedIndex,
            'squeeze-left': index !== draggedIndex && squeezeIndex !== -1 && index >= squeezeIndex && index < draggedIndex,
            'squeeze-right': index !== draggedIndex && squeezeIndex !== -1 && index <= squeezeIndex && index > draggedIndex
          }
        ]"
        :style="index === draggedIndex ? { transform: `translateX(${dragOffset}px)`, zIndex: 100 } : {}"
        @click="onUnitClick(unit)"
        @mousedown="onMouseDown($event, index)"
      >
        <div class="avatar-placeholder">{{ unit.name.charAt(0) }}</div>
        <div class="unit-info">
          <div class="unit-name">{{ unit.name }}</div>
          <div class="unit-hp">HP: {{ unit.hpCurrent }} / {{ unit.hpMax }}</div>
          <div class="unit-init">Init: {{ unit.initiative }}</div>
        </div>
        <div v-if="unit.id === activeUnitId" class="active-indicator">Current</div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  name: 'InitiativeBar',
  props: {
    units: {
      type: Array,
      required: true
    },
    activeUnitId: String,
    selectedUnitId: String,
    isReordering: Boolean
  },
  emits: ['select', 'reorder'],
  setup(props, { emit }) {
    const scrollContainer = ref(null);
    const draggedIndex = ref(-1);
    const squeezeIndex = ref(-1);
    const dragOffset = ref(0);
    
    let startX = 0;
    let cardWidth = 0;

    const handleWheel = (e) => {
      if (scrollContainer.value) {
        scrollContainer.value.scrollLeft += e.deltaY;
      }
    };

    const onUnitClick = (unit) => {
      if (draggedIndex.value !== -1) return; // Ignore click if dragging
      emit('select', unit);
    };

    const onMouseDown = (e, index) => {
      if (!props.isReordering) return;
      
      draggedIndex.value = index;
      squeezeIndex.value = index;
      startX = e.clientX;
      dragOffset.value = 0;
      
      // Calculate card width including gap (approximate or dynamic)
      // Getting the actual card element
      const card = e.currentTarget;
      // Since gap is on container (flex gap), we might need to assume or measure
      // Initiative-track has gap: 10px. Card width is 105px. Total step is ~115px.
      cardWidth = card.offsetWidth + 10; 

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      
      e.preventDefault(); // Prevent text selection
    };

    const onMouseMove = (e) => {
      if (draggedIndex.value === -1) return;

      const currentX = e.clientX;
      const deltaX = currentX - startX;
      dragOffset.value = deltaX;

      // Calculate how many "slots" we've moved
      // Round to nearest integer to find the target slot
      const slotsMoved = Math.round(deltaX / cardWidth);
      const targetIndex = draggedIndex.value + slotsMoved;

      // Clamp target index
      const clampedIndex = Math.max(0, Math.min(props.units.length - 1, targetIndex));
      
      if (squeezeIndex.value !== clampedIndex) {
        squeezeIndex.value = clampedIndex;
      }
    };

    const onMouseUp = () => {
      if (draggedIndex.value === -1) return;

      const sourceIndex = draggedIndex.value;
      const targetIndex = squeezeIndex.value;

      // Cleanup
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      
      draggedIndex.value = -1;
      squeezeIndex.value = -1;
      dragOffset.value = 0;

      if (sourceIndex !== targetIndex) {
        emit('reorder', { sourceIndex, targetIndex });
      }
    };

    return {
      scrollContainer,
      draggedIndex,
      squeezeIndex,
      dragOffset,
      handleWheel,
      onUnitClick,
      onMouseDown
    };
  }
}
</script>

<style scoped>
.initiative-bar-container {
  width: 100%;
  overflow-x: auto;
  white-space: nowrap;
  background: #1a1a1a;
  padding: 10px 0;
  border-bottom: 2px solid #444;
  /* Hide scrollbar for cleaner look, but keep functionality */
  scrollbar-width: thin;
}

.initiative-track {
  display: inline-flex;
  gap: 10px;
  padding: 0 20px;
}

.unit-card {
  width: 105px;
  height: 135px;
  background: #2a2a2a;
  border: 2px solid #444;
  border-radius: 8px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: transform 0.2s, border-color 0.2s;
  position: relative;
  user-select: none;
}

.unit-card:hover {
  transform: translateY(-5px);
}

.unit-card.draggable {
  cursor: grab;
}

.unit-card.draggable:active {
  cursor: grabbing;
}

.unit-card.is-dragging {
  opacity: 1;
  transition: none;
  box-shadow: 0 10px 20px rgba(0,0,0,0.5);
  z-index: 100;
}

.unit-card.squeeze-left {
  transform: translateX(115px);
}

.unit-card.squeeze-right {
  transform: translateX(-115px);
}

/* Faction Colors (Borders & Accents) */
.unit-card.player { border-color: #3b82f6; box-shadow: 0 0 10px rgba(59, 130, 246, 0.2); }
.unit-card.friendly { border-color: #22c55e; box-shadow: 0 0 10px rgba(34, 197, 94, 0.2); }
.unit-card.neutral { border-color: #eab308; box-shadow: 0 0 10px rgba(234, 179, 8, 0.2); }
.unit-card.hostile { border-color: #ef4444; box-shadow: 0 0 10px rgba(239, 68, 68, 0.2); }

/* Selection & Active States */
.unit-card.active {
  z-index: 10;
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
}

.unit-card.active:not(.is-dragging):not(.squeeze-left):not(.squeeze-right) {
  transform: scale(1.05);
}

.unit-card.selected {
  background: #3a3a3a;
  outline: 2px solid white;
}

.avatar-placeholder {
  width: 45px;
  height: 45px;
  background: #555;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
  color: #fff;
  margin-bottom: 8px;
}

.unit-info {
  text-align: center;
  color: #eee;
  font-size: 12px;
}

.unit-name {
  font-weight: bold;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
}

.unit-hp {
  font-size: 10px;
  color: #ccc;
}

.active-indicator {
  position: absolute;
  top: -10px;
  background: #fff;
  color: #000;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: bold;
}
</style>
