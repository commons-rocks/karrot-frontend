<template>
  <div
    class="container"
    :style="{ width: imgSize, height:imgSize }"
  >
    <img
      :width="imgSize"
      :height="imgSize"
      :src="scaleImg"
    >
    <img
      class="pointer"
      :width="pointerSize[0]"
      :height="pointerSize[1]"
      :src="scalePointerImg"
      :style="{ transform: pointerRotation, top:pointerSize[2] }"
    >
    <div
      class="text-bottom"
      :style="{ bottom: bottomOffset }"
    >
      <template v-if="hasAmount">
        <span :style="{ fontSize: fontSize }">
          {{ amountNumber[0] }}
        </span>
        <span :style="{ fontSize: fontSizeSmall }">{{ amountNumber[1] }}</span>
      </template>
      <span
        v-else
        :style="{ fontSize: fontSize }"
      >
        ?
      </span>
    </div>
  </div>
</template>

<script>

import scaleImg from '@/feedback/assets/scale_body.svg'
import scalePointerImg from '@/feedback/assets/scale_pointer.svg'

export default {
  props: {
    amount: {
      default: null,
      type: Number,
    },
    size: {
      default: 100,
      type: Number,
    },
  },
  data () {
    return {
      scaleImg,
      scalePointerImg,
    }
  },
  computed: {
    imgSize () {
      return this.size
    },
    hasAmount () {
      return !(typeof this.amount === 'undefined' || this.amount === null)
    },
    amountValue () {
      if (!this.hasAmount) return 0
      return this.amount
    },
    pointerSize () {
      return [Math.floor(this.size / 8) + 'px',
        Math.floor(this.size / 8) * 1.6 + 'px',
        Math.floor(this.size / 10) + 'px']
    },
    pointerRotation () {
      const rotation = Math.floor(this.amountValue * 1.4) - 48
      if (rotation > 48) return 'rotate(45deg)'
      return 'rotate(' + rotation + 'deg)'
    },
    bottomOffset () {
      return Math.floor(this.size / 10) + 'px'
    },
    fontSize () {
      return Math.floor(this.size / 4.2) + 'px'
    },
    fontSizeSmall () {
      return Math.floor(this.size / 7) + 'px'
    },
    amountNumber () {
      if (this.amountValue >= 1000000) {
        return ['999+', 't']
      }
      if (this.amountValue >= 1000) {
        return [Number(this.amountValue / 1000.0).toFixed(1), 't']
      }
      if (this.amountValue >= 1) {
        return [Number(this.amountValue).toFixed(1), 'kg']
      }
      return [Number(this.amountValue * 1000).toFixed(0), 'g']
    },
  },
}
</script>

<style scoped lang="sass">
.container
  position: relative
  display: block
  color: white
  text-align: center

.pointer
  position: absolute
  left: 46%
  transform-origin: 50% 85%

.text-bottom
  position: absolute
  left: 50%
  overflow: hidden
  color: black
  white-space: nowrap
  transform: translate(-50%, -50%)
</style>
