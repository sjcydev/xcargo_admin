<script lang="ts">
  import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
  import Fa from "svelte-fa";
</script>

<button
  class="mt-4 mx-6 self-start text-lg absolute top-2 p-3"
  on:click={() => history.back()}
>
  <Fa icon={faChevronLeft} />
</button>
