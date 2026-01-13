
<template>
  <div 
    class="tooltip-node"
    :style="computedStyle"
    ref="nodeRef"
    :data-id="item.id"
  >
    <div class="tooltip-term">{{ item.term }}</div>
    <div class="tooltip-content">
      <ParsedText :text="item.definition" :level="level" />
    </div>
  </div>
</template>

<script>
import { computed, ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
import ParsedText from './ParsedText.vue';
import { useRulesTooltip } from '../../composables/useRulesTooltip';

export default {
  name: 'TooltipNode',
  components: { ParsedText },
  props: {
    item: {
      type: Object,
      required: true
    },
    index: {
      type: Number,
      required: true
    }
  },
  setup(props) {
    const { registerTooltipEl, unregisterTooltipEl } = useRulesTooltip();
    const nodeRef = ref(null);
    const position = ref({ top: 0, left: 0 });
    const isVisible = ref(false);
    
    // Level in stack is index.
    // Content inside this tooltip will be at level index + 1.
    const level = computed(() => props.index + 1);

    const calculatePosition = () => {
      if (!nodeRef.value || !props.item.parentRect) return;
      
      const rect = props.item.parentRect;
      const el = nodeRef.value;
      const width = el.offsetWidth;
      const height = el.offsetHeight;
      
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const scrollX = window.scrollX;
      const scrollY = window.scrollY;

      // Default: Bottom-Left aligned
      let top = rect.bottom + 5;
      let left = rect.left;

      // Horizontal Check: Prevent overflow right
      if (left + width > viewportWidth - 10) {
        // Shift left to fit
        left = viewportWidth - width - 10;
      }
      // Horizontal Check: Prevent overflow left
      if (left < 10) left = 10;

      // Vertical Check: Prevent overflow bottom
      // Check if there is enough space below
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;

      if (spaceBelow < height + 10 && spaceAbove > height + 10) {
        // Not enough space below, but enough above -> Flip to Top
        top = rect.top - height - 5;
      }
      
      position.value = {
        top: top + scrollY,
        left: left + scrollX
      };
      isVisible.value = true;
    };

    onMounted(() => {
      if (nodeRef.value) {
        registerTooltipEl(props.item.id, nodeRef.value);
        // Calculate position after initial render
        nextTick(() => {
          calculatePosition();
        });
      }
    });

    onBeforeUnmount(() => {
      unregisterTooltipEl(props.item.id);
    });

    const computedStyle = computed(() => {
      return {
        top: `${position.value.top}px`,
        left: `${position.value.left}px`,
        zIndex: 1000 + props.index,
        opacity: isVisible.value ? 1 : 0,
        visibility: isVisible.value ? 'visible' : 'hidden' // Avoid interaction before positioning
      };
    });

    return {
      computedStyle,
      level,
      nodeRef
    };
  }
}
</script>

<style scoped>
.tooltip-node {
  position: absolute;
  background: #1f2937;
  border: 1px solid #4b5563;
  color: #f3f4f6;
  padding: 12px;
  border-radius: 6px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
  max-width: 300px;
  pointer-events: auto;
}

.tooltip-term {
  font-weight: bold;
  margin-bottom: 8px;
  color: #a3e635;
  border-bottom: 1px solid #374151;
  padding-bottom: 4px;
}

.tooltip-content {
  font-size: 14px;
  line-height: 1.5;
}
</style>
