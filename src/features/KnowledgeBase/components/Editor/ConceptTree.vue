<template>
  <div class="concept-tree">
    <div class="tree-header">
      <button @click="$emit('create')" class="new-btn">+ New Term</button>
      <input v-model="filter" placeholder="Filter..." class="filter-input" />
    </div>
    <div class="tree-content">
      <div v-for="(group, type) in groupedTerms" :key="type" class="term-group">
        <div class="group-label">{{ type.toUpperCase() }}</div>
        <div 
          v-for="term in group" 
          :key="term.id" 
          class="tree-item"
          :class="{ active: selectedId === term.id }"
          @click="$emit('select', term.id)"
        >
          {{ term.name }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref } from 'vue';

export default {
  name: 'ConceptTree',
  props: {
    terms: {
      type: Array,
      default: () => []
    },
    selectedId: {
      type: String,
      default: null
    }
  },
  emits: ['select', 'create'],
  setup(props) {
    const filter = ref('');

    const groupedTerms = computed(() => {
      const groups = {};
      const f = filter.value.toLowerCase();
      
      props.terms.forEach(t => {
        if (f && !t.name.toLowerCase().includes(f)) return;
        
        const type = t.type || 'other';
        if (!groups[type]) groups[type] = [];
        groups[type].push(t);
      });
      
      return groups;
    });

    return {
      filter,
      groupedTerms
    };
  }
}
</script>

<style scoped>
.concept-tree {
  display: flex;
  flex-direction: column;
  background: #111;
  border-right: 1px solid #333;
  height: 100%;
}
.tree-header {
  padding: 10px;
  border-bottom: 1px solid #333;
}
.new-btn {
  width: 100%;
  padding: 6px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 8px;
}
.filter-input {
  width: 100%;
  padding: 5px;
  background: #222;
  border: 1px solid #444;
  color: #fff;
}
.tree-content {
  flex: 1;
  overflow-y: auto;
}
.term-group {
  margin-bottom: 10px;
}
.group-label {
  padding: 5px 10px;
  font-size: 0.75em;
  color: #666;
  font-weight: bold;
  background: #1a1a1a;
}
.tree-item {
  padding: 6px 15px;
  cursor: pointer;
  font-size: 0.9em;
  color: #ccc;
}
.tree-item:hover {
  background: #222;
  color: #fff;
}
.tree-item.active {
  background: #333;
  color: #a3e635;
  border-left: 3px solid #a3e635;
}
</style>
