<script lang="ts">
  import "../app.css";
  import { setContext } from "svelte"
  import Navbar from "../components/Navbar.svelte";
  import { createClient, type AppClient } from "../api/appClient";
  import { user, type User } from "../stores/user";
  import type { Readable } from "svelte/store"
  import RequestNotifications from "$lib/components/RequestNotifications/RequestNotifications.svelte";
  import { createNotificationContext } from "$lib/components/RequestNotifications/context";
  import type { NotificationCTX } from "$lib/components/RequestNotifications/context";

  export let data
  
  const client = createClient(data.sessionToken)
  setContext<AppClient>('client', client)
  setContext<Readable<User>>('user', user(data.sessionToken))

  const notificationCTX = createNotificationContext()
  setContext<NotificationCTX>('notifications', notificationCTX)
</script>

<Navbar />
<slot />
<RequestNotifications />