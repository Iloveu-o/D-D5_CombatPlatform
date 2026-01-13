
import { ref } from 'vue';
import { loadDictionary } from '../services/dictionaryService';
import { TermTrie } from '../utils/textParser';

const dictionary = ref({});
const trie = ref(null);
const isLoaded = ref(false);

export function useRulesDictionary() {
  const init = async () => {
    if (isLoaded.value) return;
    const dict = await loadDictionary();
    dictionary.value = dict;
    trie.value = new TermTrie(Object.keys(dict));
    isLoaded.value = true;
  };

  const getDefinition = (term) => {
    return dictionary.value[term];
  };

  return {
    dictionary,
    trie,
    isLoaded,
    init,
    getDefinition
  };
}
