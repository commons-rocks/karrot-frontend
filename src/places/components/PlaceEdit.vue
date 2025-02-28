<template>
  <div v-if="v$.edit">
    <QCard
      class="no-shadow grey-border"
      style="max-width: 700px"
    >
      <div
        class="edit-box"
        :class="{ changed: hasChanged }"
      >
        <form @submit.prevent="maybeSave">
          <QInput
            v-model="edit.name"
            :autofocus="!$q.platform.has.touch"
            :error="hasNameError"
            :error-message="nameError"
            :label="$t('STOREEDIT.NAME')"
            autocomplete="off"
            outlined
            class="q-mb-lg"
            @blur="v$.edit.name.$touch"
          />

          <QSelect
            v-model="edit.placeType"
            :options="placeTypeOptions.filter(({ status, value }) => status === 'active' || edit.placeType === value)"
            map-options
            emit-value
            :label="$t('STOREEDIT.PLACE_TYPE')"
            :error="hasPlaceTypeError"
            :error-message="placeTypeError"
            outlined
            class="q-mb-lg"
            @blur="v$.edit.placeType.$touch"
          >
            <template #option="scope">
              <QItem
                :key="scope.index"
                dense
                v-bind="scope.itemProps"
              >
                <QItemSection side>
                  <QIcon
                    :name="scope.opt.icon"
                    size="1.1em"
                    color="positive"
                  />
                </QItemSection>
                <QItemSection>
                  <QItemLabel>{{ scope.opt.label }}</QItemLabel>
                </QItemSection>
              </QItem>
            </template>
            <template #selected-item="scope">
              <div class="row no-wrap ellipsis">
                <QIcon
                  :name="scope.opt.icon"
                  size="1.1em"
                  class="on-left q-ml-xs"
                  color="positive"
                />
                <div class="ellipsis">
                  {{ scope.opt.label }}
                </div>
              </div>
            </template>
            <template #after>
              <QBtn
                :label="$t('PLACE_TYPES.MANAGE_TYPES')"
                :to="{ name: 'groupEditPlaceTypes' }"
              />
            </template>
          </QSelect>

          <QSelect
            v-model="edit.status"
            :options="statusOptions"
            map-options
            emit-value
            :label="$t('STOREEDIT.STATUS')"
            :error="hasError('status')"
            :error-message="firstError('status')"
            outlined
            class="q-mb-lg"
          >
            <template #option="scope">
              <QItem
                :key="scope.index"
                dense
                v-bind="scope.itemProps"
              >
                <QItemSection side>
                  <QIcon
                    :name="scope.opt.icon"
                    :color="scope.opt.color"
                    size="1.1em"
                  />
                </QItemSection>
                <QItemSection>
                  <QItemLabel>{{ scope.opt.label }}</QItemLabel>
                </QItemSection>
              </QItem>
            </template>
            <template #selected-item="scope">
              <div class="row no-wrap ellipsis">
                <QIcon
                  :name="scope.opt.icon"
                  :color="scope.opt.color"
                  size="1.1em"
                  class="on-left q-ml-xs"
                />
                <div class="ellipsis">
                  {{ scope.opt.label }}
                </div>
              </div>
            </template>
          </QSelect>

          <MarkdownInput
            v-model="edit.description"
            :label="$t('STOREEDIT.DESCRIPTION')"
            :error="hasError('description')"
            :error-message="firstError('description')"
            outlined
            mentions
            class="q-mb-lg"
            @keyup.ctrl.enter="maybeSave"
          />

          <QSelect
            v-model="edit.defaultView"
            :options="[
              {label: $t('GROUP.ACTIVITIES'), value: 'activities'},
              {label: $t('GROUP.WALL'), value: 'wall'}
            ]"
            map-options
            emit-value
            :label="$t('STOREEDIT.DEFAULT_VIEW')"
            outlined
            :hint="$t('STOREEDIT.DEFAULT_VIEW_HINT')"
            class="q-mb-lg"
          />

          <AddressPicker
            v-model="edit"
            :color="markerColor"
            :font-icon="$icon('place')"
            :label="$t('STOREEDIT.ADDRESS')"
            :error="hasAddressError"
            :error-message="addressError"
            :default-map-center="defaultMapCenter"
            outlined
            class="q-mb-lg"
          />

          <div>
            <QField
              borderless
              :hint="$t('STOREEDIT.WEEKS_IN_ADVANCE')"
              stack-label
              hide-bottom-space
              :error="hasError('weeksInAdvance')"
              :error-message="firstError('weeksInAdvance')"
            >
              <template #control>
                <QSlider
                  v-model="edit.weeksInAdvance"
                  :min="1"
                  :max="10"
                  label
                  label-always
                  markers
                  class="q-mt-lg q-mx-md"
                />
              </template>
            </QField>
            <div
              v-if="!isNew && value.weeksInAdvance > edit.weeksInAdvance"
              class="q-ml-lg col-12 q-field__bottom text-warning"
            >
              <QIcon
                name="warning"
                class="vertical-center"
              />
              {{ $t('STOREEDIT.WEEKS_IN_ADVANCE_WARNING') }}
            </div>
          </div>

          <div
            v-if="hasNonFieldError || hasError('group')"
            class="text-negative"
          >
            {{ firstNonFieldError || firstError('group') }}
          </div>

          <div class="row justify-end q-gutter-sm q-mt-md">
            <QBtn
              v-if="isNew"
              type="button"
              @click="$emit('cancel')"
            >
              {{ $t('BUTTON.CANCEL') }}
            </QBtn>
            <QBtn
              v-if="!isNew"
              type="button"
              :disable="!hasChanged"
              @click="reset"
            >
              {{ $t('BUTTON.RESET') }}
            </QBtn>
            <QBtn
              v-if="!isNew"
              type="button"
              color="red"
              @click="archive"
            >
              {{ $t('BUTTON.ARCHIVE') }}
            </QBtn>
            <QBtn
              type="submit"
              color="primary"
              :disable="!canSave"
              :loading="isPending"
            >
              {{ $t(isNew ? 'BUTTON.CREATE' : 'BUTTON.SAVE_CHANGES') }}
            </QBtn>
          </div>
        </form>
      </div>
    </QCard>
  </div>
