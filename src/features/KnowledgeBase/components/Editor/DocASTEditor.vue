<template>
  <div class="doc-ast-editor">
    <div 
      v-for="(block, index) in modelValue" 
      :key="index" 
      class="editor-block"
    >
      <!-- Controls -->
      <div class="block-controls">
        <button @click="removeBlock(index)" class="btn-xs">x</button>
        <button @click="moveBlock(index, -1)" class="btn-xs">↑</button>
        <button @click="moveBlock(index, 1)" class="btn-xs">↓</button>
      </div>

      <!-- Paragraph Editor -->
      <BlockParagraph 
        v-if="block.type === 'paragraph'"
        :modelValue="block.children"
        @update:modelValue="(val) => updateBlock(index, { ...block, children: val })"
        @insert-term="openTermSelector"
      />

      <!-- Image Editor (Simple URL input for now) -->
      <div v-else-if="block.type === 'image'" class="image-block-editor">
        <label>Image URL:</label>
        <input 
          :value="block.src" 
          @input="e => updateBlock(index, { ...block, src: e.target.value })" 
        />
        <input 
          :value="block.caption" 
          placeholder="Caption"
          @input="e => updateBlock(index, { ...block, caption: e.target.value })" 
        />
      </div>

       <!-- Table Editor (Simple JSON/CSV textarea for now, or just placeholder) -->
       <div v-else-if="block.type === 'table'" class="table-block-editor">
         <textarea 
           :value="rowsToString(block.rows)"
           @input="e => updateBlock(index, { ...block, rows: stringToRows(e.target.value) })"
           placeholder="CSV format for table"
         ></textarea>
       </div>

    </div>

    <!-- Add Block Controls -->
    <div class="add-block-controls">
      <button @click="addBlock('paragraph')">+ Text</button>
      <button @click="addBlock('image')">+ Image</button>
      <button @click="addBlock('table')">+ Table</button>
    </div>
  </div>
</template>

<script>
import BlockParagraph from './BlockParagraph.vue';

export default {
  name: 'DocASTEditor',
  components: { BlockParagraph },
  props: {
    modelValue: {
      type: Array,
      default: () => []
    }
  },
  emits: ['update:modelValue', 'request-term'],
  setup(props, { emit }) {
    const addBlock = (type) => {
      const newBlock = type === 'paragraph' ? { type: 'paragraph', children: [] }
        : type === 'image' ? { type: 'image', src: '', caption: '' }
        : { type: 'table', rows: [['']] };
      
      emit('update:modelValue', [...props.modelValue, newBlock]);
    };

    const removeBlock = (index) => {
      const newVal = [...props.modelValue];
      newVal.splice(index, 1);
      emit('update:modelValue', newVal);
    };

    const moveBlock = (index, dir) => {
      if (index + dir < 0 || index + dir >= props.modelValue.length) return;
      const newVal = [...props.modelValue];
      const temp = newVal[index];
      newVal[index] = newVal[index + dir];
      newVal[index + dir] = temp;
      emit('update:modelValue', newVal);
    };

    const updateBlock = (index, block) => {
      const newVal = [...props.modelValue];
      newVal[index] = block;
      emit('update:modelValue', newVal);
    };

    const openTermSelector = (callback) => {
      emit('request-term', callback);
    };

    const rowsToString = (rows) => rows.map(r => r.join(',')).join('\n');
    const stringToRows = (str) => str.split('\n').map(line => line.split(','));

    return {
      addBlock,
      removeBlock,
      moveBlock,
      updateBlock,
      openTermSelector,
      rowsToString,
      stringToRows
    };
  }
}
</script>

<style scoped>
.doc-ast-editor {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.editor-block {
  background: #2a2a2a;
  padding: 10px;
  border-radius: 4px;
  position: relative;
  border: 1px solid #444;
}
.block-controls {
  position: absolute;
  right: 5px;
  top: 5px;
  display: flex;
  gap: 2px;
  opacity: 0.2;
  transition: opacity 0.2s;
}
.editor-block:hover .block-controls {
  opacity: 1;
}
.btn-xs {
  font-size: 10px;
  padding: 2px 4px;
  background: #444;
  border: none;
  color: #fff;
  cursor: pointer;
}
.add-block-controls {
  display: flex;
  gap: 10px;
  justify-content: center;
  padding: 10px;
  border-top: 1px dashed #444;
}
.add-block-controls button {
  background: #333;
  color: #aaa;
  border: 1px solid #555;
  padding: 5px 10px;
  cursor: pointer;
  border-radius: 4px;
}
.add-block-controls button:hover {
  background: #444;
  color: #fff;
}
.image-block-editor, .table-block-editor {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.image-block-editor input, textarea {
  background: #111;
  border: 1px solid #444;
  color: #fff;
  padding: 5px;
}
</style>
