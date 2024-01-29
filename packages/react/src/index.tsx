import "./styles/global.scss";
import "@arco-design/web-react/es/style/index.less";

import ReactDOM from "react-dom";
import { DeltaSet } from "sketching-delta";
import { Image, Rect, Text } from "sketching-plugin";

import { App } from "./components/app";
import { Preview } from "./components/preview";

DeltaSet.register(Rect);
DeltaSet.register(Text);
DeltaSet.register(Image);

const urlParams = new URL(location.href).searchParams;
const isPreview = urlParams.get("preview") !== null;

if (isPreview) {
  ReactDOM.render(<Preview />, document.getElementById("root"));
} else {
  ReactDOM.render(<App />, document.getElementById("root"));
}
