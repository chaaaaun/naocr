<script lang="ts">
  import { Orientation, sharedState } from "../../state.svelte";
  import { takePhoto } from "../utils/camera.svelte";

  // State for storing the file's data URL
  let isLoading = $state(false);
  let fileInput: HTMLInputElement;

  // Handle file selection
  function handleFileSelect(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    isLoading = true;

    const reader = new FileReader();
    reader.onload = (e) => {
      sharedState.imageDataUrl = e.target?.result as string;
      isLoading = false;
    };
    reader.onerror = () => {
      isLoading = false;
      console.error("Error reading file");
    };
    reader.readAsDataURL(file);
  }

  // Trigger file input click
  function openFileSelector() {
    fileInput.click();
  }
</script>

<div
  class="fixed bottom-0 left-0 w-full flex flex-row justify-center items-center gap-x-2 z-2 mb-8"
>
  <div>
    <!-- Hidden file input -->
    <input
      type="file"
      bind:this={fileInput}
      onchange={handleFileSelect}
      style="display: none"
    />

    <!-- Upload button -->
    <button
      class="w-16 h-16"
      onclick={openFileSelector}
      disabled={isLoading}
      aria-label="Upload file"
    ></button>
  </div>
  <button class="w-20 h-20" onclick={takePhoto} aria-label="Take photo"
  ></button>
  <button
    class="w-16 h-16"
    onclick={() =>
      (sharedState.orientation =
        sharedState.orientation === Orientation.Horizontal
          ? Orientation.Vertical
          : Orientation.Horizontal)}
    aria-label="Switch orientation"
    >{sharedState.orientation === Orientation.Horizontal ? "H" : "V"}</button
  >
</div>

<div class="fixed top-0 right-0 h-full flex flex-col justify-center z-2 mr-4">
  <input
    type="range"
    bind:this={sharedState.zoom.sliderElement}
    disabled={!sharedState.zoom.isSupported}
    class={!sharedState.zoom.isSupported ? "hidden" : ""}
  />
</div>

<style>
  button {
    border-radius: 50%;
    background-color: white;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
  }

  button:active {
    transform: translateY(3px);
    box-shadow: inset 0px 0px 5px rgba(0, 0, 0, 0.3);
    background-color: #f0f0f0;
  }

  input[type="range"] {
    writing-mode: vertical-lr;
    direction: rtl;
    appearance: slider-vertical;
    width: 16px;
    height: 40%;
    vertical-align: bottom;
  }
</style>
