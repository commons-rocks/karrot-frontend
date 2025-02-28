<template>
  <component
    :is="$q.platform.is.mobile ? 'div' : 'QCard'"
    v-if="v$.edit"
  >
    <ChangePhoto
      v-if="!isNew"
      :hint="$t('GROUP.SET_LOGO')"
      :label="$t('GROUP.LOGO')"
      :status="status"
      :value="value"
      @save="photo => $emit('save', { id: value.id, photo })"
    />
    <div
      class="edit-box"
      :class="{ changed: hasChanged }"
    >
      <form @submit.prevent="maybeSave">
        <h4 class="text-primary q-mt-none q-mb-lg">
          {{ $t('GROUP.HEADINGS.GENERAL') }}
        </h4>

        <QInput
          v-if="edit.status !== 'playground'"
          id="group-title"
          v-model="edit.name"
          :autofocus="!$q.platform.has.touch"
          v-bind="nameError"
          :label="$t('GROUP.TITLE')"
          autocomplete="off"
          outlined
          class="q-mb-lg"
          @blur="v$.edit.name.$touch"
        >
          <template #before>
            <QIcon name="fas fa-fw fa-star" />
          </template>
        </QInput>

        <MarkdownInput
          v-if="edit.status !== 'playground'"
          v-model="edit.publicDescription"
          :error="hasError('publicDescription')"
          :error-message="firstError('publicDescription')"
          :label="$t('GROUPINFO.TITLE')"
          icon="fas fa-fw fa-question"
          outlined
          class="q-mb-lg"
          @keyup.ctrl.enter="maybeSave"
        />

        <MarkdownInput
          v-model="edit.description"
          :error="hasError('description')"
          :error-message="firstError('description')"
          :label="$t('GROUP.DESCRIPTION_VERBOSE')"
          icon="fas fa-fw fa-address-card"
          outlined
          mentions
          class="q-mb-lg"
          @keyup.ctrl.enter="maybeSave"
        />

        <h4 class="text-primary q-mt-xl q-mb-lg">
          {{ $t('GROUP.HEADINGS.LOCATION') }}
          <InfoPopup
            :title="$t('INFO')"
            :description="$t('GROUP.HEADINGS.LOCATION_HINT')"
          />
        </h4>

        <AddressPicker
          v-model="edit"
          :color="isNew ? 'blue' : 'positive'"
          :error="hasAddressError"
          :error-message="addressError"
          :label="$t('GROUP.ADDRESS')"
          :default-map-center="defaultMapCenter"
          font-icon="fas fa-home"
          icon="fas fa-fw fa-map-marker"
          outlined
          class="q-mb-lg"
        />

        <QSelect
          v-model="edit.timezone"
          v-bind="timezoneError"
          :label="$t('GROUP.TIMEZONE')"
          :options="filteredTimezones"
          fill-input
          hide-selected
          input-debounce="0"
          outlined
          use-input
          class="q-mb-lg"
          @filter="timezoneFilter"
          @blur="v$.edit.timezone.$touch"
        >
          <template #before>
            <QIcon name="fas fa-fw fa-globe" />
          </template>
        </QSelect>

        <h4 class="text-primary q-mt-xl q-mb-lg">
          {{ $t('GROUP.HEADINGS.NEW_MEMBERS_SIGNUP') }}
          <InfoPopup
            :title="$t('INFO')"
            :description="$t('GROUP.HEADINGS.NEW_MEMBERS_SIGNUP_HINT')"
          />
        </h4>

        <MarkdownInput
          v-if="!edit.isOpen"
          :error="hasError('applicationQuestions')"
          :error-message="firstError('applicationQuestions')"
          :label="$t('GROUP.APPLICATION_QUESTIONS')"
          :model-value="applicationQuestionsOrDefault"
          icon="fas fa-fw fa-question"
          outlined
          class="q-mb-lg"
          @update:model-value="applicationQuestionsInput"
          @keyup.ctrl.enter="maybeSave"
        />

        <MarkdownInput
          v-if="!edit.isOpen"
          v-model="edit.welcomeMessage"
          :error="hasError('welcomeMessage')"
          :error-message="firstError('welcomeMessage')"
          :label="$t('GROUP.WELCOMEMESSAGE_VERBOSE')"
          icon="fas fa-fw fa-address-card"
          outlined
          class="q-mb-lg"
          @keyup.ctrl.enter="maybeSave"
        />

        <div
          v-if="hasNonFieldError"
          class="text-negative"
        >
          {{ firstNonFieldError }}
        </div>

        <div class="row justify-end q-gutter-sm q-mt-sm">
          <QBtn
            v-if="!isNew"
            type="button"
            :disable="!hasChanged"
            @click="reset"
          >
            {{ $t('BUTTON.RESET') }}
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
  </component>
