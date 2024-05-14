<script lang="ts">
  import { href } from "$lib/directives/useHref";
  import type { Options } from "$lib/directives/useHref";

  type Option = {
    display: string
    link: Options
    action?: undefined
  } | {
    display: string
    link?: undefined
    action: () => void
  }

  type MenuItem = (Option & { items?: undefined }) | {
    display: string
    items: Option[]
  }

  export let homeButton: Option
  export let menuItems: MenuItem[]
  export let actionButton: Option

</script>

<nav class="navbar bg-base-300">
  <div class="navbar-start">
    <div class="dropdown">
      <div tabindex="0" role="button" class="btn btn-ghost lg:hidden">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8m-8 6h16" /></svg>
      </div>
      <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
      <ul tabindex="0" class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
        {#each menuItems as menuItem}
          {#if menuItem.items}
            <li>
              <!-- svelte-ignore a11y-missing-attribute -->
              <a>{ menuItem.display }</a>
              <ul class="p-2">
                {#each menuItem.items as nestedItem}
                  {#if nestedItem.link}
                    <!-- svelte-ignore a11y-missing-attribute -->
                    <li><a use:href={nestedItem.link}>{ nestedItem.display }</a></li>
                  {:else}
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <!-- svelte-ignore a11y-no-static-element-interactions -->
                    <!-- svelte-ignore a11y-missing-attribute -->
                    <li><a on:click={nestedItem.action}>{ nestedItem.display }</a></li>
                  {/if}
                {/each}
              </ul>
            </li>
          {:else}
            {#if menuItem.link}
              <!-- svelte-ignore a11y-missing-attribute -->
              <li><a use:href={menuItem.link}>{ menuItem.display }</a></li>
            {:else}
              <!-- svelte-ignore a11y-click-events-have-key-events -->
              <!-- svelte-ignore a11y-no-static-element-interactions -->
              <!-- svelte-ignore a11y-missing-attribute -->
              <li><a on:click={menuItem.action}>{ menuItem.display }</a></li>
            {/if}
          {/if}
        {/each}
      </ul>
    </div>
    {#if homeButton.action}
      <button on:click={homeButton.action} class="btn btn-ghost text-xl">{ homeButton.display }</button>
      {:else}
      <!-- svelte-ignore a11y-missing-attribute -->
      <a use:href={homeButton.link} class="btn btn-ghost text-xl">{ homeButton.display }</a>
    {/if}
  </div>
  <div class="navbar-center hidden lg:flex">
    <ul class="menu menu-horizontal px-1">
      {#each menuItems as menuItem}
        {#if menuItem.items}
          <li>
            <!-- svelte-ignore a11y-missing-attribute -->
            <details>
              <summary>{ menuItem.display }</summary>
              <ul class="p-2">
                {#each menuItem.items as nestedItem}
                  {#if nestedItem.link}
                    <!-- svelte-ignore a11y-missing-attribute -->
                    <li><a use:href={nestedItem.link}>{ nestedItem.display }</a></li>
                  {:else}
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <!-- svelte-ignore a11y-no-static-element-interactions -->
                    <!-- svelte-ignore a11y-missing-attribute -->
                    <li><a on:click={nestedItem.action}>{ nestedItem.display }</a></li>
                  {/if}
                {/each}
              </ul>
            </details>
          </li>
        {:else}
          {#if menuItem.link}
            <!-- svelte-ignore a11y-missing-attribute -->
            <li><a use:href={menuItem.link}>{ menuItem.display }</a></li>
          {:else}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <!-- svelte-ignore a11y-missing-attribute -->
            <li><a on:click={menuItem.action}>{ menuItem.display }</a></li>
          {/if}
        {/if}
      {/each}
    </ul>
  </div>
  <div class="navbar-end">
    {#if actionButton.action}
      <button on:click={actionButton.action} class="btn">{ actionButton.display }</button>
    {:else}
      <!-- svelte-ignore a11y-missing-attribute -->
      <a use:href={actionButton.link} class="btn">{ actionButton.display }</a>
    {/if}
  </div>
</nav>