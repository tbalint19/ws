<script lang="ts">
  import { getContext } from "svelte"
  import type { Readable } from "svelte/store"
  import type { User } from "../../stores/user";
  import { type AppClient } from "../../api/appClient";
  import { type NotificationCTX } from "$lib/components/RequestNotifications/context";

  const http = getContext<AppClient>('client')
  const notifications = getContext<NotificationCTX>('notifications')

  type Product = NonNullable<Awaited<ReturnType<typeof http.api.products.get>>['data']>[0]

  let products: Product[] = []

  let name = ""
  let description = ""
  let isCreating = false
  let isLoading = false

  const loadProducts = async () => {
    isLoading = true
    const response = await http.api.products.get().catch(() => notifications.warn())
    isLoading = false
    if (!response || !response.data)
      return
    notifications.report()
    products = response.data
  }

  const createProduct = async () => {
    isCreating = true
    const response = await http.api.products.post({ name, description }).catch(() => notifications.warn())
    isCreating = false
    if (!response)
      return
    if (response.error)
      return notifications.warn()

    notifications.report()
  }

  export let data

  const user = getContext<Readable<User>>("user")
</script>

<svelte:head>
  <title>Dashboard</title>
  <!-- <meta name="description" content={data.items?.map(i => i).join(", ")} /> -->
</svelte:head>

<main>
  Dashboard page
  You are logged in as: {$user?.name}

  <section class="card card-body">
    <h1>New Product</h1>
    <input placeholder="Name" type="text" class="input input-bordered" bind:value={name} />
    <input placeholder="Description" type="text" class="input input-bordered" bind:value={description} />
    <button disabled={isCreating} class="btn btn-primary" on:click={createProduct}>Create product</button>
  </section>
    
  {#if data.items}
    {#each data.items as item}
      <p>{item}</p>
    {/each}
  {/if}
</main>