<script lang="ts">
  import { onMount } from "svelte";

  interface Props {
    orientation?: "horizontal" | "vertical";
    updateCoordinates: (coords: {
      x: number;
      y: number;
      width: number;
      height: number;
    }) => void;
  }

  // Event dispatcher for emitting coordinates
  const { orientation = "horizontal", updateCoordinates }: Props = $props();

  // Constants for the bounding box dimensions
  const HORZ_WIDTH = 250;
  const HORZ_HEIGHT = 150;

  const VERT_WIDTH = 100;
  const VERT_HEIGHT = 350;

  // State variables
  let viewportWidth = $state(0);
  let viewportHeight = $state(0);
  let boxX = $derived(() => Math.floor((viewportWidth - boxWidth()) / 2));
  let boxY = $derived(() => Math.floor((viewportHeight - boxHeight()) / 2));
  let boxWidth = $derived(() =>
    orientation === "vertical" ? VERT_WIDTH : HORZ_WIDTH
  );
  let boxHeight = $derived(() =>
    orientation === "vertical" ? VERT_HEIGHT : HORZ_HEIGHT
  );
  let resizeObserver: ResizeObserver;

  // Update position when viewport or box dimensions change
  $effect(() => {
    // Emit the coordinates whenever they change
    if (boxX() !== undefined && boxY() !== undefined) {
      updateCoordinates({
        x: boxX(),
        y: boxY(),
        width: boxWidth(),
        height: boxHeight(),
      });
    }
  });

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

  function updateViewportDimensions() {
    viewportWidth = window.innerWidth;
    viewportHeight = window.innerHeight;
  }
</script>

<div class="fixed top-0 left-0 w-full h-full pointer-events-none z-50">
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
    class="absolute bounding-box pointer-events-none border-2 border-red-500"
    style="top: {boxY()}px; left: {boxX()}px; width: {boxWidth()}px; height: {boxHeight()}px;"
  ></div>
</div>
