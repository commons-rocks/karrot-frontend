import { watch } from 'vue'
import { AppVisibility } from 'quasar'

export default async ({ store: datastore, app }) => {
  let timer = null
  const setAway = () => datastore.dispatch('presence/toggle/away', true)
  const resetTimer = () => {
    clearTimeout(timer)
    datastore.dispatch('presence/toggle/away', false)
    timer = setTimeout(setAway, 30 * 1000) // 30 seconds
  }

  ['load', 'mousemove', 'keydown', 'DOMMouseScroll', 'mousewheel', 'mousedown', 'touchstart', 'touchmove', 'click']
    .forEach(event => document.addEventListener(event, resetTimer, { passive: true }))

  watch(() => AppVisibility.appVisible, val => {
    // listen on tab & window visibility, mostly works on desktop browsers
    datastore.dispatch('presence/toggle/away', !val)
  })
}
