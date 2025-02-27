<script lang="ts">
  import Camera from './lib/components/Camera.svelte';

  let isProcessing = $state(false);

  async function handleCapture(event: {
    imageData: ImageData;
    canvas: HTMLCanvasElement;
  }) {
    // try {
      const { imageData, canvas } = event;
    //   isProcessing = true;
    //   detectedText = 'Processing...';
      
    //   const startTime = performance.now();
    //   debugInfo = 'Capturing image...';
      
    //   // Display the original captured image
    //   capturedImageUrl = canvas.toDataURL('image/png');
      
    //   // Apply TensorFlow image processing if enabled
    //   let processedImageData = imageData;
    //   if (processingEnabled) {
    //     debugInfo = 'Applying image processing...';
    //     processedImageData = await preprocessImage(
    //       imageData, 
    //       canvas, 
    //       processingSettings
    //     );
        
    //     // Update displayed image with processed version
    //     capturedImageUrl = canvas.toDataURL('image/png');
    //   }
      
    //   // Perform OCR
    //   debugInfo = 'Running OCR...';
    //   const ocrStartTime = performance.now();
    //   const result = await recognizeText(processedImageData);
    //   const ocrEndTime = performance.now();
      
    //   // Display results
    //   detectedText = result || 'No text detected';
      
    //   // Update performance stats
    //   performanceStats = {
    //     totalTime: (performance.now() - startTime).toFixed(0),
    //     ocrTime: (ocrEndTime - ocrStartTime).toFixed(0)
    //   };
      
    //   debugInfo = `
    //     Done! Total time: ${performanceStats.totalTime}ms
    //     OCR time: ${performanceStats.ocrTime}ms
    //     Processing: ${processingEnabled ? 'Enabled' : 'Disabled'}
    //     TensorFlow backend: ${tfBackend}
    //   `;
    // } catch (error) {
    //   debugInfo = `Error: ${error.message}`;
    //   console.error('Processing error:', error);
    // } finally {
    //   isProcessing = false;
    // }
  }

</script>

<main>
      <Camera capture={handleCapture} disabled={isProcessing} />
</main>

<style>
 </style>
