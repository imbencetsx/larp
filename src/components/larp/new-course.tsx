"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "pixelarticons/react/ArrowLeft.js";
import { ArrowRight } from "pixelarticons/react/ArrowRight.js";
import { BookOpen } from "pixelarticons/react/BookOpen.js";
import { Code } from "pixelarticons/react/Code.js";
import { Check } from "pixelarticons/react/Check.js";
import { Button } from "~/components/ui/button";
import { RadioGroup } from "~/components/ui/radio-group";
import { ChoiceTile, courseIcons } from "./choice-tile";
import { learningChoices } from "~/lib/onboarding";
import {
  experienceChoices,
  type CourseEnrollmentInput,
} from "~/lib/course-enrollment";
import type { TrackId } from "~/content/curriculum";
import { trackEvent } from "~/lib/analytics";
import { api } from "~/trpc/react";
import { useLearning } from "./learning-provider";
const experienceIcons = {
  new: BookOpen,
  some_basics: Code,
  comfortable: Check,
};
export function NewCourse({ initialTrack }: { initialTrack?: TrackId }) {
  const { data, loading } = useLearning();
  const router = useRouter();
  const utils = api.useUtils();
  const [step, setStep] = useState<1 | 2>(1);
  const [trackId, setTrackId] = useState<TrackId | "">(initialTrack ?? "");
  const [experience, setExperience] = useState<
    CourseEnrollmentInput["experience"] | ""
  >("");
  const [leaving, setLeaving] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const added = data?.enrollments.map((row) => row.trackId) ?? [];
  const alreadyAdded = added.includes(trackId as TrackId);
  const save = api.learning.addCourse.useMutation({
    async onSuccess(result, input) {
      setLeaving(true);
      if (result.added) trackEvent("course_added", input);
      await utils.learning.overview.invalidate();
      router.push(`/courses/${result.trackId}`);
    },
  });
  useEffect(() => {
    heading.current?.focus();
  }, [step]);
  const pending = save.isPending || leaving;
  return (
    <section
      className="new-course-panel onboarding-panel"
      aria-labelledby="new-course-title"
    >
      <Link href="/" className="back-link">
        <ArrowLeft aria-hidden="true" />
        Your learning
      </Link>
      <div className="onboarding-progress">
        <span className="onboarding-kicker">A new path</span>
        <span>0{step} / 02</span>
      </div>
      <div className="onboarding-progress-bars" aria-hidden="true">
        <span data-active />
        <span data-active={step === 2 || undefined} />
      </div>
      <h1 id="new-course-title" tabIndex={-1} ref={heading}>
        {step === 1 ? "What’s next for you?" : "Have you tried this before?"}
      </h1>
      <p className="onboarding-description">
        {step === 1
          ? "Choose a course to add to your learning."
          : `A little about your experience with ${learningChoices.find((choice) => choice.id === trackId)?.name}. You’ll get the same full course, whatever you choose.`}
      </p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (pending || loading || !data || alreadyAdded || !trackId) return;
          if (step === 1) setStep(2);
          else if (experience) save.mutate({ trackId, experience });
        }}
      >
        {step === 1 ? (
          <RadioGroup
            aria-labelledby="new-course-title"
            className="choice-grid"
            value={trackId}
            disabled={loading || pending}
            onValueChange={(value) => setTrackId(value as TrackId)}
          >
            {learningChoices.map((choice) => (
              <ChoiceTile
                key={choice.id}
                value={choice.id}
                selected={trackId === choice.id}
                disabled={added.includes(choice.id)}
                icon={courseIcons[choice.id]}
                title={choice.name}
                description={
                  added.includes(choice.id)
                    ? "Already in your learning"
                    : choice.description
                }
              />
            ))}
          </RadioGroup>
        ) : (
          <RadioGroup
            aria-labelledby="new-course-title"
            className="choice-grid"
            value={experience}
            disabled={pending}
            onValueChange={(value) =>
              setExperience(value as CourseEnrollmentInput["experience"])
            }
          >
            {experienceChoices.map((choice) => (
              <ChoiceTile
                key={choice.id}
                value={choice.id}
                selected={experience === choice.id}
                icon={experienceIcons[choice.id]}
                title={choice.name}
                description={choice.description}
              />
            ))}
          </RadioGroup>
        )}
        {save.error && (
          <p role="alert" className="onboarding-error">
            We couldn’t add this course. Your choices are saved here — try
            again.
          </p>
        )}
        {!loading && !data && (
          <p role="alert" className="onboarding-error">
            Your courses couldn’t load. Please reload to try again.
          </p>
        )}
        {alreadyAdded && (
          <p className="onboarding-description">
            This course is already yours.{" "}
            <Link className="text-link" href={`/courses/${trackId}`}>
              View course
            </Link>
          </p>
        )}
        <div className="onboarding-actions">
          {step === 2 ? (
            <Button
              variant="ghost"
              disabled={pending}
              onClick={() => {
                save.reset();
                setStep(1);
              }}
            >
              Back
            </Button>
          ) : (
            <span className="onboarding-hint">
              One course, plenty to build.
            </span>
          )}
          <Button
            type="submit"
            size="lg"
            loading={pending}
            disabled={
              loading ||
              !data ||
              !trackId ||
              alreadyAdded ||
              (step === 2 && !experience)
            }
          >
            {step === 1 ? "Continue" : "Add course"}
            <ArrowRight aria-hidden="true" />
          </Button>
        </div>
      </form>
    </section>
  );
}
