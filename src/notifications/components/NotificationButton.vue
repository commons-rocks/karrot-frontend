<template>
  <QBtn
    :to="$q.platform.is.mobile && ({ name: 'notifications' })"
    flat
    dense
    round
    :title="$t('NOTIFICATION_BELLS_LIST.TITLE')"
    @click="maybeOpen"
  >
    <QIcon
      name="fas fa-bell"
      :class="{ hasUnseen: unseenCount > 0 }"
    />
    <QBadge
      v-if="unseenCount > 0"
      floating
      color="secondary"
    >
      {{ unseenCount > 9 ? '9+' : unseenCount }}
    </QBadge>
    <QMenu
      v-if="!$q.platform.is.mobile"
      v-model="showing"
      no-parent-event
      style="width: 500px"
      anchor="bottom middle"
      self="top middle"
    >
      <Notifications
        as-popover
      />
    </QMenu>
  </QBtn>
</template>

<script>
import {
  QBtn,
  QIcon,
  QBadge,
  QMenu,
} from 'quasar'
import { defineAsyncComponent } from 'vue'

import { useStatusService } from '@/status/services'

import { useMarkSeenMutation } from '../mutations'

const Notifications = defineAsyncComponent(() => import('@/notifications/components/Notifications'))

export default {
  components: {
    QBtn,
    QIcon,
    QBadge,
    QMenu,
    Notifications,
  },
  emits: [
    'click',
  ],
  setup () {
    const { unseenNotificationCount } = useStatusService()
    const {
      mutate: markSeen,
    } = useMarkSeenMutation()
    return { unseenCount: unseenNotificationCount, markSeen }
  },
  data () {
    return {
      showing: false,
    }
  },
  methods: {
    async maybeOpen () {
      if (!this.$q.platform.is.mobile) {
        this.showing = !this.showing
        this.markSeen()
      }
      this.$emit('click')
    },
  },
}
</script>

<style lang="sass" scoped>
.q-icon:not(.hasUnseen)
  opacity: $topbar-opacity-low

.q-btn:hover .q-icon
  opacity: 1
</style>
