export type PreviewEvent = {
  id: number;
  type: "click" | "submit" | "input" | "change";
  fields: { id: number; value: string; checked: boolean }[];
};
export const MAX_PREVIEW_EVENTS = 64;
