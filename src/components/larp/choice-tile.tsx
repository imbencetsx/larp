"use client";
import type { ComponentType, SVGProps } from "react";
import { Check } from "pixelarticons/react/Check.js";
import { Code } from "pixelarticons/react/Code.js";
import { Layout } from "pixelarticons/react/Layout.js";
import { BookOpen } from "pixelarticons/react/BookOpen.js";
import { Globe } from "pixelarticons/react/Globe.js";
import { Radio } from "~/components/ui/radio-group";
import { Label } from "~/components/ui/label";
import type { TrackId } from "~/content/curriculum";
export const courseIcons = {
  html: Code,
  css: Layout,
  javascript: Code,
  typescript: BookOpen,
  nextjs: Globe,
} satisfies Record<TrackId, ComponentType<SVGProps<SVGSVGElement>>>;
export function ChoiceTile({
  value,
  selected,
  icon: Icon,
  title,
  description,
  disabled = false,
}: {
  value: string;
  selected: boolean;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  description?: string;
  disabled?: boolean;
}) {
  return (
    <Label
      className="onboarding-choice choice-tile"
      data-selected={selected || undefined}
      data-disabled={disabled || undefined}
    >
      <Radio value={value} disabled={disabled} className="pixel-radio" />
      <Check className="choice-check" aria-hidden="true" />
      <Icon className="choice-icon" aria-hidden="true" />
      <span className="choice-copy">
        <strong>{title}</strong>{" "}
        {description && (
          <span className="onboarding-choice-description">{description}</span>
        )}
      </span>
    </Label>
  );
}
