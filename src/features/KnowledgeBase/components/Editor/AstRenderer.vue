<template>
  <div class="ast-renderer">
    <template v-for="(node, index) in ast" :key="index">
      <!-- Paragraph -->
      <p v-if="node.type === 'paragraph'" class="ast-p">
        <template v-for="(child, cIndex) in node.children" :key="cIndex">
          <span v-if="child.type === 'text'">{{ child.value }}</span>
          <TermNode 
            v-else-if="child.type === 'term'" 
            :term="child.ref" 
            :label="child.label"
            :level="level"
          />
        </template>
      </p>

      <!-- Image -->
      <div v-else-if="node.type === 'image'" class="ast-image">
        <img :src="node.src" :alt="node.alt || ''" />
        <div v-if="node.caption" class="caption">{{ node.caption }}</div>
      </div>

      <!-- Table -->
      <table v-else-if="node.type === 'table'" class="ast-table">
        <tr v-for="(row, rIndex) in node.rows" :key="rIndex">
          <td v-for="(cell, cIndex) in row" :key="cIndex">
            {{ cell }}
          </td>
        </tr>
      </table>
    </template>
  </div>
</template>

<script>
import TermNode from '../View/TermNode.vue';

export default {
  name: 'AstRenderer',
  components: { TermNode },
  props: {
    ast: {
      type: Array,
      required: true,
      default: () => []
    },
    level: {
      type: Number,
      default: 0
    }
  }
}
</script>

<style scoped>
.ast-renderer {
  font-size: 14px;
  line-height: 1.6;
}
.ast-p {
  margin-bottom: 0.8em;
}
.ast-image img {
  max-width: 100%;
  border-radius: 4px;
}
.ast-table {
  width: 100%;
  border-collapse: collapse;
  margin: 1em 0;
}
.ast-table td {
  border: 1px solid #444;
  padding: 4px 8px;
}
</style>
