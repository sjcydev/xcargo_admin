<script lang="ts">
  import { toast } from "@zerodevx/svelte-toast";
  import Logo from "$lib/assets/fullLogoNegro.png";
  import { applyAction, enhance } from "$app/forms";
  import type { SubmitFunction } from "@sveltejs/kit";

  let loading = false;
  const login: SubmitFunction = () => {
    loading = true;

    return async ({ result }) => {
      loading = false;

      if (result.type === "success" || result.type === "redirect") {
        await applyAction(result);
      }

      if (result.type === "failure") {
        if (result?.data?.errors?.username) {
          toast.push("Nombre de usuario es requerido", {
            classes: ["warning"],
          });
        }

        if (result?.data?.errors?.password) {
          toast.push("Contraseña es requerida", { classes: ["warning"] });
        }

        if (result?.data?.errors?.auth_fail) {
          toast.push("Usuario o Contraseña Incorrecta", {
            classes: ["warning"],
          });
        }
      }
    };
  };
</script>

<svelte:head>
  <title>Iniciar Sesión</title>
</svelte:head>

<div class="hero min-h-screen bg-base-200">
  <div class="hero-content w-full max-w-sm flex-col">
    <img src={Logo} alt="logo" class="w-4/6 mb-5" />
    <form
      class="card flex-shrink-0 w-full shadow-2xl bg-base-100"
      method="POST"
      use:enhance={login}
    >
      <div class="card-body">
        <h1
          class="text-2xl text-left font-medium tracking-wide text-neutral-focus"
        >
          Iniciar Sesión
        </h1>
        <div class="form-control mt-3 lg:mt-4">
          <input
            type="text"
            placeholder="Nombre de Usuario"
            class="input input-bordered
        input-secondary"
            name="username"
          />
        </div>
        <div class="form-control mt-3 lg:mt-4">
          <input
            type="password"
            placeholder="Contraseña"
            class="input input-bordered
        input-secondary"
            name="password"
          />
        </div>
        <div class="form-control mt-6">
          <button type="submit" class="btn btn-secondary">
            {#if loading}
              <span class="loading loading-spinner loading-md" />
            {:else}
              Iniciar
            {/if}
          </button>
        </div>
      </div>
    </form>
  </div>
</div>
