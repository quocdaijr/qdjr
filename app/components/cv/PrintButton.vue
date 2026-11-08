<template>
  <button type="button" class="link no-print" @click="print">{{ t('cv.print') }}</button>
</template>

<script setup lang="ts">
defineOptions({name: 'CvPrintButton'})

const {t} = useI18n()
const print = () => window.print()
</script>
