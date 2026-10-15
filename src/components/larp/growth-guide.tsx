"use client";
import { Sprout } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogPopup,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogPanel,
} from "~/components/ui/dialog";
import { Tabs, TabsList, TabsTab, TabsPanel } from "~/components/ui/tabs";
import { tracks } from "~/content/curriculum";
import { growthStages } from "~/lib/garden";
import { PixelPlant } from "./pixel-art";

export function GrowthGuide() {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" />}>
        <Sprout aria-hidden="true" />
        Growth stages
      </DialogTrigger>
      <DialogPopup className="growth-guide-dialog">
        <DialogHeader>
          <DialogTitle>From seed to full bloom.</DialogTitle>
          <DialogDescription>
            Passed exercise checks grow your plant. Complete every lesson in a
            course to earn its full flower.
          </DialogDescription>
        </DialogHeader>
        <DialogPanel>
          <Tabs defaultValue={tracks[0]!.id}>
            <TabsList size="sm" aria-label="Choose a flower">
              {tracks.map((track) => (
                <TabsTab key={track.id} value={track.id}>
                  {track.id === "javascript"
                    ? "JS"
                    : track.id === "typescript"
                      ? "TS"
                      : track.name}
                </TabsTab>
              ))}
            </TabsList>
            {tracks.map((track, variant) => (
              <TabsPanel key={track.id} value={track.id}>
                <h3 className="growth-guide-title">
                  {track.name} · {track.plant}
                </h3>
                <ol className="growth-stage-grid">
                  {growthStages.map((name, stage) => (
                    <li key={name}>
                      <PixelPlant variant={variant} stage={stage} />
                      <span>{String(stage + 1).padStart(2, "0")}</span>
                      <strong>{name}</strong>
                    </li>
                  ))}
                </ol>
              </TabsPanel>
            ))}
          </Tabs>
        </DialogPanel>
      </DialogPopup>
    </Dialog>
  );
}
