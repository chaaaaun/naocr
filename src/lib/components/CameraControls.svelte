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

<div
  class={[
    "fixed top-0 right-0 h-full flex flex-col justify-center items-center gap-y-2 z-2 mr-4",
    !sharedState.zoom.isSupported && "hidden",
  ]}
>
  <input
    type="range"
    bind:this={sharedState.zoom.sliderElement}
    disabled={!sharedState.zoom.isSupported}
  />
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    fill="#fff"
    viewBox="0 0 256 256"
    ><path
      d="M152,112a8,8,0,0,1-8,8H120v24a8,8,0,0,1-16,0V120H80a8,8,0,0,1,0-16h24V80a8,8,0,0,1,16,0v24h24A8,8,0,0,1,152,112Zm77.66,117.66a8,8,0,0,1-11.32,0l-50.06-50.07a88.11,88.11,0,1,1,11.31-11.31l50.07,50.06A8,8,0,0,1,229.66,229.66ZM112,184a72,72,0,1,0-72-72A72.08,72.08,0,0,0,112,184Z"
    ></path></svg
  >
</div>

<div
  class={[
    "fixed top-0 left-0 h-full flex flex-col justify-center items-center gap-y-2 z-2 ml-4",
    !sharedState.exposure.isSupported && "hidden",
  ]}
>
  <input
    type="range"
    bind:this={sharedState.exposure.sliderElement}
    disabled={!sharedState.exposure.isSupported}
  />
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    fill="#fff"
    viewBox="0 0 256 256"
    ><path
      d="M205.66,61.66l-144,144a8,8,0,0,1-11.32-11.32l144-144a8,8,0,0,1,11.32,11.32ZM64,112a8,8,0,0,0,16,0V80h32a8,8,0,0,0,0-16H80V32a8,8,0,0,0-16,0V64H32a8,8,0,0,0,0,16H64Zm160,64H144a8,8,0,0,0,0,16h80a8,8,0,0,0,0-16Z"
    ></path></svg
  >
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
    width: 16px;
    height: 40%;
    vertical-align: bottom;
  }
</style>
