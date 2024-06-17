<script lang="ts">
  import { applyAction, enhance } from "$app/forms";
  import { toast } from "@zerodevx/svelte-toast";
  import type { SubmitFunction } from "@sveltejs/kit";
  import BackButton from "$lib/components/BackButton.svelte";

  let registering = false;
  export let data;

  const signup: SubmitFunction = () => {
    registering = true;

    return async ({ result }) => {
      registering = false;

      if (result.type === "success" || result.type === "redirect") {
        toast.push("Usuario registrado exitosamente!", {
          classes: ["success"],
        });
        await applyAction(result);
      }

      if (result.type === "failure") {
        if (result?.data?.errors.correo_registrado) {
          toast.push("Correo ya esta registrado!", { classes: ["warning"] });
        }

        if (result?.data?.errors.codigo_invalido) {
          toast.push("Codigo secreto invalido", { classes: ["warning"] });
        }

        if (result?.data?.errors.register_fail) {
          toast.push("Nombre de usuario ya esta registrado!", {
            classes: ["warning"],
          });
        }
      }
    };
  };
</script>

{#if data?.user?.rol === "ADMIN"}
  <BackButton />
{/if}

<div class="hero min-h-screen bg-base-200">
  <div class="hero-content flex-col max-w-md lg:max-w-lg w-full">
    <form
      class="card flex-shrink-0 shadow-2xl w-full bg-base-100"
      method="POST"
      use:enhance={signup}
    >
      <div class="card-body">
        <h1
          class="text-2xl text-left font-medium tracking-wide
          text-neutral-focus"
        >
          Crear Usuario
        </h1>
        <div
          class="join join-vertical lg:join-horizontal gap-5 justify-between mt-4"
        >
          <div class="join-item form-control w-full">
            <input
              type="text"
              placeholder="Nombre"
              class="input input-bordered
        input-secondary w-full"
              name="nombre"
              required
            />
          </div>
          <div class="join-item form-control w-full">
            <input
              type="text"
              placeholder="Apellido"
              class="input input-bordered
        input-secondary w-full"
              name="apellido"
              required
            />
          </div>
        </div>
        <div class="form-control mt-3 lg:mt-4">
          <input
            type="text"
            placeholder="Username"
            class="input input-bordered
        input-secondary"
            name="username"
            required
          />
        </div>
        <div class="form-control mt-3 lg:mt-4">
          <input
            type="text"
            placeholder="Correo"
            class="input input-bordered
        input-secondary"
            name="correo"
            required
          />
        </div>
        {#if data?.user?.rol === "ADMIN"}
          <input type="hidden" value="ADMIN_y" name="admin_control" />
          <div class="form-control w-full">
            <p class="label">
              <span class="label-text">Rol</span>
            </p>
            <select
              class="select select-secondary select-bordered w-full font-medium"
              name="rol"
            >
              <option disabled selected value="">Rol</option>
              <option value="ADMIN">Administrador</option>
              <option value="SECRETARIA">Secretaria</option>
              <option value="EMPLEADO">Empleado</option>
            </select>
          </div>
        {/if}
        <div class="form-control mt-3 lg:mt-4">
          <input
            type="password"
            placeholder="Codigo Secreto"
            class="input input-bordered
        input-secondary"
            name="codigo"
            required
          />
        </div>
        <div class="form-control mt-6">
          <button type="submit" class="btn btn-secondary">
            {#if registering}
              <span class="loading loading-spinner loading-md" />
            {:else}
              Crear Usuario
            {/if}
          </button>
        </div>
      </div>
    </form>
  </div>
</div>
