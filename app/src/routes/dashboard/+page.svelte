<script lang="ts">
  import { getContext } from "svelte"
  import type { Readable } from "svelte/store"
  import type { User } from "../../stores/user";
  import { type AppClient } from "../../api/appClient";
  import { type NotificationCTX } from "$lib/components/RequestNotifications/context";

  import Link from "../../components/elements/Link.svelte";
</script>

<svelte:head>
  <title>Dashboard</title>
  <!-- <meta name="description" content={data.items?.map(i => i).join(", ")} /> -->
</svelte:head>

<main>
  <div class="p-8 grid grid-cols-4cols gap-4">
    <div class="card card-body bg-base-300 text-base-content">
      <div class="px-16 py-4">
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 24 24"><path fill="currentColor" d="M5 2h14v2h-1v4h4v2h-1v10h1v2H2v-2h1V10H2V8h4V4H5zm3 2v4h8V4zm-3 6v10h3v-7h8v7h3V10zm9 10v-5h-4v5zM10.998 4.998h2.004v2.004h-2.004z"/></svg>
      </div>
      <Link display="Locations" href="/locations" />
    </div>
    <div class="card card-body bg-base-300 text-base-content">
      <div class="px-16 py-4">
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 2048 2048"><path fill="currentColor" d="M1024 1000v959l-64 32l-832-415V536l832-416l832 416v744h-128V680zm-64-736L719 384l621 314l245-122zm-64 1552v-816L256 680v816zM335 576l625 312l238-118l-622-314zm1073 1216v-128h640v128zm0-384h640v128h-640zm-256 640v-128h128v128zm0-512v-128h128v128zm0 256v-128h128v128zm-128 24h1zm384 232v-128h640v128z"/></svg>
      </div>
      <Link display="Products" href="/products" />
    </div>
    <div class="card card-body bg-base-300 text-base-content">
      <div class="px-16 py-4">
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 256 256"><path fill="currentColor" d="m213.66 66.34l-40-40A8 8 0 0 0 168 24H88a16 16 0 0 0-16 16v16H56a16 16 0 0 0-16 16v144a16 16 0 0 0 16 16h112a16 16 0 0 0 16-16v-16h16a16 16 0 0 0 16-16V72a8 8 0 0 0-2.34-5.66M168 216H56V72h76.69L168 107.31zm32-32h-16v-80a8 8 0 0 0-2.34-5.66l-40-40A8 8 0 0 0 136 56H88V40h76.69L200 75.31Zm-56-32a8 8 0 0 1-8 8H88a8 8 0 0 1 0-16h48a8 8 0 0 1 8 8m0 32a8 8 0 0 1-8 8H88a8 8 0 0 1 0-16h48a8 8 0 0 1 8 8"/></svg>
      </div>
      <Link display="Files" href="/gallery" />
    </div>
    <div class="card card-body bg-base-300 text-base-content">
      <div class="px-16 py-4">
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 24 24"><path fill="currentColor" d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12c5.16-1.26 9-6.45 9-12V5Zm0 3.9a3 3 0 1 1-3 3a3 3 0 0 1 3-3m0 7.9c2 0 6 1.09 6 3.08a7.2 7.2 0 0 1-12 0c0-1.99 4-3.08 6-3.08"/></svg>
      </div>
      <Link display="Permissions" href="/permissions" />
    </div>
  </div>

  <div class="p-8 pb-0 grid grid-cols-4cols gap-4">
    <div class="card card-body bg-base-300 text-base-content">
      <div class="px-16 py-4">
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 24 24"><path fill="currentColor" d="M5 2h14v2h-1v4h4v2h-1v10h1v2H2v-2h1V10H2V8h4V4H5zm3 2v4h8V4zm-3 6v10h3v-7h8v7h3V10zm9 10v-5h-4v5zM10.998 4.998h2.004v2.004h-2.004z"/></svg>
      </div>
      <Link display="Alerts" href="/alerts" />
    </div>
    <div class="card card-body bg-base-300 text-base-content">
      <div class="px-16 py-4">
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 24 24"><path fill="currentColor" d="M5 2h14v2h-1v4h4v2h-1v10h1v2H2v-2h1V10H2V8h4V4H5zm3 2v4h8V4zm-3 6v10h3v-7h8v7h3V10zm9 10v-5h-4v5zM10.998 4.998h2.004v2.004h-2.004z"/></svg>
      </div>
      <Link display="Sales" href="/sales" />
    </div>
  </div>
</main>