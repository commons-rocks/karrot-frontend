<template>
  <SidenavBox v-if="groupId">
    <template #icon>
      <QIcon name="fas fa-fw fa-home" />
    </template>
    <template #name>
      {{ $t('GROUP.HOME') }}
    </template>
    <template #tools>
      <div>
        <QBtn
          flat
          dense
          round
          size="sm"
          :to="{ name: 'groupDescription', params: { groupId } }"
          :title="$t('GROUP.DESCRIPTION')"
        >
          <QIcon name="fas fa-info-circle fa-fw" />
        </QBtn>
        <QBtn
          flat
          dense
          round
          size="sm"
        >
          <QIcon name="fas fa-fw fa-ellipsis-v" />
          <QMenu
            fit
            anchor="bottom right"
            self="top right"
          >
            <GroupOptions />
          </QMenu>
        </QBtn>
      </div>
    </template>
    <SidenavMenu :entries="entries" />
    <SidenavMenu
      v-if="showMore"
      :entries="entriesMore"
    />
    <QItem
      clickable
      dense
      class="more-button"
      @click="showMore = !showMore"
    >
      <QItemSection
        side
        class="text-center"
      >
        <QIcon
          :name="showMore ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"
          size="1.1em"
        />
      </QItemSection>
      <QItemSection>
        {{ showMore ? $t('BUTTON.SHOW_LESS') : $t('BUTTON.SHOW_MORE') }}
      </QItemSection>
      <QItemSection
        v-if="!showMore"
        side
      >
        <QBadge
          v-if="showMoreBadgeCount > 0"
          :label="showMoreBadgeCount"
          color="blue"
        />
      </QItemSection>
    </QItem>
  </SidenavBox>
</template>

<script>
import {
  QBtn,
  QIcon,
  QMenu,
  QItem,
  QItemSection,
  QBadge,
} from 'quasar'

import GroupOptions from './GroupOptions'
import SidenavBox from './SidenavBox'
import SidenavMenu from './SidenavMenu'

export default {
  components: {
    SidenavBox,
    SidenavMenu,
    GroupOptions,
    QBtn,
    QIcon,
    QMenu,
    QItem,
    QItemSection,
    QBadge,
  },
  props: {
    groupId: {
      default: null,
      type: Number,
    },
    theme: {
      type: String,
      default: null,
    },
    features: {
      default: () => [],
      type: Array,
    },
    wallUnreadCount: {
      default: 0,
      type: Number,
    },
    feedbackPossibleCount: {
      default: 0,
      type: Number,
    },
    pendingApplicationCount: {
      default: 0,
      type: Number,
    },
    ongoingIssueCount: {
      default: 0,
      type: Number,
    },
  },
  data () {
    return {
      showMore: false,
    }
  },
  computed: {
    cappedWallUnreadCount () {
      return this.wallUnreadCount > 99 ? '99+' : this.wallUnreadCount
    },
    entries () {
      return [{
        label: this.$t('GROUP.WALL'),
        icon: 'fas fa-bullhorn',
        to: { name: 'group', params: { groupId: this.groupId } },
        badge: {
          count: this.cappedWallUnreadCount,
          color: 'secondary',
        },
      }, {
        label: this.$t('GROUP.ACTIVITIES'),
        info: this.theme === 'foodsaving' && {
          title: this.$t('GROUP.PICKUPS_TO_ACTIVITIES'),
          description: this.$t('GROUP.PICKUPS_TO_ACTIVITIES_DESCRIPTION'),
          link: {
            text: this.$t('BUTTON.READ_MORE'),
            href: 'https://community.karrot.world/t/what-are-activity-types-in-karrot/563',
          },
        },
        icon: this.$icon('activity'),
        to: { name: 'groupActivities', params: { groupId: this.groupId } },
      }, {
        condition: this.hasFeature('offers'),
        label: this.$t('GROUP.OFFERS') + (new Date().getFullYear() < 2020 ? ' 🆕' : ''),
        icon: this.$icon('offer'),
        to: { name: 'groupOffers', params: { groupId: this.groupId } },
      }, {
        label: this.$t('ACTIVITY_FEEDBACK.TITLE'),
        icon: this.$icon('feedback'),
        to: { name: 'groupFeedback', params: { groupId: this.groupId } },
        badge: {
          count: this.feedbackPossibleCount,
          color: 'info',
          title: this.$tc('ACTIVITYLIST.AVAILABLE_FEEDBACK', this.feedbackPossibleCount, { count: this.feedbackPossibleCount }),
        },
      }, {
        label: this.$t('GROUP.MEMBERS'),
        icon: 'fas fa-users',
        to: { name: 'groupMembers', params: { groupId: this.groupId } },
      }, {
        condition: this.hasFeature('agreements'),
        label: this.$t('GROUP.AGREEMENTS'),
        icon: 'fas fa-handshake',
        to: { name: 'agreements', params: { groupId: this.groupId } },
      }, {
        label: this.$t('GROUP.HISTORY'),
        icon: 'far fa-clock',
        to: { name: 'groupHistory', params: { groupId: this.groupId } },
      }].filter(e => typeof e.condition === 'undefined' || e.condition === true)
    },
    // Total count of things inside the "show more" section that have a numeric badge...
    showMoreBadgeCount () {
      return this.entriesMore.reduce((sum, entry) => sum + (entry.badge?.count || 0), 0)
    },
    entriesMore () {
      return [{
        label: this.$t('GROUP.APPLICATIONS'),
        icon: 'fas fa-address-card',
        to: { name: 'applications', params: { groupId: this.groupId } },
        badge: {
          count: this.pendingApplicationCount,
          color: 'blue',
          title: this.$tc('APPLICATION.WALL_NOTICE', this.pendingApplicationCount, { count: this.pendingApplicationCount }),
        },
      }, {
        label: this.$t('ISSUE.TITLE'),
        icon: 'fas fa-vote-yea',
        to: { name: 'issueList', params: { groupId: this.groupId } },
        badge: {
          count: this.ongoingIssueCount,
          color: 'blue',
          title: this.$tc('ISSUE.NOTICE', this.ongoingIssueCount, { count: this.ongoingIssueCount }),
        },
      }, {
        label: this.$t('GROUP.STATISTICS'),
        icon: 'fas fa-chart-bar',
        to: { name: 'activityHistoryStatistics', params: { groupId: this.groupId } },
      }, {
        label: this.$t('GROUPINFO.META'),
        icon: 'fas fa-info-circle',
        to: { name: 'groupPreview', params: { groupPreviewId: this.groupId } },
      }, {
        condition: this.$q.platform.is.mobile === true,
        label: this.$t('GROUPMAP.TITLE'),
        icon: 'fas fa-map',
        to: { name: 'map', params: { groupId: this.groupId } },
      }].filter(e => typeof e.condition === 'undefined' || e.condition === true)
    },
  },
  methods: {
    hasFeature (feature) {
      return this.features.includes(feature)
    },
  },
}
</script>

<style lang="sass" scoped>
.more-button:hover
  opacity: .6

  ::v-deep(.q-focus-helper)
    background: none !important
</style>
