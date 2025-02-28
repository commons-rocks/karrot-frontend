<template>
  <ChatConversation
    v-if="conversation"
    :conversation="conversation"
    :messages="messages"
    :away="isAway"
    :current-user="currentUser"
    compose
    :inline="inline"
    :has-next-page="hasNextPage"
    :is-fetching-next-page="isFetchingNextPage"
    :fetch-next-page="fetchNextPage"
  >
    <template
      v-if="offer"
      #before-chat-messages
    >
      <QCarousel
        v-if="offer.images.length > 0"
        v-model="selectedImageIndex"
        v-bind="carouselOptions"
      >
        <QCarouselSlide
          v-for="(image, idx) in offer.images"
          :key="image.id"
          :name="idx"
          :img-src="image.imageUrls['600']"
        />
      </QCarousel>
      <div
        v-if="!isDefaultStatus"
        class="q-pa-md text-center text-h6 text-white bg-negative"
      >
        {{ offer.status }}
      </div>
      <div
        v-if="canEdit && offer.status === 'active'"
        class="row justify-end"
      >
        <QBtnDropdown
          flat
          no-caps
          :label="$t('OFFER.MARK_AS_ARCHIVED')"
        >
          <div
            class="q-pa-lg"
            style="max-width: 300px;"
          >
            <div
              v-t="'OFFER.MARK_AS_ARCHIVED_DESCRIPTION'"
              class="text-body1 q-mb-lg"
            />
            <div class="row justify-end">
              <QBtn
                color="negative"
                @click="archive({ offerId: offer.id })"
              >
                <span v-t="'OFFER.MARK_AS_ARCHIVED'" />
              </QBtn>
            </div>
          </div>
        </QBtnDropdown>
      </div>
      <div class="q-ma-md q-pa-md bg-white grey-border">
        <Markdown
          v-measure
          :source="offer.description"
        />
      </div>
    </template>
  </ChatConversation>
  <KSpinner v-else />
</template>

<script>
import {
  QBtn,
  QBtnDropdown,
  QCarousel,
  QCarouselSlide,
} from 'quasar'

import { useAuthService } from '@/authuser/services'
import { usePresenceService } from '@/base/services/presence'
import { useConversationAndMessages } from '@/messages/services'
import { useArchiveOfferMutation } from '@/offers/mutations'
import { DEFAULT_STATUS } from '@/offers/queries'
import { useActiveOfferService } from '@/offers/services'

import ChatConversation from '@/messages/components/ChatConversation'
import KSpinner from '@/utils/components/KSpinner'
import Markdown from '@/utils/components/Markdown'

export default {
  components: {
    QBtn,
    QBtnDropdown,
    QCarousel,
    QCarouselSlide,
    ChatConversation,
    Markdown,
    KSpinner,
  },
  props: {
    inline: {
      type: Boolean,
      default: false,
    },
  },
  setup () {
    const { mutate: archive } = useArchiveOfferMutation()
    const { offerId, offer } = useActiveOfferService()
    const { user: currentUser } = useAuthService()
    const {
      conversation,
      messages,
      hasNextPage,
      isFetchingNextPage,
      fetchNextPage,
    } = useConversationAndMessages(
      { offerId },
      // TODO: should offer messages be this way or oldest-first?
      { order: 'newest-first' },
    )
    const { isAway } = usePresenceService()

    return {
      isAway,
      currentUser,
      archive,
      offerId,
      offer,
      conversation,
      messages,
      hasNextPage,
      isFetchingNextPage,
      fetchNextPage,
    }
  },
  data () {
    return {
      selectedImageIndex: 0,
    }
  },
  computed: {
    canEdit () {
      return this.offer.user === this.currentUser?.id
    },
    carouselOptions () {
      if (this.offer.images.length <= 1) return
      return {
        swipeable: true,
        animated: true,
        thumbnails: true,
        arrows: true,
        infinite: true,
      }
    },
    isDefaultStatus () {
      return this.offer.status === DEFAULT_STATUS
    },
  },
  watch: {
    offer () {
      this.selectedImageIndex = 0
    },
  },
}
</script>
