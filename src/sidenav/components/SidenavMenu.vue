<template>
  <QList dense>
    <QItem
      v-for="{ label, icon, to, handler, badge, info } in entries"
      :key="label"
      :to="to"
      clickable
      @click="handler && handler()"
    >
      <QItemSection
        side
        class="text-center"
      >
        <QIcon
          :name="icon"
          size="1.1em"
        />
      </QItemSection>
      <QItemSection>
        {{ label }}
      </QItemSection>
      <QItemSection
        v-if="info"
        side
      >
        <InfoPopup
          :tooltip="info.title"
          :title="info.title"
          :description="info.description"
          :info-link="{ text: info.link.text, href: info.link.href }"
        />
      </QItemSection>
      <QItemSection
        v-if="badge && badge.count > 0"
        side
      >
        <QBadge
          :color="badge.color"
          :text-color="badge.textColor"
          :title="badge.title"
        >
          {{ badge.count }}
        </QBadge>
      </QItemSection>
    </QItem>
  </QList>
</template>

<script>
import {
  QList,
  QItem,
  QItemSection,
  QIcon,
  QBadge,
} from 'quasar'

import InfoPopup from '@/utils/components/InfoPopup'

export default {
  components: {
    InfoPopup,
    QList,
    QItem,
    QItemSection,
    QIcon,
    QBadge,
  },
  props: {
    entries: {
      type: Array,
      default: () => [],
    },
  },
}
</script>
