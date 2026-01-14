<template>
  <div class="term-editor-page">
    <div class="sidebar">
      <ConceptTree 
        :terms="terms" 
        :selectedId="selectedTermId"
        @select="selectTerm"
        @create="createTerm"
      />
    </div>
    <div class="main-content">
      <TermEditor 
        v-if="selectedTerm"
        :term="selectedTerm"
        :allTerms="terms"
        @save="saveTerm"
        @delete="deleteTerm"
      />
      <div v-else class="welcome-screen">
        <h2>Rule Knowledge Base Editor</h2>
        <p>Select a term to edit or create a new one.</p>
        <button @click="exportData">Export JSON</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import ConceptTree from './ConceptTree.vue';
import TermEditor from './TermEditor.vue';

export default {
  name: 'TermEditorPage',
  components: { ConceptTree, TermEditor },
  setup() {
    const terms = ref([]);
    const selectedTermId = ref(null);

    const selectedTerm = computed(() => {
      return terms.value.find(t => t.id === selectedTermId.value);
    });

    onMounted(() => {
      // Load initial mock data
      terms.value = [
        {
          id: 'weapon',
          name: 'Weapon',
          type: 'term',
          doc: [
            { 
              type: 'paragraph', 
              children: [
                { type: 'text', value: 'A tool used to make attacks.' }
              ] 
            }
          ]
        },
        {
          id: 'attack',
          name: 'Attack',
          type: 'mechanic',
          doc: [
            { 
              type: 'paragraph', 
              children: [
                { type: 'text', value: 'You can use a ' },
                { type: 'term', ref: 'weapon', label: 'Weapon' },
                { type: 'text', value: ' to make an attack.' }
              ] 
            }
          ]
        }
      ];
    });

    const selectTerm = (id) => {
      selectedTermId.value = id;
    };

    const createTerm = () => {
      const newId = 'term_' + Math.random().toString(36).substr(2, 6);
      const newTerm = {
        id: newId,
        name: 'New Term',
        type: 'term',
        doc: [
          { type: 'paragraph', children: [] }
        ]
      };
      terms.value.push(newTerm);
      selectedTermId.value = newId;
    };

    const saveTerm = (updatedTerm) => {
      const index = terms.value.findIndex(t => t.id === updatedTerm.id);
      if (index !== -1) {
        terms.value[index] = updatedTerm;
        // Also update ID if changed (though ID editing is tricky)
        // If ID changed, we need to handle refs... let's assume ID is immutable for now or handled carefully.
        // But UI shows ID as non-editable usually, here I made it display only in badge.
      }
      alert('Term Saved!');
    };

    const deleteTerm = (id) => {
      if (!confirm('Are you sure?')) return;
      terms.value = terms.value.filter(t => t.id !== id);
      if (selectedTermId.value === id) {
        selectedTermId.value = null;
      }
    };

    const exportData = () => {
      const data = {};
      terms.value.forEach(t => {
        data[t.id] = t;
      });
      console.log(JSON.stringify(data, null, 2));
      alert('Check Console for JSON output');
    };

    return {
      terms,
      selectedTermId,
      selectedTerm,
      selectTerm,
      createTerm,
      saveTerm,
      deleteTerm,
      exportData
    };
  }
}
</script>

<style scoped>
.term-editor-page {
  display: flex;
  height: calc(100vh - 40px); /* Adjust for app nav */
  background: #1a1a1a;
  color: #eee;
}
.sidebar {
  width: 250px;
  flex-shrink: 0;
}
.main-content {
  flex: 1;
  overflow: hidden;
}
.welcome-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
}
.welcome-screen button {
  margin-top: 20px;
  padding: 10px 20px;
  cursor: pointer;
}
</style>
