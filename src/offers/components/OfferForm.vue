<template>
  <KFormContainer>
    <KSpinner v-if="fetching" />
    <div
      v-else
      class="edit-box"
      :class="{ changed: hasChanged }"
    >
      <form @submit.prevent="maybeSave">
        <QInput
          v-model="edit.name"
          :label="$t('OFFER.NAME')"
          :hint="$t('OFFER.NAME_HELPER')"
          v-bind="nameError"
          :autofocus="!$q.platform.has.touch"
          autocomplete="off"
          @blur="v$.edit.name.$touch"
        >
          <template #before>
            <QIcon name="fas fa-fw fa-star" />
          </template>
        </QInput>

        <MarkdownInput
          v-model="edit.description"
          icon="fas fa-fw fa-address-card"
          :label="$t('OFFER.DESCRIPTION')"
          v-bind="descriptionError"
          @keyup.ctrl.enter="maybeSave"
        />

        <QField v-bind="imagesError">
          <template #before>
            <QIcon name="fas fa-fw fa-star" />
          </template>
          <template #control>
            <MultiCroppa v-model="edit.images" />
          </template>
        </QField>

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
  </KFormContainer>
</template>

<script>
import useVuelidate from '@vuelidate/core'
import { maxLength, minLength, required } from '@vuelidate/validators'
import { QBtn, QField, QIcon, QInput } from 'quasar'

import editMixin from '@/utils/mixins/editMixin'
import statusMixin, { mapErrors } from '@/utils/mixins/statusMixin'

import KFormContainer from '@/base/components/KFormContainer'
import KSpinner from '@/utils/components/KSpinner'
import MarkdownInput from '@/utils/components/MarkdownInput'
import MultiCroppa from '@/utils/components/MultiCroppa'

const NAME_MIN_LENGTH = 5
const NAME_MAX_LENGTH = 80

export default {
  components: {
    MarkdownInput,
    MultiCroppa,
    KFormContainer,
    QBtn,
    QField,
    QInput,
    QIcon,
    KSpinner,
  },
  mixins: [editMixin, statusMixin],
  props: {
    value: {
      type: Object,
      required: false,
      default: () => ({
        name: undefined,
        description: undefined,
        status: 'active',
        images: [],
      }),
    },
    fetching: {
      type: Boolean,
      default: false,
    },
  },
  setup () {
    return {
      v$: useVuelidate(),
    }
  },
  computed: {
    canSave () {
      if (this.v$.edit.$error) {
        return false
      }
      return this.isNew || this.hasChanged
    },
    ...mapErrors({
      name: [
        ['required', 'VALIDATION.REQUIRED'],
        ['minLength', 'VALIDATION.MINLENGTH', { min: NAME_MIN_LENGTH - 1 }],
        ['maxLength', 'VALIDATION.MAXLENGTH', { max: NAME_MAX_LENGTH + 1 }],
      ],
      description: [
        ['required', 'VALIDATION.REQUIRED'],
      ],
      images: [
        ['required', 'VALIDATION.IMAGE_REQUIRED'],
      ],
    }),
  },
  methods: {
    maybeSave () {
      this.v$.edit.$touch()
      if (!this.canSave) return
      this.v$.edit.$reset()
      this.save()
    },
  },
  validations: {
    edit: {
      name: {
        required,
        minLength: minLength(NAME_MIN_LENGTH),
        maxLength: maxLength(NAME_MAX_LENGTH),
      },
      description: {
        required,
      },
    },
  },
}
</script>

<style scoped lang="sass">
@import '~editbox'
</style>
