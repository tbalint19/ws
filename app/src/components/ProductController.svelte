<script lang="ts">
  import Button from "./elements/Button.svelte";
  import { getContext, onMount } from "svelte"
  import type { AppClient } from "../api/appClient";
  import type { NotificationCTX } from "$lib/components/RequestNotifications/context";
  import { goto } from "$app/navigation";
  import { createEventDispatcher } from "svelte";
  import Modal from "$lib/components/Modal.svelte";
  import { slide } from "svelte/transition";
  import BundlePresenter from "./BundlePresenter.svelte";

  type Product = NonNullable<Awaited<ReturnType<typeof client.api.products.get>>['data']>[0]
  type Bundle = NonNullable<Awaited<ReturnType<ReturnType<typeof client.api.bundles>['get']>>['data']>[0]

  const client = getContext<AppClient>('client')
  const { warn } = getContext<NotificationCTX>('notifications')

  const dispatchSelectToMove = createEventDispatcher<{ selectToMove: Product }>()
  const dispatchSelectToCopy = createEventDispatcher<{ selectToCopy: Product }>()
  const dispatchDelete = createEventDispatcher<{ delete: Product }>()

  export let product: Product
  export let isMoving: boolean
  export let copyDisabled: boolean
  export let moveDisabled: boolean
  export let offerId: string | null = null

  let detailsOpen = false
  let deleteOpen = false

  let confirmText = ""

  let deleting = false
  $: deletingDisabled = deleting || !!(product.name && confirmText !== product.name)
  const deleteProduct = async () => {
    deleting = true
    const response = await client.api.products({ id: product.id }).delete().catch(() => {})
    deleting = false
    if (!response || !response.data)
      return warn()
    
    dispatchDelete('delete', response.data)
  }

  let bundles: Bundle[] = []
  let loadingBundles = false
  const loadBundles = async () => {
    loadingBundles = true
    const response = await client.api.bundles({ productId: product.id }).get().catch(() => {})
    loadingBundles = false
    if (!response || !response.data)
      return warn()

    bundles = response.data
  }

  onMount(() => {
    loadBundles()
  })
</script>

