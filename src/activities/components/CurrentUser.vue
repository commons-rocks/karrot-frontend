<template>
  <div
    class="user-slot-wrapper relative-position"
    :style="{ width: size + 'px', height: size + 'px' }"
    @click.stop="$emit('leave')"
  >
    <ProfilePicture
      class="profile-picture"
      :user="user"
      :size="size"
      :is-link="false"
    />
    <div
      v-if="isLeaving"
      class="absolute-full vertical-top"
    >
      <QSpinner
        :size="size - 4"
        color="white"
      />
    </div>
    <div
      v-else
      class="absolute-full leave-icon vertical-top"
      :style="{ 'font-size': size*0.8 + 'px' }"
      :title="$t('ACTIVITYLIST.ITEM.LEAVE')"
    >
      <div class="absolute-center">
        <i
          class="fas fa-fw fa-times"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { QSpinner } from 'quasar'

import ProfilePicture from '@/users/components/ProfilePicture'

export default {
  components: {
    QSpinner,
    ProfilePicture,
  },
  props: {
    size: {
      type: Number,
      default: 20,
    },
    user: {
      type: Object,
      required: true,
    },
    isLeaving: {
      type: Boolean,
      default: false,
    },
  },
  emits: [
    'leave',
  ],
}
</script>

<style scoped lang="sass">
.user-slot-wrapper
  cursor: pointer

  .leave-icon
    color: $negative
    text-align: center
    visibility: hidden
    border: 2px dashed
    border-radius: 0

@media (hover)
  .user-slot-wrapper:hover
    .leave-icon
      visibility: visible

    .profile-picture
      visibility: hidden
</style>
