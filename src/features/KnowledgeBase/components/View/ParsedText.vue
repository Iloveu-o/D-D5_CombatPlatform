
<template>
  <span class="parsed-text">
    <template v-for="(token, index) in tokens" :key="index">
      <span v-if="token.type === 'text'">{{ token.value }}</span>
      <TermNode 
        v-else-if="token.type === 'term'" 
        :term="token.value" 
        :level="level"
      />
    </template>
  </span>
</template>

<script>
import { computed } from 'vue';
import { useRulesDictionary } from '../../composables/useRulesDictionary';
import TermNode from './TermNode.vue';

export default {
  name: 'ParsedText',
  components: {
    TermNode
  },
  props: {
    text: {
      type: String,
      required: true
    },
    level: {
      type: Number,
      default: 0
    }
  },
  setup(props) {
    const { trie, isLoaded } = useRulesDictionary();

    const tokens = computed(() => {
      if (!isLoaded.value || !trie.value) {
        return [{ type: 'text', value: props.text }];
      }
      return trie.value.parse(props.text);
    });

    return {
      tokens
    };
  }
}
</script>
