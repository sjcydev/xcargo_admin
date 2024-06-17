<script lang="ts">
  import { goto } from "$app/navigation";
  import SveltyPicker from "svelty-picker";
  import { paginate, LightPaginationNav } from "svelte-paginate";
  import { enhance } from "$app/forms";
  import type { SubmitFunction } from "@sveltejs/kit";
  import { toast } from "@zerodevx/svelte-toast";
  import type { Reportes } from "@prisma/client";
  import {
    getToday,
    dateToLocaleString,
    getDateFromISO,
  } from "$lib/utils/datehandler";

  export let data: { reportes: Reportes[] };

  // let pageSize = 25;
  // let currentPage = 1;

  // const searchUsuarios = data.facturas.map((factura: VerFacturas) => ({
  //   ...factura,
  //   searchTerm: `${factura.cliente.casillero} ${
  //     factura.pagado ? "pagado" : "pendiente"
  //   }`,
  // }));

  // const searchStore = createSearchStore(searchUsuarios);

  // $: paginatedItems = paginate({
  //   items: $searchStore.filtered,
  //   pageSize,
  //   currentPage,
  // });
  // const unsubscribe = searchStore.subscribe((model) => searchHandler(model));

  // onDestroy(() => {
  //   unsubscribe();
  // });

  // let today = new Date().toLocaleDateString("en-GB").split("/").join("-");

  let today = dateToLocaleString(getToday()).split("/").join("-");

  let fechaInicial = today;
  let fechaFinal = today;

  function resetFechas() {
    fechaInicial = today;
    fechaFinal = today;
  }

  let loading = false;
  const generar: SubmitFunction = () => {
    loading = true;

    return async ({ result, update }) => {
      loading = false;
      let dialog = document.getElementById("closeDialog");

      if (result.type === "failure") {
        toast.push(result.data?.error?.message, { classes: ["warning"] });
        if (result.data?.close) {
          dialog?.click();
        }
      }

      if (result.type === "success") {
        dialog?.click();
        await update();
      }
    };
  };
</script>

<svelte:head>
  <title>Reportes</title>
</svelte:head>

<div class="overflow-x-auto w-full h-full p-5 text-neutral-focus">
  <div class="flex justify-between">
    <h1 class="text-2xl font-medium">Reportes</h1>
    <button
      class="btn btn-secondary"
      type="button"
      onclick="add_tracking.showModal()">Generar Reporte</button
    >
  </div>
  <dialog class="modal" id="add_tracking">
    <form method="dialog" class="modal-box max-w-fit">
      <button
        class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
        on:click={() => resetFechas()}>✕</button
      >
      <form method="POST" use:enhance={generar} action="?/generarReporte">
        <h3 class="font-bold text-lg">Reporte</h3>
        <div class="flex gap-5">
          <div class="form-control">
            <p class="label">
              <span class="label-text">Fecha Inicial</span>
            </p>
            <SveltyPicker
              inputClasses="input input-secondary input-bordered"
              name="fechaInicio"
              format="dd-mm-yyyy"
              placeholder="DD-MM-YYYY"
              todayBtn={false}
              bind:value={fechaInicial}
              required
              pickerOnly
            />
          </div>
          <div class="form-control">
            <p class="label">
              <span class="label-text">Fecha Final</span>
            </p>
            <SveltyPicker
              inputClasses="input input-secondary input-bordered"
              name="fechaFinal"
              format="dd-mm-yyyy"
              placeholder="DD-MM-YYYY"
              todayBtn={false}
              bind:value={fechaFinal}
              required
              pickerOnly
            />
          </div>
        </div>

        <button
          type={loading ? "button" : "submit"}
          class="btn btn-secondary w-full mt-6"
          >{#if loading}
            <span class="loading loading-spinner loading-md" />
          {:else}
            Generar
          {/if}
        </button>
      </form>
    </form>
    <form method="dialog" class="modal-backdrop">
      <button id="closeDialog" on:click={() => resetFechas()}>close</button>
    </form>
  </dialog>

  <!-- <div class="my-3 w-full join"> -->
  <!--   <input -->
  <!--     class="input input-bordered join-item input-secondary w-full" -->
  <!--     placeholder="Buscar Casillero" -->
  <!--     bind:value={$searchStore.search} -->
  <!--     on:input={() => (currentPage = 1)} -->
  <!--   /> -->

  <!--   <select -->
  <!--     class="select select-bordered select-secondary join-item" -->
  <!--     bind:value={$searchStore.filtro} -->
  <!--   > -->
  <!--     <option disabled selected value="">Filtrador</option> -->
  <!--     <option value="">Todos</option> -->
  <!--     <option value="pendiente">Pendiente</option> -->
  <!--     <option value="pagado">Pagado</option> -->
  <!--   </select> -->
  <!-- </div> -->

  <!-- <LightPaginationNav -->
  <!--   totalItems={$searchStore.filtered.length} -->
  <!--   {pageSize} -->
  <!--   {currentPage} -->
  <!--   limit={1} -->
  <!--   showStepOptions={true} -->
  <!--   on:setPage={(e) => (currentPage = e.detail.page)} -->
  <!-- /> -->

  <table class="table table-sm table-auto">
    <thead>
      <tr>
        <th>Reporte Nº</th>
        <th>Fecha Inicial</th>
        <th>Factura Final</th>
        <th>Nº Facturas</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody>
      {#each data?.reportes as reporte}
        <tr
          class="hover:bg-base-200 cursor-pointer"
          on:click={() => goto(`/reportes/${reporte.reporte_id}`)}
        >
          <td>{reporte.reporte_id}</td>
          <td
            >{dateToLocaleString(
              getDateFromISO(reporte.fechaInicial.toISOString())
            )}</td
          >
          <td
            >{dateToLocaleString(
              getDateFromISO(reporte.fechaFinal.toISOString())
            )}</td
          >
          <td>{reporte.facturas}</td>
          <td>${reporte.total?.toFixed(2)}</td>
        </tr>
      {/each}
    </tbody>
    <tfoot>
      <tr>
        <th>Reporte Nº</th>
        <th>Fecha Inicial</th>
        <th>Fecha Final</th>
        <th>Nº Facturas</th>
        <th>Total</th>
      </tr>
    </tfoot>
  </table>
</div>

<style>
  :global(.pagination-nav) {
    box-shadow: none !important;
  }
</style>
