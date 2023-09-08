<script>
  import { page } from "$app/stores";
  import "../app.css";
  import { SvelteToast } from "@zerodevx/svelte-toast";
  import Fa from "svelte-fa";
  import { navigating } from "$app/stores";
  import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";

  let options = {
    theme: {
      "--toastBarHeight": 0,
      "--toastPadding": "0 10px",
      "--toastBorderRadius": "0.5rem",
    },
  };

  let protectedRoutes = new Set(["/login", "/aa1834160", "/password_update"]);
</script>

<SvelteToast {options} />
{#if protectedRoutes.has($page.url.pathname)}
  {#if $navigating}
    <div class="hero min-h-screen bg-base-200">
      <div class="hero-content w-full max-w-sm flex-col">
        <span class="loading loading-infinity text-secondary w-20" />
      </div>
    </div>
  {:else}
    <slot />
  {/if}
{:else}
  <div class="drawer lg:drawer-open">
    <input id="my-drawer-2" type="checkbox" class="drawer-toggle" />
    <div class="drawer-content flex flex-col items-center justify-center">
      {#if $navigating}
        <span class="loading loading-infinity text-secondary w-20" />
      {:else}
        <slot />
      {/if}
      <!-- <label for="my-drawer-2" class="btn btn-primary drawer-button lg:hidden">Open drawer</label> -->
    </div>
    <div class="drawer-side">
      <label for="my-drawer-2" class="drawer-overlay" />
      <ul class="menu p-4 w-80 h-full bg-secondary text-secondary-content">
        <div class="menu-title text-white">
          <h1
            class="text-xl font-medium flex justify-between
        place-items-center"
          >
            Menu <form method="POST">
              <button type="submit" formaction="/?/logout"
                ><Fa icon={faRightFromBracket} /></button
              >
            </form>
          </h1>
        </div>
        <li><a href="/">Clientes</a></li>
        <li><a href="/facturar">Facturar</a></li>
        <li><a href="/facturas">Ver Facturas</a></li>
        <li><a href="/tracking">Tracking Interno</a></li>
      </ul>
    </div>
  </div>
{/if}

<style>
  :global(.success) {
    --toastBackground: hsl(var(--su));
    --toastColor: hsl(var(--suc));
  }

  :global(.warning) {
    --toastBackground: hsl(var(--wa));
    --toastColor: hsl(var(--wac));
  }
</style>
