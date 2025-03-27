# naocr

Simple in-browser Japanese OCR

## Local Development

```
npm i && npm run dev
```
This project uses default Prettier options, but feel free to format your code however you want.

## Building

```
npm run build
```

## Testing

This project has no defined testing strategy. It is a small personal project after all. Nonetheless, it should work on modern Firefox and Chromium-based browsers. Notably, advanced camera controls like zoom and exposure are only supported on Chromium-based browsers.

## Caveats

- If using file uploads, make sure to set the correct bounding box orientation in the camera overlay before uploading, as the OCR engine uses a differently primed worker for horizontal and vertical text, and it decides which worker to use using the bounding box orientation set manually by the user for reliability.
- Image capture is noticably slow, which is because I've employed the age-old method of drawing a video element onto a canvas to grab the camera shot. Why do this when the ImageCapture API exists? a) the `grabFrame()` in the API is actually slower for some reason. b) `takePhoto()` actually takes a shot with the camera's full frame, which is often times vastly different in both resolution and aspect ratio to the portion displayed in-browser. As you can imagine trying to reconcile bounding boxes in this scenario would be a nightmare. From my testing, the primitive way I'm currently doing it is about 2x slower than `takePhoto()`, but I haven't found a better alternative yet...
- No deskewing will be done to the captured image, since it is assumed that the user will make an effort to capture the text in as aligned a fashion as they can. This saves on preprocessing time.

## Known Issues and Expansions

- [ ] Functionality after text extraction is very limited. At present each word just links to `jisho.org`. The plan is to integrate a local JMDict but dealing with large dictionary files is another issue.
- [x] Not much in the way of customising the OCR process, plan to add extra functionality to customise the Tesseract processing (Preprocessing is now done with OpenCV.js, allowing better thresholding to handle different text types)
- [ ] Even more preprocessing!!
- [x] Tesseract's tokenising isn't terribly accurate, so the current implementation uses the native `Intl.Segmenter` instead. While sufficient for some use cases, performance with conjugated verbs and compound nouns leaves something to be desired. Will consider updating with a better alternative if I find one. (Now uses `mecab-wasm`, which should be much more accurate)
- [ ] Figure out why vite doesn't like `mecab-wasm`

## Acknowledgement

- This project would not be possible without the open source projects it leverages: tesseract.js, OpenCV.js, and Mecab. Proper attribution WIP.