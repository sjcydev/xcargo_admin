<script lang="ts">
  import axios from "axios";
  import { toast } from "@zerodevx/svelte-toast";
  import Fa from "svelte-fa";
  import { faTrashCan } from "@fortawesome/free-solid-svg-icons";
  import { createInvoice } from "$lib/utils/createpdf";

  let info: Factura = {
    casillero: "",
    trackings: [],
  };

  const precioBase = 2.75;

  let infoTracking = {
    numero_tracking: "",
    peso: 1,
    precio: precioBase,
    base: precioBase,
    reset: function () {
      this.numero_tracking = "";
      this.peso = 1;
      this.precio = this.base;
    },
  };

  let cliente = {
    id: 0,
    nombre: "",
    apellido: "",
    correo: "",
    precio: 2.75,
    telefono: "",
  };

  function resetCliente() {
    cliente.id = 0;
    cliente.nombre = "";
    cliente.apellido = "";
    cliente.correo = "";
    cliente.precio = 2.75;
    cliente.telefono = "";
  }

  function resetInfo() {
    info.casillero = "";
    info.trackings = [];
  }

  let creating = false;
  async function crearFactura(event: Event) {
    if (info.trackings.length === 0) {
      toast.push("No tienes numero de trackings añadidos", {
        classes: ["warning"],
      });
    } else {
      creating = true;
      let totalSum = 0;
      info.trackings.forEach((tracking) => {
        totalSum += tracking.precio;
      });
      let total = Number(totalSum.toFixed(2));
      await axios
        .post("/api/facturas/crear", { info, id: cliente.id, total })
        .then(async ({ data }) => {
          const { status, message, factura } = data;

          let pdf = await createInvoice(info, factura.factura_id, cliente);

          axios
            .post("/api/emails/facturar", {
              info,
              cliente,
              factura_id: factura.factura_id,
              pdf,
            })
            .then(({ data }) => {
              toast.push(data.message, { classes: [data.status] });
            });

          toast.push(message, { classes: [status] });
          const form = event.target as HTMLFormElement;
          form.reset();
          resetInfo();
          resetCliente();
          creating = false;
        })
        .catch(({ response }) => {
          creating = false;
          const { status, message } = response.data;
          toast.push(message, { classes: [status] });
        });
    }
  }

  let especial = false;

  function addTracking(event: Event) {
    const tracking = { ...infoTracking };
    tracking.base = Number(tracking.base);
    tracking.peso = Number(tracking.peso);
    tracking.precio = Number(tracking.precio);
    info.trackings.push(tracking);
    info.trackings = info.trackings;
    const form = event.target as HTMLFormElement;
    form.reset();
    infoTracking.reset();
    infoTracking = infoTracking;
  }

  function deleteTracking(index: number) {
    info.trackings.splice(index, 1);
    info = info;
  }

  let timeout: ReturnType<typeof setTimeout>;
let searching = false;

