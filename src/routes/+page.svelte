<script lang="ts">
  import type { Usuarios } from "@prisma/client";
  import { createSearchStore, searchHandler } from "$lib/stores/search";
  import { onDestroy } from "svelte";
  import { goto } from "$app/navigation";

  export let data: { usuarios: Usuarios[] };

  const searchUsuarios = data.usuarios.map((usuario: Usuarios) => ({
    ...usuario,
    searchTerm: `${usuario.id} ${usuario.nombre} ${usuario.apellido}
${usuario.cedula} ${usuario.telefono} ${usuario.correo}`,
  }));

  const searchStore = createSearchStore(searchUsuarios);

  const unsubscribe = searchStore.subscribe((model) => searchHandler(model));

  onDestroy(() => {
    unsubscribe();
  });
</script>

<svelte:head>
  <title>Clientes</title>
</svelte:head>

<div class="overflow-x-auto w-full h-full p-5 text-neutral-focus">
  <h1 class="text-2xl font-medium">Clientes</h1>

  <div class="my-3 w-full">
    <input
      class="input input-bordered input-secondary w-full"
      placeholder="Busqueda"
      bind:value={$searchStore.search}
    />
  </div>

  <table class="table table-sm">
    <thead>
      <tr>
        <th>Casillero</th>
        <th>Nombre</th>
        <th>Correo</th>
        <th>Telefono</th>
        <th>Identificación</th>
        <th>Sexo</th>
      </tr>
    </thead>
    <tbody>
      {#each $searchStore.filtered as usuario}
        <tr
          class="hover:bg-base-200 cursor-pointer"
          on:click={() => goto(`/clientes/${usuario.casillero}`)}
        >
          <th>{usuario.casillero}</th>
          <td>{usuario.nombre} {usuario.apellido}</td>
          <td>{usuario.correo}</td>
          <td>{usuario.telefono}</td>
          <td>{usuario.cedula}</td>
          <td>{usuario.sexo}</td>
        </tr>
      {/each}
    </tbody>
    <tfoot>
      <tr>
        <th>Casillero</th>
        <th>Nombre</th>
        <th>Correo</th>
        <th>Telefono</th>
        <th>Identificación</th>
        <th>Sexo</th>
      </tr>
    </tfoot>
  </table>
</div>