</template>

<script>
import useVuelidate from '@vuelidate/core'
import { required, minLength, maxLength } from '@vuelidate/validators'
import jstz from 'jstimezonedetect'
import {
  QCard,
  QInput,
  QBtn,
  QMenu,
  QSelect,
  QIcon,
} from 'quasar'

import editMixin from '@/utils/mixins/editMixin'
import statusMixin, { mapErrors } from '@/utils/mixins/statusMixin'

import ChangePhoto from '@/authuser/components/Settings/ChangePhoto'
import AddressPicker from '@/maps/components/AddressPicker'
import InfoPopup from '@/utils/components/InfoPopup'
import MarkdownInput from '@/utils/components/MarkdownInput'

export default {
  name: 'GroupEdit',
  components: {
    QCard,
    QInput,
    QBtn,
    QMenu,
    QSelect,
    QIcon,
    AddressPicker,
    MarkdownInput,
    ChangePhoto,
    InfoPopup,
  },
  mixins: [editMixin, statusMixin],
  props: {
    value: {
      type: Object,
      required: false,
      default: () => ({
        name: undefined,
        publicDescription: undefined,
        description: undefined,
        timezone: jstz.determine().name(),
        latitude: undefined,
        longitude: undefined,
        address: undefined,
        applicationQuestions: undefined,
      }),
    },
    timezones: {
      type: Array,
      required: true,
    },
    allGroups: {
      type: Array,
      required: true,
    },
    defaultMapCenter: {
      default: null,
      type: Object,
    },
  },
  emits: [
    'save',
  ],
  setup () {
    return {
      v$: useVuelidate(),
    }
  },
  data () {
    return {
      filteredTimezones: this.timezones,
      show: false,
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
    ...mapErrors({
      name: [
        ['required', 'VALIDATION.REQUIRED'],
        ['minLength', 'VALIDATION.MINLENGTH', { min: 4 }],
        ['maxLength', 'VALIDATION.MAXLENGTH', { max: 81 }],
        ['isUnique', 'VALIDATION.UNIQUE'],
      ],
      timezone: [
        ['required', 'VALIDATION.REQUIRED'],
        ['inList', 'VALIDATION.VALID_TIMEZONE'],
      ],
    }),
    hasAddressError () {
      return !!this.addressError
    },
    addressError () {
      for (const field of ['address', 'latitude', 'longitude']) {
        if (this.hasError(field)) return this.firstError(field)
      }
      return null
    },
    applicationQuestionsOrDefault () {
      return this.edit.applicationQuestions || this.edit.applicationQuestionsDefault
    },
  },
  watch: {
    timezones (val) {
      this.filteredTimezones = val
    },
  },
  methods: {
    maybeSave () {
      this.v$.edit.$touch()
      if (!this.canSave) return
      this.v$.edit.$reset()
      this.save()
    },
    timezoneFilter (terms, update, abort) {
      update(() => {
        const token = terms.toLowerCase()
        this.filteredTimezones = this.timezones.filter(item => item.toLowerCase().includes(token))
      })
    },
    applicationQuestionsInput (value) {
      this.edit.applicationQuestions = value
    },
  },
  validations: {
    edit: {
      name: {
        required,
        minLength: minLength(5),
        maxLength: maxLength(80),
        isUnique (value) {
          if (value === '' || !this.value) return true
          return this.allGroups
            .filter(e => e.id !== this.value.id)
            .findIndex(e => e.name === value) < 0
        },
      },
      timezone: {
        required,
        inList (value) {
          if (value === '') return true
          if (this.timezones) {
            return this.timezones.findIndex(timezone => timezone === value) !== -1
          }
          return true
        },
      },
    },
  },
}
</script>

<style scoped lang="sass">
@import '~editbox'
</style>
