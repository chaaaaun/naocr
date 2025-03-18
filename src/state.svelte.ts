export enum Orientation {
  Horizontal = "horizontal",
  Vertical = "vertical",
}

export interface BoxCoordinates {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface State {
  orientation: Orientation;
  boxCoordinates: BoxCoordinates;
  boxScale: number;
  zoom: {
    isSupported: boolean;
    sliderElement: HTMLInputElement | null;
  };
  video: {
    element: HTMLVideoElement | null;
    stream: MediaStream | null;
  };
  imageProcessing: boolean;
  imageDataUrl: string;
  processedDataUrl: string;
}

export const sharedState = $state<State>({
  orientation: Orientation.Horizontal,
  boxCoordinates: {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  },
  boxScale: -1,
  zoom: {
    isSupported: false,
    sliderElement: null,
  },
  video: {
    element: null,
    stream: null,
  },
  imageProcessing: false,
  imageDataUrl: "",
  processedDataUrl: "",
});
