<template>
  <div class="conversation-reactions row">
    <div class="reactions row">
      <EmojiButton
        v-for="reaction in groupedReactions"
        :key="reaction.name"
        v-touch-hold="toggleDetail"
        :name="reaction.name"
        class="reaction-box"
        :class="{ 'user-reacted': reaction.reacted }"
        :title="reaction.message"
        @click="$emit('toggle', reaction.name)"
      >
        <span class="reactions-number">{{ reaction.users.length }}</span>
      </EmojiButton>
    </div>
    <ConversationAddReaction
      class="add-button reaction-box"
      :reacted="currentUserReactions"
      :opacity="0.5"
      flat
      @toggle="(...args) => $emit('toggle', ...args)"
    />
    <QDialog
      v-if="$q.platform.has.touch"
      v-model="showDetail"
      class="bg-grey-10 text-grey-1 q-pa-md"
    >
      <QItem
        v-for="reaction in groupedReactions"
        :key="reaction.name"
        @click="toggleDetail"
      >
        <QItemSection avatar>
          <EmojiButton
            :name="reaction.name"
            class="big"
          />
        </QItemSection>
        <QItemSection>
          <QItemLabel>
            {{ reaction.users.map(u => u.displayName).join(', ') }}
          </QItemLabel>
          <QItemLabel caption>
            {{ `:${reaction.name}:` }}
          </QItemLabel>
        </QItemSection>
      </QItem>
      <QBtn
        outline
        @click="toggleDetail"
      >
        <span v-t="'BUTTON.CLOSE'" />
      </QBtn>
    </QDialog>
  </div>
</template>

<script>
import {
  QDialog,
  QItem,
  QItemSection,
  QItemLabel,
  QBtn,
} from 'quasar'
import { computed } from 'vue'

import { useMessageHelpers } from '@/messages/helpers'

import ConversationAddReaction from './ConversationAddReaction'
import EmojiButton from './EmojiButton'

export default {
  name: 'ConversationReactions',
  components: {
    ConversationAddReaction,
    EmojiButton,
    QDialog,
    QItem,
    QItemSection,
    QItemLabel,
    QBtn,
  },
  props: {
    reactions: {
      type: Array,
      default: () => [],
    },
    currentUserReactions: {
      type: Array,
      default: () => [],
    },
  },
  emits: [
    'toggle',
  ],
  setup (props) {
    const { groupReactions } = useMessageHelpers()
    const groupedReactions = computed(() => groupReactions(props.reactions))
    return { groupedReactions }
  },
  data () {
    return {
      showDetail: false,
    }
  },
  methods: {
    toggleDetail () {
      this.showDetail = !this.showDetail
    },
  },
}
</script>

<style scoped lang="sass">
@import './reactionBox'

.add-button
  transition: none

  ::v-deep(.q-btn__wrapper)
    min-height: 0
    padding: 0

.desktop .conversation-reactions
  .add-button
    visibility: hidden

  &:hover .add-button
    visibility: visible

.user-reacted
  border-color: $secondary !important

.reactions-number
  padding-left: 3px
  font-size: .8em
  opacity: .7

.big
  font-size: 1.6em
</style>
