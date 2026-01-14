
<template>
  <Teleport to="body">
    <div class="rules-tooltip-layer">
      <TransitionGroup name="tooltip">
        <TooltipNode 
          v-for="(item, index) in tooltipStack" 
          :key="item.id" 
          :item="item" 
          :index="index" 
        />
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script>
import { useRulesTooltip } from '../../composables/useRulesTooltip';
import TooltipNode from './TooltipNode.vue';

export default {
  name: 'TooltipLayer',
  components: { TooltipNode },
  setup() {
    const { tooltipStack } = useRulesTooltip();
    return { tooltipStack };
  }
}
</script>

<style scoped>
.rules-tooltip-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 0;
  overflow: visible;
  z-index: 9999;
  pointer-events: none;
}

.tooltip-enter-active,
.tooltip-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.tooltip-enter-from,
.tooltip-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>
