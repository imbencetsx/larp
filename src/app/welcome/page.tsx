import Link from "next/link";
import { ArrowRight, BookOpen, Code2, Sprout } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardPanel } from "~/components/ui/card";
import { PixelPlant } from "~/components/larp/pixel-art";
export const metadata = { title: "Learn. Build. Repeat." };
export default function Page() {
  return (
    <div className="welcome-page">
      <nav className="welcome-nav">
        <Link href="/" className="brand">
          <span className="wordmark">LARP</span>
          <span className="logo-pixel" />
        </Link>
        <div>
          <Button variant="ghost" render={<Link href="/sign-in" />}>
            Sign in
          </Button>
          <Button render={<Link href="/" />}>
            Start learning <ArrowRight aria-hidden="true" />
          </Button>
        </div>
      </nav>
      <main className="welcome-main">
        <section className="welcome-hero">
          <div>
            <span className="eyebrow">YOUR NEXT SKILL STARTS HERE</span>
            <h1>
              Learn. Build.
              <br />
              <span>Repeat.</span>
            </h1>
            <p>Short lessons. Real code. Progress that sticks.</p>
            <Button size="lg" render={<Link href="/learn/html/1" />}>
              Start your first lesson <ArrowRight aria-hidden="true" />
            </Button>
          </div>
          <div className="welcome-plant">
            <PixelPlant variant={4} stage={11} />
          </div>
        </section>
        <section className="welcome-features">
          <Card>
            <CardPanel>
              <BookOpen />
              <h2>Learn the essentials.</h2>
              <p>5 paths. 10 hands-on lessons.</p>
            </CardPanel>
          </Card>
          <Card>
            <CardPanel>
              <Code2 />
              <h2>Make it work.</h2>
              <p>Write, run, and experiment.</p>
            </CardPanel>
          </Card>
          <Card>
            <CardPanel>
              <Sprout />
              <h2>Watch it grow.</h2>
              <p>Save progress. Grow your garden.</p>
            </CardPanel>
          </Card>
        </section>
        <div className="welcome-tracks">
          <span>HTML</span>
          <span>CSS</span>
          <span>JavaScript</span>
          <span>TypeScript</span>
          <span>Next.js</span>
        </div>
      </main>
    </div>
  );
}
