<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { captureImage, initCamera } from "../utils/camera";

  let { capture, disabled } = $props();

  let videoElement: HTMLVideoElement;
  let canvasElement: HTMLCanvasElement;
  let isInitializing = $state(true);
  let hasError = $state(false);
  let errorMessage = $state("");

  onMount(async () => {
    try {
      isInitializing = true;
      await initCamera(videoElement);
      isInitializing = false;
    } catch (error) {
      isInitializing = false;
      hasError = true;
      if (error instanceof Error) {
        errorMessage = `Camera error: ${error.message}`;
        console.error("Camera initialization error:", error);
      }
    }
  });

  onDestroy(() => {
    // Clean up video stream on component destruction
    if (!videoElement) return;
    if (videoElement.srcObject instanceof MediaStream) {
      videoElement.srcObject.getVideoTracks().forEach((track) => {
        track.stop();
      });
    }
  });

  function handleCapture() {
    try {
      if (!videoElement || !canvasElement) {
        throw new Error("Video or canvas element not found");
      }
      const result = captureImage(videoElement, canvasElement);
      capture({
        imageData: result,
        canvas: canvasElement,
      });
    } catch (error) {
      console.error("Error capturing image:", error);
    }
  }
</script>

<div class="camera-container card">
  {#if isInitializing}
    <div class="loading">Initializing camera...</div>
  {:else if hasError}
    <div class="error">
      {errorMessage}
      <p>Please ensure camera permissions are granted and try again.</p>
    </div>
  {/if}
  <video bind:this={videoElement} autoplay playsinline>
    <track kind="captions" />
  </video>
  <canvas bind:this={canvasElement}></canvas>

  <div class="controls">
    <button
      onclick={handleCapture}
      disabled={disabled || isInitializing || hasError}
    >
      {disabled ? "Processing..." : "Capture"}
    </button>
  </div>
</div>

<style>
  .camera-container {
    position: relative;
    width: 100%;
  }

  video {
    width: 100%;
    border-radius: 4px;
    background-color: #000;
  }

  .controls {
    display: flex;
    justify-content: center;
    margin-top: 10px;
  }

  .loading,
  .error {
    padding: 40px;
    text-align: center;
    background-color: #f8f9fa;
    border-radius: 4px;
  }

  .error {
    color: #dc3545;
  }
</style>
