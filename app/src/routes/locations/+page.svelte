<script lang="ts">
  import { getContext, onMount } from "svelte"
  import type { AppClient } from "../../api/appClient";
  import type { NotificationCTX } from "$lib/components/RequestNotifications/context";
	import { writable } from "svelte/store";
  import LocationEditor from "../../components/LocationEditor.svelte";

  type Location = NonNullable<Awaited<ReturnType<typeof client.api.locations.get>>['data']>[0]

  const client = getContext<AppClient>('client')
  const { warn } = getContext<NotificationCTX>('notifications')

  const locations = writable<Location[]>([])

  let isLoading = false
  const getLocations = async () => {
    isLoading = true
    const response = await client.api.locations.get().catch(() => {})
    isLoading = false
    if (!response || !response.data)
      return warn()

    $locations = response.data
  }

  const addLocation = (location: Location) => $locations = [ ...$locations, location ]
  const updateLocation = (location: Location) => $locations = $locations.map(l => l.id === location.id ? location : l)
  const deleteLocation = (location: Location) => $locations = $locations.filter(l => l.id !== location.id)

  onMount(getLocations)
</script>

<main class="p-8">
  {#if isLoading}
  <div class="flex justify-center pt-20">
    <div class="loading loading-spinner loading-lg"></div>
  </div>
  {:else}
  <div class="grid grid-cols-3cols gap-4">
    {#each $locations as location (location.id)}
      <LocationEditor
        {location}
        on:save={({ detail }) => updateLocation(detail)}
        on:delete={({ detail }) => deleteLocation(detail)} />
    {/each}
    <LocationEditor
      on:save={({ detail }) => addLocation(detail)} />
  </div>
  {/if}
</main>