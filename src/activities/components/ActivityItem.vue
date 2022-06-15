<template>
  <QCard
    class="activity-item"
    :class="{ full: activity.isFull }"
  >
    <QCardSection
      class="no-padding content"
      :class="{ isEmpty: activity.isEmpty, isUserMember: activity.isUserMember, isDisabled: activity.isDisabled }"
    >
      <div class="content-inner">
        <div class="row no-wrap items-start justify-between">
          <div>
            <strong class="featured-text">
              {{ $d(activity.date, 'hourMinute') }}
              <template v-if="activity.hasDuration"> &mdash; {{ $d(activity.dateEnd, 'hourMinute') }}</template>
            </strong>
            <template v-if="placeLink">
              <template v-if="dense">
                <span>{{ $d(activity.date, 'dateWithDayName') }}</span>
                <br>
              </template>
              <span v-if="activity.place">
                <RouterLink :to="{ name: 'place', params: { placeId: activity.place.id }}">
                  {{ activity.place.name }}
                </RouterLink>
              </span>
            </template>
            <template v-else>
              {{ $d(activity.date, 'dateLongWithDayName') }}
            </template>
          </div>
          <QIcon
            v-if="activity.activityType"
            v-bind="activity.activityType.iconProps"
            title=""
            size="xs"
            class="q-ml-sm"
            style="top: 1px;"
          >
            <q-tooltip v-if="activity.activityType.iconProps && activity.activityType.iconProps.title">
              {{ activity.activityType.iconProps.title }}
            </q-tooltip>
          </QIcon>
        </div>
        <div
          v-if="activity.isDisabled"
          class="q-my-xs"
        >
          <b class="text-negative">{{ $t('ACTIVITYLIST.ACTIVITY_DISABLED') }}</b>
        </div>
        <div
          v-if="activity.hasStarted"
          class="q-my-xs"
        >
          <b class="text-orange">{{ $t('ACTIVITYLIST.ACTIVITY_STARTED') }}</b>
        </div>
        <Markdown
          v-if="activity.description"
          :source="activity.description"
          mentions
        />
        <div class="q-mt-none q-mb-none full-width column q-gutter-y-md">
          <div
            v-for="participantType in participantTypes"
            :key="participantType.id"
            class="col"
            :class="[participantTypes.length > 1 ? 'multiple-types' : '', participantType.isUserParticipant ? 'active' : '']"
          >
            <Markdown
              v-if="participantType.description"
              :source="participantType.description"
            />
            <ActivityUsers
              :activity="activity"
              :participant-type="participantType"
            />
            <div
              v-if="participantTypes.length > 1 || participantType.role !== 'member'"
              class="q-my-xs"
            >
              <em>Open for <strong>{{ roleName(participantType.role) }}</strong></em>
            </div>
          </div>
          <CustomDialog v-model="joinDialog">
            <template #title>
              <QIcon
                v-bind="activity.activityType.iconProps"
                size="sm"
                class="q-pr-sm"
              />
              {{ $t('ACTIVITYLIST.ITEM.JOIN_CONFIRMATION_HEADER', { activityType: activity.activityType.translatedName }) }}
            </template>
            <template #message>
              <template v-if="participantTypes.length > 1">
                <QItem
                  v-for="participantType in participantTypes"
                  :key="participantType.role"
                  tag="label"
                  :class="!roles.includes(participantType.role) || participantType.isFull ? 'text-grey-5' : ''"
                >
                  <QItemSection avatar>
                    <QRadio
                      v-model="joinParticipantTypeId"
                      :val="participantType.id"
                      color="orange"
                      :disable="!roles.includes(participantType.role) || participantType.isFull"
                    />
                  </QItemSection>
                  <QItemSection>
                    <QItemLabel>
                      <Markdown
                        v-if="participantType.description"
                        :source="participantType.description"
                      />
                    </QItemLabel>
                    <QItemLabel>
                      <em>Open for <strong>{{ roleName(participantType.role) }}</strong></em>
                    </QItemLabel>
                  </QItemSection>
                </QItem>
                <br>
              </template>
              <template v-else-if="onlyAvailableParticipantType">
                <Markdown
                  v-if="onlyAvailableParticipantType.description"
                  :source="onlyAvailableParticipantType.description"
                />
              </template>
              {{ $t('ACTIVITYLIST.ITEM.JOIN_CONFIRMATION_TEXT', { date: $d(activity.date, 'long') }) }}
            </template>
            <template #actions>
              <QBtn
                v-close-popup
                flat
                color="primary"
                :label="$t('BUTTON.CANCEL')"
              />
              <QBtn
                v-close-popup
                flat
                color="primary"
                data-autofocus
                :label="$t('BUTTON.OF_COURSE')"
                @click="$emit('join', { id: activity.id, participantTypeId: joinParticipantTypeId } )"
              />
            </template>
          </CustomDialog>
          <CustomDialog v-model="leaveDialog">
            <template #title>
              <QIcon
                v-bind="activity.activityType.iconProps"
                size="sm"
                class="q-pr-sm"
              />
              {{ $t('ACTIVITYLIST.ITEM.LEAVE_CONFIRMATION_HEADER', { activityType: activity.activityType.translatedName }) }}
            </template>
            <template #message>
              {{ $t('ACTIVITYLIST.ITEM.LEAVE_CONFIRMATION_TEXT') }}
            </template>
            <template #actions>
              <QBtn
                v-close-popup
                flat
                color="primary"
                :label="$t('BUTTON.CANCEL')"
              />
              <QBtn
                v-close-popup
                flat
                color="primary"
                data-autofocus
                :label="$t('BUTTON.YES')"
                @click="$emit('leave', activity.id)"
              />
            </template>
          </CustomDialog>
        </div>
      </div>
    </QCardSection>
    <QCardSection
      class="row no-padding full-width justify-end bottom-actions"
    >
      <QBtn
        v-if="canJoin"
        flat
        no-caps
        :color="activity.activityType.iconProps.color"
        class="action-button"
        :loading="isJoining"
        @click="join"
      >
        <QIcon
          name="fas fa-user-plus"
          size="xs"
          class="q-mr-sm"
        />
        <span class="block">Join {{ activity.activityType.name }}</span>
      </QBtn>
      <QBtn
        v-if="canLeave"
        flat
        no-caps
        color="red-4"
        class="action-button activity-hover"
        :loading="isLeaving"
        @click="leave"
      >
        <QIcon
          name="fas fa-user-times"
          size="xs"
          class="q-mr-sm"
        />
        <span class="block">Leave {{ activity.activityType.name }}</span>
      </QBtn>
      <QSpace />
      <QBtn
        v-if="activity.isUserMember"
        :href="icsUrl"
        flat
        no-caps
        type="a"
        color="secondary"
        class="action-button"
      >
        <template #default>
          <QIcon
            name="event"
            size="xs"
            class="q-mr-xs"
          />
          <span>{{ $t('ACTIVITYLIST.ITEM.DOWNLOAD_ICS') }}</span>
        </template>
      </QBtn>
      <QBtn
        flat
        no-caps
        color="secondary"
        class="action-button"
        @click.stop="detail"
      >
        <template #default>
          <QIcon
            name="chat"
            size="xs"
            class="q-mr-xs icon-chat"
          />
          <span class="block">{{ $t('CONVERSATION.OPEN') }}</span>
        </template>
      </QBtn>
    </QCardSection>
  </QCard>
