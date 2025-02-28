<template>
  <div
    class="edit-box"
    :class="{ changed: hasChanged }"
  >
    <form
      class="q-gutter-y-lg"
      style="max-width: 700px"
      @submit.prevent="maybeSave"
    >
      <h3 v-if="isNew">
        {{ $t('ACTIVITY_TYPES.ADD') }}
      </h3>
      <QField
        v-if="!isNew"
        borderless
        :hint="$t(`ACTIVITY_TYPES.STATUS_${edit.status.toUpperCase()}_HINT`)"
      >
        <template #control>
          <QToggle
            v-model="edit.status"
            :label="$t(`ACTIVITY_TYPE_STATUS.${edit.status.toUpperCase()}`)"
            true-value="active"
            false-value="archived"
            color="green"
          />
        </template>
      </QField>

      <QField borderless>
        <template #before>
          <QIcon
            :name="edit.icon"
            size="lg"
            :color="colorName"
          />
        </template>
        <template #control>
          <QBtn
            :label="$t('BUTTON.CHANGE_ICON')"
            flat
            color="primary"
            class="q-mr-sm"
          >
            <QMenu
              ref="iconMenu"
              square
            >
              <QSelect
                v-model="iconTag"
                label="Tag"
                outlined
                clearable
                dense
                class="q-ma-md"
                :options="pickerTags"
              />
              <QInput
                v-model="iconFilter"
                :label="$t('BUTTON.SEARCH')"
                outlined
                dense
                clearable
                class="q-ma-md"
                :autofocus="!$q.platform.has.touch"
              />
              <QIconPicker
                v-model="edit.icon"
                v-model:model-pagination="iconPagination"
                :icons="pickerIcons"
                :filter="iconFilter"
                color="white"
                :text-color="colorName"
                :selected-color="colorName"
                selected-text-color="white"
                style="height: 220px;"
              />
            </QMenu>
          </QBtn>

          <QBtn
            :label="$t('BUTTON.CHANGE_COLOUR')"
            flat
            color="primary"
          >
            <QMenu
              auto-close
              square
            >
              <QColor
                v-model="colour"
                style="width: 350px; max-width: 100%;"
                format-model="hex"
                no-footer
                no-header
                default-view="palette"
                :palette="paletteColours"
                square
                flat
              />
            </QMenu>
          </QBtn>
        </template>
      </QField>

      <QSelect
        ref="nameInput"
        v-model="edit.name"
        filled
        emit-value
        map-options
        use-input
        fill-input
        hide-selected
        :label="$t('ACTIVITY_TYPES.NAME')"
        :options="translatableNameOptions"
        :error="hasNameError"
        :error-message="nameError"
        autocomplete="off"
        type="input"
        :hint="edit.nameIsTranslatable ? $t('ACTIVITY_TYPES.STANDARD_NAME_HINT') : $t('ACTIVITY_TYPES.CUSTOM_NAME_HINT')"
        @blur="v$.edit.name.$touch"
        @input-value="onNameInput"
        @keyup.enter="() => $refs.nameInput.hidePopup()"
      >
        <template #option="{ index, itemProps, opt: { label: itemLabel, useCustomName } }">
          <QItem
            :key="index"
            v-bind="itemProps"
          >
            <QItemSection>
              <QItemLabel v-if="useCustomName">
                <i18n-t
                  v-if="itemLabel && !edit.nameIsTranslatable"
                  keypath="ACTIVITY_TYPES.CUSTOM_NAME_USE"
                >
                  <template #name>
                    <strong>{{ itemLabel }}</strong>
                  </template>
                </i18n-t>
                <span v-else>
                  {{ $t('ACTIVITY_TYPES.CUSTOM_NAME_PROMPT') }}
                </span>
              </QItemLabel>
              <QItemLabel v-else>
                {{ itemLabel }}
              </QItemLabel>
            </QItemSection>
          </QItem>
          <template v-if="useCustomName">
            <QSeparator />
            <QItemLabel header>
              {{ $t('ACTIVITY_TYPES.STANDARD_NAME_HEADING') }}
            </QItemLabel>
          </template>
        </template>
      </QSelect>

      <QField
        borderless
        hide-bottom-space
        :hint="edit.hasFeedback ? $t('ACTIVITY_TYPES.FEEDBACK_YES_HINT') : $t('ACTIVITY_TYPES.FEEDBACK_NO_HINT')"
      >
        <QToggle
          v-model="edit.hasFeedback"
          :label="$t('ACTIVITY_TYPES.FEEDBACK')"
        />
        <QToggle
          v-if="edit.hasFeedback"
          v-model="edit.hasFeedbackWeight"
          :label="$t('ACTIVITY_TYPES.FEEDBACK_WEIGHT_LABEL')"
          class="q-ml-lg"
        />
      </QField>

      <template v-if="edit.hasFeedback">
        <QField borderless>
          <template #before>
            <QIcon
              :name="edit.feedbackIcon"
              size="lg"
              :color="colorName"
            />
          </template>
          <template #control>
            <QBtn
              :label="$t('BUTTON.CHANGE_ICON')"
              flat
              color="primary"
            >
              <QMenu
                ref="feedbackIconMenu"
              >
                <QSelect
                  v-model="feedbackIconTag"
                  label="Tag"
                  outlined
                  clearable
                  dense
                  class="q-ma-md"
                  :options="pickerTags"
                />
                <QInput
                  v-model="feedbackIconFilter"
                  :label="$t('BUTTON.SEARCH')"
                  outlined
                  dense
                  clearable
                  class="q-ma-md"
                  :autofocus="!$q.platform.has.touch"
                />
                <QIconPicker
                  v-model="edit.feedbackIcon"
                  v-model:model-pagination="feedbackIconPagination"
                  :icons="feedbackPickerIcons"
                  :filter="feedbackIconFilter"
                  color="white"
                  :text-color="colorName"
                  :selected-color="colorName"
                  selected-text-color="white"
                  style="height: 220px;"
                />
              </QMenu>
            </QBtn>
          </template>
        </QField>
      </template>

      <div class="row justify-end q-gutter-sm q-mt-sm">
        <QBtn
          type="button"
          @click="$emit('cancel')"
        >
          {{ $t('BUTTON.CANCEL') }}
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
</template>

