
<template>
  <div class="text-input-container">
    <textarea 
      v-model="internalValue" 
      class="rules-input" 
      placeholder="输入规则文本，例如：攻击造成火焰伤害..."
    ></textarea>
  </div>
</template>

<script>
import { computed } from 'vue';

export default {
  name: 'TextInput',
  props: {
    modelValue: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const internalValue = computed({
      get: () => props.modelValue,
      set: (val) => emit('update:modelValue', val)
    });

    return { internalValue };
  }
}
</script>

<style scoped>
.text-input-container {
  margin-bottom: 20px;
}

.rules-input {
  width: 100%;
  min-height: 150px;
  padding: 15px;
  background: #1f2937;
  border: 1px solid #374151;
  color: #f3f4f6;
  border-radius: 8px;
  resize: vertical;
  font-size: 16px;
  line-height: 1.6;
}

.rules-input:focus {
  outline: none;
  border-color: #a3e635;
  box-shadow: 0 0 0 2px rgba(163, 230, 53, 0.2);
}
</style>
