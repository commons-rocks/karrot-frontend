<template>
  <div>
    <KSpinner v-show="isPending" />
    <p v-if="success">
      {{ $t('VERIFYMAIL.SUCCESS') }}
    </p>
    <p v-if="hasAnyError">
      <i class="fas fa-exclamation-triangle" />
      {{ anyFirstError }}
    </p>
    <RouterLink to="/">
      <QBtn
        icon-right="fas fa-home"
        color="secondary"
        push
      >
        <span v-t="'NOT_FOUND.HOME'" />
      </QBtn>
    </RouterLink>
  </div>
</template>

<script>
import { QBtn } from 'quasar'

import statusMixin from '@/utils/mixins/statusMixin'

import KSpinner from '@/utils/components/KSpinner'

export default {
  components: {
    KSpinner,
    QBtn,
  },
  mixins: [statusMixin],
  props: {
    success: { required: true, type: Boolean },
  },
}
</script>
