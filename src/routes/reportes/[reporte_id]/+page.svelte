<script lang="ts">
  import type { Facturas, MetodoPago, Reportes } from "@prisma/client";
  import Fa from "svelte-fa";
  import {
    faDownload,
    faCircleCheck,
    faCircleXmark,
    faChevronLeft,
  } from "@fortawesome/free-solid-svg-icons";
  import { createReport } from "$lib/utils/createpdf";
  import { getDateFromISO, dateToLocaleString } from "$lib/utils/datehandler";

  export let data: {
    reporte: Reportes;
    facturas: Facturas[];
    porMetodo: {
      _count: number;
      _sum: { total: number };
      metodo_de_pago: MetodoPago;
    }[];
  };

  let fechaInicial = dateToLocaleString(
    getDateFromISO(data.reporte.fechaInicial.toISOString())
  );

  let fechaFinal = dateToLocaleString(
    getDateFromISO(data.reporte.fechaFinal.toISOString())
  );

  // let timeout: ReturnType<typeof setTimeout>;

  // let searching = false;
  // let curr_tracking: string;
  // function handleTrackingInput() {
  //   searching = true;
  //   clearTimeout(timeout);
  //   timeout = setTimeout(async () => {
  //     let tracking = data.factura.trackings.find(
  //       (tracking) => tracking.numero_tracking === curr_tracking
  //     );

  //     if (tracking) tracking.retirado = true;
  //     searching = false;
  //     curr_tracking = "";
  //     data.factura.trackings = data.factura.trackings;
  //   }, 1000);
  // }

  function capitalize(text: string) {
    text = text.charAt(0).toUpperCase() + text.slice(1);
    return text;
  }
</script>

<svelte:head>
  <title>Reporte {data.reporte.reporte_id}</title>
</svelte:head>

<button class="mt-4 mx-6 self-start text-lg" on:click={() => history.back()}>
  <Fa icon={faChevronLeft} />
</button>
<div class="overflow-x-auto w-full h-full p-5 text-neutral-focus">
  <div class="text-2xl font-medium px-1 flex justify-between">
    <div>
      <h1>Reporte {data.reporte.reporte_id}</h1>
      <h1 class="text-xl">Total: ${data.reporte.total.toFixed(2)}</h1>
    </div>
    <button
      type="button"
      class="btn btn-accent"
      on:click={() => createReport(data.reporte, data.facturas, true)}
      >Descargar Reporte <Fa icon={faDownload} /></button
    >
  </div>

  {#if fechaInicial === fechaFinal}
    <div class="form-control w-full">
      <label for="casillero" class="label">
        <span class="label-text">Fecha</span>
      </label>
      <div class="w-full">
        <input
          type="text"
          name="casillero"
          class="input input-bordered
        input-secondary w-full"
          bind:value={fechaInicial}
          disabled
        />
      </div>
    </div>
  {:else}
    <div
      class="join join-vertical lg:join-horizontal justify-between gap-5 w-full"
    >
      <div class="join-item form-control w-full">
        <label for="casillero" class="label">
          <span class="label-text">Fecha Inicial</span>
        </label>
        <div class="w-full">
          <input
            type="text"
            name="casillero"
            class="input input-bordered
        input-secondary w-full"
            bind:value={fechaInicial}
            disabled
          />
        </div>
      </div>
      <div class="join-item form-control w-full">
        <label for="casillero" class="label">
          <span class="label-text">Fecha Final</span>
        </label>
        <div class="w-full">
          <input
            type="text"
            class="input input-bordered
        input-secondary w-full"
            bind:value={fechaFinal}
            disabled
          />
        </div>
      </div>
    </div>
  {/if}

  <div class="stats shadow mt-5 w-full">
    {#each data.porMetodo as metodo}
      <div class="stat place-items-center">
        <div class="stat-title">{capitalize(metodo.metodo_de_pago)}</div>
        <div class="stat-value">${metodo._sum.total.toFixed(2)}</div>
        <div class="stat-desc text-secondary">
          {metodo._count}
          {metodo._count <= 1 ? "Factura" : "Facturas"}
        </div>
      </div>
    {/each}
  </div>

  <hr class="mt-4 mb-2" />

  <h1 class="text-xl font-medium px-1">Facturas</h1>

  <table class="table table-sm table-auto mt-5">
    <thead>
      <tr>
        <th>Fecha</th>
        <th>Casillero</th>
        <th>Factura Nº</th>
        <th>Total</th>
        <th>Metodo de Pago</th>
        <th>Estado de Pago</th>
        <th>Fecha de Pago</th>
      </tr>
    </thead>
    <tbody>
      {#each data.facturas as factura}
        <tr>
          <td>{factura.fecha}</td>
          <td>{factura.casillero}</td>
          <th>{factura.factura_id}</th>
          <th>${factura.total.toFixed(2)}</th>
          <td>{factura.metodo_de_pago.toUpperCase()}</td>
          <td class="text-lg text-right">
            <div>
              {#if factura.pagado}
                <div class="text-right">
                  <Fa class="text-green-500 text-right" icon={faCircleCheck} />
                </div>
              {:else}
                <div class="text-right">
                  <Fa class="text-red-500 text-right" icon={faCircleXmark} />
                </div>
              {/if}
            </div>
          </td>
          <td
            >{factura.pagadoAt
              ? dateToLocaleString(
                  getDateFromISO(factura.pagadoAt?.toISOString())
                )
              : ""}</td
          >
        </tr>
      {/each}
    </tbody>
    <tfoot>
      <tr>
        <th>Fecha</th>
        <th>Factura Nº</th>
        <th>Total</th>
        <th>Metodo de Pago</th>
        <th>Estado de Pago</th>
        <th>Fecha de Pago</th>
      </tr>
    </tfoot>
  </table>
</div>
