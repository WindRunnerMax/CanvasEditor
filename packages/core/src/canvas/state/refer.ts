import { Range } from "../../selection/range";
import { Node } from "../dom/node";

export class ReferNode extends Node {
  constructor() {
    super(Range.empty());
  }
}
