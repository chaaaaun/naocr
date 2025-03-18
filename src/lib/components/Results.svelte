<script lang="ts">
  import { sharedState } from "../../state.svelte";
  import { recognizeText } from "../utils/ocr";
  import { processImage } from "../utils/preprocessing";

  let detectedText = $state<string[]>([]);
  let imgCanvas: HTMLCanvasElement | null = $state(null);

  $effect(() => {
    if (!sharedState.imageDataUrl) return;
    detectedText = [];
    processImage(
      sharedState.imageDataUrl,
      sharedState.boxCoordinates,
      sharedState.boxScale
    )
      .then((result) => {
        sharedState.processedDataUrl = result;
      })
      .catch((error) => {
        console.error(error);
      });
  });

  $effect(() => {
    if (!sharedState.processedDataUrl || !imgCanvas) return;
    const ctx = imgCanvas.getContext("2d");
    if (ctx) {
      const img = new Image();
      img.onload = () => {
        if (!imgCanvas) return;
        const scale = Math.min(
          imgCanvas.width / img.width,
          imgCanvas.height / img.height
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
  <canvas bind:this={imgCanvas} class="object-contain border-red-500 border"
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
