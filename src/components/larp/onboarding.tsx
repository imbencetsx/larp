"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "pixelarticons/react/ArrowRight.js";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
} from "~/components/ui/field";
import { RadioGroup } from "~/components/ui/radio-group";
import { ChoiceTile, courseIcons } from "./choice-tile";
import { Users } from "pixelarticons/react/Users.js";
import { Search } from "pixelarticons/react/Search.js";
import { Video } from "pixelarticons/react/Video.js";
import { Camera } from "pixelarticons/react/Camera.js";
import { Music } from "pixelarticons/react/Music.js";
import { Message } from "pixelarticons/react/Message.js";
import { Globe } from "pixelarticons/react/Globe.js";
import { Minus } from "pixelarticons/react/Minus.js";
const referralIcons = {
  friend: Users,
  search: Search,
  tiktok: Music,
  instagram: Camera,
  youtube: Video,
  reddit: Message,
  other: Globe,
  prefer_not_to_say: Minus,
};
import {
  gardenNameInput,
  learningChoices,
  referralChoices,
  type OnboardingAnswers,
} from "~/lib/onboarding";
import { trackEvent } from "~/lib/analytics";
import { api } from "~/trpc/react";

export function Onboarding() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [learningTrack, setLearningTrack] = useState<
    OnboardingAnswers["learningTrack"] | ""
  >("");
  const [referralSource, setReferralSource] = useState<
    OnboardingAnswers["referralSource"] | ""
  >("");
  const [gardenName, setGardenName] = useState("");
  const [leaving, setLeaving] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const started = useRef(false);
  const save = api.learning.completeOnboarding.useMutation({
    onSuccess(result, input) {
      if (result.firstCompletion) {
        trackEvent("onboarding_completed", {
          learningTrack: input.learningTrack,
          referralSource: input.referralSource,
        });
      }
      setLeaving(true);
      window.location.replace(`/courses/${result.learningTrack}`);
    },
  });
  useEffect(() => {
    if (!started.current) {
      started.current = true;
      trackEvent("onboarding_started", {});
    }
  }, []);
  useEffect(() => {
    heading.current?.focus();
  }, [step]);
  const pending = save.isPending || leaving;
  return (
    <main className="onboarding-page">
      <section className="onboarding-panel" aria-labelledby="onboarding-title">
        <div className="onboarding-progress" aria-label={`Step ${step} of 3`}>
          <span className="onboarding-kicker">A little about you</span>
          <span>0{step} / 03</span>
        </div>
        <div className="onboarding-progress-bars" aria-hidden="true">
          <span data-active />
          <span data-active={step >= 2 || undefined} />
          <span data-active={step === 3 || undefined} />
        </div>
        <h1 id="onboarding-title" ref={heading} tabIndex={-1}>
          {step === 1
            ? "What do you want to start learning?"
            : step === 2
              ? "How did you hear about LARP?"
              : "What should your garden’s name be?"}
        </h1>
        <p className="onboarding-description">
          {step === 1
            ? "Pick your first path. You can explore every course whenever you like."
            : step === 2
              ? "Help us find more people who want to learn by building."
              : "Every lesson helps it grow. Give your garden a name to make it yours."}
        </p>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (pending) return;
            if (step === 1 && learningTrack) {
              trackEvent("onboarding_step_completed", {
                step: "learning_track",
              });
              setStep(2);
            } else if (step === 2 && learningTrack && referralSource) {
              trackEvent("onboarding_step_completed", {
                step: "referral_source",
              });
              setStep(3);
            } else if (
              step === 3 &&
              learningTrack &&
              referralSource &&
              gardenNameInput.safeParse(gardenName).success
            ) {
              save.mutate({
                learningTrack,
                referralSource,
                gardenName: gardenName.trim(),
              });
            }
          }}
        >
          {step === 1 ? (
            <RadioGroup
              key="learning"
              aria-labelledby="onboarding-title"
              value={learningTrack}
              onValueChange={(value) =>
                setLearningTrack(value as OnboardingAnswers["learningTrack"])
              }
              className="onboarding-choices choice-grid"
            >
              {learningChoices.map((choice) => (
                <ChoiceTile
                  key={choice.id}
                  value={choice.id}
                  selected={learningTrack === choice.id}
                  icon={courseIcons[choice.id]}
                  title={choice.name}
                  description={choice.description}
                />
              ))}
            </RadioGroup>
          ) : step === 2 ? (
            <RadioGroup
              key="referral"
              aria-labelledby="onboarding-title"
              value={referralSource}
              disabled={pending}
              onValueChange={(value) =>
                setReferralSource(value as OnboardingAnswers["referralSource"])
              }
              className="onboarding-choices choice-grid onboarding-referrals"
            >
              {referralChoices.map((choice) => (
                <ChoiceTile
                  key={choice.id}
                  value={choice.id}
                  selected={referralSource === choice.id}
                  icon={referralIcons[choice.id]}
                  title={choice.name}
                  disabled={pending}
                />
              ))}
            </RadioGroup>
          ) : (
            <Field name="gardenName" disabled={pending}>
              <FieldLabel htmlFor="onboarding-garden-name">
                Garden name
              </FieldLabel>
              <Input
                id="onboarding-garden-name"
                type="text"
                size="lg"
                required
                maxLength={30}
                value={gardenName}
                placeholder="e.g. The little green patch"
                onChange={(event) => setGardenName(event.target.value)}
              />
              <FieldDescription>
                Up to 30 characters. You can change it in settings.
              </FieldDescription>
              <FieldError />
            </Field>
          )}
          {save.error && (
            <p className="onboarding-error" role="alert">
              We couldn’t save your answers. Please try again.
            </p>
          )}
          <div className="onboarding-actions">
            {step > 1 ? (
              <Button
                type="button"
                variant="ghost"
                disabled={pending}
                onClick={() => {
                  save.reset();
                  setStep(step === 3 ? 2 : 1);
                }}
              >
                Back
              </Button>
            ) : (
              <span className="onboarding-hint">
                New to coding? Start with HTML.
              </span>
            )}
            <Button
              type="submit"
              size="lg"
              loading={pending}
              disabled={
                step === 1
                  ? !learningTrack
                  : step === 2
                    ? !referralSource
                    : !gardenNameInput.safeParse(gardenName).success
              }
            >
              {step < 3 ? "Continue" : "View my course"}
              <ArrowRight aria-hidden="true" />
            </Button>
          </div>
        </form>
      </section>
    </main>
  );
}
