import { sharedState } from "../../state.svelte";
import { toDataUrl } from "./image";

// Adjust video size based on screen and constraints
export function handleResize() {
  const { element } = sharedState.video;
  if (!element) return;

  // Set video to fill the screen on mobile
  const aspectRatio = window.innerWidth / window.innerHeight;

  if (aspectRatio > 1) {
    // Landscape orientation
    element.style.width = "100vw";
    element.style.height = "100vh";
  } else {
    // Portrait orientation
    element.style.width = "auto";
    element.style.height = "100vh";
  }
  element.style.objectFit = "cover";
}

export async function startCamera() {
  let { element, stream } = sharedState.video;
  if (!element) return;

  // Request permission to use the camera at the highest resolution
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
  element.srcObject = stream;
  await element.play();

  setTimeout(handleResize, 100);

  // Get the video track to check for zoom capabilities
  const [videoTrack] = element.srcObject.getVideoTracks();
  initZoom(videoTrack);
}

function initZoom(videoTrack: MediaStreamTrack) {
  let { sliderElement } = sharedState.zoom;
  if (!sliderElement) return;

  // Check if zoom is supported
  const capabilities = videoTrack.getCapabilities();
  const settings = videoTrack.getSettings();

  if (!capabilities.zoom) {
    sharedState.zoom.isSupported = false;
    return;
  }

  // throw new Error("Zoom is not supported");
  // Set up slider input
  sharedState.zoom.isSupported = true;
  sliderElement.min = capabilities.zoom.min.toString();
  sliderElement.max = capabilities.zoom.max.toString();
  sliderElement.step = capabilities.zoom.step.toString();
  sliderElement.value = settings.zoom ? settings.zoom.toString() : "1";

  sliderElement.oninput = async () => {
    try {
      if (!sliderElement) return;
      // Warning: Chrome requires advanced constraints.
      await videoTrack.applyConstraints({
        zoom: Number(sliderElement.value),
      });
    } catch (err) {
      console.error("applyConstraints() failed: ", err);
    }
  };
}

export function stopCamera() {
  let { element, stream } = sharedState.video;
  if (!element || !stream) return;

  stream.getTracks().forEach((track) => track.stop());
  element.srcObject = null;
  stream = null;
}

export async function takePhoto() {
  sharedState.imageProcessing = true;
  const { element } = sharedState.video;
  if (!element) return;

  sharedState.boxScale =
    element.videoHeight / element.getBoundingClientRect().height;
  await grabFrame(element);
  // const bitmap: ImageBitmap = await grabFrame(element);
  // const cropped = await cropImageBitmap(bitmap, sharedState.boxCoordinates);
  // if (!cropped) return;
  // sharedState.imageDataUrl = toDataUrl(cropped);
}

async function grabFrame(videoElement: HTMLVideoElement) {
  // Make sure the video element is receiving a media stream
  if (
    !videoElement.srcObject ||
    !(videoElement.srcObject instanceof MediaStream)
  ) {
    throw new Error("Video element is not connected to a MediaStream");
  }
  console.log("grabFrame", sharedState.imageProcessing);
  sharedState.imageProcessing = true;
  // await new Promise(resolve => setTimeout(resolve, 3000));

  // Wait for the next animation frame to ensure we get the latest frame
  await new Promise<void>((resolve) => {
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
          throw new Error("Could not create canvas 2D context");
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
          canvas.height, // Destination rectangle
        );

        createImageBitmap(canvas).then((bitmap) => {
          sharedState.imageDataUrl = toDataUrl(bitmap);
        });
        resolve();
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(`Error capturing frame: ${error.message}`);
        } else {
          throw new Error(`Error capturing frame: ${error}`);
        }
      } finally {
        sharedState.imageProcessing = false;
        console.log("grabFrameDone", sharedState.imageProcessing);
      }
    });
  });
}
