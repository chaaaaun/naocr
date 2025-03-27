<script>
  import Mecab from "mecab-wasm";

  import Camera from "./lib/components/Camera.svelte";
  import Results from "./lib/components/Results.svelte";
  import { initWorker } from "./lib/utils/ocr";
  import { sharedState } from "./state.svelte";
</script>

<main>
  {#await initWorker()}
    <p class="p-4">Loading OCR Engine...</p>
  {:then}
    {#await Mecab.waitReady()}
      <p class="p-4">Loading tokenizer...</p>
    {:then}
      {#if sharedState.imageDataUrl}
        <Results />
      {:else}
        <Camera />
      {/if}
    {/await}
  {:catch error}
    <p class="p-4">Error loading OCR Engine: {error.message}</p>
  {/await}
</main>
