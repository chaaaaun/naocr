<script lang="ts">
  import { sharedState } from "../../state.svelte";

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
    onclick={openFileSelector}
    disabled={isLoading}
    aria-label="Upload file"
  ></button>
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
</style>
