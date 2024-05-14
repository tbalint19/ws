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
  import { Duration } from "luxon";
  import { onMount } from "svelte";

  export let data
  
  const client = createClient(data.sessionToken)
  setContext<AppClient>('client', client)

  const userData = user(data.sessionToken)
  setContext<Readable<User>>('user', userData)

  const notificationCTX = createNotificationContext()
  setContext<NotificationCTX>('notifications', notificationCTX)

  let sessionDuration = ""
  onMount(() => {
    userData.subscribe(user => {
      if (user) {
        setInterval(() => {
          if (user.exp) {
            const remmaining = (user.exp * 1000) - new Date().getTime()
            const duration = Duration.fromMillis(remmaining).toFormat("hh:mm:ss")
            sessionDuration = duration
          }
        }, 100)
      }
    })
  })
</script>

<Navbar />
<slot />
<RequestNotifications />