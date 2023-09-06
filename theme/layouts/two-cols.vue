<script setup lang="ts">
import { computed } from 'vue'
import { handleBackground } from '../utils/layoutHelper'
const props = defineProps({
  background: {
    default: '',
  },
  class: {
    type: String,
  },
  layoutClass: {
    type: String,
  },
})

const style = computed(() => handleBackground(props.background, true))
</script>

<template>
  <div class="bg-main slidev-layout default two-columns w-full h-full grid grid-cols-2 grid-rows-[fit-content(100%)]" :style="style">
    <div class="col-span-2 h-fit"><slot name="top"/></div>
    <div class="col-left" :class="props.class">
      <slot />
    </div>
    <div class="col-right" :class="props.class">
      <slot name="right" />
    </div>
  </div>
</template>