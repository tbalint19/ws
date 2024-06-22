<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import type { AppClient } from '../../api/appClient';
	import type { NotificationCTX } from '$lib/components/RequestNotifications/context';
	import { writable } from 'svelte/store';
	import CategoryEditor from '../../components/CategoryEditor.svelte';
	import { goto } from '$app/navigation';
	import Modal from '$lib/components/Modal.svelte';
	import Button from '../../components/elements/Button.svelte';
	import ProductController from '../../components/ProductController.svelte';
	import { slide } from 'svelte/transition';
	import OfferOfLocationEditor from '../../components/OfferOfLocationEditor.svelte';
	import type { EventBus } from '../../stores/eventbus';

	type Category = NonNullable<Awaited<ReturnType<typeof client.api.categories.get>>['data']>[0];
	type Product = NonNullable<Awaited<ReturnType<typeof client.api.products.get>>['data']>[0];
	type Bundle = NonNullable<
		Awaited<ReturnType<ReturnType<typeof client.api.bundles>['get']>>['data']
	>[0];
	type Offer = NonNullable<Awaited<ReturnType<typeof client.api.offers.post>>['data']>;

	const client = getContext<AppClient>('client');
	const { subscribe } = getContext<EventBus>('eventbus');
	const { warn } = getContext<NotificationCTX>('notifications');

	const selectedCategory = writable<Category | null>(null);
	const relatedCategories = writable<Category[]>([]);
	const path = writable<Category[]>([]);
	const categoryToMove = writable<Category | null>(null);
	const productToMove = writable<Product | null>(null);
	const categoryToRemove = writable<Category | null>(null);
	const relatedProducts = writable<Product[]>([]);

	let isLoadingCategories = false;
	const getCategories = async (category: Category | null) => {
		isLoadingCategories = true;
		const response = await client.api
			.subcategories({ id: category?.id || 'null' })
			.get()
			.catch(() => {});
		isLoadingCategories = false;
		if (!response || !response.data) return warn();

		if ($selectedCategory?.id !== category?.id) return;
		$relatedCategories = response.data;
	};

	let nameSearch = '';

	let isLoadingProducts = false;
	const loadProducts = async (query: { name?: string; category?: string }) => {
		isLoadingProducts = true;
		const response = await client.api.products.get({ query }).catch(() => {});
		isLoadingProducts = false;
		if (!response || !response.data) return warn();

		const categoryId = $selectedCategory?.id || null;
		const queriedCategoryId = query.category || null;
		const stillRelevant =
			categoryId === queriedCategoryId || (categoryId === null && queriedCategoryId === 'orphan');
		if (!stillRelevant) return;
		$relatedProducts = response.data;
	};

	const searchByName = () => {
		orphansShown = false;
		offersShown = false;
		backToRoot();
		categoriesShown = false;
		loadProducts({ name: nameSearch });
	};

	const searchByCategory = (id: string) => loadProducts({ category: id });

	let orphansShown = false;
	const searchOrphans = () => {
		offersShown = false;
		orphansShown = true;
		nameSearch = '';
		backToRoot();
		loadProducts({ category: 'orphan' });
	};

	const reset = () => {
		offersShown = false;
		orphansShown = false;
		nameSearch = '';
		nameFilter = '';
		backToRoot();
		$relatedProducts = [];
		offers = [];
	};

	let isMoving = false;
	$: movingDisabled =
		isMoving ||
		(!$categoryToMove && !$productToMove) ||
		($categoryToMove && $categoryToMove.subcategoryOf === $selectedCategory?.id) ||
		($productToMove && $relatedProducts.some((p) => p.id === $productToMove?.id)) ||
		($categoryToMove && $categoryToMove.subcategoryOf === null && $selectedCategory === null);

	$: cancelDisabled = isMoving || (!$categoryToMove && !$productToMove);
	const moveCategory = async () => {
		if (!$categoryToMove) return;
		isMoving = true;
		const response = await client.api
			.categories({ id: $categoryToMove.id })
			.patch({
				name: $categoryToMove.name,
				subcategoryOf: $selectedCategory?.id || null,
			})
			.catch(() => {});
		isMoving = false;
		if (!response || !response.data) return warn();

		$relatedCategories = [...$relatedCategories, response.data];
		$categoryToMove = null;
	};

	const selectToMove = (product: Product, category?: Category) => {
		$categoryToRemove = category || null;
		$productToMove = product;
		$categoryToMove = null;
	};

	const moveProduct = async () => {
		if (!$productToMove || !$selectedCategory) return;
		isMoving = true;
		const response = await client.api['category-to-product'].post({
			productId: $productToMove.id,
			newRelatedCategoryId: $selectedCategory.id,
			oldRelatedCategoryId: $categoryToRemove?.id || undefined,
		});
		isMoving = false;
		if (!response || !response.data) return warn();

		$relatedProducts = [...$relatedProducts, $productToMove];
		$productToMove = null;
	};

	const handleMove = () => {
		if ($categoryToMove) moveCategory();
		if ($productToMove) moveProduct();
	};

	const addCategory = (category: Category) =>
		($relatedCategories = [...$relatedCategories, category]);
	const updateCategory = (category: Category) => {
		$relatedCategories = $relatedCategories.map((c) => (c.id === category.id ? category : c));
	};
	const deleteCategory = (category: Category) =>
		($relatedCategories = $relatedCategories.filter((c) => c.id !== category.id));
	const selectCategory = (category: Category) => {
		$path = [...$path, category];
		$selectedCategory = category;
	};
	const backTo = (category: Category, index: number) => {
		$path = $path.slice(0, index + 1);
		$selectedCategory = category;
	};
	const backToRoot = () => {
		categoriesShown = true;
		$path = [];
		$selectedCategory = null;
	};
	const setToMove = (category: Category) => {
		$categoryToMove = category;
		$productToMove = null;
	};
	const cancelMove = () => {
		$categoryToMove = null;
		$productToMove = null;
		$categoryToRemove = null;
	};

	let isConfirming = false;
	const addRelatedProduct = () => {
		if (!$relatedCategories.length || isConfirming) {
			isConfirming = false;
			return goto(`/products/new/?category=${$selectedCategory?.id || ''}`);
		}
		isConfirming = true;
	};

	const handleDelete = (product: Product) =>
		($relatedProducts = $relatedProducts.filter((p) => p.id !== product.id));

	let nameFilter = '';
	$: displayedProducts = $relatedProducts.filter((p) =>
		nameFilter ? p.name?.includes(nameFilter) : true,
	);
	$: displayedOffers = offers.filter((o) => (nameFilter ? o.name?.includes(nameFilter) : true));

	selectedCategory.subscribe(getCategories);
	selectedCategory.subscribe((c) => {
		$relatedProducts = [];
		if (c) {
			orphansShown = false;
			offersShown = false;
		}
	});
	selectedCategory.subscribe((c) => c && searchByCategory(c.id));

	let categoriesShown = true;

	let editedOffer: Offer | undefined;
	let nameInput = '';
	let priceInput = 0;
	let availableAfterInput = '';
	let availableBeforeInput = '';

	$: canSaveOffer =
		priceInput > 0 &&
		(!editedOffer || nameInput !== editedOffer.name || priceInput !== editedOffer.price);
	let isSaving = false;
	const save = async () => {
		isSaving = true;
		const response = editedOffer
			? await client.api
					.offers({ id: editedOffer.id })
					.patch({
						name: nameInput,
						price: priceInput,
					})
					.catch(() => {})
			: await client.api.offers
					.post({
						name: nameInput,
						price: priceInput,
					})
					.catch(() => {});
		isSaving = false;
		if (!response || !response.data) return warn();

		editedOffer = response.data;
		if (offersShown) {
			if (!offers.some((o) => o.id === response.data.id)) offers = [...offers, response.data];
			else offers = offers.map((o) => (o.id === response.data.id ? response.data : o));
		}
	};

	let offerDrawerShown = false;

	const createOffer = () => {
		editedOffer = undefined;
		offerDrawerShown = true;
		nameInput = '';
		priceInput = 0;
		window.scrollTo({ behavior: 'smooth', top: 0 });
	};

	const editOffer = (offer: Offer) => {
		editedOffer = offer;
		offerDrawerShown = true;
		nameInput = offer.name || '';
		priceInput = offer.price;
		window.scrollTo({ behavior: 'smooth', top: 0 });
	};

	const closeOfferDrawer = () => {
		offerDrawerShown = false;
		editedOffer = undefined;
	};

	let offersShown = false;
	let offers: Offer[] = [];
	let loadingOffers = false;
	const loadOffers = async (bundleId?: string) => {
		loadingOffers = true;
		const query = bundleId ? { bundleId } : {};
		const response = await client.api.offers.get({ query }).catch(() => {});
		loadingOffers = false;
		if (!response || !response.data) return warn();

		offers = response.data;
	};

	let deletingOffer = false;
	const deleteOffer = async (id: string) => {
		deletingOffer = true;
		const response = await client.api
			.offers({ id })
			.delete()
			.catch(() => {});
		deletingOffer = false;
		if (!response || !response.data) return warn();

		offers = offers.filter((o) => o.id !== id);
	};

	const handleLoadOffers = (id?: string) => {
		reset();
		offersShown = true;
		loadOffers(id);
	};

	relatedCategories.subscribe((arr) => {
		if (isLoadingCategories) return;
		if (!arr.length) categoriesShown = false;
		else categoriesShown = true;
	});

	$: orphansShown &&
		(() => {
			categoriesShown = false;
		})();

	$: offersShown &&
		(() => {
			categoriesShown = false;
		})();

	let locationSelectorShown = false;

	onMount(() => {
		subscribe('EDIT_OFFER', editOffer);
	});
