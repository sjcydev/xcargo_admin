<script lang="ts">
  import type { Facturas, Trackings, Usuarios } from "@prisma/client";
  import { enhance } from "$app/forms";
  import type { SubmitFunction } from "@sveltejs/kit";
  import { createInvoice } from "$lib/utils/createpdf";
  import { toast } from "@zerodevx/svelte-toast";
  import Fa from "svelte-fa";
  import {
    faDownload,
    faCircleCheck,
    faCircleXmark,
    faChevronLeft,
    faPaperPlane,
  } from "@fortawesome/free-solid-svg-icons";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";

  export let data: {
    factura: Facturas & { trackings: Trackings[] };
    cliente: Usuarios;
    user: Lucia.UserAttributes;
  };

  let metodoLoader = false;
  const metodoPago: SubmitFunction = () => {
    metodoLoader = true;

    return async () => {
      metodoLoader = false;
    };
  };

  let pagoLoader = false;
  const marcarPago: SubmitFunction = () => {
    pagoLoader = true;

    return async () => {
      pagoLoader = false;
    };
  };

  const marcarRetirado = (index: number) => {
    let tracking = data.factura.trackings[index];

    if (tracking) tracking.retirado = !tracking.retirado;
    data.factura.trackings = data.factura.trackings;
  };

  let timeout: ReturnType<typeof setTimeout>;

  let searching = false;
  let curr_tracking: string;
  function handleTrackingInput() {
    searching = true;
    clearTimeout(timeout);
    timeout = setTimeout(async () => {
      let tracking = data.factura.trackings.find(
        (tracking) => tracking.numero_tracking === curr_tracking
      );

      if (tracking) tracking.retirado = true;
      searching = false;
      curr_tracking = "";
      data.factura.trackings = data.factura.trackings;
    }, 1000);
  }

  let marcando = false;
  const marcarRetirados: SubmitFunction = () => {
    marcando = true;

    return async () => {
      marcando = false;
    };
  };

  let reenviando = false;
  async function reenviarFactura() {
    reenviando = true;
    let pdf = await createInvoice(
      data.factura,
      data.factura.factura_id,
      data.cliente,
      false,
      true
    );

    const reenviarData = {
      info: data.factura,
      cliente: data.cliente,
      factura_id: data.factura.factura_id,
      pdf,
    };

    await fetch("/api/emails/facturar", {
      method: "POST",
      body: JSON.stringify(reenviarData),
    })
      .then((res) => res.json())
      .then((data) => {
        toast.push(data.message, { classes: [data.status] });
        reenviando = false;
      });
  }

  let passwordAdmin: string;
  let cancelando = false;

  let modal: HTMLDialogElement;
  onMount(() => {
    modal = document.getElementById("cancelar_factura") as HTMLDialogElement;
  });

  async function cancelarFactura() {
    cancelando = true;

    await fetch(`/api/facturas/cancelar/${data.factura.factura_id}`, {
      method: "POST",
      body: JSON.stringify({ password: passwordAdmin, user: data.user }),
    })
      .then((res) => res.json())
      .then((data) => {
        cancelando = false;

        toast.push(data.message, { classes: [data.status] });

        if (data.status === "warning") {
          passwordAdmin = "";
        } else {
          modal.close();
          goto("/facturas");
        }
      });
  }
</script>

<svelte:head>
  <title>Factura {data.factura.factura_id}</title>
</svelte:head>

<button class="mt-4 mx-6 self-start text-lg" on:click={() => history.back()}>
  <Fa icon={faChevronLeft} />
