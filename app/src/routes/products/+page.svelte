<script lang="ts">
  import { getContext } from "svelte"
  import type { AppClient } from "../../api/appClient";
  import type { NotificationCTX } from "$lib/components/RequestNotifications/context";
	import { writable } from "svelte/store";
  import CategoryEditor from "../../components/CategoryEditor.svelte";
	import { goto } from "$app/navigation";
  import Modal from "$lib/components/Modal.svelte";
  import Button from "../../components/elements/Button.svelte";
  import { scale } from 'svelte/transition';

  type Category = NonNullable<Awaited<ReturnType<typeof client.api.categories.get>>['data']>[0]
  type Product = NonNullable<Awaited<ReturnType<typeof client.api.products.get>>['data']>[0]

  const client = getContext<AppClient>('client')
  const { warn } = getContext<NotificationCTX>('notifications')

  const selectedCategory = writable<Category | null>(null)
  const relatedCategories = writable<Category[]>([])
  const path = writable<Category[]>([])
  const categoryToMove = writable<Category | null>(null)
  const productToMove = writable<Product | null>(null)
  const categoryToRemove = writable<Category | null>(null)
  const relatedProducts = writable<Product[]>([])

  let isLoadingCategories = false
  const getCategories = async (category: Category | null) => {
    isLoadingCategories = true
    const response = await client.api.subcategories({ id: category?.id || "null" }).get().catch(() => {}) 
    isLoadingCategories = false
    if (!response || !response.data)
      return warn()

    $relatedCategories = response.data
  }

  let nameSearch = ""

  let isLoadingProducts = false
  const loadProducts = async (query: { name?: string, category?: string }) => {
    isLoadingProducts = true
    const response = await client.api.products.get({ query }).catch(() => {})
    isLoadingProducts = false
    if (!response || !response.data)
      return warn()

    $relatedProducts = response.data    
  }

  const searchByName = () => {
    orphansShown = false
    backToRoot()
    loadProducts({ name: nameSearch })
  }

  const searchByCategory = (id: string) => loadProducts({ category: id })

  let orphansShown = false
  const searchOrphans = () => {
    orphansShown = true
    nameSearch = ""
    backToRoot()
    loadProducts({ category: "orphan" })
  }

  const reset = () => {
    orphansShown = false
    nameSearch = ""
    backToRoot()
    $relatedProducts = []
  }

  let isMoving = false
  $: movingDisabled = isMoving ||
    (!$categoryToMove && !$productToMove) ||
    ($categoryToMove && $categoryToMove.subcategoryOf === $selectedCategory?.id) ||
    ($productToMove && $relatedProducts.some(p => p.id === $productToMove?.id)) ||
    ($categoryToMove && $categoryToMove.subcategoryOf === null && $selectedCategory === null)

  $: cancelDisabled = isMoving || !$categoryToMove && !$productToMove 
  const moveCategory = async () => {
    if (!$categoryToMove) return
    isMoving = true
    const response = await client.api.categories({ id: $categoryToMove.id }).patch({
      name: $categoryToMove.name,
      subcategoryOf: $selectedCategory?.id || null
    }).catch(() => {})
    isMoving = false
    if (!response || !response.data)
      return warn()

    $relatedCategories = [ ...$relatedCategories, response.data ]
    $categoryToMove = null
  }

  const selectToMove = (product: Product, category?: Category) => {
    $categoryToRemove = category || null
    $productToMove = product
    $categoryToMove = null
  }

  const moveProduct = async () => {
    if (!$productToMove || !$selectedCategory) return
    isMoving = true
    const response = await client.api["category-to-product"].post({
      productId: $productToMove.id,
      newRelatedCategoryId: $selectedCategory.id,
      oldRelatedCategoryId: $categoryToRemove?.id || undefined,
    })
    isMoving = false
    if (!response || !response.data)
      return warn()

    $relatedProducts = [ ...$relatedProducts, $productToMove ]
    $productToMove = null
  }

  const handleMove = () => {
    if ($categoryToMove)
      moveCategory()
    if ($productToMove)
      moveProduct()
  }

  const addCategory = (category: Category) => $relatedCategories = [ ...$relatedCategories, category ]
  const updateCategory = (category: Category) => {
    $relatedCategories = $relatedCategories.map(c => c.id === category.id ? category : c)
  }
  const deleteCategory = (category: Category) => $relatedCategories = $relatedCategories.filter(c => c.id !== category.id)
  const selectCategory = (category: Category) => {
    $path = [ ...$path, category ]
    $selectedCategory = category
  }
  const backTo = (category: Category, index: number) => {
    $path = $path.slice(0, index+1)
    $selectedCategory = category
  }
  const backToRoot = () => {
    $path = []
    $selectedCategory = null
  }
  const setToMove = (category: Category) => {
    $categoryToMove = category
    $productToMove = null
  }
  const cancelMove = () => {
    $categoryToMove = null
    $productToMove = null
    $categoryToRemove = null
  }

  let isConfirming = false
  const addRelatedProduct = () => {
    if (!$relatedCategories.length || isConfirming) {
      isConfirming = false
      return goto(`/products/new/?category=${$selectedCategory?.id || ""}`)
    }
    isConfirming = true
  }

  let productToDelete: Product | undefined
  let confirmText = ""
  let deleting = false
  $: deletingDisabled = deleting || !!(productToDelete && productToDelete.name && confirmText !== productToDelete.name)
  const deleteProduct = async () => {
    if (!productToDelete) return
    deleting = true
    const response = await client.api.products({ id: productToDelete.id }).delete().catch(() => {})
    deleting = false
    if (!response || !response.data)
      return warn()
    
    $relatedProducts = $relatedProducts.filter(p => p.id !== response.data.id)
    productToDelete = undefined
    confirmText = ""
  }

  const closeDelete = () => {
    productToDelete = undefined
    confirmText = ""
  }

  let nameFilter = ""
  $: displayedProducts = $relatedProducts.filter(p => nameFilter ? p.name?.includes(nameFilter) : true)

  selectedCategory.subscribe(getCategories)
  selectedCategory.subscribe(c => {
    $relatedProducts = []
    if (c) {
      orphansShown = false
    }
  })
  selectedCategory.subscribe(c => c && searchByCategory(c.id))

  let categoriesShown = true