</script>

<main>
	<div class="bg-primary">
		{#if offerDrawerShown}
			<section class="px-4 pb-4 pt-2" transition:slide>
				<div class="divider">
					{editedOffer ? 'Edit' : 'Add'} offer
				</div>
				<div class="flex items-center gap-2">
					<button
						class="btn btn-neutral"
						disabled={!editedOffer}
						on:click={() => (locationSelectorShown = true)}
					>
						<!-- prettier-ignore -->
						<svg xmlns="http://www.w3.org/2000/svg" width="1.8em" height="1.8em" viewBox="0 0 24 24">
              <path fill="currentColor" d="M4 6.143v12.824l5.065-2.17l6 3L20 17.68V4.857l1.303-.558a.5.5 0 0 1 .697.46V19l-7 3l-6-3l-6.303 2.701a.5.5 0 0 1-.697-.46V7zm12.243 5.1L12 15.485l-4.243-4.242a6 6 0 1 1 8.486 0M12 12.657l2.828-2.829a4 4 0 1 0-5.656 0z"/>
            </svg>
					</button>
					<div class="divider divider-horizontal"></div>
					<input
						bind:value={nameInput}
						type="text"
						placeholder="Name"
						class="input-bordered input w-full"
					/>
					<input
						bind:value={priceInput}
						type="number"
						placeholder="Price"
						class="input input-bordered w-full"
					/>
					<div class="divider divider-horizontal"></div>
					<input
						bind:value={availableAfterInput}
						type="date"
						placeholder="Available after"
						class="input-bordered input w-full"
					/>
					<div class="flex justify-center">
						<svg xmlns="http://www.w3.org/2000/svg" width="1.8em" height="1.8em" viewBox="0 0 24 24"
							><path
								fill="none"
								stroke="currentColor"
								stroke-linecap="round"
								d="m9.929 4.858l6.364 6.364a1 1 0 0 1 0 1.414L9.929 19"
							/></svg
						>
					</div>
					<input
						bind:value={availableBeforeInput}
						type="date"
						placeholder="Available before"
						class="input-bordered input w-full"
					/>
					<div class="divider divider-horizontal"></div>
					<Button
						disabled={!canSaveOffer || isSaving}
						on:click={save}
						loading={isSaving}
						type="save"
					/>
					<button class="btn btn-neutral" on:click={closeOfferDrawer}>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="1.8em"
							height="1.8em"
							viewBox="0 0 256 256"
							><path
								fill="currentColor"
								d="M216.49 191.51a12 12 0 0 1-17 17L128 137l-71.51 71.49a12 12 0 0 1-17-17l80-80a12 12 0 0 1 17 0Zm-160-63L128 57l71.51 71.52a12 12 0 0 0 17-17l-80-80a12 12 0 0 0-17 0l-80 80a12 12 0 0 0 17 17Z"
							/></svg
						>
					</button>
				</div>
			</section>
		{/if}
	</div>

	{#if locationSelectorShown && editedOffer}
		<Modal on:clickOut={() => (locationSelectorShown = false)}>
			<OfferOfLocationEditor
				offer={editedOffer}
				on:loadError={() => (locationSelectorShown = false)}
			/>
		</Modal>
	{/if}

	{#if isConfirming}
		<Modal on:clickOut={() => (isConfirming = false)}>
			<div class="card card-body bg-base-300 text-base-content max-w-[450px]">
				<div class="flex justify-center py-4 text-9xl">
					<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"
						><path
							fill="currentColor"
							d="m12.866 3l9.526 16.5a1 1 0 0 1-.866 1.5H2.474a1 1 0 0 1-.866-1.5L11.134 3a1 1 0 0 1 1.732 0M11 16v2h2v-2zm0-7v5h2V9z"
						/></svg
					>
				</div>
				<p class="text-justify">
					It is recommended to to add products for a category which is <span class="italic"
						>"end of the line"</span
					>
					- one, which has
					<span class="font-bold">no subcategories</span>.
				</p>
				<p class="text-justify">
					It makes the shop more intuitive, well-organized. <span class="font-bold"
						>Are you sure you want to insert a new product here?</span
					>
				</p>
				<div class="flex justify-center gap-2 pt-8">
					<Button class="grow" type="no" on:click={() => (isConfirming = false)} />
					<Button class="grow" type="yes" on:click={addRelatedProduct} />
				</div>
			</div>
		</Modal>
	{/if}

	<div class="flex items-center justify-between">
		<div class="flex items-center gap-2 px-4 pt-4">
			<button class="btn btn-outline" on:click={() => (categoriesShown = !categoriesShown)}>
				<svg
					class={`${categoriesShown ? '' : 'rotate-180'} transition-all`}
					xmlns="http://www.w3.org/2000/svg"
					width="1.8em"
					height="1.8em"
					viewBox="0 0 24 24"
					><g fill="none" fill-rule="evenodd"
						><path
							d="M24 0v24H0V0zM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427c-.002-.01-.009-.017-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093c.012.004.023 0 .029-.008l.004-.014l-.034-.614c-.003-.012-.01-.02-.02-.022m-.715.002a.023.023 0 0 0-.027.006l-.006.014l-.034.614c0 .012.007.02.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z"
						/><path
							fill="currentColor"
							d="M10.94 7.94a1.5 1.5 0 0 1 2.12 0l5.658 5.656a1.5 1.5 0 1 1-2.122 2.121L12 11.122l-4.596 4.596a1.5 1.5 0 1 1-2.122-2.12z"
						/></g
					></svg
				>
			</button>
			<div class="divider divider-horizontal"></div>
			<button class="btn btn-outline" on:click={backToRoot} disabled={isMoving}>
				<svg xmlns="http://www.w3.org/2000/svg" width="1.8em" height="1.8em" viewBox="0 0 24 24"
					><path fill="currentColor" d="M4 21V9l8-6l8 6v12h-6v-7h-4v7z" /></svg
				>
			</button>
			{#each $path as category, index (category.id)}
				<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 256 256"
					><path
						fill="currentColor"
						d="m184.49 136.49l-80 80a12 12 0 0 1-17-17L159 128L87.51 56.49a12 12 0 1 1 17-17l80 80a12 12 0 0 1-.02 17"
					/></svg
				>
				<button class="btn btn-ghost" on:click={() => backTo(category, index)} disabled={isMoving}>
					<span>{category.name}</span>
				</button>
			{/each}
		</div>

		<div class="flex items-center gap-2 px-4 pt-4">
			<button class="btn btn-secondary" disabled={isLoadingCategories} on:click={addRelatedProduct}>
				<svg xmlns="http://www.w3.org/2000/svg" width="1.8em" height="1.8em" viewBox="0 0 24 24"
					><path
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						d="M11 9h8m-4 4V5m2 12v6H1V7h6m0-6h16v16H7z"
					/></svg
				>
			</button>
			<div class="divider divider-horizontal"></div>
			<button class="btn btn-neutral" disabled={cancelDisabled} on:click={cancelMove}>
				<svg xmlns="http://www.w3.org/2000/svg" width="1.8em" height="1.8em" viewBox="0 0 24 24"
					><path
						fill="currentColor"
						d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2m-3.4 14L12 13.4L8.4 17L7 15.6l3.6-3.6L7 8.4L8.4 7l3.6 3.6L15.6 7L17 8.4L13.4 12l3.6 3.6z"
					/></svg
				>
			</button>
			<button class="btn btn-neutral" disabled={movingDisabled} on:click={handleMove}>
				{#if isMoving}
					<span class="loading loading-dots loading-xs"></span>
				{:else}
					<svg xmlns="http://www.w3.org/2000/svg" width="1.8em" height="1.8em" viewBox="0 0 24 24"
						><path
							fill="currentColor"
							d="M5 21q-.825 0-1.412-.587T3 19V9q0-.825.588-1.412T5 7h4v2H5v10h14V9h-4V7h4q.825 0 1.413.588T21 9v10q0 .825-.587 1.413T19 21zm7-5l-4-4l1.4-1.4l1.6 1.575V0h2v12.175l1.6-1.575L16 12z"
						/></svg
					>
				{/if}
			</button>
			<div class="divider divider-horizontal"></div>
			<button class="btn btn-primary" disabled={isLoadingCategories} on:click={createOffer}>
				<svg xmlns="http://www.w3.org/2000/svg" width="1.8em" height="1.8em" viewBox="0 0 24 24"
					><path
						fill="currentColor"
						d="m21.41 11.58l-9-9C12.04 2.21 11.53 2 11 2H4a2 2 0 0 0-2 2v7c0 .53.21 1.04.59 1.41l.41.4c.9-.54 1.94-.81 3-.81a6 6 0 0 1 6 6c0 1.06-.28 2.09-.82 3l.4.4c.37.38.89.6 1.42.6s1.04-.21 1.41-.59l7-7c.38-.37.59-.88.59-1.41s-.21-1.04-.59-1.42M5.5 7A1.5 1.5 0 0 1 4 5.5A1.5 1.5 0 0 1 5.5 4A1.5 1.5 0 0 1 7 5.5A1.5 1.5 0 0 1 5.5 7M10 19H7v3H5v-3H2v-2h3v-3h2v3h3z"
					/></svg
				>
			</button>
			<button
				disabled={isMoving}
				class={`btn btn-primary ${offersShown ? '' : 'btn-outline'}`}
				on:click={offersShown ? reset : () => handleLoadOffers()}
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="1.8em" height="1.8em" viewBox="0 0 32 32"
					><path
						fill="currentColor"
						d="M27 22.141V18a2 2 0 0 0-2-2h-8v-4h2a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h-6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2v4H7a2 2 0 0 0-2 2v4.142a4 4 0 1 0 2 0V18h8v4.142a4 4 0 1 0 2 0V18h8v4.141a4 4 0 1 0 2 0M13 4h6l.001 6H13ZM8 26a2 2 0 1 1-2-2a2 2 0 0 1 2 2m10 0a2 2 0 1 1-2-2a2.003 2.003 0 0 1 2 2m8 2a2 2 0 1 1 2-2a2 2 0 0 1-2 2"
					/></svg
				>
				<svg xmlns="http://www.w3.org/2000/svg" width="1.8em" height="1.8em" viewBox="0 0 24 24"
					><path
						fill="currentColor"
						d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2m0 16H5V5h14zM17 8.4L13.4 12l3.6 3.6l-1.4 1.4l-3.6-3.6L8.4 17L7 15.6l3.6-3.6L7 8.4L8.4 7l3.6 3.6L15.6 7z"
					/></svg
				>
			</button>
		</div>
	</div>

	{#if categoriesShown}
		<div transition:slide>
			<div class="divider px-4">
				{$selectedCategory ? 'Subcategories' : 'Categories'}
			</div>

			{#if isLoadingCategories}
				<div class="flex justify-center py-10">
					<div class="loading loading-spinner loading-lg"></div>
				</div>
			{:else}
				<div class="grid-cols-3cols grid gap-4 p-4">
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
								on:move={({ detail }) => setToMove(detail)}
							/>
						</div>
					{/each}
					<CategoryEditor
						categoryToMove={$categoryToMove}
						subcategoryOf={$selectedCategory}
						on:save={({ detail }) => addCategory(detail)}
					/>
				</div>
			{/if}
		</div>
	{/if}

	<div class="divider px-4">{offersShown ? 'Offers' : 'Products'}</div>

	<div class="flex items-center justify-between px-4">
		<div class="flex items-center gap-2">
			<button
				disabled={isMoving}
				class={`btn ${orphansShown ? 'btn-neutral' : 'btn-outline'}`}
				on:click={orphansShown ? reset : searchOrphans}
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="1.8em" height="1.8em" viewBox="0 0 32 32"
					><path
						fill="currentColor"
						d="M27 22.141V18a2 2 0 0 0-2-2h-8v-4h2a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h-6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2v4H7a2 2 0 0 0-2 2v4.142a4 4 0 1 0 2 0V18h8v4.142a4 4 0 1 0 2 0V18h8v4.141a4 4 0 1 0 2 0M13 4h6l.001 6H13ZM8 26a2 2 0 1 1-2-2a2 2 0 0 1 2 2m10 0a2 2 0 1 1-2-2a2.003 2.003 0 0 1 2 2m8 2a2 2 0 1 1 2-2a2 2 0 0 1-2 2"
					/></svg
				>
				<svg xmlns="http://www.w3.org/2000/svg" width="1.8em" height="1.8em" viewBox="0 0 24 24"
					><path
						fill="currentColor"
						d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2m0 16H5V5h14zM17 8.4L13.4 12l3.6 3.6l-1.4 1.4l-3.6-3.6L8.4 17L7 15.6l3.6-3.6L7 8.4L8.4 7l3.6 3.6L15.6 7z"
					/></svg
				>
			</button>
			<div class="divider divider-horizontal"></div>
			<button class="btn btn-warning" on:click={reset} disabled={isMoving}>
				<svg xmlns="http://www.w3.org/2000/svg" width="1.8em" height="1.8em" viewBox="0 0 24 24"
					><path
						fill="currentColor"
						d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89h15a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2m-3 12.59L17.59 17L14 13.41L10.41 17L9 15.59L12.59 12L9 8.41L10.41 7L14 10.59L17.59 7L19 8.41L15.41 12"
					/></svg
				>
			</button>
			<input
				type="text"
				class="input input-bordered w-80"
				placeholder="Search PRODUCTS in all categories"
				bind:value={nameSearch}
			/>
			<button class="btn btn-info" on:click={searchByName} disabled={isMoving}>
				<svg xmlns="http://www.w3.org/2000/svg" width="1.8em" height="1.8em" viewBox="0 0 24 24"
					><path
						fill="currentColor"
						d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5A6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5S14 7.01 14 9.5S11.99 14 9.5 14"
					/></svg
				>
			</button>
		</div>
		<div class="flex items-center gap-2">
			<input
				type="text"
				class="input input-bordered"
				placeholder="Filter here"
				bind:value={nameFilter}
			/>
			<button class="btn btn-warning" on:click={() => (nameFilter = '')}>
				<svg xmlns="http://www.w3.org/2000/svg" width="1.8em" height="1.8em" viewBox="0 0 2048 2048"
					><path
						fill="currentColor"
						d="M0 128h2048v219l-768 768v805H768v-805L0 347zm1920 165v-37H128v37l768 768v731h256v-731zm37 987l91 91l-230 229l230 229l-91 91l-229-230l-229 230l-91-91l230-229l-230-229l91-91l229 230z"
					/></svg
				>
			</button>
		</div>
	</div>

	<div class="divider px-4">Results</div>

	{#if !offersShown}
		<div class="flex flex-col gap-4 px-4 py-8">
			{#if isLoadingProducts}
				<div class="flex justify-center py-4">
					<div class="loading loading-spinner loading-lg"></div>
				</div>
			{:else if !$relatedProducts.length}
				<div class="flex justify-center py-4 text-9xl opacity-25">
					<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"
						><path
							fill="currentColor"
							d="M17.5 12a5.5 5.5 0 1 1 0 11a5.5 5.5 0 0 1 0-11m-2.476 3.024a.5.5 0 0 0 0 .707l1.769 1.77l-1.767 1.766a.5.5 0 1 0 .707.708l1.767-1.767l1.77 1.769a.5.5 0 1 0 .707-.707l-1.769-1.77l1.771-1.77a.5.5 0 0 0-.707-.707l-1.771 1.77l-1.77-1.77a.5.5 0 0 0-.707 0M17.75 3A3.25 3.25 0 0 1 21 6.25l.001 5.773a6.5 6.5 0 0 0-1.5-.71L19.5 8.5h-15v9.25c0 .966.784 1.75 1.75 1.75h5.064c.172.534.412 1.038.709 1.501L6.25 21A3.25 3.25 0 0 1 3 17.75V6.25A3.25 3.25 0 0 1 6.25 3zm0 1.5H6.25A1.75 1.75 0 0 0 4.5 6.25V7h15v-.75a1.75 1.75 0 0 0-1.75-1.75"
						/></svg
					>
				</div>
			{:else}
				{#each displayedProducts as product (product.id)}
					<ProductController
						{product}
						{isMoving}
						offerId={editedOffer?.id}
						on:delete={() => handleDelete(product)}
						on:selectToMove={() => selectToMove(product, $selectedCategory || undefined)}
						on:selectToCopy={() => selectToMove(product)}
						copyDisabled={isMoving || !$selectedCategory || $productToMove?.id === product.id}
						moveDisabled={isMoving || $productToMove?.id === product.id}
					/>
				{/each}
			{/if}
		</div>
	{:else}
		<div class="flex flex-col gap-4 px-4 py-8">
			{#if loadingOffers}
				<div class="flex justify-center py-4">
					<div class="loading loading-spinner loading-lg"></div>
				</div>
			{:else if !offers.length}
				<div class="flex justify-center py-4 text-9xl opacity-25">
					<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"
						><path
							fill="currentColor"
							d="M17.5 12a5.5 5.5 0 1 1 0 11a5.5 5.5 0 0 1 0-11m-2.476 3.024a.5.5 0 0 0 0 .707l1.769 1.77l-1.767 1.766a.5.5 0 1 0 .707.708l1.767-1.767l1.77 1.769a.5.5 0 1 0 .707-.707l-1.769-1.77l1.771-1.77a.5.5 0 0 0-.707-.707l-1.771 1.77l-1.77-1.77a.5.5 0 0 0-.707 0M17.75 3A3.25 3.25 0 0 1 21 6.25l.001 5.773a6.5 6.5 0 0 0-1.5-.71L19.5 8.5h-15v9.25c0 .966.784 1.75 1.75 1.75h5.064c.172.534.412 1.038.709 1.501L6.25 21A3.25 3.25 0 0 1 3 17.75V6.25A3.25 3.25 0 0 1 6.25 3zm0 1.5H6.25A1.75 1.75 0 0 0 4.5 6.25V7h15v-.75a1.75 1.75 0 0 0-1.75-1.75"
						/></svg
					>
				</div>
			{:else}
				{#each displayedOffers as offer (offer.id)}
					<div class="card bg-primary text-primary-content justify-between p-4">
						<div class="flex flex-row items-center justify-between">
							<p class="text-2xl font-bold">
								{offer.name}
							</p>
							<div class="flex gap-2">
								<Button
									type="delete"
									disabled={deletingOffer}
									loading={deletingOffer}
									on:click={() => deleteOffer(offer.id)}
								/>
								<div class="divider divider-horizontal"></div>
								<button
									class="btn btn-outline"
									disabled={deletingOffer}
									on:click={() => editOffer(offer)}
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="1.8em"
										height="1.8em"
										viewBox="0 0 32 32"
										><path
											fill="currentColor"
											d="M27.87 7.863L23.024 4.82l-7.89 12.566l4.843 3.04zM14.395 21.25l-.107 2.855l2.527-1.337l2.35-1.24l-4.673-2.936zM29.163 3.24L26.63 1.647a1.364 1.364 0 0 0-1.88.43l-1 1.588l4.843 3.042l1-1.586c.4-.64.21-1.483-.43-1.883zm-3.965 23.82c0 .275-.225.5-.5.5h-19a.5.5 0 0 1-.5-.5v-19a.5.5 0 0 1 .5-.5h13.244l1.884-3H5.698c-1.93 0-3.5 1.57-3.5 3.5v19c0 1.93 1.57 3.5 3.5 3.5h19c1.93 0 3.5-1.57 3.5-3.5V11.097l-3 4.776v11.19z"
										/></svg
									>
								</button>
							</div>
						</div>
					</div>
				{/each}
			{/if}
		</div>
	{/if}
</main>
