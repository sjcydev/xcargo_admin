<script lang="ts">
  import { createSearchStore, searchHandler } from "$lib/stores/search";
  import { onDestroy } from "svelte";
  import { goto } from "$app/navigation";
  import Fa from "svelte-fa";
  import {
    faCircleXmark,
    faCircleCheck,
    faDownload,
  } from "@fortawesome/free-solid-svg-icons";
  import axios from "axios";
  import { createInvoice } from "$lib/utils/createpdf";

  export let data: { facturas: VerFacturas[] };

  const searchUsuarios = data.facturas.map((factura: VerFacturas) => ({
    ...factura,
    searchTerm: `${factura.cliente.casillero}`,
  }));

  const searchStore = createSearchStore(searchUsuarios);

  const unsubscribe = searchStore.subscribe((model) => searchHandler(model));

  onDestroy(() => {
    unsubscribe();
  });

  async function marcarPagado(factura_id: number, pagado: boolean) {
    await axios.post(`/api/facturas/actualizar/${factura_id}`, { pagado });
  }
</script>

<svelte:head>
  <title>Facturas</title>
</svelte:head>

<div class="overflow-x-auto w-full h-full p-5 text-neutral-focus">
  <h1 class="text-2xl font-medium">Facturas</h1>

  <div class="my-3 w-full">
    <input
      class="input input-bordered input-secondary w-full"
      placeholder="Busqueda"
      bind:value={$searchStore.search}
    />
  </div>

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
        <th />
      </tr>
    </thead>
    <tbody>
      {#each $searchStore.filtered as factura, idx}
        <tr class="hover:bg-base-200">
          <td>{factura.fecha}</td>
          <th>{factura.factura_id}</th>
          <td>{factura.cliente.casillero}</td>
          <td>{factura.cliente.nombre} {factura.cliente.apellido}</td>
          <td>{factura.cliente.telefono}</td>
          <td>{factura.cliente.cedula}</td>
          <td>${factura.total.toFixed(2)}</td>
          <td class="text-lg text-center whitespace-nowrap w-1">
            <label class="swap swap-rotate">
              <input
                type="checkbox"
                checked={factura.pagado}
                on:change={() =>
                  marcarPagado(factura.factura_id, factura.pagado)}
              />
              <div class="swap-on">
                <Fa class="text-green-500 text-center" icon={faCircleCheck} />
              </div>
              <div class="swap-off">
                <Fa class="text-red-500 text-center" icon={faCircleXmark} />
              </div>
            </label>
          </td>
          <td class="text-right whitespace-nowrap w-1"
            ><button
              type="button"
              on:click={() =>
                createInvoice(
                  factura,
                  factura.factura_id,
                  factura.cliente,
                  true
                )}><Fa icon={faDownload} /></button
            ></td
          >
        </tr>
      {/each}
    </tbody>
    <tfoot>
      <tr>
        <th>Factura</th>
        <th>Casillero</th>
        <th>Nombre</th>
        <th>Telefono</th>
        <th>Identificación</th>
        <th>Sucursal</th>
        <th>Total</th>
        <th>Pagado</th>
        <th />
      </tr>
    </tfoot>
  </table>
</div>
