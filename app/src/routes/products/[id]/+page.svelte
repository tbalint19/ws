<script lang="ts">
  import { page } from "$app/stores"
  import { getContext,  } from "svelte"
  import type { AppClient } from "../../../api/appClient";
  import type { NotificationCTX } from "$lib/components/RequestNotifications/context";
	import { writable } from "svelte/store";
  import { goto, invalidateAll } from "$app/navigation"
  import Button from "../../../components/elements/Button.svelte";
  import { afterNavigate } from "$app/navigation";
  import BundleEditor from "../../../components/BundleEditor.svelte";

  type Product = NonNullable<Awaited<ReturnType<typeof client.api.products.post>>['data']>
  type Category = NonNullable<Awaited<ReturnType<typeof client.api.categories.get>>['data']>[0]
  type Bundle = NonNullable<Awaited<ReturnType<ReturnType<typeof client.api.bundles>['get']>>['data']>[0]

  const client = getContext<AppClient>('client')
  const { warn, notify } = getContext<NotificationCTX>('notifications')
  
  $: id = $page.params.id
  $: category = $page.url.searchParams.get('category')
  let parentCategory: Category | undefined
  afterNavigate(async () => {
    if (category) {
      const response = await client.api.categories({ id: category }).get().catch(() => {})
      if (!response || !response.data)
        return warn()
      
      parentCategory = response.data
    }
    else {
      if (id !== "new") {
        parentCategory = undefined
        load()
        loadRelatedCategories()
        loadRelatedBundles()
      }
    }
  })

  let name = ""
  let brand = ""
  let model = ""
  let description = ""
  let displayUnit = ""

  let saving = false
  const saveProduct = async () => {
    saving = true
    const response = id !== "new" ?
      await client.api.products({ id }).patch({
        name, brand, model, description, displayUnit
      }).catch(() => {}) :
      await client.api.products.post({ product: {
        name, brand, model, description, displayUnit
      }, categoryId: category || undefined }).catch(() => {})
    saving = false
    if (!response || !response.data)
      return warn()

    if (id === "new")
      goto("/products/" + response.data.product.id)
    else
      invalidateAll()
  }

  let loading = false
  const load = async () => {
    loading = true
    const response = await client.api.products({ id }).get().catch(() => {})
    loading = false
    if (!response || !response.data)
      return warn()

    name = response.data.name || ""
    brand = response.data.brand || ""
    model = response.data.model || ""
    description = response.data.description || ""
    displayUnit = response.data.displayUnit || ""
  }

  let categories: Category[] = []

  let loadingRelatedCategories = false
  const loadRelatedCategories = async () => {
    loadingRelatedCategories = true
    const response = await client.api.categories.get({ query: { productId: id } }).catch(() => {})
    loadingRelatedCategories = false
    if (!response || !response.data)
      return warn()

    categories = response.data
  }

  let deletingRelation = false
  const deleteRelation = async (categoryId: string) => {
    deletingRelation = true
    const response = await client.api["category-to-product"].delete({ productId: id, categoryId }).catch(() => {})
    deletingRelation = false
    if (!response || !response.data)
      return warn()

    categories = categories.filter(c => c.id !== response.data.categoryId)
  }

  let bundles: Bundle[] = []
  let isLoadingBundles = false
  const loadRelatedBundles = async () => {
    isLoadingBundles = true
    const response = await client.api.bundles({ productId: id }).get().catch(() => {})
    isLoadingBundles = false
    if (!response || !response.data)
      return warn()

    bundles = response.data
  }

  const deleteBundle = (bundle: Bundle) => bundles = bundles.filter(b => b.id !== bundle.id)
  const addBundle = (bundle: Bundle) => bundles = [ ...bundles, bundle ]
  const updateBundle = (bundle: Bundle) => bundles = bundles.map(b => b.id === bundle.id ? bundle : b)

  const copyId = () => {
    navigator.clipboard.writeText(id)
    notify({ type: "info", text: "Copied to clipboard" })
  }
</script>

<main class="p-8">
  <div class="flex gap-6">
    <div class="w-[450px]">
      <section class="card card-body bg-base-300 text-base-content mb-6">
        <div class="flex gap-1">
          <input class="input input-bordered grow" type="text" placeholder="ID" disabled value={id === "new" ? "" : id}>
          <button class="btn btn-outline" disabled={id === "new"} on:click={copyId}>
            <svg xmlns="http://www.w3.org/2000/svg" width="1.8em" height="1.8em" viewBox="0 0 24 24"><path fill="currentColor" d="M18 2H9c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h9c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2m0 14H9V4h9zM3 15v-2h2v2zm0-5.5h2v2H3zM10 20h2v2h-2zm-7-1.5v-2h2v2zM5 22c-1.1 0-2-.9-2-2h2zm3.5 0h-2v-2h2zm5 0v-2h2c0 1.1-.9 2-2 2M5 6v2H3c0-1.1.9-2 2-2"/></svg>
          </button>
        </div>
        <input class="input input-bordered" type="text" placeholder="Name" bind:value={name}>
        <input class="input input-bordered" type="text" placeholder="Brand" bind:value={brand}>
        <input class="input input-bordered" type="text" placeholder="Model" bind:value={model}>
        <input class="input input-bordered" type="text" placeholder="Description" bind:value={description}>
        <input class="input input-bordered" type="text" placeholder="Display Unit" bind:value={displayUnit}>
        <Button on:click={saveProduct} disabled={saving} loading={loading} type="save" />
      </section>

      {#if parentCategory}
      <div class="card p-4 bg-base-200 text-base-content flex-row justify-between items-center opacity-50">
        <span class="text-xl font-bold">
          { parentCategory.name }
        </span>
        <Button type="delete" disabled={true} />
      </div>
      {/if}
    
      <section class="grow">
        {#each categories as category (category.id)}
          <div class="card p-4 bg-base-200 text-base-content flex-row justify-between items-center">
            <span class="text-xl font-bold">
              { category.name }
            </span>
            <Button type="delete" on:click={() => deleteRelation(category.id)} />
          </div>
        {/each}
      </section>
    </div>

    <div class="grow">
      {#if id !== "new"}
        <div class="divider">Bundles</div>
        {#if isLoadingBundles}
          <div class="flex justify-center py-4">
            <div class="loading loading-spinner loading-lg"></div>
          </div>
        {:else}
          <div class="py-4 flex flex-col gap-2">
            {#each bundles as bundle (bundle.id)}
              <BundleEditor
                {bundle}
                productId={id}
                on:save={({ detail }) => updateBundle(detail)}
                on:delete={({ detail }) => deleteBundle(detail)} />      
            {/each}
            <BundleEditor
              productId={id}
              on:save={({ detail }) => addBundle(detail)} />      
          </div>
        {/if}
      {/if}
    </div>
  </div>
</main>