<script lang="ts">
  import { createSearchStore, searchHandler } from "$lib/stores/search";
  import { onDestroy } from "svelte";
  import { goto } from "$app/navigation";
  import Fa from "svelte-fa";
  import {
    faCircleXmark,
    faCircleCheck,
  } from "@fortawesome/free-solid-svg-icons";
  import { paginate, LightPaginationNav } from "svelte-paginate";

  export let data: { facturas: VerFacturas[] };

  let pageSize = 25;
  let currentPage = 1;

  const searchUsuarios = data.facturas.map((factura: VerFacturas) => ({
    ...factura,
    searchTerm: `${factura.cliente.casillero} ${factura.cliente.codigo} ${
      factura.pagado ? "pagado" : "pendiente"
    }`,
  }));

  const searchStore = createSearchStore(searchUsuarios);

  $: paginatedItems = paginate({
    items: $searchStore.filtered,
    pageSize,
    currentPage,
  });
  const unsubscribe = searchStore.subscribe((model) => searchHandler(model));

  onDestroy(() => {
    unsubscribe();
  });
</script>

<svelte:head>
  <title>Facturas</title>
</svelte:head>

<div class="overflow-x-auto w-full h-full p-5 text-neutral-focus">
  <h1 class="text-2xl font-medium">Facturas</h1>

  <div class="my-3 w-full join">
    <input
      class="input input-bordered join-item input-secondary w-full"
      placeholder="Buscar Casillero"
      bind:value={$searchStore.search}
      on:input={() => (currentPage = 1)}
    />

    <select
      class="select select-bordered select-secondary join-item"
      bind:value={$searchStore.filtro}
    >
      <option disabled selected value="">Filtrador</option>
      <option value="">Todos</option>
      <option value="pendiente">Pendiente</option>
      <option value="pagado">Pagado</option>
    </select>
  </div>

  <LightPaginationNav
    totalItems={$searchStore.filtered.length}
    {pageSize}
    {currentPage}
    limit={1}
    showStepOptions={true}
    on:setPage={(e) => (currentPage = e.detail.page)}
  />

  <table class="table table-sm table-auto">
    <thead>
      <tr>
        <th>Fecha</th>
        <th>Factura</th>
        <th>Casillero</th>
        <th>Nombre</th>
        <th>Telefono</th>
        <th>Identificación</th>
        <th>Total</th>
        <th>Pagado</th>
        <th>Retirados</th>
      </tr>
    </thead>
    <tbody>
      {#each paginatedItems as factura, idx}
        <tr
          class="hover:bg-base-200 cursor-pointer"
          on:click={() => goto(`/facturas/${factura.factura_id}`)}
        >
          <td>{factura.fecha}</td>
          <th>{factura.factura_id}</th>
          <td>{factura.cliente.casillero}</td>
          <td>{factura.cliente.nombre} {factura.cliente.apellido}</td>
          <td>{factura.cliente.telefono}</td>
          <td>{factura.cliente.cedula}</td>
          <td>${factura.total.toFixed(2)}</td>
          <td class="text-lg text-center whitespace-nowrap w-1">
            <div>
              {#if factura.pagado}
                <div>
                  <Fa class="text-green-500 text-center" icon={faCircleCheck} />
                </div>
              {:else}
                <div>
                  <Fa class="text-red-500 text-center" icon={faCircleXmark} />
                </div>
              {/if}
            </div>
          </td>
          <td class="text-lg text-center whitespace-nowrap w-1">
            <div>
              {#if factura.retirados}
                <div>
                  <Fa class="text-green-500 text-center" icon={faCircleCheck} />
                </div>
              {:else}
                <div>
                  <Fa class="text-red-500 text-center" icon={faCircleXmark} />
                </div>
              {/if}
            </div>
          </td>
        </tr>
      {/each}
    </tbody>
    <tfoot>
      <tr>
        <th>Fecha</th>
        <th>Factura</th>
        <th>Casillero</th>
        <th>Nombre</th>
        <th>Telefono</th>
        <th>Identificación</th>
        <th>Total</th>
        <th>Pagado</th>
      </tr>
    </tfoot>
  </table>
</div>

<style>
  :global(.pagination-nav) {
    box-shadow: none !important;
  }
</style>
