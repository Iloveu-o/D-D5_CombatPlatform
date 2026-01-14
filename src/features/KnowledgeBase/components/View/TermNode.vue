
<template>
  <span 
    class="term-node"
    :class="{ 'has-definition': !!definition }"
    :data-level="level"
    :data-term="term"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
    ref="termRef"
  >
    {{ label || term }}
  </span>
</template>

<script>
import { computed, ref, onBeforeUnmount } from 'vue';
import { useRulesDictionary } from '../../composables/useRulesDictionary';
import { useRulesTooltip } from '../../composables/useRulesTooltip';

export default {
  name: 'TermNode',
  props: {
    term: {
      type: String,
      required: true
    },
    label: {
      type: String,
      default: ''
    },
    level: {
      type: Number,
      default: 0
    }
  },
  setup(props) {
    const { getDefinition } = useRulesDictionary();
    const { openTooltip } = useRulesTooltip();
    const termRef = ref(null);
    let timer = null;

    const definition = computed(() => getDefinition(props.term));

    const onMouseEnter = () => {
      if (!definition.value) return;
      
      timer = setTimeout(() => {
        // Fix: Check if termRef.value is valid before accessing
        if (!termRef.value) return;
        
        const rect = termRef.value.getBoundingClientRect();
        openTooltip(props.term, definition.value, rect, props.level);
      }, 500); // Changed to 500ms as per new requirement
    };

    const onMouseLeave = () => {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    };

    onBeforeUnmount(() => {
      if (timer) clearTimeout(timer);
    });

    return {
      termRef,
      definition,
      onMouseEnter,
      onMouseLeave
    };
  }
}
</script>

<style scoped>
.term-node {
  border-bottom: 1px dotted #999;
  cursor: help;
  color: #a3e635; /* Lime-400 */
  transition: color 0.2s;
  display: inline-block; /* Ensure rect calculation is stable */
}

.term-node:hover {
  color: #bef264; /* Lime-300 */
  background-color: rgba(163, 230, 53, 0.1);
}

.term-node.has-definition {
  /* specific styles if needed */
}
</style>
