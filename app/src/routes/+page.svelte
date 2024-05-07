<script lang="ts">
  import { getContext } from "svelte";
  import { type AppClient } from "../api/appClient";
  import { type NotificationCTX } from "$lib/components/RequestNotifications/context";


  const http = getContext<AppClient>('client')
  const notifications = getContext<NotificationCTX>('notifications')

  let brand = ""

  const demoReq = async () => {
    const response = await http.api.cars.post({ brand, topSpeed: 220 })
    if (!response.error)
      notifications.report()
  }
</script>

<main>

</main>