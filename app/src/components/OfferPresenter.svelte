<script lang="ts">
	import type { Offer } from "../api/types/output";
  import type { AppClient } from "../api/appClient";
  import type { NotificationCTX } from "$lib/components/RequestNotifications/context";
  import { getContext, onMount } from "svelte"
  import type { Bundle, Product, BundleOfOffer } from "../api/types/output";
  import type { EventBus } from "../stores/eventbus";
  import BundleOfOfferEditor from "./BundleOfOfferEditor.svelte";
	import { writable } from "svelte/store";
  import { slide } from "svelte/transition";

  const client = getContext<AppClient>('client')
  const { warn } = getContext<NotificationCTX>('notifications')
  const { publish, subscribe } = getContext<EventBus>('eventbus')

  export let offer: Offer
  export let bundle: Bundle
  
  let rows: ({ bundle: Bundle, product: Product, bundleOfOffer: BundleOfOffer })[] = []
  let isLoading = false
  export const loadBundles = async () => {
    isLoading = true 
    const respone = await client.api["bundle-of-offer"].get({ query: { offerId: offer.id } }).catch(() => {})
    isLoading = false
    if (!respone || !respone.data)
      return warn()

    rows = respone.data
  }

  const isOpen = writable(false)
  isOpen.subscribe(value => {
    if (value)
      rows = []
      loadBundles()
  })

  const toggle = () => {
    if (!$isOpen)
      publish("OPEN_OFFER", { offer, bundle })
    else
      $isOpen = false
  }

  onMount(() => {
    subscribe("UPDATED_OFFER", bundleOfOffer => {
      if (bundleOfOffer.offerId === offer.id && $isOpen)
        loadBundles()
    })
    subscribe("OPEN_OFFER", opened => {
      $isOpen = offer.id === opened.offer.id && bundle.id === opened.bundle.id
    })
    subscribe("BUNDLE_OF_OFFER_AMOUNT_PATCHED", value => {
      rows = rows.map(r => r.bundleOfOffer.id === value.id ? { ...r, bundleOfOffer: value } : r)
    })
    subscribe("BUNDLE_OF_OFFER_AMOUNT_DELETED", value => {
      rows = rows.filter(r => r.bundleOfOffer.id !== value.id)
    })
  })
</script>

<div class="card bg-primary text-primary-content p-4">
  <div class="flex justify-between items-center">
    <p class="text-2xl font-bold">{ offer.name } ({ offer.price })</p>
    <div class="flex">
      <button class="btn btn-outline" on:click={() => publish("EDIT_OFFER" ,offer)}>
        <svg xmlns="http://www.w3.org/2000/svg" width="1.8em" height="1.8em" viewBox="0 0 32 32"><path fill="currentColor" d="M27.87 7.863L23.024 4.82l-7.89 12.566l4.843 3.04zM14.395 21.25l-.107 2.855l2.527-1.337l2.35-1.24l-4.673-2.936zM29.163 3.24L26.63 1.647a1.364 1.364 0 0 0-1.88.43l-1 1.588l4.843 3.042l1-1.586c.4-.64.21-1.483-.43-1.883zm-3.965 23.82c0 .275-.225.5-.5.5h-19a.5.5 0 0 1-.5-.5v-19a.5.5 0 0 1 .5-.5h13.244l1.884-3H5.698c-1.93 0-3.5 1.57-3.5 3.5v19c0 1.93 1.57 3.5 3.5 3.5h19c1.93 0 3.5-1.57 3.5-3.5V11.097l-3 4.776v11.19z"/></svg>
      </button>
      <div class="divider divider-horizontal"></div>
      <button class="btn btn-outline" on:click={toggle}>
        <svg class={`${$isOpen ? "" : "rotate-180"} transition-all`} xmlns="http://www.w3.org/2000/svg" width="1.8em" height="1.8em" viewBox="0 0 24 24"><g fill="none" fill-rule="evenodd"><path d="M24 0v24H0V0zM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427c-.002-.01-.009-.017-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093c.012.004.023 0 .029-.008l.004-.014l-.034-.614c-.003-.012-.01-.02-.02-.022m-.715.002a.023.023 0 0 0-.027.006l-.006.014l-.034.614c0 .012.007.02.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z"/><path fill="currentColor" d="M10.94 7.94a1.5 1.5 0 0 1 2.12 0l5.658 5.656a1.5 1.5 0 1 1-2.122 2.121L12 11.122l-4.596 4.596a1.5 1.5 0 1 1-2.122-2.12z"/></g></svg>
      </button>
    </div>
  </div>
  {#if $isOpen}
    <div transition:slide>
      <div class="divider">Products</div>
      <div>
        {#if isLoading}
          <div class="flex justify-center py-2">
            <div class="loading loading-dots loading-lg"></div>
          </div>
        {:else}
          <div class="flex flex-col gap-2">
            {#each rows as row (row.bundle.id)}
              <BundleOfOfferEditor {bundle} {row} />
            {/each}
          </div>
          {/if}
      </div>
    </div>
  {/if}
</div>