</script>

<main>
  {#if isConfirming}
  <Modal on:clickOut={() => isConfirming = false}>
    <div class="card card-body bg-base-300 text-base-content max-w-[450px]">
      <div class="flex justify-center py-4 text-9xl">
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="m12.866 3l9.526 16.5a1 1 0 0 1-.866 1.5H2.474a1 1 0 0 1-.866-1.5L11.134 3a1 1 0 0 1 1.732 0M11 16v2h2v-2zm0-7v5h2V9z"/></svg>
      </div>
      <p class="text-justify">
        It is recommended to to add products for a category which
        is <span class="italic">"end of the line"</span> - one, which has <span class="font-bold">no subcategories</span>.
      </p>
      <p class="text-justify">
        It makes the shop more intuitive, well-organized. <span class="font-bold">Are you sure you want to insert a new product here?</span>
      </p>
      <div class="flex justify-center gap-2 pt-8">
        <Button class="grow" type="no" on:click={() => isConfirming = false} />
        <Button class="grow" type="yes" on:click={addRelatedProduct} />
      </div>
    </div>
  </Modal>
  {/if}

  <div class="flex justify-between items-center">
    <div class="flex items-center gap-2 px-4 pt-4">
      <button class="btn btn-outline" on:click={() => categoriesShown = !categoriesShown}>
        <svg class={`${categoriesShown ? "" : "rotate-180"} transition-all`} xmlns="http://www.w3.org/2000/svg" width="1.8em" height="1.8em" viewBox="0 0 24 24"><g fill="none" fill-rule="evenodd"><path d="M24 0v24H0V0zM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427c-.002-.01-.009-.017-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093c.012.004.023 0 .029-.008l.004-.014l-.034-.614c-.003-.012-.01-.02-.02-.022m-.715.002a.023.023 0 0 0-.027.006l-.006.014l-.034.614c0 .012.007.02.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z"/><path fill="currentColor" d="M10.94 7.94a1.5 1.5 0 0 1 2.12 0l5.658 5.656a1.5 1.5 0 1 1-2.122 2.121L12 11.122l-4.596 4.596a1.5 1.5 0 1 1-2.122-2.12z"/></g></svg>
      </button>
      <div class="divider divider-horizontal"></div>
      <button class="btn btn-outline" on:click={backToRoot} disabled={isMoving}>
        <svg xmlns="http://www.w3.org/2000/svg" width="1.8em" height="1.8em" viewBox="0 0 24 24"><path fill="currentColor" d="M4 21V9l8-6l8 6v12h-6v-7h-4v7z"/></svg>
      </button>
      {#each $path as category, index (category.id)}
      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 256 256"><path fill="currentColor" d="m184.49 136.49l-80 80a12 12 0 0 1-17-17L159 128L87.51 56.49a12 12 0 1 1 17-17l80 80a12 12 0 0 1-.02 17"/></svg>
      <button class="btn btn-ghost" on:click={() => backTo(category, index)} disabled={isMoving}>
        <span>{ category.name }</span>
      </button>
      {/each}
    </div>

    <div class="px-4 pt-4 gap-2 flex items-center">
      <button class="btn btn-secondary" disabled={isLoadingCategories} on:click={addRelatedProduct}>
        <svg xmlns="http://www.w3.org/2000/svg" width="1.8em" height="1.8em" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2" d="M11 9h8m-4 4V5m2 12v6H1V7h6m0-6h16v16H7z"/></svg>
      </button>
      <div class="divider divider-horizontal"></div>
      <button class="btn btn-neutral" disabled={cancelDisabled} on:click={cancelMove}>
        <svg xmlns="http://www.w3.org/2000/svg" width="1.8em" height="1.8em" viewBox="0 0 24 24"><path fill="currentColor" d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2m-3.4 14L12 13.4L8.4 17L7 15.6l3.6-3.6L7 8.4L8.4 7l3.6 3.6L15.6 7L17 8.4L13.4 12l3.6 3.6z"/></svg>
      </button>
      <button class="btn btn-neutral" disabled={movingDisabled} on:click={handleMove}>
        {#if isMoving}
          <span class="loading loading-dots loading-xs"></span>
        {:else}
          <svg xmlns="http://www.w3.org/2000/svg" width="1.8em" height="1.8em" viewBox="0 0 24 24"><path fill="currentColor" d="M5 21q-.825 0-1.412-.587T3 19V9q0-.825.588-1.412T5 7h4v2H5v10h14V9h-4V7h4q.825 0 1.413.588T21 9v10q0 .825-.587 1.413T19 21zm7-5l-4-4l1.4-1.4l1.6 1.575V0h2v12.175l1.6-1.575L16 12z"/></svg>
        {/if}
      </button>
    </div>
  </div>

  {#if categoriesShown}
  <div class="divider px-4">{ $selectedCategory ? "Subcategories" : "Categories" }</div>

  {#if isLoadingCategories}
    <div class="flex justify-center py-10">
      <div class="loading loading-spinner loading-lg"></div>
    </div>
  {:else}
  <div class="grid p-4 grid-cols-3cols gap-4">
    {#each $relatedCategories as category (category.id)}
      <div class="card">
        <CategoryEditor
          {category}
          moveDisabled={isMoving}
          categoryToMove={$categoryToMove}
          subcategoryOf={$selectedCategory}
          on:save={({ detail }) => updateCategory(detail)}
          on:delete={({ detail }) => deleteCategory(detail)}
          on:select={({ detail }) => selectCategory(detail)}
          on:move={({ detail }) => setToMove(detail)} />
      </div>
    {/each}
      <CategoryEditor categoryToMove={$categoryToMove} subcategoryOf={$selectedCategory} on:save={({ detail }) => addCategory(detail)} />
  </div>
  {/if}
  {/if}

  <div class="divider px-4">Products</div>

  <div class="flex justify-between items-center px-4">
    <div class="flex gap-2 items-center">
      <button disabled={isMoving} class={`btn ${ orphansShown ? "btn-neutral" : "btn-outline" }`} on:click={orphansShown ? reset : searchOrphans}>
        <svg xmlns="http://www.w3.org/2000/svg" width="1.8em" height="1.8em" viewBox="0 0 32 32"><path fill="currentColor" d="M27 22.141V18a2 2 0 0 0-2-2h-8v-4h2a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h-6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2v4H7a2 2 0 0 0-2 2v4.142a4 4 0 1 0 2 0V18h8v4.142a4 4 0 1 0 2 0V18h8v4.141a4 4 0 1 0 2 0M13 4h6l.001 6H13ZM8 26a2 2 0 1 1-2-2a2 2 0 0 1 2 2m10 0a2 2 0 1 1-2-2a2.003 2.003 0 0 1 2 2m8 2a2 2 0 1 1 2-2a2 2 0 0 1-2 2"/></svg>
        <svg xmlns="http://www.w3.org/2000/svg" width="1.8em" height="1.8em" viewBox="0 0 24 24"><path fill="currentColor" d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2m0 16H5V5h14zM17 8.4L13.4 12l3.6 3.6l-1.4 1.4l-3.6-3.6L8.4 17L7 15.6l3.6-3.6L7 8.4L8.4 7l3.6 3.6L15.6 7z"/></svg>
      </button>
      <div class="divider divider-horizontal"></div>
      <button class="btn btn-warning" on:click={reset} disabled={isMoving}>
        <svg xmlns="http://www.w3.org/2000/svg" width="1.8em" height="1.8em" viewBox="0 0 24 24"><path fill="currentColor" d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89h15a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2m-3 12.59L17.59 17L14 13.41L10.41 17L9 15.59L12.59 12L9 8.41L10.41 7L14 10.59L17.59 7L19 8.41L15.41 12"/></svg>
      </button>
      <input type="text" class="input input-bordered" placeholder="Search in all categories" bind:value={nameSearch}>
      <button class="btn btn-info" on:click={searchByName} disabled={isMoving}>
        <svg xmlns="http://www.w3.org/2000/svg" width="1.8em" height="1.8em" viewBox="0 0 24 24"><path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5A6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5S14 7.01 14 9.5S11.99 14 9.5 14"/></svg>
      </button>
    </div>
    <div class="flex gap-2 items-center">
      <input type="text" class="input input-bordered" placeholder="Filter here" bind:value={nameFilter}>
      <button class="btn btn-warning" on:click={() => nameFilter = ""}>
        <svg xmlns="http://www.w3.org/2000/svg" width="1.8em" height="1.8em" viewBox="0 0 2048 2048"><path fill="currentColor" d="M0 128h2048v219l-768 768v805H768v-805L0 347zm1920 165v-37H128v37l768 768v731h256v-731zm37 987l91 91l-230 229l230 229l-91 91l-229-230l-229 230l-91-91l230-229l-230-229l91-91l229 230z"/></svg>
      </button>
    </div>
  </div>

  <div class="divider px-4">Results</div>

  <div class="flex flex-col gap-4 px-4 py-8">
    {#if isLoadingProducts}
    <div class="flex justify-center py-4">
      <div class="loading loading-spinner loading-lg"></div>
    </div>
    {:else}
      {#if !$relatedProducts.length}
      <div class="flex justify-center py-4 text-9xl opacity-25">
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M17.5 12a5.5 5.5 0 1 1 0 11a5.5 5.5 0 0 1 0-11m-2.476 3.024a.5.5 0 0 0 0 .707l1.769 1.77l-1.767 1.766a.5.5 0 1 0 .707.708l1.767-1.767l1.77 1.769a.5.5 0 1 0 .707-.707l-1.769-1.77l1.771-1.77a.5.5 0 0 0-.707-.707l-1.771 1.77l-1.77-1.77a.5.5 0 0 0-.707 0M17.75 3A3.25 3.25 0 0 1 21 6.25l.001 5.773a6.5 6.5 0 0 0-1.5-.71L19.5 8.5h-15v9.25c0 .966.784 1.75 1.75 1.75h5.064c.172.534.412 1.038.709 1.501L6.25 21A3.25 3.25 0 0 1 3 17.75V6.25A3.25 3.25 0 0 1 6.25 3zm0 1.5H6.25A1.75 1.75 0 0 0 4.5 6.25V7h15v-.75a1.75 1.75 0 0 0-1.75-1.75"/></svg>
      </div>
      {:else}
      {#each displayedProducts as product (product.id)}
      <div class="card p-4 flex flex-row bg-base-200 text-base-content justify-between items-center">
        <div class="flex items-center">
          <Button type="delete" on:click={() => productToDelete = product} />
          <div class="divider divider-horizontal"></div>
          <p class="text-2xl font-bold">{ product.name }</p>
        </div>
        <div class="flex items-center">
          <div class="divider divider-horizontal"></div>
          <button class="btn btn-neutral mr-4" disabled={isMoving || $productToMove?.id === product.id} on:click={() => selectToMove(product, $selectedCategory || undefined)}>
            {#if isMoving}
            <span class="loading loading-dots loading-xs"></span>
            {:else}
            <svg xmlns="http://www.w3.org/2000/svg" width="1.6em" height="1.6em" viewBox="0 0 24 24"><g fill="none" fill-rule="evenodd"><path d="M24 0v24H0V0zM12.594 23.258l-.012.002l-.071.035l-.02.004l-.014-.004l-.071-.036c-.01-.003-.019 0-.024.006l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427c-.002-.01-.009-.017-.016-.018m.264-.113l-.014.002l-.184.093l-.01.01l-.003.011l.018.43l.005.012l.008.008l.201.092c.012.004.023 0 .029-.008l.004-.014l-.034-.614c-.003-.012-.01-.02-.02-.022m-.715.002a.023.023 0 0 0-.027.006l-.006.014l-.034.614c0 .012.007.02.017.024l.015-.002l.201-.093l.01-.008l.003-.011l.018-.43l-.003-.012l-.01-.01z"/><path fill="currentColor" d="M11.5 9a1 1 0 1 0 0-2H9V5.207C9 3.87 7.384 3.2 6.44 4.147L1.644 8.938a1.5 1.5 0 0 0 0 2.122l4.794 4.793c.945.945 2.56.275 2.56-1.061V13H16a1 1 0 0 0 1-1v-1.587L20.586 14L17 17.586V16a1 1 0 0 0-1-1h-3.5a1 1 0 1 0 0 2H15v1.793c0 1.336 1.615 2.005 2.56 1.06l4.794-4.793a1.5 1.5 0 0 0 0-2.121L17.56 8.146C16.615 7.2 15 7.87 15 9.206V11H8a1 1 0 0 0-1 1v1.586L3.413 10L7 6.414V8a1 1 0 0 0 1 1z"/></g></svg>
            {/if}
          </button>   
          <button class="btn btn-neutral" disabled={isMoving || !$selectedCategory || $productToMove?.id === product.id} on:click={() => selectToMove(product)}>
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
      {/each}
      {/if}
    {/if}
  </div>
  
  {#if productToDelete}
  <Modal on:clickOut={closeDelete}>
    <div class="card gap-4 card-body bg-base-300">
      <div class="flex flex-col gap-1">
        <h2 class="text-2xl font-bold">Delete product</h2>
        <p>Are you sure you want to delete this product? This action cannot be undone.</p>
        <p>Please write "<span class="font-bold">{ productToDelete.name }</span>" in the input below to confirm.</p>
      </div>
      <input class="input input-bordered" type="text" bind:value={confirmText}>
      <div class="flex gap-4 justify-between">
        <Button type="no" on:click={closeDelete} />
        <Button type="delete" on:click={deleteProduct} disabled={deletingDisabled} loading={deleting} />
      </div>
    </div>
  </Modal>
  {/if}
</main>