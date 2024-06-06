<script lang="ts">
  import { getContext  } from "svelte"
  import type { AppClient } from "../api/appClient";
  import type { NotificationCTX } from "$lib/components/RequestNotifications/context";
  import type { ProductProperty } from "../api/types/output";
  import Button from "./elements/Button.svelte";
  import { createEventDispatcher } from "svelte";

  type Events = {
    save: ProductProperty
    delete: ProductProperty
  }

  const dispatch = createEventDispatcher<Events>()

  export let productId: string
  export let property: ProductProperty | null = null

  const client = getContext<AppClient>('client')
  const { warn, notify } = getContext<NotificationCTX>('notifications')

  let name = property?.name || ""
  let description = property?.description || ""
  let value = property?.value || ""

  let isSaving = false
  const save = async () => {
    isSaving = true
    const response = property ?
      await client.api.properites({ productId })({ id: property.id }).patch({ name, description, value }).catch(() => {}) :
      await client.api.properites({ productId }).post({ name, description, value }).catch(() => {})
    isSaving = false
    if (!response || !response.data)
      return warn()

    dispatch('save', response.data)
    if (property) return 
    name = ""
    description = ""
    value = ""
  }

  let isDeleting = false
  const del = async () => {
    if (!property) return
    isDeleting = true
    const response =
      await client.api.properites({ productId })({ id: property.id }).delete().catch(() => {})
    isDeleting = false
    if (!response || !response.data)
      return warn()

    dispatch('delete', response.data)
  }
</script>

<div class="flex gap-2 card card-body bg-base-200 flex-row">
  <input class="input input-bordered" type="text" bind:value={name} placeholder="Name">
  <input class="input input-bordered grow" type="text" bind:value={description} placeholder="Description">
  <input class="input input-bordered" type="text" bind:value={value} placeholder="Value">
  <Button type="save" loading={isSaving} disabled={isSaving || isDeleting} on:click={save}/>
  <Button type="delete" loading={isDeleting} disabled={isSaving || isDeleting} on:click={del}/>
</div>