<script lang="ts">
  import type { Bundle, Offer } from "../api/types/output";
  import type { AppClient } from "../api/appClient";
  import type { NotificationCTX } from "$lib/components/RequestNotifications/context";
  import { getContext, onMount } from "svelte"
  import OfferPresenter from "./OfferPresenter.svelte";
  import type { EventBus } from "../stores/eventbus";
  
  export let bundle: Bundle
  export let offerId: string | null
  export let isMoving: boolean

  const client = getContext<AppClient>('client')
  const { warn } = getContext<NotificationCTX>('notifications')
  const { publish, subscribe } = getContext<EventBus>('eventbus')
      
  let offers: Offer[] = []
  let isLoading = false
  const loadOffers = async () => {
    isLoading = true
    const response = await client.api.offers.get({ query: { bundleId: bundle.id } }).catch(() => {})
    isLoading = false
    if (!response || !response.data)
      return warn()

    offers = response.data
  }

  let isBinding = false
  const bindBundleToOffer = async () => {
    if (!offerId) return
    isBinding = true
    const response = await client.api["bundle-of-offer"].post({ offerId, bundleId: bundle.id, amount: 1 }).catch(() => {})
    isBinding = false
    if (!response || !response.data)
      return warn()

    publish("UPDATED_OFFER", response.data)
  }

  onMount(() => {
    loadOffers()
    subscribe("UPDATED_OFFER", bundleOfOffer => {
      if (bundleOfOffer.bundleId === bundle.id)
        loadOffers()
    })
  })
</script>

<div class="card bg-base-300 text-base-content p-4">
  <div class="flex flex-row justify-between items-center">
    <p class="text-2xl font-bold">{ bundle.name } ({ bundle.multiplier }x)</p>
    <button class="btn btn-primary" disabled={isMoving || !offerId || isBinding} on:click={bindBundleToOffer}>
      {#if isBinding}
        <div class="loading loading-dots loading-lg"></div>
      {:else}
        <svg xmlns="http://www.w3.org/2000/svg" width="1.8em" height="1.8em" viewBox="0 0 24 24"><path fill="currentColor" d="m21.41 11.58l-9-9C12.04 2.21 11.53 2 11 2H4a2 2 0 0 0-2 2v7c0 .53.21 1.04.59 1.41l.41.4c.9-.54 1.94-.81 3-.81a6 6 0 0 1 6 6c0 1.06-.28 2.09-.82 3l.4.4c.37.38.89.6 1.42.6s1.04-.21 1.41-.59l7-7c.38-.37.59-.88.59-1.41s-.21-1.04-.59-1.42M5.5 7A1.5 1.5 0 0 1 4 5.5A1.5 1.5 0 0 1 5.5 4A1.5 1.5 0 0 1 7 5.5A1.5 1.5 0 0 1 5.5 7M10 19H7v3H5v-3H2v-2h3v-3h2v3h3z"/></svg>
        <svg xmlns="http://www.w3.org/2000/svg" width="1.6em" height="1.6em" viewBox="0 0 256 256"><path fill="currentColor" d="m221.66 133.66l-80 80A8 8 0 0 1 128 208v-60.69l-66.34 66.35A8 8 0 0 1 48 208V48a8 8 0 0 1 13.66-5.66L128 108.69V48a8 8 0 0 1 13.66-5.66l80 80a8 8 0 0 1 0 11.32"/></svg>
      {/if}
    </button>
  </div>
  <div class="divider font-bold">Offers</div>
  {#if isLoading}
    <div class="flex justify-center py-4">
      <div class="loading loading-dots loading-lg"></div>
    </div>
  {:else}
    <div class="flex flex-col gap-4 py-4">
      {#each offers as offer}
        <OfferPresenter {offer} {bundle} />
      {/each}
    </div>
  {/if}
</div>