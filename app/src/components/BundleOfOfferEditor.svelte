<script lang="ts">
  import type { AppClient } from "../api/appClient";
	import type { Bundle, BundleOfOffer, Product } from "../api/types/output";
  import Button from "./elements/Button.svelte";
  import { getContext } from "svelte";
  import type { NotificationCTX } from "$lib/components/RequestNotifications/context";
  import type { EventBus } from "../stores/eventbus";

  export let bundle: Bundle
  export let row: ({ bundle: Bundle, product: Product, bundleOfOffer: BundleOfOffer })

  const client = getContext<AppClient>('client')
  const { warn } = getContext<NotificationCTX>('notifications')
  const { publish } = getContext<EventBus>('eventbus')

  let isPatching = false
  const patch = async () => {
    isPatching = true
    const respone = await client.api["bundle-of-offer"]({ id: row.bundleOfOffer.id }).patch({ amount: amountInput }).catch(() => {})
    isPatching = false
    if (!respone || !respone.data)
      return warn()

    publish('BUNDLE_OF_OFFER_AMOUNT_PATCHED', respone.data)
  }

  let isDeleting = false
  const del = async () => {
    isDeleting = true
    const respone = await client.api["bundle-of-offer"]({ id: row.bundleOfOffer.id }).delete().catch(() => {})
    isDeleting = false
    if (!respone || !respone.data)
      return warn()

    publish('BUNDLE_OF_OFFER_AMOUNT_DELETED', respone.data)
  }

  let amountInput = row.bundleOfOffer.amount
</script>

<div class="flex justify-between items-center">
  <div>
    <p class={`text-xl ${bundle.id === row.bundle.id ? 'font-extrabold' : 'opacity-75'}`}>{ row.product.name } x{ row.bundle.multiplier} ({ row.bundle.name })</p>
  </div>
  <div class="flex items-center">
    <input class="input input-bordered w-20" type="number" bind:value={amountInput}>
    <div class="divider divider-horizontal"></div>
    <Button type="save" on:click={patch} loading={isPatching} disabled={isPatching || isDeleting || amountInput === row.bundleOfOffer.amount} />
    <Button class="ml-2" type="delete" on:click={del} loading={isDeleting} disabled={isPatching || isDeleting} />
  </div>
</div>