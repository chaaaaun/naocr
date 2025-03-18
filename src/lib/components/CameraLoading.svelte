<script>
  import { sharedState } from "../../state.svelte";
</script>

{#if sharedState.imageProcessing}
  <div
    class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 pointer-events-none"
  >
    <div
      class="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600 mb-4"
    ></div>
  </div>
{/if}
