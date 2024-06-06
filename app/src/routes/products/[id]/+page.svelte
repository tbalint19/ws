<script lang="ts">
  import { page } from "$app/stores"
  import { getContext,  } from "svelte"
  import type { AppClient } from "../../../api/appClient";
  import type { NotificationCTX } from "$lib/components/RequestNotifications/context";
  import { goto, invalidateAll } from "$app/navigation"
  import Button from "../../../components/elements/Button.svelte";
  import { afterNavigate } from "$app/navigation";
  import BundleEditor from "../../../components/BundleEditor.svelte";
  import ProductEditor from "../../../components/ProductEditor.svelte";

  type Product = NonNullable<Awaited<ReturnType<ReturnType<typeof client.api.products>['get']>>['data']>
  type Category = NonNullable<Awaited<ReturnType<typeof client.api.categories.get>>['data']>[0]
  type Bundle = NonNullable<Awaited<ReturnType<ReturnType<typeof client.api.bundles>['get']>>['data']>[0]

  const client = getContext<AppClient>('client')
  const { warn, notify } = getContext<NotificationCTX>('notifications')
  
  $: id = $page.params.id
  $: category = $page.url.searchParams.get('category')
  $: variantOfParam = $page.url.searchParams.get('variantof')
  let parentCategory: Category | undefined
  afterNavigate(async () => {
    variants = []
    categories = []
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
        loadVariants()
      }
    }
    reset()
  })

  const addVariant = () => {
    if (!id) return
    goto("/products/new?variantof=" + id)
  }

  const reset = () => {
    name = ""
    brand = ""
    model = ""
    description = ""
    displayUnit = ""
  }

  let variantOf: string | null = null
  let name = ""
  let brand = ""
  let model = ""
  let description = ""
  let displayUnit = ""

  $: canSaveProduct = name.length > 0
  let saving = false
  const saveProduct = async () => {
    if (!canSaveProduct) return
    saving = true
    const response = id !== "new" ?
      await client.api.products({ id }).patch({
        name, brand, model, description, displayUnit
      }).catch(() => {}) :
      await client.api.products.post({ product: {
        name, brand, model, description, displayUnit, variantOf: variantOfParam || undefined
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
    variantOf = response.data.variantOf
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

  let variants: Product[] = []
  let isLoadingVariants = false
  const loadVariants = async () => {
    isLoadingVariants = true
    const response = await client.api.variants({ productId: id }).get().catch(() => {})
    isLoadingVariants = false
    if (!response || !response.data)
      return warn()

    variants = response.data
  }

  const deleteBundle = (bundle: Bundle) => bundles = bundles.filter(b => b.id !== bundle.id)
  const addBundle = (bundle: Bundle) => bundles = [ ...bundles, bundle ]
  const updateBundle = (bundle: Bundle) => bundles = bundles.map(b => b.id === bundle.id ? bundle : b)

  const copyId = () => {
    navigator.clipboard.writeText(id)
    notify({ type: "info", text: "Copied to clipboard" })
  }

  const backToParent = () => {
    if (!variantOf) return
    goto("/products/" + variantOf)
  }
</script>

<main class="p-8">
  <div class="flex gap-6">
    <div class="w-[450px]">
      <section class="card card-body bg-base-300 text-base-content mb-6">
        <button class="btn btn-secondary" disabled={!variantOfParam && !variantOf} on:click={backToParent}>
          <svg xmlns="http://www.w3.org/2000/svg" width="1.8em" height="1.8em" viewBox="0 0 24 24"><g fill="none" fill-rule="evenodd"><path d="M24 0v24H0V0zM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427c-.002-.01-.009-.017-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093c.012.004.023 0 .029-.008l.004-.014l-.034-.614c-.003-.012-.01-.02-.02-.022m-.715.002a.023.023 0 0 0-.027.006l-.006.014l-.034.614c0 .012.007.02.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z"/><path fill="currentColor" d="M8.108 3a3 3 0 0 0-2.544 1.41l-4.08 6.53a2 2 0 0 0 0 2.12l4.08 6.53A3 3 0 0 0 8.108 21H19a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3zm8.427 12.536a1 1 0 0 1-1.414 0L13 13.414l-2.121 2.122a1 1 0 1 1-1.415-1.415L11.586 12L9.464 9.879a1 1 0 0 1 1.415-1.415L13 10.586l2.121-2.122a1 1 0 1 1 1.414 1.415L14.415 12l2.12 2.121a1 1 0 0 1 0 1.415"/></g></svg>
        </button>
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
        <Button on:click={saveProduct} disabled={saving || !canSaveProduct} loading={loading} type="save" />
        <div class="divider">Variants</div>
        {#each variants as variant (variant.id)}
          <button class="btn btn-info btn-outline" on:click={() => goto("/products/" + variant.id)}>
            { variant.name }
          </button>
        {/each}
        <button disabled={id === "new"} on:click={addVariant} class="btn btn-info">
          <svg xmlns="http://www.w3.org/2000/svg" width="1.8em" height="1.8em" viewBox="0 0 24 24"><path fill="currentColor" d="M10.6 13.4a1 1 0 0 1-1.4 1.4a4.8 4.8 0 0 1 0-7l3.5-3.6a5.1 5.1 0 0 1 7.1 0a5.1 5.1 0 0 1 0 7.1l-1.5 1.5a6.4 6.4 0 0 0-.4-2.4l.5-.5a3.2 3.2 0 0 0 0-4.3a3.2 3.2 0 0 0-4.3 0l-3.5 3.6a2.9 2.9 0 0 0 0 4.2M23 18v2h-3v3h-2v-3h-3v-2h3v-3h2v3m-3.8-4.3a4.8 4.8 0 0 0-1.4-4.5a1 1 0 0 0-1.4 1.4a2.9 2.9 0 0 1 0 4.2l-3.5 3.6a3.2 3.2 0 0 1-4.3 0a3.2 3.2 0 0 1 0-4.3l.5-.4a7.3 7.3 0 0 1-.4-2.5l-1.5 1.5a5.1 5.1 0 0 0 0 7.1a5.1 5.1 0 0 0 7.1 0l1.8-1.8a6 6 0 0 1 3.1-4.3"/></svg>
        </button>
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
        {#if id}
          {#key id}
            <ProductEditor {id} />
          {/key}
        {/if}
      {/if}
    </div>
  </div>
</main>