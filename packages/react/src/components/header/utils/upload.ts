import { IMAGE_INPUT_DOM_ID } from "../../../utils/constant";

export const uploadImage = () => {
  return new Promise<string>(resolve => {
    let input = document.getElementById(IMAGE_INPUT_DOM_ID) as HTMLInputElement;
    if (!input) {
      input = document.createElement("input");
      input.setAttribute("type", "file");
      input.setAttribute("id", IMAGE_INPUT_DOM_ID);
      input.setAttribute("accept", "image/png, image/jpeg, image/svg+xml");
      input.style.display = "none";
      document.body.append(input);
    }
    input.value = "";
    input.onchange = e => {
      const target = e.target as HTMLInputElement;
      document.body.removeChild(input);
      const files = target.files;
      if (files && files[0]) {
        const reader = new FileReader();
        reader.onloadend = function () {
          const src = reader.result as string;
          resolve(src);
        };
        reader.readAsDataURL(files[0]);
      }
    };
    input.click();
  });
};