</template>

<script>
import useVuelidate from '@vuelidate/core'
import { required, minLength, maxLength } from '@vuelidate/validators'
import {
  QCard,
  QField,
  QSlider,
  QInput,
  QBtn,
  QSelect,
  QIcon,
  QItem,
  QItemSection,
  QItemLabel,
  Dialog,
} from 'quasar'
import { computed } from 'vue'

import { useCurrentGroupService } from '@/group/services'
import { usePlaceTypeHelpers } from '@/places/helpers'
import { statusList, optionsFor } from '@/places/placeStatus'
import { usePlaceTypeService } from '@/places/services'
import editMixin from '@/utils/mixins/editMixin'
import statusMixin from '@/utils/mixins/statusMixin'

import AddressPicker from '@/maps/components/AddressPicker'
import MarkdownInput from '@/utils/components/MarkdownInput'

export default {
  name: 'PlaceEdit',
  components: {
    QCard,
    QField,
    QSlider,
    QInput,
    QBtn,
    QSelect,
    QIcon,
    QItem,
    QItemSection,
    QItemLabel,
    MarkdownInput,
    AddressPicker,
  },
  mixins: [editMixin, statusMixin],
  props: {
    value: {
      required: false,
      type: Object,
      default: () => ({
        name: undefined,
        description: undefined,
        weeksInAdvance: 4,
        latitude: undefined,
        longitude: undefined,
        address: undefined,
        status: 'created',
        defaultView: 'activities',
      }),
    },
    currentGroup: {
      required: false,
      type: Object,
      default: () => ({}),
    },
    allPlaces: { required: true, type: Array },
  },
  emits: [
    'cancel',
    'save',
  ],
  setup () {
    const { groupId } = useCurrentGroupService()

    const { getPlaceTypesByGroup, getPlaceTypeById } = usePlaceTypeService()

    const {
      getTranslatedName,
      sortByTranslatedName,
    } = usePlaceTypeHelpers()

    const placeTypes = computed(() => getPlaceTypesByGroup(groupId).sort(sortByTranslatedName))

    const placeTypeOptions = computed(() => placeTypes.value.map(placeType => ({
      value: placeType.id,
      label: getTranslatedName(placeType),
      icon: placeType.icon,
      status: placeType.status,
    })))

    return {
      v$: useVuelidate(),
      placeTypeOptions,
      getPlaceTypeById,
    }
  },
  computed: {
    canSave () {
      if (this.v$.edit.$error) {
        return false
      }
      if (!this.isNew && !this.hasChanged) {
        return false
      }
      return true
    },
    hasNameError () {
      return !!this.nameError
    },
    nameError () {
      if (this.v$.edit.name.$error) {
        const m = this.v$.edit.name
        if (m.required.$invalid) return this.$t('VALIDATION.REQUIRED')
        if (m.minLength.$invalid) return this.$t('VALIDATION.MINLENGTH', { min: 2 })
        if (m.maxLength.$invalid) return this.$t('VALIDATION.MAXLENGTH', { max: 81 })
        if (m.isUnique.$invalid) return this.$t('VALIDATION.UNIQUE')
      }
      return this.firstError('name')
    },
    hasPlaceTypeError () {
      return !!this.placeTypeError
    },
    placeTypeError () {
      if (this.v$.edit.placeType.$error) {
        if (this.v$.edit.placeType.required.$invalid) return this.$t('VALIDATION.REQUIRED')
      }
      return this.firstError('placeType')
    },
    hasAddressError () {
      return !!this.addressError
    },
    addressError () {
      for (const field of ['address', 'latitude', 'longitude']) {
        if (this.hasError(field)) return this.firstError(field)
      }
      return null
    },
    statusOptions () {
      const { icon } = this.edit.placeType ? this.getPlaceTypeById(this.edit.placeType) : { icon: 'fas fa-circle' }
      return statusList
        .filter(s => s.selectable)
        .map(s => ({
          value: s.key,
          label: this.$t(s.label),
          color: s.color,
          icon,
        }))
    },
    markerColor () {
      if (this.edit) return optionsFor(this.edit).color
      return null
    },
    defaultMapCenter () {
      const { latitude: lat, longitude: lng } = this.edit.group || this.currentGroup || {}
      if (lat && lng) return { lat, lng }
      return null
    },
  },
  watch: {
    '$route.query' (val) {
      if (val) this.setLocation(val)
    },
  },
  mounted () {
    if (this.$route && this.$route.query) this.setLocation(this.$route.query)
  },
  methods: {
    setLocation ({ lat, lng }) {
      if (this.isNew) {
        if (!isNaN(lat) && !isNaN(lng)) {
          this.edit.latitude = lat
          this.edit.longitude = lng
        }
        else {
          this.edit.latitude = undefined
          this.edit.longitude = undefined
        }
      }
    },
    maybeSave () {
      this.v$.edit.$touch()
      if (!this.canSave) return
      this.v$.edit.$reset()
      this.save()
    },
    archive () {
      Dialog.create({
        title: this.$t('STOREEDIT.DIALOGS.ARCHIVE.TITLE'),
        message: this.$t('STOREEDIT.DIALOGS.ARCHIVE.MESSAGE'),
        cancel: this.$t('BUTTON.CANCEL'),
        ok: this.$t('STOREEDIT.DIALOGS.ARCHIVE.CONFIRM'),
      })
        .onOk(() => this.$emit('save', { id: this.value.id, status: 'archived' }))
    },
  },
  validations: {
    edit: {
      name: {
        required,
        minLength: minLength(3),
        maxLength: maxLength(80),
        isUnique (value) {
          if (value === '') return true
          return !this.allPlaces
            .filter(e => e.id !== this.edit.id)
            .find(e => e.name === value)
        },
      },
      placeType: {
        required,
      },
    },
  },
}
</script>

<style scoped lang="sass">
@import '~editbox'
</style>
