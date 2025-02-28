<template>
  <QItem
    clickable
    @click="showing = !showing"
  >
    <QItemSection
      side
      class="text-center"
    >
      <QIcon
        name="fab fa-discourse fa-fw"
        size="1.1em"
      />
    </QItemSection>
    <QItemSection>
      {{ $t('COMMUNITY_FEED.KARROT_DISCUSSION') }}
    </QItemSection>
    <QItemSection
      v-if="unreadCount > 0"
      side
    >
      <QBadge
        color="secondary"
      >
        {{ unreadCount > 9 ? '9+' : unreadCount }}
      </QBadge>
    </QItemSection>
    <QDialog
      v-model="showing"
      @hide="mark()"
    >
      <QCard>
        <QList>
          <QItem>
            <QItemSection side>
              <QIcon
                name="fab fa-discourse"
                size="20px"
                class="q-mr-xs"
              />
            </QItemSection>
            <QItemSection>
              <i18n-t keypath="COMMUNITY_FEED.HEADER">
                <template #community>
                  <a
                    href="https://community.karrot.world"
                    target="_blank"
                    rel="noopener"
                    style="text-decoration: underline"
                  >
                    {{ $t('COMMUNITY_FEED.HEADER_LINK') }}
                  </a>
                </template>
              </i18n-t>
            </QItemSection>
            <QItemSection side>
              <QBtn
                dense
                round
                color="secondary"
                @click="showing = false"
              >
                <QIcon name="fas fa-times" />
              </QBtn>
            </QItemSection>
          </QItem>
          <QItem
            v-for="{ topic, isUnread } in entries"
            :key="topic.id"
            tag="a"
            :href="topic.link"
            target="_blank"
            rel="noopener"
            :class="{ isUnread }"
          >
            <QItemSection avatar>
              <QAvatar>
                <img
                  :src="topic.lastPosterAvatar"
                  :title="topic.lastPosterUsername"
                >
              </QAvatar>
            </QItemSection>
            <QItemSection>
              <QItemLabel
                lines="1"
              >
                {{ topic.title }}
              </QItemLabel>
              <QItemLabel
                caption
                lines="1"
              >
                <i18n-t
                  keypath="COMMUNITY_FEED.LAST_UPDATED"
                  tag="div"
                >
                  <template #relativeDate>
                    <DateAsWords
                      style="display: inline"
                      :date="topic.lastPostedAt"
                    />
                  </template>
                </i18n-t>
              </QItemLabel>
            </QItemSection>
          </QItem>
        </QList>
      </QCard>
    </QDialog>
  </QItem>
</template>

<script setup>
import {
  QBtn,
  QIcon,
  QDialog,
  QList,
  QItemLabel,
  QItem,
  QItemSection,
  QBadge,
  QAvatar,
  QCard,
} from 'quasar'
import { ref } from 'vue'

import { useAuthService } from '@/authuser/services'
import { useMarkCommunityFeedMutation } from '@/communityFeed/mutations'
import { useCommunityFeedService } from '@/communityFeed/services'

import DateAsWords from '@/utils/components/DateAsWords'

const showing = ref(false)

const {
  entries,
  unreadCount,
} = useCommunityFeedService()

const { isLoggedIn } = useAuthService()

const { mutate: markSeen } = useMarkCommunityFeedMutation()

function mark () {
  if (!isLoggedIn.value) return
  markSeen()
}
</script>

<style scoped lang="sass">
.isUnread
  background: linear-gradient(to right, $lightGreen, $lighterGreen)
</style>
