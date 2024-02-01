const BATH_PATH = process.env.PUBLIC_URL + "/template/";

export type TemplateConfig = {
  name: string;
  image: string;
  template: string;
};

export const TEMPLATE_CONFIG: TemplateConfig[] = [
  {
    name: "FE-Czy",
    image: BATH_PATH + "Czy/index.jpeg",
    template: BATH_PATH + "Czy/index.json",
  },
  {
    name: "FE-Hty",
    image: BATH_PATH + "Hty/index.jpeg",
    template: BATH_PATH + "Hty/index.json",
  },
  {
    name: "FE-Lbz",
    image: BATH_PATH + "Lbz/index.jpeg",
    template: BATH_PATH + "Lbz/index.json",
  },
  {
    name: "BE-Lmz",
    image: BATH_PATH + "Lmz/index.jpeg",
    template: BATH_PATH + "Lmz/index.json",
  },
];

export const loadTemplate = (src: string) => {
  return window
    .fetch(src)
    .then(res => res.json())
    .catch(() => null);
};
