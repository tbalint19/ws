<script lang="ts">
  import type { Location, Offer, OfferOfLocation } from "../api/types/output"
  import type { AppClient } from "../api/appClient";
  import type { NotificationCTX } from "$lib/components/RequestNotifications/context";
  import { getContext, onMount, createEventDispatcher } from "svelte"
  import OfferOfLocationCheckBox from "./OfferOfLocationCheckBox.svelte";

  type Events = {
    loadError: null
    save: OfferOfLocation
  }
  const dispatch = createEventDispatcher<Events>()

  export let offer: Offer

  const client = getContext<AppClient>('client')
  const { warn } = getContext<NotificationCTX>('notifications')

  let locations: Location[] = []
  let loadingLocations = false
  const loadLocations = async () => {
    loadingLocations = true
    const response = await client.api.locations.get().catch(() => {})
    loadingLocations = false
    if (!response || !response.data)
      return null

    return response.data
  }

  let related: ({ offer_of_location: OfferOfLocation, location: Location })[] = []
  let loadingRelated = false
  const loadRelatedLocations = async () => {
    loadingRelated = true
    const response = await client.api["offer-of-location"].get({ query: { offerId: offer.id } }).catch(() => {})
    loadingRelated = false
    if (!response || !response.data)
      return null

    return response.data
  }

  const add = (o: OfferOfLocation, l: Location) => related = [ ...related, { offer_of_location: o, location: l } ]
  const remove = (o: OfferOfLocation, l: Location) => related = related.filter(r => offer.id !== o.id && r.location.id !== l.id)

  onMount(async () => {
    const locationsResult = await loadLocations()
    const relatedResult = await loadRelatedLocations()
    if (!locationsResult || !relatedResult) {
      dispatch('loadError')
      return warn()
    }

    locations = locationsResult
    related = relatedResult
  })
</script>

<section class="card card-body bg-base-300 min-w-[250px]">
  <div class="text-center"><span class="font-extrabold text-3xl">{ offer.name }</span></div>
  <div class="divider">Locations</div>
  {#if loadingLocations || loadingRelated}
    <div class="flex justify-center">
      <div class="loading loading-dots loading-lg"></div>
    </div>
  {/if}
  {#each locations as location (location.id)}
    <OfferOfLocationCheckBox
      {offer}
      {location}
      {related}
      on:add={({ detail }) => add(detail, location)}
      on:remove={({ detail }) => remove(detail, location)} />
  {/each}
</section>
