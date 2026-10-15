import { notFound } from "next/navigation";
import { getTrack } from "~/content/curriculum";
import { CourseDetail } from "~/components/larp/courses";
export default async function Page({
  params,
}: {
  params: Promise<{ track: string }>;
}) {
  const { track: id } = await params;
  const track = getTrack(id);
  if (!track) notFound();
  return <CourseDetail track={track} />;
}
