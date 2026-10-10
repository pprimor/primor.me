import type { ComponentType } from "react";
import type { PanelId } from "../ids";
import CanvaPanel from "./CanvaPanel";
import JiraPanel from "./JiraPanel";
import PhotoshopPanel from "./PhotoshopPanel";
import WordPanel from "./WordPanel";

export const panels: Record<PanelId, ComponentType> = {
  photoshop: PhotoshopPanel,
  jira: JiraPanel,
  canva: CanvaPanel,
  word: WordPanel,
};
