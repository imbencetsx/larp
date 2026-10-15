import { notFound } from "next/navigation";
import { getLesson } from "~/content/curriculum";
import { LessonWorkspace } from "~/components/larp/lesson-workspace";
export default async function Page({
  params,
}: {
  params: Promise<{ track: string; lesson: string }>;
}) {
  const p = await params;
  const lesson = getLesson(`${p.track}-${p.lesson}`);
  if (!lesson) notFound();
  return <LessonWorkspace lesson={lesson} />;
}
