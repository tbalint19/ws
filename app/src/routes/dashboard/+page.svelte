<script lang="ts">
  import { getContext } from "svelte"
  import type { Readable } from "svelte/store"
  import type { User } from "../../stores/user";
  import { type AppClient } from "../../api/appClient";
  import { type NotificationCTX } from "$lib/components/RequestNotifications/context";
  import Modal from "$lib/components/Modal.svelte"
  import FileUpload from "$lib/components/FileUpload.svelte"

  const http = getContext<AppClient>('client')
  const notifications = getContext<NotificationCTX>('notifications')

  type Product = NonNullable<Awaited<ReturnType<typeof http.api.products.get>>['data']>[0]

  let products: Product[] = []

  let name = ""
  let description = ""
  let model = ""
  let brand = ""
  let displayUnit = ""
  let grossWeightOfUnitInKg = ""
  let netWeightOfUnitInKg = ""
  let grossVolumeOfUnitInLiter = ""
  let netVolumeOfUnitInLiter = ""
  let grossWidthInMeter = ""
  let netWidthInMeter = ""
  let grossHeightInMeter = ""
  let netHeightInMeter = ""
  let grossLengthInMeter = ""
  let netLengthInMeter = ""


  let isCreating = false
  let isLoading = false

  const loadProducts = async () => {
    isLoading = true
    const response = await http.api.products.get().catch(() => notifications.warn())
    isLoading = false
    if (!response || !response.data)
      return
    notifications.report()
    console.log(response.data);
    
    products = response.data
  }

  let createOpen = false
  const createProduct = async () => {
    isCreating = true
    const response = await http.api.products.post({
      name, description, brand, model, displayUnit
    }).catch(() => notifications.warn())
    isCreating = false
    if (!response)
      return
    if (response.error)
      return notifications.warn()
    notifications.report()
  }

  let productToTopup: Product | undefined
  let amount = ""
  let price = ""
  let currency = ""
  const createTopup = async () => {
    if (!productToTopup)
      return
    const response = await http.api.topup.post({
      id: productToTopup.id,
      amount: +amount,
      topup: {
        productId: productToTopup.id,
        price: +price,
        currency,
        amount: +amount,
      }
    })
  }

  export let data

  const user = getContext<Readable<User>>("user")

  let uploadOpen = false

  const getPresignedUrl = async (file: File): Promise<string | null> => {
    const response = await http.api.upload.images.post({ filename: file.name, type: file.type }).catch(() => {})
    if (!response || !response.data) return null
    return response.data.url
  }
</script>

<svelte:head>
  <title>Dashboard</title>
  <!-- <meta name="description" content={data.items?.map(i => i).join(", ")} /> -->
</svelte:head>

<main class="lg:w-3/4 m-auto">

  <div>
    <button class="btn btn-info" on:click={() => createOpen = true}>Create product</button>
    <button class="mt-4 btn btn-info" on:click={loadProducts}>Refresh</button>
    <button class="mt-4 btn btn-info" on:click={() => uploadOpen = true}>Upload</button>
  </div>
  
  {#if uploadOpen}
  <Modal on:clickOut={() => uploadOpen = false}>
    <FileUpload on:close={() => uploadOpen = false} {getPresignedUrl} />
  </Modal>
  {/if}

  <div class="divider">Products</div>

  {#if createOpen}
  <Modal on:clickOut={() => createOpen = false}>
  <section class="card card-body bg-base-300 text-base-content">
    <div class="flex gap-4">
      <div class="flex flex-col gap-2">
        <h1>New Product</h1>
        <input placeholder="Name" type="text" class="input input-bordered" bind:value={name} />
        <input placeholder="Description" type="text" class="input input-bordered" bind:value={description} />
        <input placeholder="Brand (optional)" type="text" class="input input-bordered" bind:value={brand} />
        <input placeholder="Model (optional)" type="text" class="input input-bordered" bind:value={model} />
        <input placeholder="Display unit (optional)" type="text" class="input input-bordered" bind:value={displayUnit} />
    
        <button disabled={isCreating} class="btn btn-success" on:click={createProduct}>Create product</button>
      </div>
  
      <div class="flex flex-col gap-2">
        <input placeholder="Gross weight (in kg - optional)" type="text" class="input input-bordered" bind:value={grossWeightOfUnitInKg} />
        <input placeholder="Net weight (in kg - optional)" type="text" class="input input-bordered" bind:value={netWeightOfUnitInKg} />

        <input placeholder="Gross volume (in liter - optional)" type="text" class="input input-bordered" bind:value={grossVolumeOfUnitInLiter} />
        <input placeholder="Net volume (in liter - optional)" type="text" class="input input-bordered" bind:value={netVolumeOfUnitInLiter} />

        <input placeholder="Gross width (in meter - optional)" type="text" class="input input-bordered" bind:value={grossWidthInMeter} />
        <input placeholder="Net width (in meter - optional)" type="text" class="input input-bordered" bind:value={netWidthInMeter} />

        <input placeholder="Gross height (in meter - optional)" type="text" class="input input-bordered" bind:value={grossHeightInMeter} />
        <input placeholder="Net height (in meter - optional)" type="text" class="input input-bordered" bind:value={netHeightInMeter} />

        <input placeholder="Gross length (in meter - optional)" type="text" class="input input-bordered" bind:value={grossLengthInMeter} />
        <input placeholder="Net length (in meter - optional)" type="text" class="input input-bordered" bind:value={netLengthInMeter} />
      </div>
    </div>
  </section>
  </Modal>
  {/if}
    
  {#if products}
    <div class="grid grid-cols-3cols gap-2">
      {#each products as product}
      <div class="card card-body bg-base-300 text-base-content">
        <p>{product.name} ({product.availableAmount})</p>
        <button class="btn btn-success" on:click={() => productToTopup = product}>Topup</button>
      </div>
      {/each}
    </div>
  {/if}
  {#if productToTopup}
  <Modal on:clickOut={() => productToTopup = undefined}>
    <div class="card card-body bg-base-300 text-base-content">
      <h1>{productToTopup.name}</h1>
      <input class="input input-bordered my-4" type="text" placeholder="Amount" bind:value={amount}>
      <input class="input input-bordered my-4" type="text" placeholder="Price" bind:value={price}>
      <input class="input input-bordered my-4" type="text" placeholder="Currency" bind:value={currency}>
      <button class="btn btn-success" on:click={createTopup}>Topup</button>
    </div>
  </Modal>
  {/if}
</main>