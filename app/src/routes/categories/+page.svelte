<script lang="ts">
  import { getContext } from "svelte"
  import type { AppClient } from "../../api/appClient";
  import type { NotificationCTX } from "$lib/components/RequestNotifications/context";
	import { writable } from "svelte/store";
  import CategoryEditor from "../../components/CategoryEditor.svelte";

  type Category = NonNullable<Awaited<ReturnType<typeof client.api.categories.get>>['data']>[0]

  const client = getContext<AppClient>('client')
  const { warn } = getContext<NotificationCTX>('notifications')

  const selectedCategory = writable<Category | null>(null)
  const relatedCategories = writable<Category[]>([])
  const path = writable<Category[]>([])
  const categoryToMove = writable<Category | null>(null)

  let isLoading = false
  const getCategories = async (category: Category | null) => {
    isLoading = true
    const response = category ?
      await client.api.categories({ id: category.id }).get().catch(() => {}) :
      await client.api.categories.get().catch(() => {})
    isLoading = false
    if (!response || !response.data)
      return warn()

    $relatedCategories = response.data
  }

  let isMoving = false
  $: movingDisabled = isMoving || !$categoryToMove || $categoryToMove.subcategoryOf === $selectedCategory?.id
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
  }
  const cancelMove = () => {
    $categoryToMove = null
  }

  selectedCategory.subscribe(getCategories)
</script>

<main>
  <div class="flex justify-between items-center">
    <div class="flex items-center gap-2 px-4 pt-4">
      <button class="btn btn-ghost" on:click={backToRoot}>
        <svg xmlns="http://www.w3.org/2000/svg" width="1.8em" height="1.8em" viewBox="0 0 24 24"><path fill="currentColor" d="M4 21V9l8-6l8 6v12h-6v-7h-4v7z"/></svg>
      </button>
      {#each $path as category, index (category.id)}
      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 256 256"><path fill="currentColor" d="m184.49 136.49l-80 80a12 12 0 0 1-17-17L159 128L87.51 56.49a12 12 0 1 1 17-17l80 80a12 12 0 0 1-.02 17"/></svg>
      <button class="btn btn-ghost" on:click={() => backTo(category, index)}>
        <span>{ category.name }</span>
      </button>
      {/each}
    </div>

    <div class="px-4 pt-4 gap-2 flex items-center">
      <button class="btn btn-neutral" disabled={movingDisabled} on:click={cancelMove}>
        <svg xmlns="http://www.w3.org/2000/svg" width="1.8em" height="1.8em" viewBox="0 0 24 24"><path fill="currentColor" d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2m-3.4 14L12 13.4L8.4 17L7 15.6l3.6-3.6L7 8.4L8.4 7l3.6 3.6L15.6 7L17 8.4L13.4 12l3.6 3.6z"/></svg>
      </button>
      <button class="btn btn-neutral" disabled={movingDisabled} on:click={moveCategory}>
        {#if isMoving}
          <span class="loading loading-dots loading-xs"></span>
        {:else}
          <svg xmlns="http://www.w3.org/2000/svg" width="1.6em" height="1.6em" viewBox="0 0 24 24"><g fill="none" fill-rule="evenodd"><path d="M24 0v24H0V0zM12.594 23.258l-.012.002l-.071.035l-.02.004l-.014-.004l-.071-.036c-.01-.003-.019 0-.024.006l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427c-.002-.01-.009-.017-.016-.018m.264-.113l-.014.002l-.184.093l-.01.01l-.003.011l.018.43l.005.012l.008.008l.201.092c.012.004.023 0 .029-.008l.004-.014l-.034-.614c-.003-.012-.01-.02-.02-.022m-.715.002a.023.023 0 0 0-.027.006l-.006.014l-.034.614c0 .012.007.02.017.024l.015-.002l.201-.093l.01-.008l.003-.011l.018-.43l-.003-.012l-.01-.01z"/><path fill="currentColor" d="M11.5 9a1 1 0 1 0 0-2H9V5.207C9 3.87 7.384 3.2 6.44 4.147L1.644 8.938a1.5 1.5 0 0 0 0 2.122l4.794 4.793c.945.945 2.56.275 2.56-1.061V13H16a1 1 0 0 0 1-1v-1.587L20.586 14L17 17.586V16a1 1 0 0 0-1-1h-3.5a1 1 0 1 0 0 2H15v1.793c0 1.336 1.615 2.005 2.56 1.06l4.794-4.793a1.5 1.5 0 0 0 0-2.121L17.56 8.146C16.615 7.2 15 7.87 15 9.206V11H8a1 1 0 0 0-1 1v1.586L3.413 10L7 6.414V8a1 1 0 0 0 1 1z"/></g></svg>
        {/if}
      </button>
    </div>
  </div>

  <div class="divider px-4">{ $selectedCategory ? "Subcategories" : "Categories" }</div>

  <div class="grid p-4 grid-cols-3cols gap-4">
    {#each $relatedCategories as category (category.id)}
      <div class="card">
        <CategoryEditor
          {category}
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

</main>