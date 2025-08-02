export const NAV_ENUM = {
  DEFAULT: "default",
  GRAB: "grab",
  RECT: "rect",
  TEXT: "text",
  IMAGE: "image",
} as const;

const svgToBase64 = (svgString: string) => {
  const cleanedSvg = svgString.replace(/\s+/g, " ").trim();
  const base64 = btoa(unescape(encodeURIComponent(cleanedSvg)));
  return `data:image/svg+xml;base64,${base64}`;
};

export const DEFAULT_IMAGE = svgToBase64(
  `<svg class="icon" viewBox="-530 -530 2048 2048" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="300" height="300"><path d="M0 192c0-70.6 57.4-128 128-128h768c70.6 0 128 57.4 128 128v640c0 70.6-57.4 128-128 128H128c-70.6 0-128-57.4-128-128V192z m647.6 213c-9-13.2-23.8-21-39.6-21s-30.8 7.8-39.6 21l-174 255.2-53-66.2c-9.2-11.4-23-18-37.4-18s-28.4 6.6-37.4 18l-128 160c-11.6 14.4-13.8 34.2-5.8 50.8S157.6 832 176 832h672c17.8 0 34.2-9.8 42.4-25.6s7.2-34.8-2.8-49.4l-240-352zM224 384a96 96 0 1 0 0-192 96 96 0 1 0 0 192z" fill="#BBBBBB"></path></svg>`
);
