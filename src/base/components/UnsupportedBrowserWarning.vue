<template>
  <div
    v-if="unsupportedBrowser"
    class="browser-warning bg-warning text-white"
  >
    <i18n-t
      tag="span"
      keypath="OUTDATED_BROWSER.MESSAGE"
    >
      <template #upgradeBrowser>
        <a
          v-t="'OUTDATED_BROWSER.LINK'"
          href="https://browser-update.org/update.html"
          class="outdated-link"
          rel="noopener nofollow noreferrer"
          target="_blank"
          translate="yes"
        />
      </template>
    </i18n-t>
  </div>
</template>

<script>
export default {
  computed: {
    unsupportedBrowser () {
      const {
        cordova,
        safari,
        ie,
        versionNumber,
      } = this.$q.platform.is

      if (cordova) return false
      if (safari && versionNumber < 10) {
        return true
      }
      else if (ie && versionNumber < 11) {
        return true
      }
      return false
    },
  },
}
</script>

<style scoped lang="sass">
.browser-warning
  width: 100%
  padding: 10px 4px
  text-align: center

.outdated-link
  text-decoration: underline
</style>
