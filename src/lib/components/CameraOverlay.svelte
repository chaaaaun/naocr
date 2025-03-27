<script lang="ts">
  import { onMount } from "svelte";
  import { Orientation, sharedState } from "../../state.svelte";

  // Constants for the bounding box dimensions
  const HORZ_WIDTH = 250;
  const HORZ_HEIGHT = 50;

  const VERT_WIDTH = 100;
  const VERT_HEIGHT = 350;

  // Local state variables
  let viewportWidth = $state(0);
  let viewportHeight = $state(0);
  let boxX = $derived(() => Math.floor((viewportWidth - boxWidth()) / 2));
  let boxY = $derived(() => Math.floor((viewportHeight - boxHeight()) / 2));
  let boxWidth = $derived(() =>
    sharedState.orientation === Orientation.Vertical ? VERT_WIDTH : HORZ_WIDTH
  );
  let boxHeight = $derived(() =>
    sharedState.orientation === Orientation.Vertical ? VERT_HEIGHT : HORZ_HEIGHT
  );
  let resizeObserver: ResizeObserver;

  // Update the coordinates in parent whenever they change
  $effect(() => {
    if (boxX() !== undefined && boxY() !== undefined) {
      sharedState.boxCoordinates = {
        x: boxX(),
        y: boxY(),
        width: boxWidth(),
        height: boxHeight(),
      };
    }
  });

  function updateViewportDimensions() {
    viewportWidth = window.innerWidth;
    viewportHeight = window.innerHeight;
  }

  onMount(() => {
    // Initialize with current viewport dimensions
    updateViewportDimensions();

    // Set up resize observer to update dimensions when viewport changes
    resizeObserver = new ResizeObserver(updateViewportDimensions);
    resizeObserver.observe(document.documentElement);

    return () => {
      // Clean up the observer on component unmount
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  });
</script>

<div class="fixed top-0 left-0 w-full h-full pointer-events-none z-1">
  <!-- Top dimmed area -->
  <div
    class="dimmed-area"
    style="top: 0; left: 0; width: 100%; height: {boxY()}px;"
  ></div>

  <!-- Left dimmed area -->
  <div
    class="dimmed-area"
    style="top: {boxY()}px; left: 0; width: {boxX()}px; height: {boxHeight()}px;"
  ></div>

  <!-- Right dimmed area -->
  <div
    class="dimmed-area"
    style="top: {boxY()}px; left: {boxX() +
      boxWidth()}px; width: calc(100% - {boxX() +
      boxWidth()}px); height: {boxHeight()}px;"
  ></div>

  <!-- Bottom dimmed area -->
  <div
    class="dimmed-area"
    style="top: {boxY() +
      boxHeight()}px; left: 0; width: 100%; height: calc(100% - {boxY() +
      boxHeight()}px);"
  ></div>

  <!-- Bounding box -->
  <div
    class="absolute pointer-events-none border-2 border-red-500"
    style="top: {boxY()}px; left: {boxX()}px; width: {boxWidth()}px; height: {boxHeight()}px;"
  ></div>
</div>
