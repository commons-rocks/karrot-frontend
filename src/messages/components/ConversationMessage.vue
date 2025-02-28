<template>
  <QItem
    v-if="!editMode"
    :class="{ isUnread, slim, continuation }"
    class="conversation-message relative-position"
  >
    <QBtnGroup
      outline
      class="hover-button k-message-controls bg-white"
    >
      <QBtn
        v-if="message.isEditable"
        outline
        color="secondary"
        :title="$t('BUTTON.EDIT')"
        @click="toggleEdit"
      >
        <i class="fas fa-pencil-alt" />
      </QBtn>
      <QBtn
        v-if="!slim"
        outline
        color="secondary"
        :title="$t('CONVERSATION.REPLIES')"
        @click="() => openThread(message)"
      >
        <i class="fas fa-comments" />
      </QBtn>
      <ConversationAddReaction
        :reacted="currentUserReactions"
        color="secondary"
        outline
        @toggle="toggleReaction"
      />
    </QBtnGroup>
    <QItemSection
      v-if="!slim"
      side
      top
      class="q-mt-xs q-pr-sm"
    >
      <ProfilePicture
        :user="author"
        :size="$q.platform.is.mobile ? 30 : 40"
      />
    </QItemSection>
    <QItemSection>
      <QItemLabel
        v-if="!continuation"
        class="no-wrap k-message-meta"
      >
        <RouterLink :to="{ name: 'user', params: { userId: author.id } }">
          <span class="k-message-author text-bold text-secondary text-uppercase">{{ author.displayName }}</span>
        </RouterLink>
        <span class="message-date">
          <small class="text-weight-light">
            <DateAsWords
              :title="tooltipDate"
              :date="message.createdAt"
            />
          </small>
        </span>
        <QIcon
          v-if="message.receivedVia === 'email'"
          name="far fa-envelope"
          class="email-icon"
          :title="$t('WALL.RECEIVED_VIA_EMAIL')"
        />
      </QItemLabel>
      <div class="content full-width">
        <Markdown
          v-measure
          :source="message.content"
          mentions
        />
      </div>
      <QItemLabel
        v-if="getIsMessageEdited(message)"
        caption
        class="q-pb-xs text-weight-light"
      >
        ({{ $t('CONVERSATION.EDITED') }}
        <DateAsWords
          :date="message.editedAt"
          style="display: inline; margin-right: -4px"
        />
        )
      </QItemLabel>
      <div
        v-if="imagesForDisplay.length > 0"
        class="images"
      >
        <QImg
          v-for="image in imagesForDisplay"
          :key="image.id"
          :src="image.imageUrls['200']"
          class="q-mr-sm q-mb-sm"
          @click="openImageGallery(image.id)"
        />
      </div>
      <ConversationReactions
        v-if="hasReactions"
        :reactions="message.reactions"
        :current-user-reactions="currentUserReactions"
        @toggle="toggleReaction"
      />
      <div v-if="showReplies">
        <QBtn
          unelevated
          :color="message.threadMeta.unreadReplyCount > 0 ? 'secondary' : 'white'"
          :text-color="message.threadMeta.unreadReplyCount > 0 ? 'white' : 'black'"
          class="reaction-box k-thread-box"
          no-caps
          @click="() => openThread(message)"
        >
          <ProfilePicture
            v-for="user in threadParticipants"
            :key="user.id"
            class="k-profile-picture"
            :user="user"
            :is-link="false"
          />
          <span
            v-t="{
              path: 'CONVERSATION.REPLIES_COUNT',
              choice: message.threadMeta.replyCount,
              args: {
                count: message.threadMeta.replyCount > 99 ? '99+' : message.threadMeta.replyCount,
              },
            }"
            class="k-replies-count text-caption"
          />
        </QBtn>
      </div>
    </QItemSection>
  </QItem>
  <ConversationCompose
    v-else
    :status="saveMessageStatus"
    :user="author"
    :value="message"
    :slim="slim"
    @submit="save"
    @leave-edit="toggleEdit"
  />
</template>

<script>
import {
  Dialog,
  QBtn,
  QBtnGroup,
  QImg,
  QItem,
  QItemSection,
  QItemLabel,
  QIcon,
} from 'quasar'
import { computed } from 'vue'

import { useAuthHelpers } from '@/authuser/helpers'
import { useMessageHelpers } from '@/messages/helpers'
import {
  useAddReactionMutation,
  useRemoveReactionMutation,
  useSaveMesssageMutation,
} from '@/messages/mutations'
import { useDetailService } from '@/messages/services'
import { useUserService } from '@/users/services'