<div class="card bg-base-200 text-base-content p-4">
  <div class="flex flex-row justify-between items-center">
    <div class="flex items-center">
      <button class="btn btn-outline" on:click={() => detailsOpen = !detailsOpen}>
        <svg class={`${detailsOpen ? "" : "rotate-180"} transition-all`} xmlns="http://www.w3.org/2000/svg" width="1.8em" height="1.8em" viewBox="0 0 24 24"><g fill="none" fill-rule="evenodd"><path d="M24 0v24H0V0zM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427c-.002-.01-.009-.017-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093c.012.004.023 0 .029-.008l.004-.014l-.034-.614c-.003-.012-.01-.02-.02-.022m-.715.002a.023.023 0 0 0-.027.006l-.006.014l-.034.614c0 .012.007.02.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z"/><path fill="currentColor" d="M10.94 7.94a1.5 1.5 0 0 1 2.12 0l5.658 5.656a1.5 1.5 0 1 1-2.122 2.121L12 11.122l-4.596 4.596a1.5 1.5 0 1 1-2.122-2.12z"/></g></svg>
      </button>
      <div class="divider divider-horizontal"></div>
      <p class="text-2xl font-bold">{ product.name }</p>
    </div>
    <div class="flex items-center">
      <Button type="delete" on:click={() => deleteOpen = true} />
      <div class="divider divider-horizontal"></div>
      <button class="btn btn-neutral mr-4" disabled={moveDisabled} on:click={() => dispatchSelectToMove('selectToMove', product)}>
        {#if isMoving}
        <span class="loading loading-dots loading-xs"></span>
        {:else}
        <svg xmlns="http://www.w3.org/2000/svg" width="1.6em" height="1.6em" viewBox="0 0 24 24"><g fill="none" fill-rule="evenodd"><path d="M24 0v24H0V0zM12.594 23.258l-.012.002l-.071.035l-.02.004l-.014-.004l-.071-.036c-.01-.003-.019 0-.024.006l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427c-.002-.01-.009-.017-.016-.018m.264-.113l-.014.002l-.184.093l-.01.01l-.003.011l.018.43l.005.012l.008.008l.201.092c.012.004.023 0 .029-.008l.004-.014l-.034-.614c-.003-.012-.01-.02-.02-.022m-.715.002a.023.023 0 0 0-.027.006l-.006.014l-.034.614c0 .012.007.02.017.024l.015-.002l.201-.093l.01-.008l.003-.011l.018-.43l-.003-.012l-.01-.01z"/><path fill="currentColor" d="M11.5 9a1 1 0 1 0 0-2H9V5.207C9 3.87 7.384 3.2 6.44 4.147L1.644 8.938a1.5 1.5 0 0 0 0 2.122l4.794 4.793c.945.945 2.56.275 2.56-1.061V13H16a1 1 0 0 0 1-1v-1.587L20.586 14L17 17.586V16a1 1 0 0 0-1-1h-3.5a1 1 0 1 0 0 2H15v1.793c0 1.336 1.615 2.005 2.56 1.06l4.794-4.793a1.5 1.5 0 0 0 0-2.121L17.56 8.146C16.615 7.2 15 7.87 15 9.206V11H8a1 1 0 0 0-1 1v1.586L3.413 10L7 6.414V8a1 1 0 0 0 1 1z"/></g></svg>
        {/if}
      </button>   
      <button class="btn btn-neutral" disabled={copyDisabled} on:click={() => dispatchSelectToCopy('selectToCopy', product)}>
        {#if isMoving}
        <span class="loading loading-dots loading-xs"></span>
        {:else}
        <svg xmlns="http://www.w3.org/2000/svg" width="1.6em" height="1.6em" viewBox="0 0 256 256"><path fill="currentColor" d="M216 32H88a8 8 0 0 0-8 8v40H40a8 8 0 0 0-8 8v128a8 8 0 0 0 8 8h128a8 8 0 0 0 8-8v-40h40a8 8 0 0 0 8-8V40a8 8 0 0 0-8-8m-56 176H48V96h112Zm48-48h-32V88a8 8 0 0 0-8-8H96V48h112Z"/></svg>
        {/if}
      </button>   
      <div class="divider divider-horizontal"></div>
      <button class="btn btn-secondary" on:click={() => goto("/products/" + product.id)}>
        <svg xmlns="http://www.w3.org/2000/svg" width="1.8em" height="1.8em" viewBox="0 0 32 32"><path fill="currentColor" d="M27.87 7.863L23.024 4.82l-7.89 12.566l4.843 3.04zM14.395 21.25l-.107 2.855l2.527-1.337l2.35-1.24l-4.673-2.936zM29.163 3.24L26.63 1.647a1.364 1.364 0 0 0-1.88.43l-1 1.588l4.843 3.042l1-1.586c.4-.64.21-1.483-.43-1.883zm-3.965 23.82c0 .275-.225.5-.5.5h-19a.5.5 0 0 1-.5-.5v-19a.5.5 0 0 1 .5-.5h13.244l1.884-3H5.698c-1.93 0-3.5 1.57-3.5 3.5v19c0 1.93 1.57 3.5 3.5 3.5h19c1.93 0 3.5-1.57 3.5-3.5V11.097l-3 4.776v11.19z"/></svg>
      </button>
    </div>
  </div>
  {#if detailsOpen}
    <div transition:slide class="flex flex-col gap-2 py-2">
      <div class="divider">Bundles</div>
      {#if loadingBundles}
        <div class="flex justify-center py-2">
          <div class="loading loading-dots loading-lg"></div>
        </div>
      {:else}
        {#each bundles as bundle (bundle.id)}
          <BundlePresenter {bundle} {offerId} {isMoving} />
        {/each}
      {/if}   
    </div>  
  {/if}
</div>

{#if deleteOpen}
  <Modal on:clickOut={() => deleteOpen = false}>
    <div class="card gap-4 card-body bg-base-300">
      <div class="flex flex-col gap-1">
        <h2 class="text-2xl font-bold">Delete product</h2>
        <p>Are you sure you want to delete this product? This action cannot be undone.</p>
        <p>Please write "<span class="font-bold">{ product.name }</span>" in the input below to confirm.</p>
      </div>
      <input class="input input-bordered" type="text" bind:value={confirmText}>
      <div class="flex gap-4 justify-between">
        <Button type="no" on:click={() => deleteOpen = false} />
        <Button type="delete" on:click={deleteProduct} disabled={deletingDisabled} loading={deleting} />
      </div>
    </div>
  </Modal>
  {/if}