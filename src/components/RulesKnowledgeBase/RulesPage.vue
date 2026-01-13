
<template>
  <div class="rules-page">
    <header class="page-header">
      <h1>Interactive Rules Knowledge Base</h1>
      <p>Enter text below to explore interactive terms. (Try: "攻击", "伤害", "暴击")</p>
    </header>

    <main class="page-content">
      <TextInput v-model="inputText" />
      
      <div class="parsed-content-area">
        <h2>Preview</h2>
        <div class="parsed-content-box">
          <ParsedText :text="inputText" :level="0" />
        </div>
      </div>
    </main>

    <TooltipLayer />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import TextInput from './TextInput.vue';
import ParsedText from './ParsedText.vue';
import TooltipLayer from './TooltipLayer.vue';
import { useRulesDictionary } from '../../composables/useRulesDictionary';
import { useRulesTooltip } from '../../composables/useRulesTooltip';

export default {
  name: 'RulesPage',
  components: {
    TextInput,
    ParsedText,
    TooltipLayer
  },
  setup() {
    const inputText = ref('战士发动攻击，造成大量物理伤害。若触发暴击，则造成双倍伤害并使目标眩晕。');
    const { init } = useRulesDictionary();
    const { init: initTooltips } = useRulesTooltip();

    onMounted(() => {
      init();
      initTooltips();
    });

    return {
      inputText
    };
  }
}
</script>

<style scoped>
.rules-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 20px;
  color: #e5e7eb;
  font-family: 'Segoe UI', sans-serif;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-header h1 {
  font-size: 2.5rem;
  color: #a3e635;
  margin-bottom: 10px;
}

.parsed-content-area h2 {
  font-size: 1.2rem;
  color: #9ca3af;
  margin-bottom: 15px;
}

.parsed-content-box {
  background: #111827;
  border: 1px solid #374151;
  padding: 20px;
  border-radius: 8px;
  min-height: 100px;
  line-height: 1.8;
  font-size: 18px;
}
</style>
