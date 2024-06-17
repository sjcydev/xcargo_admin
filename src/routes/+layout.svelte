<script>
  import "../app.css";
  import { SvelteToast } from "@zerodevx/svelte-toast";
  import { navigating, page } from "$app/stores";
  import Fa from "svelte-fa";
  import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";

  let options = {
    theme: {
      "--toastBarHeight": 0,
      "--toastPadding": "0 10px",
      "--toastBorderRadius": "0.5rem",
    },
  };

  let protectedRoutes = new Set(["/login", "/registrar", "/password_update"]);

  let routes = [
    { path: "/", title: "Clientes" },
    { path: "/facturar", title: "Facturar Cliente" },
    { path: "/facturas", title: "Ver Facturas" },
    { path: "/tracking", title: "Tracking Interno" },
    { path: "/reportes", title: "Reportes" },
  ];

  export let data;
</script>

<SvelteToast {options} />
{#if protectedRoutes.has($page.url.pathname) && $page.url.pathname !== "/registar" && data?.user?.rol !== "ADMIN"}
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
      <!-- <label for="my-drawer-2" class="btn btn-primary drawer-button lg:hidden" -->
      <!--   >Open drawer</label -->
      <!-- > -->
    </div>
    <div class="drawer-side">
      <label for="my-drawer-2" class="drawer-overlay" />
      <ul
        class="menu p-4 w-80 h-full bg-secondary text-secondary-content block"
      >
        <div class="menu-title text-white">
          <h1
            class="text-xl font-medium flex justify-between
        place-items-center"
          >
            Menu
          </h1>
        </div>
        <div class="flex flex-col justify-between h-[95%]">
          <div class="grow">
            {#each routes as route}
              {#if route.path === "/reportes"}
                {#if data?.user?.rol !== "EMPLEADO"}
                  <li>
                    <a
                      class={$page.url.pathname === route.path ? "active" : ""}
                      href={route.path}>{route.title}</a
                    >
                  </li>
                {/if}
              {:else}
                <li>
                  <a
                    class={$page.url.pathname === route.path ? "active" : ""}
                    href={route.path}>{route.title}</a
                  >
                </li>
              {/if}
            {/each}
          </div>
          <li class="dropdown dropdown-top dropdown-end">
            <label tabindex="0" class="avatar placeholder">
              <div class="bg-neutral text-neutral-content rounded-full w-10">
                <span>{data.user.name.charAt(0).toUpperCase()}</span>
              </div>
              {data.user.name}
            </label>
            <ul
              tabindex="0"
              class="dropdown-content z-[1] menu p-2 shadow bg-base-100
              rounded-box w-full text-black mb-2"
            >
              {#if data.user.rol === 'ADMIN'}
                <li><a href="/registrar">Añadir Usuario</a></li>
              {/if}
              <li>
                <form method="POST">
                  <button type="submit" class="w-full" formaction="/?/logout"
                    >Cerrar Sesión</button
                  >
                </form>
              </li>
            </ul>
          </li>
        </div>
      </ul>
    </div>
  </div>
{/if}

<!-- <div class="drawer"> -->
<!--   <input id="my-drawer-3" type="checkbox" class="drawer-toggle" /> -->
<!--   <div class="drawer-content flex flex-col"> -->
<!--     <!-- Navbar -->
<!--     <div class="w-full navbar bg-secondary text-white"> -->
<!--       <div class="flex-none lg:hidden"> -->
<!--         <label for="my-drawer-3" class="btn btn-square btn-ghost"> -->
<!--           <svg -->
<!--             xmlns="http://www.w3.org/2000/svg" -->
<!--             fill="none" -->
<!--             viewBox="0 0 24 24" -->
<!--             class="inline-block w-6 h-6 stroke-current" -->
<!--             ><path -->
<!--               stroke-linecap="round" -->
<!--               stroke-linejoin="round" -->
<!--               stroke-width="2" -->
<!--               d="M4 6h16M4 12h16M4 18h16" -->
<!--             /></svg -->
<!--           > -->
<!--         </label> -->
<!--       </div> -->
<!--       <div class="flex-1 px-2 mx-2">Navbar Title</div> -->
<!--       <div class="flex-none hidden lg:block"> -->
<!--         <ul class="menu menu-horizontal"> -->
<!--           <!-- Navbar menu content here -->

<!--           {#each routes as route} -->
<!--             {#if route.path === "/reporte"} -->
<!--               {#if data?.user?.rol !== "EMPLEADO"} -->
<!--                 <li> -->
<!--                   <a -->
<!--                     class={$page.url.pathname === route.path ? "active" : ""} -->
<!--                     href={route.path}>{route.title}</a -->
<!--                   > -->
<!--                 </li> -->
<!--               {/if} -->
<!--             {:else} -->
<!--               <li> -->
<!--                 <a -->
<!--                   class={$page.url.pathname === route.path ? "active" : ""} -->
<!--                   href={route.path}>{route.title}</a -->
<!--                 > -->
<!--               </li> -->
<!--             {/if} -->
<!--           {/each} -->
<!--         </ul> -->
<!--       </div> -->
<!--     </div> -->
<!--     <!-- Page content here -->
<!--     <div class="drawer-content flex flex-col items-center justify-center"> -->
<!--       {#if $navigating} -->
<!--         <div class="hero min-h-screen bg-base-200"> -->
<!--           <div class="hero-content w-full max-w-sm flex-col"> -->
<!--             <span class="loading loading-infinity text-secondary w-20" /> -->
<!--           </div> -->
<!--         </div> -->
<!--       {:else} -->
<!--         <slot /> -->
<!--       {/if} -->
<!--     </div> -->
<!--   </div> -->
<!--   <div class="drawer-side"> -->
<!--     <label for="my-drawer-3" class="drawer-overlay" /> -->
<!--     <ul class="menu p-4 w-80 min-h-full bg-base-200"> -->
<!--       <!-- Sidebar content here -->

<!--       {#each routes as route} -->
<!--         {#if route.path === "/reporte"} -->
<!--           {#if data?.user?.rol !== "EMPLEADO"} -->
<!--             <li> -->
<!--               <a href={route.path}>{route.title}</a> -->
<!--             </li> -->
<!--           {/if} -->
<!--         {:else} -->
<!--           <li> -->
<!--             <a href={route.path}>{route.title}</a> -->
<!--           </li> -->
<!--         {/if} -->
<!--       {/each} -->
<!--     </ul> -->
<!--   </div> -->
<!-- </div> -->

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
