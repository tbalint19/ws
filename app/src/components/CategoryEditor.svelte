<script lang="ts">
  import { getContext } from "svelte"
  import type { AppClient } from "../api/appClient";
  import type { NotificationCTX } from "$lib/components/RequestNotifications/context";
  import { createEventDispatcher } from "svelte";
  import Button from "./elements/Button.svelte";

  type Category = NonNullable<Awaited<ReturnType<typeof client.api.categories.get>>['data']>[0]

  const client = getContext<AppClient>('client')
  const { warn, report, notify } = getContext<NotificationCTX>('notifications')

  export let category: Category | null = null
  export let subcategoryOf: Category | null = null
  export let categoryToMove: Category | null
  export let moveDisabled = false

  let nameInput = ""
  let saving = false
  let deleting = false

  const dispatchSave = createEventDispatcher<{ save: Category }>()
  const dispatchDelete = createEventDispatcher<{ delete: Category }>()
  const dispatchSelect = createEventDispatcher<{ select: Category }>()
  const dispatchMove = createEventDispatcher<{ move: Category}>()

  const save = async () => {
    saving = true
    const response = category ?
      await client.api.categories({ id: category.id }).patch({
        name: nameInput,
      }).catch(() => {}) :
      await client.api.categories.post({
        name: nameInput,
        subcategoryOf: subcategoryOf?.id || undefined
      }).catch(() => {})
    saving = false
    if (!response || !response.data)
      return warn()
    
    nameInput = ""
    dispatchSave('save', response.data)
  }

  const del = async () => {
    if (!category) return
    deleting = true
    const response = await client.api.categories({ id: category.id }).delete().catch(() => {})
    deleting = false
    if (!response || !response.data)
      return notify({ type: "error", text: "Could not delete" })

    dispatchDelete('delete', response.data)
  }

  const select = () => {
    if (!category) return
    dispatchSelect('select', category)
  }
  
  const move = () => {
    if (!category) return
    dispatchMove('move', category)
  }

  $: pending = saving || deleting
  $: isSelectedToMove = categoryToMove && categoryToMove.id === category?.id
  $: saveDisabled = !!(nameInput.length < 3 || pending || nameInput === category?.name || isSelectedToMove)
</script>

<section class={`card card-body gap-4 bg-base-300 ${isSelectedToMove ? 'opacity-50' : 'opacity-100'}`}>
  <div class="flex gap-2">
    <input type="text" placeholder={category ? category.name : "Name"} on:focus={() => nameInput = category ? category.name : ""} class="input input-bordered grow" bind:value={nameInput}>
    <Button on:click={save} disabled={saveDisabled} loading={saving} type="save" />
  </div>
  {#if category}
  <div class="flex justify-between">
    <div class="flex gap-2">
      <Button disabled={deleting} on:click={del} loading={deleting} type="delete" />
      <button class="btn btn-neutral" on:click={move} disabled={isSelectedToMove}>
        <svg xmlns="http://www.w3.org/2000/svg" width="1.6em" height="1.6em" viewBox="0 0 24 24"><g fill="none" fill-rule="evenodd"><path d="M24 0v24H0V0zM12.594 23.258l-.012.002l-.071.035l-.02.004l-.014-.004l-.071-.036c-.01-.003-.019 0-.024.006l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427c-.002-.01-.009-.017-.016-.018m.264-.113l-.014.002l-.184.093l-.01.01l-.003.011l.018.43l.005.012l.008.008l.201.092c.012.004.023 0 .029-.008l.004-.014l-.034-.614c-.003-.012-.01-.02-.02-.022m-.715.002a.023.023 0 0 0-.027.006l-.006.014l-.034.614c0 .012.007.02.017.024l.015-.002l.201-.093l.01-.008l.003-.011l.018-.43l-.003-.012l-.01-.01z"/><path fill="currentColor" d="M11.5 9a1 1 0 1 0 0-2H9V5.207C9 3.87 7.384 3.2 6.44 4.147L1.644 8.938a1.5 1.5 0 0 0 0 2.122l4.794 4.793c.945.945 2.56.275 2.56-1.061V13H16a1 1 0 0 0 1-1v-1.587L20.586 14L17 17.586V16a1 1 0 0 0-1-1h-3.5a1 1 0 1 0 0 2H15v1.793c0 1.336 1.615 2.005 2.56 1.06l4.794-4.793a1.5 1.5 0 0 0 0-2.121L17.56 8.146C16.615 7.2 15 7.87 15 9.206V11H8a1 1 0 0 0-1 1v1.586L3.413 10L7 6.414V8a1 1 0 0 0 1 1z"/></g></svg>
      </button>
    </div>
    <button class="btn btn-info" disabled={isSelectedToMove || moveDisabled} on:click={select}>
      <svg xmlns="http://www.w3.org/2000/svg" width="1.6em" height="1.6em" viewBox="0 0 256 256"><path fill="currentColor" d="m221.66 133.66l-80 80A8 8 0 0 1 128 208v-60.69l-66.34 66.35A8 8 0 0 1 48 208V48a8 8 0 0 1 13.66-5.66L128 108.69V48a8 8 0 0 1 13.66-5.66l80 80a8 8 0 0 1 0 11.32"/></svg>
    </button>
  </div>
  {/if}
</section>