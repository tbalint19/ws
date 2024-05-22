<script lang="ts">
  import { getContext,  } from "svelte"
  import type { AppClient } from "../api/appClient";
  import Button from "./elements/Button.svelte";
  import type { NotificationCTX } from "$lib/components/RequestNotifications/context";
  import { createEventDispatcher } from "svelte";

  type Product = NonNullable<Awaited<ReturnType<typeof client.api.products.post>>['data']>
  type Bundle = NonNullable<Awaited<ReturnType<ReturnType<typeof client.api.bundles>['get']>>['data']>[0]

  const client = getContext<AppClient>('client')
  const { warn } = getContext<NotificationCTX>('notifications')

  export let bundle: Bundle | null = null
  export let productId: string

  let nameInput = bundle?.name || ""
  let multiplierInput = bundle?.multiplier || 0

  const dispatchSave = createEventDispatcher<{ save: Bundle }>()
  let saving = false
  const save = async () => {
    saving = true
    const response = bundle ?
      await client.api.bundles({ productId })({ id: bundle.id }).patch({
        name: nameInput,
        multiplier: multiplierInput
      }).catch(() => {}) :
      await client.api.bundles({ productId }).post({
        name: nameInput,
        multiplier: multiplierInput
      }).catch(() => {})
    saving = false
    if (!response || !response.data)
      return warn()

    dispatchSave('save', response.data)
    if (!bundle) {
      nameInput = ""
      multiplierInput = 0
    }
  }

  const dispatchDelete = createEventDispatcher<{ delete: Bundle }>()
  let deleting = false
  const del = async () => {
    if (!bundle) return
    deleting = true
    const response = await client.api.bundles({ productId })({ id: bundle.id }).delete().catch(() => {})
    deleting = false
    if (!response || !response.data)
      return warn()

    dispatchDelete('delete', response.data)
  }

  $: saveDisabled = (nameInput === bundle?.name && multiplierInput === bundle?.multiplier) ||
    nameInput.length < 1 || multiplierInput <= 0 || saving || deleting

  $: deleteDisabled = !bundle || deleting || saving
</script>

<section class="card p-4 bg-base-300 text-base-content flex-row gap-2">
  <input type="text" class="input input-bordered grow" placeholder="Name" bind:value={nameInput}>
  <input type="number" class="input input-bordered" placeholder="Multiplier" bind:value={multiplierInput}>
  <Button disabled={deleteDisabled} loading={deleting} on:click={del} type="delete" />
  <Button disabled={saveDisabled} loading={saving} on:click={save} type="save" />
</section>