</button>
<div class="overflow-x-auto w-full h-full p-5 text-neutral-focus">
  <div class="text-2xl font-medium px-1 flex justify-between">
    <div>
      <h1>Factura {data.factura.factura_id}</h1>
      <h1 class="text-xl">Total: ${data.factura.total.toFixed(2)}</h1>
    </div>
    <div class="flex gap-5">
      <button type="button" class="btn" on:click={() => reenviarFactura()}
        >Reenivar Factura
        {#if reenviando}
          <span class="loading loading-spinner loading-md" />
        {:else}
          <Fa icon={faPaperPlane} />
        {/if}
      </button>

      {#if data.user.rol === "ADMIN"}
        <button
          class="btn btn-accent"
          type="button"
          on:click={() => modal.showModal()}>Cancelar Factura</button
        >
        <dialog class="modal" id="cancelar_factura">
          <form method="dialog" class="modal-box">
            <button
              on:click={() => (passwordAdmin = "")}
              class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              >✕</button
            >
            <form
              method="POST"
              on:submit|preventDefault={() => {
                cancelarFactura();
              }}
            >
              <h3 class="font-normal text-lg">
                Seguro que quieres cancelar la factura {data.factura
                  .factura_id}?
              </h3>
              <div class="form-control lg:mt-2">
                <label for="peso" class="label">
                  <span class="label-text">Contraseña</span>
                </label>
                <input
                  type="password"
                  placeholder="Contraseña"
                  class="input input-bordered
        input-secondary"
                  bind:value={passwordAdmin}
                  required
                />
              </div>
              <button type="submit" class="btn btn-accent w-full mt-6">
                {#if cancelando}
                  <span class="loading loading-spinner loading-md" />
                {:else}
                  Cancelar Factura
                {/if}
              </button>
            </form>
          </form>
          <form method="dialog" class="modal-backdrop">
            <button on:click={() => (passwordAdmin = "")}>close</button>
          </form>
        </dialog>
      {/if}

      <button
        type="button"
        class="btn btn-primary"
        on:click={() =>
          createInvoice(
            data.factura,
            data.factura.factura_id,
            data.cliente,
            true
          )}>Descargar Factura <Fa icon={faDownload} /></button
      >
    </div>
  </div>

  <div class="form-control mt-2">
    <label for="casillero" class="label">
      <span class="label-text">Fecha</span>
    </label>
    <div class="w-full">
      <input
        type="text"
        name="casillero"
        class="input input-bordered
        input-secondary join-item w-full"
        bind:value={data.factura.fecha}
        disabled
      />
    </div>
  </div>
  <div class="form-control">
    <label for="casillero" class="label">
      <span class="label-text">Numero de Factura</span>
    </label>
    <div class="w-full">
      <input
        type="text"
        class="input input-bordered
        input-secondary w-full"
        bind:value={data.factura.factura_id}
        disabled
      />
    </div>
  </div>
  <div
    class="join join-vertical lg:join-horizontal gap-5 justify-between
    w-full"
  >
    <div class="join-item form-control w-full">
      <label for="casillero" class="label">
        <span class="label-text">Metodo de Pago</span>
      </label>
      <form method="POST" action="?/metodo_de_pago" use:enhance={metodoPago}>
        <input
          type="hidden"
          name="factura_id"
          value={data.factura.factura_id}
        />

        <div class="join w-full">
          <select
            placeholder="Metodo de Pago"
            name="metodopago"
            class="select select-bordered
        select-secondary join-item w-full font-normal"
            bind:value={data.factura.metodo_de_pago}
          >
            <option value="nulo">Nulo</option>
            <option value="yappy">Yappy</option>
            <option value="tarjeta">Tarjeta</option>
            <option value="efectivo">Efectivo</option>
            <option value="transferencia">Transferencia</option>
          </select>
          <button class="btn btn-secondary join-item"
            >{#if metodoLoader}
              <span class="loading loading-spinner loading-md" />
            {:else}
              Actualizar
            {/if}</button
          >
        </div>
      </form>
    </div>
  </div>

  <hr class="mt-4 mb-2" />

  <h1 class="text-xl font-medium px-1">Cliente</h1>

  <div class="form-control mt-2">
    <label for="casillero" class="label">
      <span class="label-text">Casillero </span>
    </label>
    <div class="w-full">
      <input
        type="text"
        name="casillero"
        class="input input-bordered
        input-secondary join-item w-full"
        bind:value={data.cliente.casillero}
        disabled
      />
    </div>
  </div>
  <div
    class="join join-vertical lg:join-horizontal gap-5 justify-between
    w-full"
  >
    <div class="join-item form-control w-full">
      <label for="casillero" class="label">
        <span class="label-text">Nombre </span>
      </label>
      <input
        type="text"
        placeholder="Nombre"
        class="input input-bordered
        input-secondary w-full"
        bind:value={data.cliente.nombre}
        disabled
      />
    </div>
    <div class="join-item form-control w-full">
      <label for="casillero" class="label">
        <span class="label-text">Apellido </span>
      </label>
      <input
        type="text"
        placeholder="Apellido"
        class="input input-bordered
        input-secondary w-full"
        bind:value={data.cliente.apellido}
        disabled
      />
    </div>
  </div>
  <div class="form-control">
    <label for="casillero" class="label">
      <span class="label-text">Correo </span>
    </label>
    <input
      type="text"
      placeholder="Correo"
      class="input input-bordered
        input-secondary"
      bind:value={data.cliente.correo}
      disabled
    />
  </div>
  <div class="form-control">
    <label for="casillero" class="label">
      <span class="label-text">Cedula </span>
    </label>
    <input
      type="text"
      placeholder="Cedula"
      class="input input-bordered
        input-secondary"
      bind:value={data.cliente.cedula}
      disabled
    />
  </div>

  <hr class="mt-4 mb-2" />

  <form
    class="flex justify-between"
    method="POST"
    action="?/marcarRetirados"
    use:enhance={marcarRetirados}
  >
    <h1 class="text-xl font-medium px-1">
      Trackings {#if searching}
        <span class="loading loading-spinner loading-xs text-secondary" />
      {/if}
    </h1>

    <div>
      <input
        type="hidden"
        value={JSON.stringify(data.factura)}
        name="factura"
      />
      <button class="btn btn-secondary"
        >Actualizar Retirados {#if marcando}
          <span class="loading loading-spinner loading-md" />
        {/if}
      </button>
    </div>
  </form>

  <div class="my-3 w-full">
    <input
      class="input input-bordered input-secondary w-full"
      placeholder="Marcar Trackings"
      bind:value={curr_tracking}
      on:input={() => {
        handleTrackingInput();
      }}
    />
  </div>

  <table class="table w-full table-fixed mt-5">
    <thead>
      <tr>
        <th class="w-0">QTY</th>
        <th class="w-[60%]">Numero de Tracking</th>
        <th>Precio Base</th>
        <th>Peso (lbs)</th>
        <th>Total</th>
        <th>Estado</th>
      </tr>
    </thead>
    <tbody>
      {#each data.factura.trackings as tracking, idx}
        <tr
          class="font-semibold cursor-pointer {tracking.retirado
            ? 'bg-success'
            : 'bg-error'}"
          on:click={() => marcarRetirado(idx)}
        >
          <td>1</td>
          <td class="break-words">{tracking.numero_tracking}</td>
          <td>${tracking.base.toFixed(2)}</td>
          <td>{tracking.peso}</td>
          <td>${tracking.precio.toFixed(2)}</td>
          <td>{tracking.retirado ? "RETIRADO" : "NO RETIRADO"}</td>
        </tr>
      {/each}
    </tbody>
    <tfoot>
      <tr>
        <th>QTY</th>
        <th>Numero de Tracking</th>
        <th>Precio Base</th>
        <th>Peso (lbs)</th>
        <th>Total</th>
        <th>Estado</th>
      </tr>
    </tfoot>
  </table>
</div>