import ConversationCompose from '@/messages/components/ConversationCompose'
import ConversationReactions from '@/messages/components/ConversationReactions'
import ImageGalleryDialog from '@/messages/components/ImageGalleryDialog'
import ProfilePicture from '@/users/components/ProfilePicture'
import DateAsWords from '@/utils/components/DateAsWords'
import Markdown from '@/utils/components/Markdown'

import ConversationAddReaction from './ConversationAddReaction'

export default {
  name: 'ConversationMessage',
  components: {
    ConversationReactions,
    ConversationAddReaction,
    ConversationCompose,
    ProfilePicture,
    Markdown,
    DateAsWords,
    QBtn,
    QBtnGroup,
    QImg,
    QItem,
    QItemSection,
    QItemLabel,
    QIcon,
  },
  props: {
    message: {
      type: Object,
      required: true,
    },
    isUnread: {
      type: Boolean,
      default: false,
    },
    continuation: {
      type: Boolean,
      default: false,
    },
    slim: {
      type: Boolean,
      default: false,
    },
  },
  setup (props) {
    const { getIsCurrentUser } = useAuthHelpers()
    const { getUserById } = useUserService()
    const { openThread } = useDetailService()
    const { getIsMessageEdited } = useMessageHelpers()

    const author = computed(() => getUserById(props.message.author))
    const threadParticipants = computed(() => props.message.threadMeta?.participants?.map(getUserById) ?? [])

    const {
      mutateAsync: saveMessage,
      status: saveMessageStatus,
    } = useSaveMesssageMutation()

    const { mutate: addReaction } = useAddReactionMutation()
    const { mutate: removeReaction } = useRemoveReactionMutation()

    function toggleReaction (name) {
      const messageId = props.message.id
      const reactionIndex = props.message.reactions.findIndex(reaction => getIsCurrentUser(reaction.user) && reaction.name === name)

      if (reactionIndex === -1) {
        addReaction({ messageId, name })
      }
      else {
        removeReaction({ messageId, name })
      }
    }

    return {
      author,
      threadParticipants,

      getIsMessageEdited,
      getIsCurrentUser,

      toggleReaction,
      saveMessage,
      saveMessageStatus,
      openThread,
    }
  },
  data () {
    return {
      editMode: false,
    }
  },
  computed: {
    currentUserReactions () {
      return this.message?.reactions?.filter(reaction => this.getIsCurrentUser(reaction.user)).map(reaction => reaction.name)
    },
    hasReactions () {
      return this.message?.reactions?.length > 0
    },
    showReplies () {
      return this.message.threadMeta && !this.slim
    },
    tooltipDate () {
      return this.$d(this.message.createdAt, 'long')
    },
    imagesForDisplay () {
      return this.message?.images?.filter(image => image.id && !image._removed) || []
    },
  },
  methods: {
    toggleEdit () {
      this.editMode = !this.editMode
    },
    openImageGallery (imageId) {
      Dialog.create({
        component: ImageGalleryDialog,
        componentProps: {
          message: this.message,
          selectedImageId: imageId,
        },
        parent: this,
      })
    },
    async save ({ content, images }) {
      await this.saveMessage({
        id: this.message.id,
        content,
        images,
      })
      this.toggleEdit()
    },
  },
}
</script>

<style scoped lang="sass">
@use 'sass:color'
@import './reactionBox'

.isUnread
  background: linear-gradient(to right, $lightGreen, $lighterGreen)

.continuation
  min-height: auto
  padding-top: 0

.images
  .q-img
    width: 80px
    height: 80px
    cursor: pointer

body.mobile .conversation-message
  .k-message-meta
    padding-top: 3px
    font-size: 80%

.conversation-message
  padding-bottom: 0

  .hover-button
    visibility: hidden

  &:hover .hover-button
    visibility: visible

  &.q-item-highlight:hover
    background-color: color.change($secondary, $alpha: .07)

  .email-icon
    position: relative
    top: -1.5px
    margin-left: 2px

  .content
    word-wrap: break-word

  .message-date
    display: inline-block
    margin-left: 2px

  .k-thread-box
    min-height: 30px
    max-height: 30px
    box-shadow: none

    ::v-deep(.q-btn__wrapper)
      min-height: 0
      padding: 0

    .k-profile-picture
      margin-right: 2px
      vertical-align: middle

    .k-replies-count
      padding-right: 3px
      margin-left: 4px
      font-size: 13px

  .k-message-controls
    position: absolute
    top: -6px
    right: 0px

    .q-btn
      padding-left: 12px
      padding-right: 12px
      font-size: 13px
      color: white
      transition: none

body.desktop
  .conversation-message.slim .k-message-controls
    top: -8px

    .q-btn
      min-height: 24px
      font-size: 13px

  .k-message-meta
    padding-top: 4px
</style>
