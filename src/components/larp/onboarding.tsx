"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "pixelarticons/react/ArrowRight.js";
import { Button } from "~/components/ui/button";
import { Radio, RadioGroup } from "~/components/ui/radio-group";
import { Label } from "~/components/ui/label";
import {
  learningChoices,
  referralChoices,
  learningDestination,
  type OnboardingAnswers,
} from "~/lib/onboarding";
import { trackEvent } from "~/lib/analytics";
import { api } from "~/trpc/react";

export function Onboarding({ next }: { next: string }) {
  const [step, setStep] = useState<1 | 2>(1);
  const [learningTrack, setLearningTrack] = useState<
    OnboardingAnswers["learningTrack"] | ""
  >("");
  const [referralSource, setReferralSource] = useState<
    OnboardingAnswers["referralSource"] | ""
  >("");
  const [leaving, setLeaving] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const started = useRef(false);
  const save = api.learning.completeOnboarding.useMutation({
    onSuccess(result, input) {
      if (result.firstCompletion) trackEvent("onboarding_completed", input);
      setLeaving(true);
      const destination = learningDestination(next);
      window.location.replace(
        destination === "/" ? `/learn/${result.learningTrack}/1` : destination,
      );
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
        <div className="onboarding-progress" aria-label={`Step ${step} of 2`}>
          <span className="onboarding-kicker">A little about you</span>
          <span>0{step} / 02</span>
        </div>
        <div className="onboarding-progress-bars" aria-hidden="true">
          <span data-active />
          <span data-active={step === 2 || undefined} />
        </div>
        <h1 id="onboarding-title" ref={heading} tabIndex={-1}>
          {step === 1
            ? "What do you want to start learning?"
            : "How did you hear about LARP?"}
        </h1>
        <p className="onboarding-description">
          {step === 1
            ? "Pick your first path. You can explore every course whenever you like."
            : "Help us find more people who want to learn by building."}
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
              save.mutate({ learningTrack, referralSource });
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
              className="onboarding-choices"
            >
              {learningChoices.map((choice) => (
                <Label
                  className="onboarding-choice"
                  data-selected={learningTrack === choice.id || undefined}
                  key={choice.id}
                >
                  <Radio value={choice.id} />
                  <span>
                    <strong>{choice.name}</strong>{" "}
                    <span className="onboarding-choice-description">
                      {choice.description}
                    </span>
                  </span>
                </Label>
              ))}
            </RadioGroup>
          ) : (
            <RadioGroup
              key="referral"
              aria-labelledby="onboarding-title"
              value={referralSource}
              disabled={pending}
              onValueChange={(value) =>
                setReferralSource(value as OnboardingAnswers["referralSource"])
              }
              className="onboarding-choices onboarding-referrals"
            >
              {referralChoices.map((choice) => (
                <Label
                  className="onboarding-choice"
                  data-selected={referralSource === choice.id || undefined}
                  key={choice.id}
                >
                  <Radio value={choice.id} />
                  <span>{choice.name}</span>
                </Label>
              ))}
            </RadioGroup>
          )}
          {save.error && (
            <p className="onboarding-error" role="alert">
              We couldn’t save your answers. Please try again.
            </p>
          )}
          <div className="onboarding-actions">
            {step === 2 ? (
              <Button
                type="button"
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
                New to coding? Start with HTML.
              </span>
            )}
            <Button
              type="submit"
              size="lg"
              loading={pending}
              disabled={step === 1 ? !learningTrack : !referralSource}
            >
              {step === 1 ? "Continue" : "Start learning"}
              <ArrowRight aria-hidden="true" />
            </Button>
          </div>
        </form>
      </section>
    </main>
  );
}
