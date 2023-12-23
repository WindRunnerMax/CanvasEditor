import ReactDOM from "react-dom";
import { DeltaSet } from "sketching-delta";

import { Rect } from "../src";
import { App } from "./components/app";

DeltaSet.register(Rect);
ReactDOM.render(<App />, document.getElementById("root"));
