<script lang="ts">
  import { toast } from "@zerodevx/svelte-toast";
  import { applyAction, enhance } from "$app/forms";
  import type { SubmitFunction } from "@sveltejs/kit";

  let username = "";

  let loading = false;

  const update_password: SubmitFunction = ({ formData, cancel }) => {
    loading = true;

    return async ({ result }) => {
      loading = false;

      if (result.type === "success" || result.type === "redirect") {
        toast.push("Correo Enviado", { classes: ["success"] });
        await applyAction(result);
      }

      if (result.type === "failure") {
        toast.push(
          "Se requiere nueva contraseña y confirmación de la nueva contraseña",
          { classes: ["warning"] }
        );
      }
    };
  };
</script>

<svelte:head>
  <title>Restaurar Contraseña</title>
</svelte:head>

<div class="hero min-h-screen bg-base-200">
  <div class="hero-content w-full max-w-sm flex-col">
    <form
      class="card flex-shrink-0 w-full shadow-2xl bg-base-100"
      method="POST"
      use:enhance={update_password}
    >
      <div class="card-body">
        <h1
          class="text-2xl text-left font-medium tracking-wide text-neutral-focus"
        >
          Restaurar Contraseña
        </h1>
        <div class="form-control mt-3 lg:mt-4">
          <input
            type="text"
            placeholder="Nombre de Usuario"
            class="input input-bordered
        input-secondary"
            bind:value={username}
            name="username"
          />
        </div>
        <div class="form-control mt-6">
          <button type="submit" class="btn btn-secondary">
            {#if loading}
              <span class="loading loading-spinner loading-md" />
            {:else}
              Restaurar
            {/if}
          </button>
        </div>
      </div>
    </form>
  </div>
</div>
