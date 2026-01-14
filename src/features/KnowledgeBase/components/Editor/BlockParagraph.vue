<template>
  <div class="block-paragraph">
    <div class="toolbar">
      <button @click="triggerInsertTerm" class="tool-btn"># Term</button>
    </div>
    <div 
      class="editor-content" 
      contenteditable="true" 
      ref="editorRef"
      @input="onInput"
      @blur="onBlur"
    ></div>
  </div>
</template>

<script>
import { ref, onMounted, watch, nextTick } from 'vue';

export default {
  name: 'BlockParagraph',
  props: {
    modelValue: {
      type: Array,
      default: () => []
    }
  },
  emits: ['update:modelValue', 'insert-term'],
  setup(props, { emit }) {
    const editorRef = ref(null);
    let isInternalUpdate = false;

    // Convert AST to HTML
    const render = (ast) => {
      if (!editorRef.value) return;
      
      // Clear current content
      editorRef.value.innerHTML = '';
      
      ast.forEach(node => {
        if (node.type === 'text') {
          editorRef.value.appendChild(document.createTextNode(node.value));
        } else if (node.type === 'term') {
          const span = document.createElement('span');
          span.contentEditable = 'false';
          span.className = 'term-token';
          span.dataset.id = node.ref;
          // Ideally we should have the term name here. 
          // For now, use the ref or a placeholder. 
          // Real impl should look up name from store.
          span.innerText = node.label || `[${node.ref}]`; 
          editorRef.value.appendChild(span);
        }
      });
    };

    // Convert HTML to AST
    const parse = () => {
      if (!editorRef.value) return [];
      
      const nodes = [];
      editorRef.value.childNodes.forEach(child => {
        if (child.nodeType === Node.TEXT_NODE) {
          if (child.textContent) {
            // Merge with previous text node if exists?
            // Simple approach: just push
            nodes.push({ type: 'text', value: child.textContent });
          }
        } else if (child.nodeType === Node.ELEMENT_NODE) {
           if (child.classList.contains('term-token')) {
             nodes.push({ 
               type: 'term', 
               ref: child.dataset.id,
               label: child.innerText // Store label to persist display name
             });
           } else {
             // Treat other tags as text (strip tags)
             nodes.push({ type: 'text', value: child.innerText });
           }
        }
      });
      return nodes;
    };

    const onInput = () => {
      isInternalUpdate = true;
      const ast = parse();
      emit('update:modelValue', ast);
      // Reset flag after a tick? No, wait for prop update
      nextTick(() => {
        isInternalUpdate = false;
      });
    };

    const onBlur = () => {
        // Ensure sync on blur
        onInput();
    };

    // Initial Render
    onMounted(() => {
      render(props.modelValue);
    });

    // Watch for external changes
    watch(() => props.modelValue, (newVal) => {
      if (isInternalUpdate) return;
      // Re-render only if content significantly changed?
      // For now, simple re-render. This might lose cursor if external update happens while typing.
      // But typically updates come from this component.
      
      // Optimization: Check if semantic equal?
      // Skipping for now.
      // Actually, if we re-render while user is typing, it's bad.
      // But props.modelValue update is triggered by us.
      // We rely on `isInternalUpdate` flag (which might be flaky if parent modifies it).
      // A better check is needed but for MVP:
      
      const currentAST = parse();
      if (JSON.stringify(currentAST) !== JSON.stringify(newVal)) {
          render(newVal);
      }
    }, { deep: true });

    const triggerInsertTerm = () => {
      // Ask parent to open selector
      emit('insert-term', (term) => {
        // term: { id, name }
        insertTermToken(term);
      });
    };

    const insertTermToken = (term) => {
      if (!editorRef.value) return;
      
      const span = document.createElement('span');
      span.contentEditable = 'false';
      span.className = 'term-token';
      span.dataset.id = term.id;
      span.innerText = term.name;
      
      editorRef.value.focus();
      
      // Insert at cursor
      const sel = window.getSelection();
      if (sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        // Check if range is inside our editor
        if (editorRef.value.contains(range.commonAncestorContainer)) {
            range.deleteContents();
            range.insertNode(span);
            // Move cursor after
            range.setStartAfter(span);
            range.setEndAfter(span);
            sel.removeAllRanges();
            sel.addRange(range);
        } else {
            editorRef.value.appendChild(span);
        }
      } else {
        editorRef.value.appendChild(span);
      }
      
      onInput(); // Update model
    };

    return {
      editorRef,
      onInput,
      onBlur,
      triggerInsertTerm
    };
  }
}
</script>

<style scoped>
.block-paragraph {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}
.toolbar {
  padding-top: 5px;
}
.tool-btn {
  font-size: 11px;
  background: #333;
  color: #a3e635;
  border: 1px solid #444;
  cursor: pointer;
  padding: 2px 5px;
  border-radius: 3px;
}
.editor-content {
  flex: 1;
  min-height: 1.5em;
  outline: none;
  white-space: pre-wrap;
  color: #ddd;
  font-family: sans-serif;
  line-height: 1.6;
}
.editor-content:empty:before {
  content: 'Type here...';
  color: #555;
}
/* Deep selector for dynamically added elements */
:deep(.term-token) {
  background: rgba(163, 230, 53, 0.2);
  color: #bef264;
  padding: 0 4px;
  border-radius: 4px;
  border: 1px solid rgba(163, 230, 53, 0.4);
  margin: 0 2px;
  font-size: 0.9em;
  user-select: none;
  cursor: pointer;
}
</style>
