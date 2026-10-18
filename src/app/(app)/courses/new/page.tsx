import { NewCourse } from "~/components/larp/new-course";
import { getTrack } from "~/content/curriculum";
export const metadata = { title: "New course" };
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ track?: string }>;
}) {
  const track = getTrack((await searchParams).track ?? "");
  return <NewCourse initialTrack={track?.id} />;
}
