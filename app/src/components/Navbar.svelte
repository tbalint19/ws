<script lang="ts">
  import { derived, type Readable } from "svelte/store";
  import type { User } from "../stores/user";
  import Navbar from "$lib/components/Navbar.svelte";
  import { builOpenIdUrl } from "$lib/util/buildOpenIdUrl";
  import { getContext, onMount } from "svelte";
  import {
    PUBLIC_GOOGLE_AUTH_URL,
    PUBLIC_GOOGLE_CLIENT_ID,
    PUBLIC_GOOGLE_REDIRECT
  } from "$env/static/public";

  const authUrl = builOpenIdUrl({
    url: PUBLIC_GOOGLE_AUTH_URL,
    clientId: PUBLIC_GOOGLE_CLIENT_ID,
    redirectUri: PUBLIC_GOOGLE_REDIRECT
  });

  const user = getContext<Readable<User>>("user")

  const menuItems = $user ? [
    { display: "Categories", link: { path: "/categories" } },
    { display: "Products", link: { path: "/products" } },
    { display: "Uploads", items: [
      { display: "Images", link: { path: "/gallery" } },
      { display: "Documents", link: { path: "/documents" } },
    ] },
  ] : [ ]

  const actionButton = $user ?
    { display: "Logout", link: { path: "/logout" } } :
    { display: "Login", link: { path: authUrl } }

  let timeout: ReturnType<typeof setTimeout> | null = null
  let remaining: number | null = null
  user.subscribe(user => {
    if (user) {
      const exp = user.exp
      if (exp) {
        timeout = setInterval(() => {
          const now = new Date().getTime()
          remaining = exp - now
          if (remaining <= 0) {

          }
        }, 100)
      }
    }
  })
</script>

<Navbar
  homeButton={{ display: "Webshop admin", link: { path: "/" } }}
  menuItems={menuItems}
  actionButton={actionButton} />