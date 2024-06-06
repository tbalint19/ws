<script lang="ts">
	import { onMount } from "svelte";
  import { getContext  } from "svelte"
  import type { AppClient } from "../api/appClient";
  import type { NotificationCTX } from "$lib/components/RequestNotifications/context";
  import type { ProductProperty } from "../api/types/output";
  import PropertyEditor from "./PropertyEditor.svelte";

  const client = getContext<AppClient>('client')
  const { warn, notify } = getContext<NotificationCTX>('notifications')
  
  export let id: string

  let properties: ProductProperty[] = []
  const loadProperties = async () => {
    const response = await client.api.properites({ productId: id }).get().catch(() => {})
    if (!response || !response.data)
      return warn()

    properties = response.data
  }

  const add = (property: ProductProperty) => properties = [ ...properties, property ]
  const update = (property: ProductProperty) => properties = properties.map(p => p.id === property.id ? property : p)
  const del = (property: ProductProperty) => properties = properties.filter(p => p.id !== property.id)

  onMount(() => {
    loadProperties()
  })
</script>

<section>
  <div class="divider">Properties</div>
  {#each properties as property (property.id)}
    <PropertyEditor productId={id} {property} on:save={({ detail }) => update(detail)} on:delete={({ detail }) => del(detail)} />
  {/each}
  <PropertyEditor productId={id} on:save={({ detail }) => add(detail)} />
</section>