</template>

<script>
import {
  QCard,
  QCardSection,
  QIcon,
  QBtn,
  QSpace,
  QItem,
  QItemSection,
  QItemLabel,
  QRadio,
} from 'quasar'
import ActivityUsers from './ActivityUsers'
import CustomDialog from '@/utils/components/CustomDialog'
import { absoluteURL } from '@/utils/absoluteURL'
import Markdown from '@/utils/components/Markdown'

export default {
  components: {
    CustomDialog,
    QCard,
    QCardSection,
    QIcon,
    QBtn,
    QSpace,
    QItem,
    QItemSection,
    QItemLabel,
    QRadio,
    ActivityUsers,
    Markdown,
  },
  props: {
    activity: {
      type: Object,
      required: true,
    },
    roles: {
      type: Array,
      required: true,
    },
    dense: {
      type: Boolean,
      default: false,
    },
    placeLink: {
      type: Boolean,
      default: false,
    },
  },
  emits: [
    'join',
    'leave',
    'detail',
  ],
  data () {
    return {
      joinDialog: false,
      leaveDialog: false,
      joinParticipantTypeId: null,
    }
  },
  computed: {
    canJoin () {
      if (this.activity.isDisabled || this.activity.isUserMember) {
        return false
      }
      return this.availableParticipantTypes.length > 0
    },
    canLeave () {
      return this.activity.isUserMember
    },
    participantTypes () {
      return this.activity.participantTypes.filter(entry => !entry._removed)
    },
    availableParticipantTypes () {
      return this.participantTypes.filter(participantType => {
        return this.roles.includes(participantType.role) && !participantType.isFull
      })
    },
    onlyAvailableParticipantType () {
      if (this.availableParticipantTypes.length === 1) {
        return this.availableParticipantTypes[0]
      }
      return null
    },
    icsUrl () {
      // a relative URL would work fine in a browser but
      // not in Cordova so we always make it absolute for simplicity.
      // see https://github.com/karrot-dev/karrot-frontend/issues/2400
      return absoluteURL(`/api/activities/${this.activity.id}/ics/`)
    },
    isJoining () {
      // if request is in progress and user is not member yet (watches out for websocket updates!)
      return this.activity.joinStatus.pending && !this.activity.isUserMember
    },
    isLeaving () {
      // if request is in progress and user has not left yet
      return this.activity.leaveStatus.pending && this.activity.isUserMember
    },
  },
  methods: {
    join () {
      if (this.joinParticipantTypeId !== null && !this.availableParticipantTypes.find(t => t.id === this.joinParticipantTypeId)) {
        this.joinParticipantTypeId = null
      }
      if (this.joinParticipantTypeId === null && this.availableParticipantTypes.length > 0) {
        this.joinParticipantTypeId = this.availableParticipantTypes[0].id
      }
      this.leaveDialog = false
      this.joinDialog = true
    },
    leave () {
      if (!this.activity.hasStarted) {
        this.joinDialog = false
        this.leaveDialog = true
      }
    },
    detail (event) {
      if (event.target.closest('a')) return // ignore actual links
      this.$emit('detail', this.activity)
    },
    roleName (role) {
      return role === 'member' ? 'anyone' : role // TODO: translation
    },
  },
}
</script>

<style scoped lang="sass">
.activity-item
  .activity-hover
    visibility: hidden

  &:hover
    .activity-hover
      visibility: visible

.multiple-types
  padding: 8px 8px 2px 8px
  border-left: 4px solid rgba(0, 0, 0, 0.1)
  &.active
   background-color: rgba(0, 0, 0, 0.1)

.content
  width: 100%
  transition: background-color 2s ease

  &.isUserMember
    &:not(.isDisabled)
      background: linear-gradient(to right, $lightGreen, $lighterGreen)

  &.isDisabled
    background: $lightRed

  .content-inner
    width: 100%
    padding: 12px

    .featured-text
      display: inline
      margin-right: .3em

.bottom-actions
  font-weight: 500
  color: $secondary
  box-shadow: 0 -1px 0 rgba(0, 0, 0, 0.06)

.q-btn.action-button
  ::v-deep(.q-btn__wrapper)
    padding: 10px 16px !important

    .icon-chat
      transform: rotateY(180deg)
</style>
