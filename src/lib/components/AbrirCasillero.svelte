<script lang="ts">
  import SveltyPicker from "svelty-picker";
  import axios from "axios";
  import { applyAction, enhance } from "$app/forms";
  import { toast } from "@zerodevx/svelte-toast";
  // import validateAll from "$lib/utils/form-check";
  import { page } from "$app/stores";
  import type { SubmitFunction } from "@sveltejs/kit";

  export let formAction: string;

  let maxDate = new Date();
  let usuario = {
    nombre: "",
    apellido: "",
    correo: "",
    telefono: "",
    nacimiento: "",
    cedula: "",
    sexo: "",
    sucursal: "Chorrera",

    reset: function () {
      this.nombre = "";
      this.apellido = "";
      this.correo = "";
      this.telefono = "";
      this.nacimiento = "";
      this.cedula = "";
      this.sexo = "";
      this.sucursal = "Chorrera";
    },
  };

  let registering = false;

  async function crearUsuario(event: Event) {
    registering = true;
    let valid = true;
    // valid = validateAll(usuario);
    if (valid) {
      usuario.cedula = usuario.cedula.split(" ").join("");
      axios
        .post("/api/usuarios", { usuario })
        .then(({ data }) => {
          const { status, message } = data;
          toast.push(message, { classes: [status] });
          const form = event.target as HTMLFormElement;
          form.reset();
          usuario.reset();
          registering = false;
        })
        .catch(({ response }) => {
          registering = false;
          const { status, message } = response.data;
          toast.push(message, { classes: [status] });
        });
    } else {
      registering = false;
    }
  }

  const crearUsuario2: SubmitFunction = () => {
    registering = true;

    return async ({ result }) => {
      registering = false;

      if (result.type === "failure") {
        if (result?.data?.errors.email_registered) {
          toast.push("Correo ya esta registrado!", { classes: ["warning"] });
        }
      }

      if (result.type === "success" || result.type === "redirect") {
        await applyAction(result);
      }
    };
  };
</script>

<form
  class="card flex-shrink-0 max-w-lg w-full shadow-2xl bg-base-100
  text-neutral-focus {$page.url.pathname === '/registrar'
    ? 'my-16'
    : ''} lg:my-0"
  method="POST"
  use:enhance={crearUsuario2}
  action={formAction}
>
  <div class="flex flex-auto flex-col lg:p-8 p-4 gap-2">
    <h1 class="text-2xl text-left font-medium tracking-wide">
      Crear Casillero
    </h1>
    <div class="form-control w-full">
      <p class="label">
        <span class="label-text">Sucursal</span>
      </p>
      <select
        class="select select-bordered w-full font-medium select-secondary"
        bind:value={usuario.sucursal}
        name="sucursal"
        required
      >
        <option selected value="Chorrera">Chorrera</option>
        <option value="Panamá">Panamá</option>
      </select>
    </div>

    <div
      class="join join-vertical lg:join-horizontal gap-5 justify-between mt-4"
    >
      <div class="join-item form-control w-full">
        <input
          type="text"
          name="nombre"
          placeholder="Nombre"
          class="input input-secondary input-bordered w-full"
          bind:value={usuario.nombre}
          required
        />
      </div>
      <div class="join-item form-control w-full">
        <input
          type="text"
          name="apellido"
          placeholder="Apellido"
          class="input input-secondary input-bordered
        w-full"
          bind:value={usuario.apellido}
          required
        />
      </div>
    </div>
    <div class="form-control mt-3 lg:mt-4">
      <input
        type="text"
        name="correo"
        placeholder="Correo"
        class="input input-secondary input-bordered
        "
        bind:value={usuario.correo}
        required
      />
    </div>
    <div class="form-control mt-3 lg:mt-4">
      <input
        type="text"
        name="cedula"
        placeholder="Cedula o Pasaporte"
        class="input input-secondary input-bordered
        "
        bind:value={usuario.cedula}
        required
      />
    </div>
    <div class="form-control mt-3 lg:mt-4">
      <input
        type="text"
        name="telefono"
        placeholder="Telefono"
        class="input input-secondary input-bordered
        "
        bind:value={usuario.telefono}
        required
      />
    </div>
    <div
      class="join join-vertical lg:join-horizontal gap-2 lg:gap-5 justify-between"
    >
      <div class="join-item form-control">
        <p class="label">
          <span class="label-text">Fecha de Nacimiento</span>
        </p>
        <SveltyPicker
          inputClasses="input input-secondary input-bordered"
          name="nacimiento"
          format="dd-mm-yyyy"
          placeholder="DD-MM-YYYY"
          todayBtn={false}
          endDate={maxDate}
          required
          bind:value={usuario.nacimiento}
        />
      </div>
      <div class="join-item form-control w-full">
        <p class="label">
          <span class="label-text">Sexo</span>
        </p>
        <select
          class="select select-secondary select-bordered w-full font-medium {usuario.sexo ===
          ''
            ? 'text-base-300'
            : ''}"
          name="sexo"
          bind:value={usuario.sexo}
          required
        >
          <option disabled selected value="">Sexo</option>
          <option value="masculino">Masculino</option>
          <option value="femenino">Femenino</option>
          <option value="otros">Otros</option>
        </select>
      </div>
    </div>
    <div class="form-control">
      <label class="label justify-start gap-2 cursor-pointer">
        <span class="label-text">Enviar correo al usuario</span>
        <input
          type="checkbox"
          name="enviar"
          class="checkbox checkbox-secondary checkbox-sm"
          checked
        />
      </label>
    </div>
    <div class="form-control mt-6">
      <button type="submit" class="btn btn-secondary">
        {#if registering}
          <span class="loading loading-spinner loading-md" />
        {:else}
          Abrir Casillero
        {/if}
      </button>
    </div>
  </div>
</form>
