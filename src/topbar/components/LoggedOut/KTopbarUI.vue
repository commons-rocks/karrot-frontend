<template>
  <QToolbar>
    <RouterLink
      :to="'/'"
      class="logo"
    >
      <KarrotLogo show-loading />
    </RouterLink>
    <QToolbarTitle>
      <div class="row justify-between no-wrap">
        <div />
        <KBreadcrumb class="bread" />
        <div />
      </div>
    </QToolbarTitle>
    <div class="actions">
      <LocaleSelect in-toolbar />
      <RouterLink :to="{ name: 'login' }">
        <QBtn class="text-white">
          {{ $t('LOGIN.SUBMIT') }}
        </QBtn>
      </RouterLink>
      <RouterLink
        v-if="!$q.platform.is.mobile"
        :to="{ name: 'signup' }"
      >
        <QBtn
          flat
          class="text-white bg-secondary"
        >
          {{ $t('LOGIN.SIGNUP') }}
        </QBtn>
      </RouterLink>
    </div>
  </QToolbar>
</template>

<script>
import { QToolbar, QToolbarTitle, QBtn } from 'quasar'

import KarrotLogo from '@/logo/components/KarrotLogo'
import KBreadcrumb from '@/topbar/components/KBreadcrumb'
import LocaleSelect from '@/utils/components/LocaleSelect'

export default {
  components: {
    QToolbar, QToolbarTitle, QBtn, KarrotLogo, KBreadcrumb, LocaleSelect,
  },
  props: {
    breadcrumbs: {
      type: Array,
      required: false,
      default: () => [],
    },
  },
}
</script>

<style scoped lang="sass">
.logo
  width: 32px
  height: 32px
  // In this component (logged-out) the logo is a RouterLink (a href)
  // but in the logged-in component the logo is a QBtn with distinct paddings
  // -> these margins make the logo visually positioned the same way as in the logged-in component
  margin-top: -4px
  margin-left: 8px

.actions .router-link-exact-active
  display: none
</style>
