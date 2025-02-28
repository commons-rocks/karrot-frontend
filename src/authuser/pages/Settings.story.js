import { action } from '@storybook/addon-actions'
import { storiesOf } from '@storybook/vue3'
import { h } from 'vue'

import Settings from '@/authuser/pages/Settings'

import VerificationWarning from '@/authuser/components/Settings/VerificationWarning'

import * as factories from '>/enrichedFactories'
import { createDatastore, statusMocks, storybookDefaults as defaults } from '>/helpers'
import { currentUserMock, groupsMock } from '>/mockdata'

const datastore = createDatastore({
  auth: {
    getters: {
      user: () => currentUserMock,
      saveStatus: () => statusMocks.default(),
      changeEmailStatus: () => statusMocks.default(),
      changePasswordStatus: () => statusMocks.default(),
      failedEmailDeliveries: () => [],
    },
    actions: {
      update: action('update'),
      changePassword: action('changePassword'),
      changeEmail: action('changeEmail'),
    },
    modules: {
      push: {
        namespaced: true,
        getters: {
          enabled: () => false,
          pending: () => false,
        },
      },
    },
  },
  currentGroup: {
    getters: {
      value: () => groupsMock[0],
      getNotificationTypeStatus: () => () => ({}),
    },
  },
  groups: {
    getters: {
      mineWithApplications: () => groupsMock,
    },
  },
  users: {
    getters: {
      resendVerificationCodeStatus: () => statusMocks.default(),
      requestDeleteAccountStatus: () => statusMocks.default(),
      resendVerificationCodeSuccess: () => false,
    },
    actions: {
      resendVerification: action('resend'),
    },
  },
  unsubscribe: {
    getters: {
      allEmailsPerGroupStatus: () => statusMocks.default(),
    },
  },
  i18n: {
    getters: {
      locale: () => 'en',
    },
  },
  pwa: {
    getters: {
      installPrompt: () => ({}),
    },
  },
  geo: {
    getters: {
      defaultCenter: () => null,
    },
  },
})

const user = factories.makeCurrentUser({ mailVerified: false })
const verificationWarningDatastore = createDatastore({
  auth: {
    getters: {
      user: () => user,
      failedEmailDeliveries: () => [],
    },
  },
  users: {
    getters: {
      resendVerificationCodeStatus: () => statusMocks.default(),
      resendVerificationCodeSuccess: () => false,
    },
  },
})

const failedEmailDeliveriesDatastore = createDatastore({
  auth: {
    getters: {
      user: () => factories.makeCurrentUser({ mailVerified: true }),
      failedEmailDeliveries: () => [{
        subject: 'Your verification code',
        event: '550',
        reason: 'Unknown address',
        createdAt: new Date(),
      }],
    },
  },
  users: {
    getters: {
      resendVerificationCodeStatus: () => statusMocks.default(),
      resendVerificationCodeSuccess: () => false,
    },
  },
})

const unverifiedAndfailedEmailDeliveriesDatastore = createDatastore({
  auth: {
    getters: {
      user: () => factories.makeCurrentUser({ mailVerified: false }),
      failedEmailDeliveries: () => [{
        subject: 'Your verification code',
        event: '550',
        reason: 'Unknown address',
        createdAt: new Date(),
      },
      {
        subject: 'Your verification code again',
        event: '550',
        reason: 'Unknown address',
        createdAt: new Date(),
      }],
    },
  },
  users: {
    getters: {
      resendVerificationCodeStatus: () => statusMocks.default(),
      resendVerificationCodeSuccess: () => false,
    },
  },
})

storiesOf('Settings Page', module)
  .add('Default', () => defaults({
    render () {
      return h(Settings)
    },
    store: datastore,
  }))
  .add('verification warning', () => defaults({
    render () {
      return h(VerificationWarning)
    },
    store: verificationWarningDatastore,
  }))
  .add('failed email deliveries', () => defaults({
    render () {
      return h(VerificationWarning)
    },
    store: failedEmailDeliveriesDatastore,
  }))
  .add('verification warning and failed email deliveries', () => defaults({
    render () {
      return h(VerificationWarning)
    },
    store: unverifiedAndfailedEmailDeliveriesDatastore,
  }))
