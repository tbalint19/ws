<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import { fly } from 'svelte/transition'
  import { fade } from 'svelte/transition'
  import { createEventDispatcher } from 'svelte'
  const dispatch = createEventDispatcher()

  const emitClickOut = () => dispatch('clickOut')

  onMount(() => (document.body.style['overflow'] = 'hidden'))
  onDestroy(() => (document.body.style['overflow'] = 'auto'))
</script>

<div class="fixed inset-0 z-40">
  <div class="relative flex h-screen w-full justify-end items-stretch">
    <div
      transition:fly={{ x: 500, opacity: 0, duration: 500 }}
      class="relative z-50 inline p-4 bg-base-300"
    >
      <slot />
    </div>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div
      transition:fade={{ duration: 200 }}
      class="absolute left-0 top-0 h-full w-screen bg-base-100 opacity-70"
      on:click={emitClickOut}
    />
  </div>
</div>
