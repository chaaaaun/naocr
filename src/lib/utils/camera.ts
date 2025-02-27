export async function initCamera(videoElement: HTMLVideoElement) {
    const constraints = {
        video: {
            facingMode: 'environment',
            width: { ideal: 1080 },
            height: { ideal: 1920 }
        },
        audio: false
    };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    videoElement.srcObject = stream;
    await videoElement.play();
}

export function captureImage(videoElement: HTMLVideoElement, canvasElement: HTMLCanvasElement) {
    const context = canvasElement.getContext('2d');
    if (!context) {
        throw new Error('Unable to get 2d context from canvas');
    }

    // Set canvas dimensions to match video
    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;

    // Draw current video frame to canvas
    context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);

    // Get image data from canvas
    return context.getImageData(0, 0, canvasElement.width, canvasElement.height);
}
