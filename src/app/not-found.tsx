import Link from "next/link";
import { PixelPlant } from "~/components/larp/pixel-art";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "~/components/ui/empty";
export default function NotFound() {
  return (
    <main className="auth-page">
      <Card className="auth-card">
        <Empty>
          <EmptyHeader>
            <EmptyMedia>
              <PixelPlant stage={0} className="h-20 w-16" />
            </EmptyMedia>
            <EmptyTitle>
              <h1>Page not found.</h1>
            </EmptyTitle>
            <EmptyDescription>This page does not exist.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button render={<Link href="/" />}>Back to LARP</Button>
          </EmptyContent>
        </Empty>
      </Card>
    </main>
  );
}
