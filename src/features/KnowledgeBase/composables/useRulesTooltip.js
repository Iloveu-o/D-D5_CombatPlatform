
import { reactive } from 'vue';

// Global state for tooltips (singleton pattern)
const tooltipStack = reactive([]);
const registeredTooltips = reactive(new Map()); // Map<id, HTMLElement>

export function useRulesTooltip() {
  
  // Register tooltip DOM element for geometric hit testing
  const registerTooltipEl = (id, el) => {
    registeredTooltips.set(id, el);
  };

  const unregisterTooltipEl = (id) => {
    registeredTooltips.delete(id);
  };

  /**
   * Opens a tooltip at a specific nesting level.
   * @param {string} term - The term to define
   * @param {string} definition - The definition text
   * @param {DOMRect} parentRect - The bounding rect of the triggering element
   * @param {number} level - The nesting level (0 for root text, 1 for first tooltip, etc.)
   */
  const openTooltip = (term, definition, parentRect, level) => {
    // If we are opening a tooltip at 'level', it means it's the child of a tooltip at 'level-1'.
    // The stack should contain 'level' items (indices 0 to level-1).
    // So we slice the stack to length 'level'.
    
    // Geometric Stack Pruning:
    // If we are opening a new branch, we must prune everything deeper than current level
    if (tooltipStack.length > level) {
      tooltipStack.splice(level);
    }
    
    // Check if the last tooltip is the same term (prevent duplicate if already open)
    const existing = tooltipStack[level];
    if (existing && existing.term === term) {
      return; // Already open
    }

    // Prevent immediate self-recursion (A -> A)
    // If the parent tooltip (level-1) is the same term, don't open a nested one.
    if (level > 0) {
      const parent = tooltipStack[level - 1];
      if (parent && parent.term === term) {
        return;
      }
    }
    
    tooltipStack.push({
      id: Math.random().toString(36).substr(2, 9),
      term,
      definition,
      parentRect,
      level
    });
  };

  // Geometric Stack Pruning Logic
  // We don't use mouseleave anymore. We use global mouse tracking.
  let lastMouseX = 0;
  let lastMouseY = 0;
  let lastValidHitTime = 0; // The last time we were in a valid "keep stack top" state
  const GRACE_PERIOD = 100; // ms

  const checkTooltipHit = () => {
    // Find the deepest tooltip that contains the mouse
    // or the deepest term that is being hovered (handled by TermNode via openTooltip)
    
    const hitEl = document.elementFromPoint(lastMouseX, lastMouseY);
    // targetLevel is the level we want to prune TO (keep 0 to targetLevel)
    // Default is 0 (close all)
    let targetLevel = 0; 
    
    if (hitEl) {
      const termNode = hitEl.closest('.term-node');
      const tooltipEl = hitEl.closest('.tooltip-node');
      
      if (termNode) {
        const level = parseInt(termNode.dataset.level);
        const term = termNode.dataset.term;
        
        if (!isNaN(level)) {
           targetLevel = level;
           // If this term corresponds to the next level tooltip in stack, we keep it too
           if (tooltipStack.length > level) {
               const nextTooltip = tooltipStack[level];
               if (nextTooltip && nextTooltip.term === term) {
                   targetLevel = level + 1;
               }
           }
        }
      } else if (tooltipEl) {
         const id = tooltipEl.dataset.id;
         const index = tooltipStack.findIndex(t => t.id === id);
         
         if (index !== -1) {
           // If we are in tooltip index I, we keep up to I+1
           targetLevel = index + 1;
         }
      }
    }
    
    // Logic:
    // If targetLevel >= tooltipStack.length: We are safe (hovering deepest content or deeper).
    // If targetLevel < tooltipStack.length: We are hovering something shallower (or nothing).
    // In this case, we check grace period before pruning.
    
    if (targetLevel >= tooltipStack.length) {
      lastValidHitTime = Date.now();
    } else {
      // We are in a state that requires pruning.
      // Check grace period.
      if (Date.now() - lastValidHitTime < GRACE_PERIOD) {
        // Within grace period, treat as if we are still at the top level
        return;
      }
      
      // Grace period exceeded, prune to targetLevel
      tooltipStack.splice(targetLevel);
    }
  };

  const startTracking = () => {
    window.addEventListener('mousemove', (e) => {
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    });
    
    // Check periodically or on mousemove?
    // "In every mousemove (or requestAnimationFrame)"
    // rAF is better for performance.
    
    const loop = () => {
      checkTooltipHit();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  };

  // We need to start tracking once.
  // Ideally this should be called in App setup.
  // But since this is a composable, we can't easily guarantee single init unless we use a flag.
  let isTracking = false;
  
  const init = () => {
    if (isTracking) return;
    isTracking = true;
    startTracking();
  };

  return {
    tooltipStack,
    openTooltip,
    registerTooltipEl,
    unregisterTooltipEl,
    init
  };
}
