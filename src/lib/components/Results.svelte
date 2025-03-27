<script lang="ts">
  import { sharedState } from "../../state.svelte";
  import { recognizeText } from "../utils/ocr";
  import { preprocessImage } from "../utils/preprocessing";

  let detectedText = $state<string[]>([]);
  let ogCanvas: HTMLCanvasElement | null = $state(null);
  let procCanvas: HTMLCanvasElement | null = $state(null);
  let processingMethod: string = $state("standard");

  $effect(() => {
    if (!sharedState.imageDataUrl || !procCanvas || !ogCanvas) return;
    sharedState.imageProcessing = false;
    detectedText = [];
    preprocessImage(
      sharedState.imageDataUrl,
      sharedState.boxCoordinates,
      sharedState.boxScale,
      ogCanvas,
      procCanvas,
      processingMethod
    );
  });

  $effect(() => {
    if (!sharedState.processedDataUrl || !procCanvas) return;
    const ctx = procCanvas.getContext("2d");
    if (ctx) {
      const img = new Image();
      img.onload = () => {
        if (!procCanvas) return;
        const scale = Math.min(
          procCanvas.width / img.width,
          procCanvas.height / img.height
        );
        ctx.drawImage(img, 0, 0, img.width * scale, img.height * scale);
      };
      img.src = sharedState.processedDataUrl;
      recognizeText(sharedState.processedDataUrl, sharedState.orientation).then(
        (result) => {
          console.log("result", result);
          detectedText = result;
        }
      );
    }
  });
</script>

<div class="flex flex-col justify-center items-center gap-2 p-2">
  <canvas
    bind:this={ogCanvas}
    class="w-full object-contain border-red-500 border"
  ></canvas>
  <div>
    <p class="text-center">Processing Method: {processingMethod} text</p>
    <button
      class="p-2 border-black border-2 w-full"
      onclick={() => {
        processingMethod =
          processingMethod === "standard" ? "blocky" : "standard";
      }}>Change</button
    >
  </div>
  <canvas
    bind:this={procCanvas}
    class="w-full object-contain border-red-500 border"
  ></canvas>
  <div class="flex flex-row flex-wrap gap-2">
    {#each detectedText as word}
      <a
        href={encodeURI(`https://jisho.org/search/${word}`)}
        target="_blank"
        class="p-2 border">{word}</a
      >
    {/each}
  </div>
  <button
    class="p-2 border-black border-2 w-full"
    onclick={() => {
      sharedState.imageDataUrl = "";
      sharedState.boxScale = -1;
      detectedText = [];
    }}>Retake</button
  >
</div>
