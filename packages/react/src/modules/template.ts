const BATH_PATH = process.env.PUBLIC_URL + "/template/";

export type TemplateConfig = {
  name: string;
  image: string;
  template: string;
};

export const TEMPLATE_CONFIG: TemplateConfig[] = [
  {
    name: "Czy",
    image: BATH_PATH + "Czy/index.jpeg",
    template: BATH_PATH + "Czy/index.json",
  },
];

export const loadTemplate = (src: string) => {
  return window
    .fetch(src)
    .then(res => res.json())
    .catch(() => null);
};
