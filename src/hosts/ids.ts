/** Host apps that get a themed window on the desktop. */
export const PANEL_IDS = ["photoshop", "jira", "canva", "word"] as const;

export type PanelId = (typeof PANEL_IDS)[number];
