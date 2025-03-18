<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { sharedState } from "../../state.svelte";
  import CameraControls from "./CameraControls.svelte";
  import CameraOverlay from "./CameraOverlay.svelte";
  import {
    handleResize,
    startCamera,
    stopCamera,
  } from "../utils/camera.svelte";
  import CameraLoading from "./CameraLoading.svelte";

  // Local state variables
  let errorMessage = $state("");

  onMount(() => {
    try {
      startCamera();
      window.addEventListener("resize", handleResize);
    } catch (error) {
      if (typeof error === "string") {
        errorMessage = error.toUpperCase();
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
    }
  });

  onDestroy(() => {
    window.removeEventListener("resize", handleResize);
    stopCamera();
  });
</script>

{#if errorMessage}
  <div class="m-4 p-4 bg-red-100 text-red-900 rounded-2xl">{errorMessage}</div>
{:else}
  <video
    bind:this={sharedState.video.element}
    autoplay
    playsinline
    muted
    class="z-0"
  ></video>
  <CameraOverlay />
  <CameraControls />
  <CameraLoading />
{/if}
