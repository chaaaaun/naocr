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

This project has no defined testing strategy. It is a small personal project after all. Nonetheless, it should work on modern Firefox and Chromium-based browsers. Notably, zooming is only supported on Chromium-based browsers.

## Caveats

- If using file uploads, make sure to set the correct bounding box orientation in the camera overlay before uploading, as the OCR engine uses a differently primed worker for horizontal and vertical text, and it decides which worker to use using the bounding box orientation set manually by the user for reliability.

## Known Issues and Expansions

- Functionality after text extraction is very limited. At present each word just links to `jisho.org`. The plan is to integrate a local JMDict but dealing with large dictionary files is another issue.
- Not much in the way of customising the OCR process, plan to add extra functionality to customise the Tesseract processing
- Tesseract's tokenising isn't terribly accurate, so the current implementation uses the native `Intl.Segmenter` instead. While sufficient for some use cases, performance with conjugated verbs and compound nouns leaves something to be desired. Will consider updating with a better alternative if I find one.
