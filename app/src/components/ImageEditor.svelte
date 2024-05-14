<script lang="ts">
  import { getContext } from "svelte"
  import { type AppClient } from "../api/appClient";
  import { type NotificationCTX } from "$lib/components/RequestNotifications/context";
  import { createEventDispatcher } from "svelte";
	import Modal from "$lib/components/Modal.svelte";

  type Metadata = NonNullable<Awaited<ReturnType<typeof http.api.files.get>>['data']>[0]

  const http = getContext<AppClient>('client')
  const notifications = getContext<NotificationCTX>('notifications')

  const dispatchUpdate = createEventDispatcher<{ update: Metadata }>()
  const dispatchDelete = createEventDispatcher<{ delete: { id: string }}>()
  
  export let metadata: Metadata

  let isUpdating = false
  const update = async () => {
    isUpdating = true
    const response = await http.api.files({ id: metadata.id }).patch({ name }).catch(notifications.warn)
    isUpdating = false
    if (!response || !response.data)
      return

    dispatchUpdate('update', response.data)
    name = ""
  }

  let isDeleting = false
  const deleteImage = async () => {
    isDeleting = true
    const response = await http.api.files({ id: metadata.id }).delete().catch(notifications.warn)
    isDeleting = false
    if (!response || !response.data)
      return
    
    dispatchDelete('delete', response.data)
    deleteOpen = false
  }
  
  let name = ""

  let deleteOpen = false

</script>

<div class="card card-body justify-between gap-6 bg-secondary text-secondary-content">
  <img src={metadata.url} alt={metadata.name}>
  <div class="flex gap-2">
    <button disabled={isDeleting} class="btn btn-error" on:click={() => deleteOpen = true}>
      <svg xmlns="http://www.w3.org/2000/svg" width="1.6em" height="1.6em" viewBox="0 0 24 24"><path fill="currentColor" d="M7 21q-.825 0-1.412-.587T5 19V6H4V4h5V3h6v1h5v2h-1v13q0 .825-.587 1.413T17 21zm2-4h2V8H9zm4 0h2V8h-2z"/></svg>
    </button>
    <input
      disabled={isUpdating && isDeleting}
      type="text"
      class="input input-bordered grow"
      placeholder={metadata.name}
      bind:value={name}
      on:focus={() => name = metadata.name}>
    <button disabled={isUpdating || isDeleting} class="btn btn-success" on:click={update}>
      {#if !isUpdating}
        <svg xmlns="http://www.w3.org/2000/svg" width="1.6em" height="1.6em" viewBox="0 0 512 512"><path fill="currentColor" d="M64 48c-8.726 0-16 7.274-16 16v384c0 8.726 7.274 16 16 16h215v-16H64V64h63.375v97.53c0 3.924 3.443 7.095 7.72 7.095h169.81c4.277 0 7.72-3.17 7.72-7.094V64h69.22c.428.318.8.548 1.467 1.094c2.05 1.675 4.962 4.264 8.375 7.406c6.827 6.283 15.65 14.837 24.313 23.5s17.217 17.486 23.5 24.313c3.142 3.413 5.73 6.324 7.406 8.374c.546.668.776 1.04 1.094 1.47V330.25l16 16V128c0-2.68-.657-3.402-1.03-4.156a15 15 0 0 0-1.095-1.844c-.74-1.1-1.575-2.19-2.594-3.438c-2.036-2.492-4.768-5.55-8.03-9.093c-6.524-7.09-15.155-16-23.938-24.782s-17.692-17.414-24.78-23.938c-3.545-3.262-6.6-5.994-9.094-8.03c-1.247-1.02-2.337-1.855-3.438-2.595c-.55-.37-1.09-.72-1.844-1.094c-.754-.373-1.477-1.03-4.156-1.03zm87.72 16h48.56c4.277 0 7.72 4.425 7.72 9.938v70.124c0 5.513-3.443 9.938-7.72 9.938h-48.56c-4.277 0-7.72-4.425-7.72-9.938V73.938c0-5.512 3.443-9.937 7.72-9.937zM114 212c-4.432 0-8 3.568-8 8v184c0 4.432 3.568 8 8 8h165v-28h-76.72l15.345-15.375l128-128L352 234.28l6.375 6.345L406 288.25V220c0-4.432-3.568-8-8-8zm238 47.75L245.75 366H297v128h110V366h51.25zM448 384v64h-23v16h23c8.726 0 16-7.274 16-16v-64z"/></svg>
      {:else}
        <div class="loading loading-dots"></div>
      {/if}
    </button>
  </div>
</div>

{#if deleteOpen}
<Modal on:clickOut={() => deleteOpen = false}>
  <div class="card card-body bg-base-300 text-base-content">
    <h1>Are you sure you want to delete?</h1>
    <div class="flex gap-2">
      <button class="btn btn-error grow" disabled={isDeleting} on:click={deleteImage}>
        {#if !isDeleting}
          Yes, DELETE
        {:else}
          <div class="loading loading-dots"></div>
        {/if}
      </button>
      <button disabled={isDeleting} class="btn btn-success grow" on:click={() => deleteOpen = false}>No</button>
    </div>
  </div>
</Modal>
{/if}