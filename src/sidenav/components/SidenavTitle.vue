<template>
  <QToolbar
    v-if="$q.platform.is.mobile"
    class="bg-primary text-white"
  >
    <img
      v-if="currentGroup && currentGroup.hasPhoto"
      :src="currentGroup.photoUrls.thumbnail"
      style="height: 1.5em"
    >
    <QToolbarTitle
      @click="$emit('click')"
    >
      {{ currentGroup && currentGroup.name }}
    </QToolbarTitle>
    <LatestMessageButton
      v-if="isLoggedIn"
      style="font-size: 10px"
      class="q-mr-xs"
      @click="$emit('click')"
    />
    <NotificationButton
      v-if="isLoggedIn"
      style="font-size: 10px"
      class="q-mr-xs"
      @click="$emit('click')"
    />
    <QBtn
      flat
      dense
      round
      :to="{ name: 'groupsGallery' }"
      :title="$t('TOPBAR.CHANGE_GROUP')"
      size="sm"
      @click="$emit('click')"
    >
      <QIcon name="fas fa-exchange-alt" />
    </QBtn>
  </QToolbar>
</template>

<script setup>
import {
  QToolbar,
  QToolbarTitle,
  QBtn,
  QIcon,
} from 'quasar'

import { useAuthService } from '@/authuser/services'
import { useCurrentGroupService } from '@/group/services'

import LatestMessageButton from '@/messages/components/LatestMessageButton'
import NotificationButton from '@/notifications/components/NotificationButton'

defineEmits(['click'])

const {
  group: currentGroup,
} = useCurrentGroupService()

const {
  isLoggedIn,
} = useAuthService()
</script>
