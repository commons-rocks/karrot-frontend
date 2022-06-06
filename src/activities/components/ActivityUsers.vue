<template>
  <div
    ref="wrapperDiv"
    class="row justify-start"
  >
    <QResizeObserver
      style="width: 100%"
      @resize="calculateSlotsPerRow"
    />
    <div
      v-for="participant in participants"
      :key="'participant' + participant.user.id"
      class="relative-position pic-wrapper"
    >
      <div
        v-if="isNewcomer(participant.user) && !participant.user.isCurrentUser"
        class="newcomer-box"
        :title="$t('USERDATA.NEWCOMER_GUIDANCE', { userName: participant.user.displayName })"
      />
      <ProfilePicture
        :user="participant.user"
        :size="size"
      />
    </div>

    <EmptySlot
      v-for="n in emptySlots"
      :key="n"
      :size="size"
    />

    <div
      v-if="notShownEmptySlotCount > 0"
      class="emptySlots"
      :style="{ width: size + 'px', height: size + 'px' }"
    >
      <div />
      {{ notShownEmptySlotSymbol }}
    </div>
  </div>
</template>

<script>
import ProfilePicture from '@/users/components/ProfilePicture'
import EmptySlot from './EmptySlot'
import { mapGetters } from 'vuex'
import {
  QResizeObserver,
} from 'quasar'

export default {
  components: {
    ProfilePicture,
    EmptySlot,
    QResizeObserver,
  },
  props: {
    activity: {
      type: Object,
      required: true,
    },
    participantType: {
      type: Object,
      required: true,
    },
    size: {
      type: Number,
      default: 36,
    },
  },
  emits: [
    'leave',
    'join',
  ],
  data () {
    return {
      slotsPerRow: 6,
    }
  },
  computed: {
    ...mapGetters({
      currentUser: 'auth/user',
    }),
    participants () {
      return (this.activity.participants || []).filter(participant => participant.participantType.id === this.participantType.id)
    },
    hasUnlimitedPlaces () {
      return this.maxParticipants === null
    },
    maxParticipants () {
      return this.participantType.maxParticipants
    },
    emptyPlaces () {
      if (this.hasUnlimitedPlaces) {
        return 9999999999
      }
      if (this.participants) {
        return Math.max(this.maxParticipants - this.participants.length, 0)
      }
      return 0
    },
    emptySlots () {
      if (this.participants) {
        const minToShow = Math.min(1, this.emptyPlaces)
        const maxToShow = Math.max(minToShow, this.slotsPerRow - this.participants.length - 1)
        return Math.min(this.emptyPlaces, maxToShow)
      }
      return 0
    },
    notShownEmptySlotCount () {
      return this.emptyPlaces - this.emptySlots
    },
    notShownEmptySlotSymbol () {
      if (this.notShownEmptySlotCount > 99) {
        return this.hasUnlimitedPlaces ? '+ ∞' : '...'
      }
      return `+ ${this.notShownEmptySlotCount}`
    },
  },
  methods: {
    calculateSlotsPerRow () {
      if (this.$refs.wrapperDiv) {
        this.slotsPerRow = Math.floor(this.$refs.wrapperDiv.clientWidth / (this.size + 3.8))
      }
    },
    isNewcomer (user) {
      return user.membership && !user.membership.isEditor
    },
  },
}
</script>

<style scoped lang="sass">
@use 'sass:color'

.pic-wrapper
  margin-right: 3px

.newcomer-box
  position: absolute
  bottom: -4px
  left: 0
  width: 100%
  height: 8px
  background: linear-gradient(to bottom, $secondary, color.adjust($secondary, $lightness: 50%))

.emptySlots
  display: inline-block
  margin-bottom: 3.8px
  color: grey
  text-align: center
  background-color: rgba(255, 255, 255, 0.7)
  border: 2px dashed lightgrey
  border-radius: 0

  div
    display: inline-block
    height: 100%
    vertical-align: middle
</style>
