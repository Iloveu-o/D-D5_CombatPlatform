<template>
  <div class="term-editor" v-if="localTerm">
    <div class="editor-header">
      <div class="header-main">
        <input v-model="localTerm.name" class="title-input" placeholder="Term Name" />
        <span class="id-badge">{{ localTerm.id }}</span>
      </div>
      <div class="actions">
        <button @click="save" class="btn-primary">Save JSON</button>
        <button @click="$emit('delete', localTerm.id)" class="btn-danger">Delete</button>
      </div>
    </div>

    <div class="props-bar">
      <div class="prop-item">
        <label>Type</label>
        <select v-model="localTerm.type">
          <option value="term">Term</option>
          <option value="mechanic">Mechanic</option>
          <option value="spell">Spell</option>
          <option value="item">Item</option>
          <option value="condition">Condition</option>
        </select>
      </div>
    </div>

    <div class="editor-workspace">
      <!-- Left: Editor -->
      <div class="workspace-col editor-col">
        <div class="col-header">Definition Editor</div>
        <div class="scroll-area">
          <DocASTEditor 
            v-model="localTerm.doc" 
            @request-term="openTermSelector"
          />
        </div>
      </div>

      <!-- Right: Preview -->
      <div class="workspace-col preview-col">
        <div class="col-header">Tooltip Preview</div>
        <div class="scroll-area preview-bg">
           <div class="preview-tooltip">
             <div class="tooltip-term">{{ localTerm.name }}</div>
             <div class="tooltip-content">
               <AstRenderer :ast="localTerm.doc" />
             </div>
           </div>
        </div>
      </div>
    </div>

    <!-- Term Selector Modal -->
    <div v-if="showSelector" class="modal-overlay" @click.self="showSelector = false">
      <div class="modal-box">
        <h3>Insert Term Reference</h3>
        <input 
          v-model="searchQuery" 
          placeholder="Search terms..." 
          class="search-input"
          ref="searchInput"
        />
        <div class="term-results">
          <div 
            v-for="t in filteredTerms" 
            :key="t.id" 
            class="term-result-item"
            @click="selectTerm(t)"
          >
            <span class="term-name">{{ t.name }}</span>
            <span class="term-type">{{ t.type }}</span>
          </div>
        </div>
        <button @click="showSelector = false" class="btn-secondary">Cancel</button>
      </div>
    </div>

  </div>
  <div v-else class="empty-state">
    Select or Create a Term
  </div>
</template>

<script>
import { ref, watch, computed, nextTick } from 'vue';
import DocASTEditor from './DocASTEditor.vue';
import AstRenderer from './AstRenderer.vue';

export default {
  name: 'TermEditor',
  components: { DocASTEditor, AstRenderer },
  props: {
    term: {
      type: Object,
      default: null
    },
    allTerms: {
      type: Array,
      default: () => []
    }
  },
  emits: ['save', 'delete'],
  setup(props, { emit }) {
    const localTerm = ref(null);
    const showSelector = ref(false);
    const searchQuery = ref('');
    const searchInput = ref(null);
    let currentCallback = null;

    // Sync prop to local
    watch(() => props.term, (newVal) => {
      if (newVal) {
        // Deep copy to avoid mutating prop directly before save
        localTerm.value = JSON.parse(JSON.stringify(newVal));
      } else {
        localTerm.value = null;
      }
    }, { immediate: true });

    const save = () => {
      emit('save', localTerm.value);
    };

    const openTermSelector = (callback) => {
      currentCallback = callback;
      searchQuery.value = '';
      showSelector.value = true;
      nextTick(() => {
        if (searchInput.value) searchInput.value.focus();
      });
    };

    const filteredTerms = computed(() => {
      if (!searchQuery.value) return props.allTerms.slice(0, 10);
      const q = searchQuery.value.toLowerCase();
      return props.allTerms.filter(t => 
        t.name.toLowerCase().includes(q) || t.id.includes(q)
      ).slice(0, 20);
    });

    const selectTerm = (t) => {
      if (currentCallback) {
        currentCallback({ id: t.id, name: t.name });
      }
      showSelector.value = false;
    };

    return {
      localTerm,
      save,
      showSelector,
      searchQuery,
      searchInput,
      filteredTerms,
      openTermSelector,
      selectTerm
    };
  }
}
</script>

<style scoped>
.term-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  color: #eee;
}
.editor-header {
  padding: 10px;
  background: #222;
  border-bottom: 1px solid #444;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header-main {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}
.title-input {
  background: transparent;
  border: none;
  border-bottom: 1px solid #555;
  color: #fff;
  font-size: 1.2em;
  padding: 5px;
  width: 200px;
}
.id-badge {
  font-size: 0.8em;
  color: #666;
  font-family: monospace;
}
.props-bar {
  padding: 10px;
  background: #1a1a1a;
  border-bottom: 1px solid #333;
}
.editor-workspace {
  flex: 1;
  display: flex;
  overflow: hidden;
}
.workspace-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.editor-col {
  border-right: 1px solid #333;
}
.col-header {
  padding: 5px 10px;
  background: #252525;
  font-size: 0.8em;
  color: #aaa;
  text-transform: uppercase;
}
.scroll-area {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}
.preview-bg {
  background: #111;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}
.preview-tooltip {
  background: #1f2937;
  border: 1px solid #4b5563;
  color: #f3f4f6;
  padding: 12px;
  border-radius: 6px;
  width: 300px;
  box-shadow: 0 10px 15px rgba(0,0,0,0.5);
}
.tooltip-term {
  font-weight: bold;
  margin-bottom: 8px;
  color: #a3e635;
  border-bottom: 1px solid #374151;
  padding-bottom: 4px;
}
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.7);
  z-index: 2000;
  display: flex;
  justify-content: center;
  align-items: center;
}
.modal-box {
  background: #222;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
  border: 1px solid #444;
}
.search-input {
  width: 100%;
  padding: 8px;
  margin: 10px 0;
  background: #111;
  border: 1px solid #444;
  color: #fff;
}
.term-results {
  max-height: 200px;
  overflow-y: auto;
  margin-bottom: 10px;
  border: 1px solid #333;
}
.term-result-item {
  padding: 8px;
  border-bottom: 1px solid #333;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
}
.term-result-item:hover {
  background: #333;
}
.term-type {
  font-size: 0.8em;
  color: #888;
}
.btn-primary { background: #3b82f6; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; }
.btn-danger { background: #ef4444; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; margin-left: 5px; }
.btn-secondary { background: #555; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; }
</style>