<script>
import { QIconPicker } from '@quasar/quasar-ui-qiconpicker'
import useVuelidate from '@vuelidate/core'
import { required } from '@vuelidate/validators'
import {
  QSelect,
  QInput,
  QField,
  QBtn,
  QToggle,
  QMenu,
  QIcon,
  QColor,
  QItem,
  QItemSection,
  QItemLabel,
  QSeparator,
  colors,
} from 'quasar'

import { createActivityTypeStylesheet } from '@/activities/stylesheet'
import editMixin from '@/utils/mixins/editMixin'
import statusMixin from '@/utils/mixins/statusMixin'
import pickerIcons, { tags as pickerTags } from '@/utils/pickerIcons'

const { getPaletteColor } = colors

// We provide a limited palette of colours to choose from that we think will look nice
// See https://quasar.dev/style/color-palette#Color-List
const COLOUR_NAMES = [
  'pink',
  'purple',
  'indigo',
  'light-blue',
  'cyan',
  'teal',
  'green',
  'amber',
  'deep-orange',
  'blue-grey',
]

const COLOUR_SHADES = [
  8,
  9,
  10,
]

// For the colour picker we need to provide a flat array with all the colours and shades
// Quasar warns that "getPaletteColor" is quite expensive function to call, putting it here means it's only called
// once for the whole module when it's first loaded (which would be async hopefully), not once per form
const PALETTE_COLOURS = COLOUR_SHADES.flatMap(number => COLOUR_NAMES.map(name => getPaletteColor(`${name}-${number}`)))

