<script lang="ts">
  import { getContext, createEventDispatcher } from "svelte"
  import type { AppClient } from "../api/appClient";
  import type { NotificationCTX } from "$lib/components/RequestNotifications/context";
  import Button from "./elements/Button.svelte";

  type Location = NonNullable<Awaited<ReturnType<typeof client.api.locations.get>>['data']>[0]

  export let location: Location | null = null

  const client = getContext<AppClient>('client')
  const { warn } = getContext<NotificationCTX>('notifications')

  let nameInput = location?.name || ""
  let googleUrlInput = location?.googleMapUrl || ""

  const dispatchSave = createEventDispatcher<{ save: Location }>()
  const dispatchDelete = createEventDispatcher<{ delete: Location }>()

  let saving = false
  const save = async () => {
    saving = true
    const response = location ?
      await client.api.locations({ id: location.id }).patch({
        name: nameInput,
        googleMapUrl: googleUrlInput
      }) :
      await client.api.locations.post({
        name: nameInput,
        googleMapUrl: googleUrlInput
      })
    saving = false
    if (!response || !response.data)
      return
    if (response.error)
      return warn()

    if (!location) {
      nameInput = ""
      googleUrlInput = ""
    }
    dispatchSave('save', response.data)
  }

  let deleting = false
  const del = async () => {
    if (!location) return
    deleting = true
    const response = await client.api.locations({ id: location.id }).delete()
    deleting = false
    if (!response || !response.data)
      return
    if (response.error)
      return warn()

    dispatchDelete('delete', response.data)
  }

  $: googleUrlInput && (() => {
    if (googleUrlInput.startsWith(`<iframe`)) {
      googleUrlInput = googleUrlInput.split(`src="`)[1].split(`"`)[0]
    }
  })()

  $: saveDisabled = (nameInput === location?.name && googleUrlInput === location?.googleMapUrl) ||
    nameInput.length < 3 || saving || deleting
</script>

<section class="card bg-base-300 text-base-content">
  <div class="card-body">
    <input
      class="input input-bordered"
      type="text"
      placeholder={location ? location.name : "Name" }
      bind:value={nameInput}>
    <input
      class="input input-bordered"
      type="text"
      placeholder={location ? location.googleMapUrl : "Google map url"}
      bind:value={googleUrlInput}>
    {#if location?.googleMapUrl || googleUrlInput}
    <div class="h-[250px] my-4 shadow-lg">
      <iframe
        title={location?.name || nameInput}
        src={location?.googleMapUrl || googleUrlInput}
        width="100%"
        height="100%"
        style="border:0;border-radius:1rem;"
        allowfullscreen
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade">
      </iframe>
    </div>
    {:else}
    <div class="h-[250px] flex justify-center items-center p-8 m-auto opacity-25 my-4">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-full" viewBox="0 0 48 48"><defs><mask id="ipSDamageMap0"><g fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="4"><path fill="#fff" stroke="#fff" d="M5 10v28a2 2 0 0 0 2 2h11l-3-11l7-2l-1-7l8-4l-2-3l3-5H7a2 2 0 0 0-2 2m38 28V10a2 2 0 0 0-2-2h-3l-4 6l3 5l-9 4l1 8l-7 2l2 7h17a2 2 0 0 0 2-2"/><path fill="#000" fill-rule="evenodd" stroke="#000" d="M14.5 18a1.5 1.5 0 1 0 0-3a1.5 1.5 0 0 0 0 3" clip-rule="evenodd"/></g></mask></defs><path fill="currentColor" d="M0 0h48v48H0z" mask="url(#ipSDamageMap0)"/></svg>
    </div>
    {/if}

    <div class="card-actions justify-between">
      <Button disabled={deleting} on:click={del} loading={deleting} type="delete" />
      <Button disabled={saveDisabled} on:click={save} loading={saving} type="save" />
    </div>
  </div>
</section>