function handleCasilleroChange() {
  clearTimeout(timeout);
  timeout = setTimeout(async () => {
    const casillero = info.casillero as string;
    if (casillero.length === 0) {
      resetCliente();
      resetInfo();
      return;
    }

    searching = true;
    const url = /\d/.test(casillero) ? `/api/clientes/${casillero}` : `/api/corporativo/${casillero}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      processClienteData(data);
    } catch (error) {
      console.error('Error fetching client data:', error);
    } finally {
      searching = false;
    }
  }, 1500);
}

function processClienteData(data: any) {
  if (data.cliente) {
    cliente = data.cliente;
    especial = cliente.precio !== precioBase;
    infoTracking.base = cliente.precio;
    infoTracking.precio = infoTracking.base;
  } else {
    resetCliente();
    resetInfo();
  }
}

  const handlePriceChange = () => {
    infoTracking.precio = infoTracking.base * infoTracking.peso;
    infoTracking.precio = Number(infoTracking.precio.toFixed(2));
  };
</script>

<svelte:head>
  <title>Facturación</title>
</svelte:head>

<div class="hero min-h-screen bg-base-200">
  <div class="hero-content flex-col w-full">
    <form
      class="card flex-shrink-0 shadow-2xl w-full bg-base-100"
      method="POST"
      on:submit|preventDefault={(e) => crearFactura(e)}
    >
      <div class="card-body">
        <h1 class="text-2xl text-left font-medium tracking-wide text-neutral">
          Facturar
        </h1>
        <div class="form-control mt-3 lg:mt-4">
          <label for="casillero" class="label">
            <span class="label-text"
              >Casillero
              {#if searching}
                <span
                  class="loading loading-spinner loading-xs text-secondary"
                />
              {/if}
            </span>
          </label>
          <div class="join join-horizontal w-full">
            <input
              type="text"
              name="casillero"
              class="input input-bordered
        input-secondary join-item w-full"
              bind:value={info.casillero}
              required
              on:input={() => handleCasilleroChange()}
            />
            <button
              type="button"
              class="btn btn-secondary join-item"
              on:click={() => handleCasilleroChange()}>Buscar</button
            >
          </div>
        </div>
        <div
          class="join join-vertical lg:join-horizontal gap-5 justify-between mt-4"
        >
          <div class="join-item form-control w-full">
            <input
              type="text"
              placeholder="Nombre"
              class="input input-bordered
        input-secondary w-full"
              bind:value={cliente.nombre}
              disabled
            />
          </div>
          <div class="join-item form-control w-full">
            <input
              type="text"
              placeholder="Apellido"
              class="input input-bordered
        input-secondary w-full"
              bind:value={cliente.apellido}
              disabled
            />
          </div>
        </div>
        <div class="form-control mt-3 lg:mt-4">
          <input
            type="text"
            placeholder="Correo"
            class="input input-bordered
        input-secondary"
            bind:value={cliente.correo}
            disabled
          />
        </div>
        {#if cliente.nombre}
          <div class="form-control mt-4">
            <p>Tipo de Casillero</p>
            <div class="form-control w-fit">
              <label class="label cursor-pointer">
                <input
                  type="radio"
                  name="tipo"
                  class="radio radio-secondary"
                  on:click={() => {
                    especial = false;
                    infoTracking.base = precioBase;
                    infoTracking.precio = infoTracking.base;
                  }}
                  checked={!especial}
                />
                <span class="label-text ml-2">Cliente Casillero</span>
              </label>
            </div>
            <div class="form-control w-fit">
              <label class="label cursor-pointer">
                <input
                  type="radio"
                  name="tipo"
                  class="radio radio-secondary"
                  on:click={() => (especial = true)}
                  checked={especial}
                />
                <span class="label-text ml-2">Cliente Precio Especial</span>
              </label>
            </div>
          </div>
          <div class="overflow-x-auto mt-4 text-white">
            <div class="flex justify-between items-center mb-2">
              <h2 class="text-xl">Trackings</h2>

              <button
                class="btn btn-secondary"
                type="button"
                onclick="add_tracking.showModal()">Añadir</button
              >
              <dialog class="modal" id="add_tracking">
                <form method="dialog" class="modal-box">
                  <button
                    class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                    >✕</button
                  >
                  <form
                    method="POST"
                    on:submit|preventDefault={(e) => addTracking(e)}
                  >
                    <h3 class="font-bold text-lg">Tracking</h3>
                    <div class="form-control lg:mt-2">
                      <label for="peso" class="label">
                        <span class="label-text">Peso (lbs)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Peso"
                        class="input input-bordered
        input-secondary"
                        bind:value={infoTracking.peso}
                        on:input={handlePriceChange}
                        required
                      />
                    </div>
                    <div class="form-control mt-3 lg:mt-4">
                      <label for="tracking" class="label">
                        <span class="label-text">Numero de Tracking</span>
                      </label>
                      <input
                        type="text"
                        class="input input-bordered
        input-secondary"
                        bind:value={infoTracking.numero_tracking}
                        required
                      />
                    </div>
                    <div class="form-control mt-2">
                      <label for="precio" class="label">
                        <span class="label-text">Precio</span>
                      </label>
                      <input
                        type="text"
                        name="precio"
                        placeholder="Precio"
                        class="input input-bordered
        input-secondary"
                        bind:value={infoTracking.base}
                        disabled={!especial}
                        on:input={handlePriceChange}
                      />
                    </div>
                    <div class="form-control mt-2">
                      <label for="precio" class="label">
                        <span class="label-text">Total</span>
                      </label>
                      <input
                        type="text"
                        name="precio"
                        placeholder="Total"
                        class="input input-bordered
        input-secondary"
                        bind:value={infoTracking.precio}
                        disabled
                      />
                    </div>
                    <button type="submit" class="btn btn-secondary w-full mt-6"
                      >Añadir</button
                    >
                  </form>
                </form>
                <form method="dialog" class="modal-backdrop">
                  <button>close</button>
                </form>
              </dialog>
            </div>
            <table class="table">
              <thead>
                <tr>
                  <th>QTY</th>
                  <th>Numero de Tracking</th>
                  <th>Peso (lbs)</th>
                  <th>Precio Total</th>
                  <th />
                </tr>
              </thead>
              <tbody class="text-black">
                {#each info.trackings as tracking, ind}
                  <tr>
                    <th>1</th>
                    <td class="w-full">{tracking.numero_tracking}</td>
                    <td class="w-full text-right">{tracking.peso}</td>
                    <td class="w-full text-right">${tracking.precio}</td>
                    <td class="w-auto text-right"
                      ><button
                        type="button"
                        on:click={() => deleteTracking(ind)}
                        ><Fa icon={faTrashCan} /></button
                      ></td
                    >
                  </tr>
                {/each}
                {#if info.trackings.length === 0}
                  <tr>
                    <td colspan="4" class="text-center italic text-base-content"
                      >No hay trackings añadidos
                    </td>
                  </tr>
                {/if}
              </tbody>
            </table>
          </div>
        {/if}
        <div class="form-control mt-6">
          <button type="submit" class="btn btn-secondary">
            {#if creating}
              <span class="loading loading-spinner loading-md" />
            {:else}
              Crear Factura
            {/if}
          </button>
        </div>
      </div>
    </form>
  </div>
</div>
