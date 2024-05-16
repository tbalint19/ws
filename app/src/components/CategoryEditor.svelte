<script lang="ts">
  import { getContext } from "svelte"
  import type { AppClient } from "../api/appClient";
  import type { NotificationCTX } from "$lib/components/RequestNotifications/context";
  import { createEventDispatcher } from "svelte";

  type Category = NonNullable<Awaited<ReturnType<typeof client.api.categories.get>>['data']>[0]

  const client = getContext<AppClient>('client')
  const { warn, report, notify } = getContext<NotificationCTX>('notifications')

  export let category: Category | null = null
  export let subcategoryOf: Category | null = null
  export let categoryToMove: Category | null

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
  $: saveDisabled = nameInput.length < 3 || pending || nameInput === category?.name || isSelectedToMove
</script>

<section class={`card card-body gap-4 bg-base-300 ${isSelectedToMove ? 'opacity-50' : 'opacity-100'}`}>
  <div class="flex gap-2">
    <input type="text" placeholder={category ? category.name : "Name"} on:focus={() => nameInput = category ? category.name : ""} class="input input-bordered grow" bind:value={nameInput}>
    <button disabled={saveDisabled} class="btn btn-success" on:click={save}>
      {#if saving}
        <span class="loading loading-dots loading-xs"></span>
      {:else}
        <svg xmlns="http://www.w3.org/2000/svg" width="1.6em" height="1.6em" viewBox="0 0 512 512"><path fill="currentColor" d="M64 48c-8.726 0-16 7.274-16 16v384c0 8.726 7.274 16 16 16h215v-16H64V64h63.375v97.53c0 3.924 3.443 7.095 7.72 7.095h169.81c4.277 0 7.72-3.17 7.72-7.094V64h69.22c.428.318.8.548 1.467 1.094c2.05 1.675 4.962 4.264 8.375 7.406c6.827 6.283 15.65 14.837 24.313 23.5s17.217 17.486 23.5 24.313c3.142 3.413 5.73 6.324 7.406 8.374c.546.668.776 1.04 1.094 1.47V330.25l16 16V128c0-2.68-.657-3.402-1.03-4.156a15 15 0 0 0-1.095-1.844c-.74-1.1-1.575-2.19-2.594-3.438c-2.036-2.492-4.768-5.55-8.03-9.093c-6.524-7.09-15.155-16-23.938-24.782s-17.692-17.414-24.78-23.938c-3.545-3.262-6.6-5.994-9.094-8.03c-1.247-1.02-2.337-1.855-3.438-2.595c-.55-.37-1.09-.72-1.844-1.094c-.754-.373-1.477-1.03-4.156-1.03zm87.72 16h48.56c4.277 0 7.72 4.425 7.72 9.938v70.124c0 5.513-3.443 9.938-7.72 9.938h-48.56c-4.277 0-7.72-4.425-7.72-9.938V73.938c0-5.512 3.443-9.937 7.72-9.937zM114 212c-4.432 0-8 3.568-8 8v184c0 4.432 3.568 8 8 8h165v-28h-76.72l15.345-15.375l128-128L352 234.28l6.375 6.345L406 288.25V220c0-4.432-3.568-8-8-8zm238 47.75L245.75 366H297v128h110V366h51.25zM448 384v64h-23v16h23c8.726 0 16-7.274 16-16v-64z"/></svg>
      {/if}
    </button>
  </div>
  {#if category}
  <div class="flex justify-between">
    <div class="flex gap-2">
      <button disabled={deleting} class="btn btn-error" on:click={del}>
        {#if deleting}
          <span class="loading loading-dots loading-xs"></span>
        {:else}
          <svg xmlns="http://www.w3.org/2000/svg" width="1.6em" height="1.6em" viewBox="0 0 24 24"><path fill="currentColor" d="M7 21q-.825 0-1.412-.587T5 19V6H4V4h5V3h6v1h5v2h-1v13q0 .825-.587 1.413T17 21zm2-4h2V8H9zm4 0h2V8h-2z"/></svg>
        {/if}
      </button>
      <button class="btn btn-neutral" on:click={move} disabled={isSelectedToMove}>
        <svg xmlns="http://www.w3.org/2000/svg" width="1.6em" height="1.6em" viewBox="0 0 24 24"><g fill="none" fill-rule="evenodd"><path d="M24 0v24H0V0zM12.594 23.258l-.012.002l-.071.035l-.02.004l-.014-.004l-.071-.036c-.01-.003-.019 0-.024.006l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427c-.002-.01-.009-.017-.016-.018m.264-.113l-.014.002l-.184.093l-.01.01l-.003.011l.018.43l.005.012l.008.008l.201.092c.012.004.023 0 .029-.008l.004-.014l-.034-.614c-.003-.012-.01-.02-.02-.022m-.715.002a.023.023 0 0 0-.027.006l-.006.014l-.034.614c0 .012.007.02.017.024l.015-.002l.201-.093l.01-.008l.003-.011l.018-.43l-.003-.012l-.01-.01z"/><path fill="currentColor" d="M11.5 9a1 1 0 1 0 0-2H9V5.207C9 3.87 7.384 3.2 6.44 4.147L1.644 8.938a1.5 1.5 0 0 0 0 2.122l4.794 4.793c.945.945 2.56.275 2.56-1.061V13H16a1 1 0 0 0 1-1v-1.587L20.586 14L17 17.586V16a1 1 0 0 0-1-1h-3.5a1 1 0 1 0 0 2H15v1.793c0 1.336 1.615 2.005 2.56 1.06l4.794-4.793a1.5 1.5 0 0 0 0-2.121L17.56 8.146C16.615 7.2 15 7.87 15 9.206V11H8a1 1 0 0 0-1 1v1.586L3.413 10L7 6.414V8a1 1 0 0 0 1 1z"/></g></svg>
      </button>
    </div>
    <button class="btn btn-info" on:click={select}>
      <svg xmlns="http://www.w3.org/2000/svg" width="1.6em" height="1.6em" viewBox="0 0 256 256"><path fill="currentColor" d="m221.66 133.66l-80 80A8 8 0 0 1 128 208v-60.69l-66.34 66.35A8 8 0 0 1 48 208V48a8 8 0 0 1 13.66-5.66L128 108.69V48a8 8 0 0 1 13.66-5.66l80 80a8 8 0 0 1 0 11.32"/></svg>
    </button>
  </div>
  {/if}
</section>