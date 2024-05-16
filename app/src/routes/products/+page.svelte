<script lang="ts">
  import { getContext } from "svelte"
  import type { AppClient } from "../../api/appClient";
  import type { NotificationCTX } from "$lib/components/RequestNotifications/context";

  type Product = NonNullable<Awaited<ReturnType<typeof client.api.products.get>>['data'][0]>

  let products: Product[] = []

  const client = getContext<AppClient>('client')
  const { warn } = getContext<NotificationCTX>('notifications')

  let isLoadingProducts = false
  const loadProducts = async () => {
    isLoadingProducts = true
    const response = await client.api.products.get({ query: { } }).catch(() => {})
    isLoadingProducts = false
    if (!response || !response.data)
      return warn()

    products = response.data
  }
</script>

<main>

</main>