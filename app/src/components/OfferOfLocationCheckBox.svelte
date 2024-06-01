<script lang="ts">
	import type { Offer, Location, OfferOfLocation } from "../api/types/output";
  import { getContext, createEventDispatcher } from "svelte"
  import type { AppClient } from "../api/appClient";
  import type { NotificationCTX } from "$lib/components/RequestNotifications/context";

  type Events = {
    add: OfferOfLocation
    remove: OfferOfLocation
  }

  const dispatch = createEventDispatcher<Events>()

  const client = getContext<AppClient>('client')
  const { warn } = getContext<NotificationCTX>('notifications')

  export let offer: Offer
  export let location: Location
  export let related: ({ offer_of_location: OfferOfLocation, location: Location })[]

  $: hasConnection = related.some(e => e.location.id === location.id)
  $: {
    console.log(related)
    console.log(hasConnection)
  }

  let isToggling = false
  const toggle = async () => {
    isToggling = true
    const response = hasConnection ?
      await client.api["offer-of-location"].delete({ offerId: offer.id, locationId: location.id }).catch(() => {}) :
      await client.api["offer-of-location"].post({ offerId: offer.id, locationId: location.id }).catch(() => {})
    isToggling = false

    if (!response || !response.data)
      return warn()

    if (!hasConnection) dispatch('add', response.data)
    else dispatch('remove', response.data)
  }
</script>

<div class="flex justify-between items-center">
  <span>
    { location.name }
  </span>
  <span class="flex items-center gap-2">
    {#if isToggling}
      <span class="loading loading-spinner loading-xs"></span>
    {/if}
    <button class="btn btn-sm btn-outline" on:click={toggle} disabled={isToggling}>
      <svg class={`${hasConnection ? 'opacity-100' : 'opacity-0'}`} xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 12 12"><path fill="currentColor" fill-rule="evenodd" d="M10.78 2.62a.75.75 0 0 1 0 1.06L4.683 9.777a.75.75 0 0 1-1.069-.009L1.211 7.284a.75.75 0 0 1 1.078-1.043l1.873 1.936L9.72 2.62a.75.75 0 0 1 1.06 0" clip-rule="evenodd"/></svg>
    </button>
  </span>
</div>