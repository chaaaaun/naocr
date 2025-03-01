<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import Overlay from "./Overlay.svelte";

  let videoElement: HTMLVideoElement;
  let stream: MediaStream | null = null;
  let errorMessage = $state("");

  // Zoom control variables
  let zoomSlider: HTMLInputElement;
  let zoomSupported = $state(false);

  // Bounding box for cropping
  let boundingBox = $state({ x: 0, y: 0, width: 0, height: 0 });

  // Adjust video size based on screen and constraints
  function handleResize() {
    if (!videoElement) return;

    // Set video to fill the screen on mobile
    const aspectRatio = window.innerWidth / window.innerHeight;

    if (aspectRatio > 1) {
      // Landscape orientation
      videoElement.style.width = "100vw";
      videoElement.style.height = "100vh";
    } else {
      // Portrait orientation
      videoElement.style.width = "auto";
      videoElement.style.height = "100vh";
    }
    videoElement.style.objectFit = "cover";
  }

  async function startCamera() {
    // document.body.requestFullscreen();
    try {
      // Reset any previous error message
      errorMessage = "";

      const constraints: MediaTrackConstraints = {
        facingMode: "environment",
        width: { ideal: 4096 },
        height: { ideal: 4096 },
      };

      stream = await navigator.mediaDevices.getUserMedia({
        video: constraints,
        audio: false,
      });

      // Assign the stream to the video element
      videoElement.srcObject = stream;
      await videoElement.play();

      setTimeout(handleResize, 100);

      // Get the video track to check for zoom capabilities
      const [videoTrack] = videoElement.srcObject.getVideoTracks();

      // Check if zoom is supported
      const capabilities = videoTrack.getCapabilities();
      const settings = videoTrack.getSettings();
      if (capabilities.zoom) {
        console.log();

        zoomSupported = true;
        zoomSlider.min = capabilities.zoom.min.toString();
        zoomSlider.max = capabilities.zoom.max.toString();
        zoomSlider.step = capabilities.zoom.step.toString();
        zoomSlider.value = settings.zoom ? settings.zoom.toString() : "1";

        zoomSlider.oninput = async () => {
          try {
            // Warning: Chrome requires advanced constraints.
            await videoTrack.applyConstraints({
              zoom: Number(zoomSlider.value),
            });
          } catch (err) {
            console.error("applyConstraints() failed: ", err);
          }
        };
      } else {
        zoomSupported = false;
      }
    } catch (error) {
      let e = "";
      if (typeof error === "string") {
        e = error.toUpperCase(); // works, `e` narrowed to string
      } else if (error instanceof Error) {
        e = error.message; // works, `e` narrowed to Error
      }
      console.error("Error accessing camera:", e);
      errorMessage = `Camera access error: ${e}`;
    }
  }

  function stopCamera() {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      videoElement.srcObject = null;
      stream = null;
    }
  }

  async function takePhoto() {
    try {
      const bitmap: ImageBitmap = await grabFrame(videoElement);
      const cropped = await cropImageBitmap(bitmap, boundingBox);
      await downloadImageBitmap(cropped, "photo.png");
      //   console.log("Photo taken: " + blob.type + ", " + blob.size + "B");
    } catch (err) {
      console.error("takePhoto() failed: ", err);
    }
  }

  async function downloadImageBitmap(
    imageBitmap: ImageBitmap,
    filename = "image.png"
  ) {
    // Create a canvas to draw the ImageBitmap
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Could not create canvas 2D context");
    }

    // Set canvas size to match image dimensions
    canvas.width = imageBitmap.width;
    canvas.height = imageBitmap.height;

    // Draw the image onto the canvas
    ctx.drawImage(imageBitmap, 0, 0);

    // Convert canvas content to Blob
    canvas.toBlob((blob) => {
      if (blob) {
        // Download the Blob
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url); // Clean up
      }
    }, "image/png"); // Adjust format as needed
  }

  async function cropImageBitmap(
    imageBitmap: ImageBitmap,
    coords: { x: number; y: number; width: number; height: number }
  ) {
    console.log("Cropping image", coords);

    const videoRect = videoElement.getBoundingClientRect();
    const scale = videoElement.videoHeight / videoRect.height;

    const x = coords.x * scale;
    const y = coords.y * scale;
    const width = coords.width * scale;
    const height = coords.height * scale;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Could not create canvas 2D context");
    }

    // Set canvas size to match crop dimensions
    canvas.width = width;
    canvas.height = height;

    // Draw the cropped area from the ImageBitmap
    ctx.drawImage(imageBitmap, x, y, width, height, 0, 0, width, height);

    return createImageBitmap(canvas); // Convert the cropped canvas back to an ImageBitmap
  }

  function grabFrame(videoElement: HTMLVideoElement) {
    return new Promise<ImageBitmap>((resolve, reject) => {
      // Make sure the video element is receiving a media stream
      if (
        !videoElement.srcObject ||
        !(videoElement.srcObject instanceof MediaStream)
      ) {
        reject("Video element is not connected to a MediaStream");
        return;
      }

      // Wait for the next animation frame to ensure we get the latest frame
      requestAnimationFrame(() => {
        try {
          // Get the actual displayed dimensions of the video element on the page
          const videoRect = videoElement.getBoundingClientRect();
          const scale = videoElement.videoHeight / videoRect.height;

          // Create a canvas matching the displayed size
          const canvas = document.createElement("canvas");
          canvas.width = videoRect.width * scale;
          canvas.height = videoElement.videoHeight;

          // Get the 2D context and draw the current video frame
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject("Could not create canvas 2D context");
            return;
          }

          // Draw the video at its current displayed size (not the natural size)
          // This will capture the video as it appears on screen, with any CSS transforms applied
          ctx.drawImage(
            videoElement,
            (videoElement.videoWidth - videoRect.width * scale) / 2,
            0,
            videoRect.width * scale,
            videoElement.videoHeight, // Source rectangle
            0,
            0,
            canvas.width,
            canvas.height // Destination rectangle
          );

          resolve(createImageBitmap(canvas));
        } catch (error) {
          if (error instanceof Error) {
            reject(`Error capturing frame: ${error.message}`);
          } else {
            reject(`Error capturing frame: ${error}`);
          }
        }
      });
    });
  }

  onMount(() => {
    startCamera();
    window.addEventListener("resize", handleResize);
  });

  onDestroy(() => {
    window.removeEventListener("resize", handleResize);
    stopCamera();
  });
</script>

<div class="fixed bottom-0 left-0 p-4 bg-gray-800 text-white z-10">
  <button onclick={takePhoto}>Take Photo</button>
  <input
    type="range"
    bind:this={zoomSlider}
    disabled={!zoomSupported}
    class={!zoomSupported ? "hidden" : ""}
  />
</div>

{#if errorMessage}
  <div class="error">{errorMessage}</div>
{/if}

<video bind:this={videoElement} autoplay playsinline muted class="z-0"></video>
<Overlay
  updateCoordinates={(c) => {
    boundingBox = c;
  }}
/>

<style>
  button {
    padding: 0.5rem 1rem;
    background-color: #4caf50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
  }
</style>
