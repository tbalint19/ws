<script lang="ts">
  import type { Readable } from "svelte/store";
  import type { User } from "../stores/user";
  import Navbar from "$lib/components/Navbar.svelte";
  import { builOpenIdUrl } from "$lib/util/buildOpenIdUrl";
  import { getContext } from "svelte";
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
  const actionButton = $user ?
    { display: "Logout", link: { path: "/logout" } } :
    { display: "Login", link: { path: authUrl } }
</script>

<Navbar
  homeButton={{ display: "App name", link: { path: "/" } }}
  menuItems={[
    { display: "About", link: { hash: "/about" } },
    { display: "Second link", items: [
      { display: "First nested", link: { hash: "" } },
      { display: "Second nested", link: { hash: "" } },
    ] },
    { display: "Third link", link: { hash: "" } },
  ]}
  actionButton={actionButton} />