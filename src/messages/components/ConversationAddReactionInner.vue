<template>
  <div
    class="k-add-reaction"
  >
    <QInput
      v-model="search"
      type="search"
      :placeholder="$q.lang.label.search"
      dense
    >
      <template #prepend>
        <QIcon name="search" />
      </template>
    </QInput>
    <div class="row">
      <EmojiButton
        v-for="name in results"
        :key="name"
        v-close-popup
        :name="name"
        class="big"
        :title="':' + name + ':'"
        @click="$emit('toggle', name)"
      />
    </div>
  </div>
</template>

<script>
import emojiList from 'markdown-it-emoji/lib/data/full.json'
import {
  QInput,
  QIcon,
} from 'quasar'

import EmojiButton from './EmojiButton'

function searchEmoji (search) {
  // Remove colons and set to lowercase to normalize search
  const cleanedSearch = search.replace(/:/g, '').toLowerCase()
  const matchingEmojiNames = []
  // The set is used to remove duplicate emoji that may have different names
  const matchingEmojiUnicodes = new Set()
  // First add the exact search in case there is an emoji shortcode with less
  // than three characters
  if (Object.keys(emojiList).includes(cleanedSearch)) {
    matchingEmojiUnicodes.add(emojiList[cleanedSearch])
    matchingEmojiNames.push(cleanedSearch)
  }

  // Checking input length because we don't want to have too many results
  if (cleanedSearch.length > 2) {
    for (const emojiShortcode in emojiList) {
      if (emojiShortcode.includes(cleanedSearch) &&
          emojiShortcode !== cleanedSearch &&
          !matchingEmojiUnicodes.has(emojiList[emojiShortcode])) {
        matchingEmojiUnicodes.add(emojiList[emojiShortcode])
        matchingEmojiNames.push(emojiShortcode)
      }
      if (matchingEmojiNames.length >= 20) {
        return matchingEmojiNames
      }
    }
  }
  return matchingEmojiNames
}

export default {
  components: {
    EmojiButton,
    QInput,
    QIcon,
  },
  props: {
    reacted: {
      type: Array,
      default: () => [],
    },
  },
  emits: [
    'toggle',
  ],
  data () {
    return {
      search: '',
    }
  },
  computed: {
    results () {
      // sorted alphabetically
      if (this.search !== '') {
        return searchEmoji(this.search).filter(e => !this.reacted.includes(e))
      }
      return [
        'carrot',
        'laughing',
        'ok_hand',
        'thumbsup',
        'thumbsdown',
        'rage',
        'cry',
        'heart',
        'muscle',
        'raised_hands',
      ].filter(e => !this.reacted.includes(e))
    },
  },
}
</script>

<style scoped lang="sass">
.k-add-reaction
  margin: 2px 4px

.big
  font-size: 25.6px
</style>
