<template>
  <QBtn
    :flat="inToolbar"
    :dense="inToolbar"
    :round="inToolbar"
    :title="$t('LANGUAGECHOOSER.SWITCH')"
    class="k-locale-select"
    @click="open = !open"
  >
    <QIcon
      name="fas fa-globe fa-fw"
      class="q-mr-sm"
    />
    <template
      v-if="!inToolbar"
    >
      {{ currentName }}
    </template>
    <QDialog
      v-model="open"
    >
      <LocaleSelectInner />
    </QDialog>
  </QBtn>
</template>

<script>
import {
  QIcon,
  QBtn,
  QDialog,
} from 'quasar'
import { defineAsyncComponent } from 'vue'

import { useI18nService } from '@/base/services/i18n'
import locales from '@/locales/index'

const LocaleSelectInner = defineAsyncComponent(() => import('./LocaleSelectInner'))

export default {
  name: 'LocaleSelect',
  components: {
    QIcon,
    QBtn,
    QDialog,
    LocaleSelectInner,
  },
  props: {
    inToolbar: {
      type: Boolean,
      default: false,
    },
  },
  setup () {
    const {
      locale: current,
    } = useI18nService()
    return {
      current,
    }
  },
  data () {
    return {
      open: false,
    }
  },
  computed: {
    currentName () {
      if (!this.current) return ''
      return locales[this.current].name
    },
  },
}
</script>

<style lang="sass" scoped>
.k-locale-select
  .q-icon
    opacity: $topbar-opacity-low

  &:hover .q-icon
    opacity: 1
</style>