export default {
  components: {
    QSelect,
    QInput,
    QField,
    QBtn,
    QToggle,
    QMenu,
    QIcon,
    QColor,
    QIconPicker,
    QItem,
    QItemSection,
    QItemLabel,
    QSeparator,
  },
  mixins: [editMixin, statusMixin],
  props: {
    activityTypes: {
      type: Array,
      required: true,
    },
  },
  emits: [
    'cancel',
  ],
  setup () {
    return {
      v$: useVuelidate(),
    }
  },
  data () {
    return {
      paletteColours: PALETTE_COLOURS,
      customName: '',
      colorName: null,
      iconTag: null,
      iconFilter: '',
      iconPagination: {
        itemsPerPage: 20,
        page: 0,
      },
      feedbackIconTag: null,
      feedbackIconFilter: '',
      feedbackIconPagination: {
        itemsPerPage: 20,
        page: 0,
      },
    }
  },
  computed: {
    pickerIcons () {
      if (!this.iconTag) return pickerIcons
      return pickerIcons.filter(icon => icon.tags.includes(this.iconTag))
    },
    feedbackPickerIcons () {
      if (!this.feedbackIconTag) return pickerIcons
      return pickerIcons.filter(icon => icon.tags.includes(this.iconTag))
    },
    canSave () {
      if (!this.isNew && !this.hasChanged) {
        return false
      }
      return true
    },
    translatableNames () {
      return [
        // alphabetical
        'Activity',
        'Distribution',
        'Event',
        'Meeting',
        'Pickup',
        'Task',
      ]
    },
    translatableNameOptions () {
      return [
        {
          value: this.edit.name,
          label: this.edit.name && this.edit.nameIsTranslatable ? this.$t(`ACTIVITY_TYPE_NAMES.${this.edit.name}`) : this.edit.name,
          useCustomName: true,
          disable: this.edit.nameIsTranslatable,
        },
        ...this.translatableNames.map((value, idx) => ({
          value,
          label: this.$t(`ACTIVITY_TYPE_NAMES.${value}`),
          // prevent people from trying to choose a name that is already used (it's not allowed, and enforced by backend too)
          disable: this.activityTypeNamesInUse.includes(value),
        })),
      ]
    },
    activityTypeNamesInUse () {
      return this.activityTypes
        .filter(activityType => activityType.id && activityType.id !== this.edit.id)
        .map(activityType => activityType.name)
    },
    hasNameError () {
      return !!this.nameError
    },
    nameError () {
      if (this.v$.edit.name.$error) {
        const m = this.v$.edit.name
        if (m.required.$invalid) return this.$t('VALIDATION.REQUIRED')
        if (m.isUnique.$invalid) return this.$t('VALIDATION.UNIQUE')
      }
      return this.firstError('name')
    },
    colour: {
      get () {
        return `#${this.edit.colour}`
      },
      set (val) {
        this.edit.colour = val.substring(1)
      },
    },
  },
  watch: {
    'edit.colour': {
      handler () {
        // Keep our activity type class names up to date!
        this.colorName = this.updateActivityType(this.edit)
      },
      immediate: true,
    },
    'edit.icon' () {
      this.$refs.iconMenu.hide()
    },
    'edit.feedbackIcon' () {
      this.$refs.feedbackIconMenu.hide()
    },
  },
  created () {
    this.pickerTags = pickerTags
  },
  beforeCreate () {
    const { updateActivityType, removeStylesheet } = createActivityTypeStylesheet('-edit')
    Object.assign(this, {
      updateActivityType,
      removeStylesheet,
    })
  },
  beforeUnmount () {
    this.removeStylesheet()
  },
  methods: {
    maybeSave () {
      if (!this.canSave) return
      this.save()
    },
    onNameInput (value) {
      // See if the user typed in a standard name
      const option = this.translatableNameOptions.find(option =>
        // (ignore the "special" option)
        !option.useCustomName && (
          // check if it matches the translated value
          option.label === value ||
          // or the non-translated value
          option.value === value
        ),
      )
      if (option) {
        // It is, therefore translatable!
        this.edit.name = option.value
        this.edit.nameIsTranslatable = true
      }
      else {
        // Nope, it's a custom name
        this.edit.name = value
        this.edit.nameIsTranslatable = false
      }
    },
  },
  validations: {
    edit: {
      name: {
        required,
        isUnique (value) {
          return !this.activityTypeNamesInUse.includes(value)
        },
      },
    },
  },
}
</script>

<style scoped lang="sass">
@import '~editbox'
</style>

<style src="@quasar/quasar-ui-qiconpicker/dist/index.css"></style>
