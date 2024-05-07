<script lang="ts">
  import { flip } from 'svelte/animate'
  import { fly } from 'svelte/transition'
  import { getContext } from "svelte";
	import type { NotificationCTX } from "./context";

  const { notifications } = getContext<NotificationCTX>('notifications')
</script>

<section class="fixed bottom-10 right-10 flex flex-col gap-4">
  {#if $notifications}
    {#each $notifications as notification (notification.id)}
    <div animate:flip={{ duration: 300 }}>
      <div transition:fly={{ x: 500, opacity: 0, duration: 300 }}>
        {#if notification.type === "success"}
          <div class="alert alert-success">
            {#if notification.text}
              {notification.text}
            {:else}
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 1024 1024"><path fill="currentColor" d="M512 64a448 448 0 1 1 0 896a448 448 0 0 1 0-896m-55.808 536.384l-99.52-99.584a38.4 38.4 0 1 0-54.336 54.336l126.72 126.72a38.27 38.27 0 0 0 54.336 0l262.4-262.464a38.4 38.4 0 1 0-54.272-54.336z"/></svg>
            {/if}
          </div>
        {:else if notification.type === "error"}
          <div class="alert alert-error flex justify-center items-center px-12">
            {#if notification.text}
              {notification.text}
            {:else}
              <svg xmlns="http://www.w3.org/2000/svg"class="h-8 w-8" viewBox="0 0 20 20"><path fill="currentColor" d="M7.987 4.18a12.213 12.213 0 0 0-.669 2.32h5.364a12.21 12.21 0 0 0-.67-2.32c-.301-.733-.648-1.294-1.008-1.663C10.646 2.149 10.307 2 10 2c-.307 0-.646.149-1.004.517c-.36.37-.707.93-1.009 1.663m-.096-1.899c-.314.426-.59.941-.828 1.518c-.32.78-.58 1.694-.762 2.701H2.804a8.02 8.02 0 0 1 5.087-4.219m4.219 0c.313.426.59.941.827 1.518c.32.78.58 1.694.762 2.701h3.497a8.02 8.02 0 0 0-5.087-4.219M17.602 7.5H13.85c.06.493.104 1.002.128 1.524a5.477 5.477 0 0 1 4.018 1.23a7.994 7.994 0 0 0-.394-2.754m-4.76 0c.071.546.12 1.119.143 1.711a5.514 5.514 0 0 0-3.61 3.289H7.158A19.438 19.438 0 0 1 7 10c0-.875.056-1.715.158-2.5zm-5.524 6h1.773c-.06.324-.091.659-.091 1c0 1.316.462 2.525 1.234 3.471A.987.987 0 0 1 10 18c-.307 0-.646-.149-1.004-.517c-.36-.37-.707-.93-1.009-1.663a12.211 12.211 0 0 1-.669-2.32m.573 4.219A8.02 8.02 0 0 1 2.804 13.5h3.497c.182 1.007.441 1.922.762 2.7c.237.578.514 1.093.828 1.519M2.398 12.5H6.15A20.524 20.524 0 0 1 6 10c0-.866.052-1.705.15-2.5H2.398A7.993 7.993 0 0 0 2 10c0 .873.14 1.713.398 2.5M19 14.5a4.5 4.5 0 1 1-9 0a4.5 4.5 0 0 1 9 0M14.5 12a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 1 0v-2a.5.5 0 0 0-.5-.5m0 5.125a.625.625 0 1 0 0-1.25a.625.625 0 0 0 0 1.25"/></svg>
            {/if}
          </div>
        {:else if notification.type === "info"}
          <div class="alert alert-info">
            {notification.text}
          </div>      
        {/if}
      </div>
    </div>
    {/each}
  {/if}
</section>