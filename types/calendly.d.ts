// Ambient typing for the Calendly inline-widget global injected by
// https://assets.calendly.com/assets/external/widget.js. Kept out of the
// component file so its global-augmentation behavior is visible at the
// project type level.
declare global {
  interface Window {
    Calendly?: {
      initInlineWidget: (opts: {
        url: string;
        parentElement: HTMLElement;
      }) => void;
    };
  }
}

export {};
