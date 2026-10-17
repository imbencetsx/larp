"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft } from "pixelarticons/react/ArrowLeft.js";
import { ArrowRight } from "pixelarticons/react/ArrowRight.js";
import { CheckboxOn as CheckCircle2 } from "pixelarticons/react/CheckboxOn.js";
import { ChevronLeft } from "pixelarticons/react/ChevronLeft.js";
import { ChevronRight } from "pixelarticons/react/ChevronRight.js";
import { Reload as RotateCcw } from "pixelarticons/react/Reload.js";
import { Button } from "~/components/ui/button";
import { Card, CardHeader, CardPanel } from "~/components/ui/card";
import { Radio, RadioGroup } from "~/components/ui/radio-group";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import { Alert, AlertDescription } from "~/components/ui/alert";
import {
  trackLessons,
  tracks,
  lessons,
  type Lesson,
} from "~/content/curriculum";
import { api, type RouterOutputs } from "~/trpc/react";
import { useLearning } from "./learning-provider";
import { Snippet } from "./code-workspace";
import { LessonProgress } from "./lesson-progress";

export function QuizWorkspace({
  lesson,
  initialCode,
}: {
  lesson: Lesson;
  initialCode: string;
}) {
  const questions = lesson.quiz!;
  const [answers, setAnswers] = useState<number[]>(() => {
    try {
      const stored: unknown = JSON.parse(initialCode);
      return questions.map((question, i) =>
        Array.isArray(stored) &&
        Number.isInteger(stored[i]) &&
        stored[i] >= 0 &&
        stored[i] < question.choices.length
          ? Number(stored[i])
          : -1,
      );
    } catch {
      return questions.map(() => -1);
    }
  });
  const [step, setStep] = useState(0);
  const [dirty, setDirty] = useState(false);
  const [feedback, setFeedback] = useState<
    RouterOutputs["learning"]["submit"] | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const { refresh } = useLearning();
  const submit = api.learning.submit.useMutation();
  const { mutate: save } = api.learning.save.useMutation({
    onError: () =>
      setError("Could not save your answers. Choose again to retry."),
  });
  useEffect(() => {
    if (!dirty) return;
    const timer = setTimeout(() => {
      save({ lessonId: lesson.id, code: JSON.stringify(answers) });
      setDirty(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [answers, dirty, lesson.id, save]);
  const question = questions[step]!;
  const answered = answers.filter((answer) => answer >= 0).length;
  const passed = feedback?.passed;
  const next = lessons[lessons.findIndex((item) => item.id === lesson.id) + 1];
  async function checkAnswers() {
    setError(null);
    setDirty(false);
    try {
      const result = await submit.mutateAsync({
        lessonId: lesson.id,
        code: JSON.stringify(answers),
      });
      setFeedback(result);
      await refresh();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not submit. Try again.",
      );
    }
  }
  return (
    <div className="quiz-workspace">
      <div className="lesson-topline">
        <div>
          <Link href={`/courses/${lesson.track}`} className="back-link">
            <ArrowLeft aria-hidden="true" />
            {tracks.find((track) => track.id === lesson.track)!.name}
          </Link>
          <h1>{lesson.title}</h1>
        </div>
        <Badge variant="outline">
          QUIZ · {lesson.number}/{trackLessons(lesson.track).length}
        </Badge>
      </div>
      <div className="quiz-layout">
        <Card className="quiz-question-card">
          <CardHeader>
            <div className="section-heading">
              <span className="eyebrow">
                QUESTION {step + 1} OF {questions.length}
              </span>
              <Badge variant="outline">
                {answered}/{questions.length} answered
              </Badge>
            </div>
            <LessonProgress
              completed={answered}
              total={questions.length}
              label="Answers chosen"
            />
          </CardHeader>
          <CardPanel>
            <h2 id="quiz-question">{question.prompt}</h2>
            {question.code && (
              <Snippet
                code={question.code}
                filename={
                  lesson.track === "html"
                    ? "question.html"
                    : lesson.track === "css"
                      ? "question.css"
                      : "question.ts"
                }
              />
            )}
            <RadioGroup
              aria-labelledby="quiz-question"
              value={(answers[step] ?? -1) >= 0 ? String(answers[step]) : null}
              onValueChange={(value) => {
                setAnswers((previous) =>
                  previous.map((answer, i) =>
                    i === step ? Number(value) : answer,
                  ),
                );
                setDirty(true);
                setFeedback(null);
                setError(null);
              }}
              disabled={submit.isPending || !!passed}
              className="quiz-choices"
            >
              {question.choices.map((choice, i) => (
                <Label
                  key={choice}
                  className="quiz-choice"
                  data-selected={answers[step] === i}
                >
                  <Radio value={String(i)} />
                  <span className="quiz-choice-letter">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span>{choice}</span>
                </Label>
              ))}
            </RadioGroup>
            {feedback && (
              <Alert
                variant={feedback.checks[step]?.passed ? "success" : "error"}
                className="quiz-explanation"
              >
                <AlertDescription>
                  <strong>
                    {feedback.checks[step]?.passed
                      ? "Correct."
                      : "Review this one."}
                  </strong>{" "}
                  {feedback.output[step]}
                </AlertDescription>
              </Alert>
            )}
            <div className="quiz-pagination">
              <Button
                variant="outline"
                disabled={step === 0}
                onClick={() => setStep((value) => value - 1)}
              >
                <ChevronLeft aria-hidden="true" />
                Previous
              </Button>
              <span>
                {step + 1} / {questions.length}
              </span>
              <Button
                variant="outline"
                disabled={step === questions.length - 1}
                onClick={() => setStep((value) => value + 1)}
              >
                Next
                <ChevronRight aria-hidden="true" />
              </Button>
            </div>
          </CardPanel>
        </Card>
        <Card className="quiz-summary">
          <CardHeader>
            <h2>Check your thinking.</h2>
          </CardHeader>
          <CardPanel>
            <p>
              Choose one answer per question. Submit to see explanations and
              grow your course flower.
            </p>
            <nav className="quiz-question-nav" aria-label="Quiz questions">
              {questions.map((item, i) => (
                <Button
                  key={item.prompt}
                  variant={step === i ? "default" : "outline"}
                  onClick={() => setStep(i)}
                  aria-label={`Question ${i + 1}${(answers[i] ?? -1) >= 0 ? ", answered" : ""}`}
                  aria-current={step === i ? "step" : undefined}
                >
                  {feedback?.checks[i]?.passed ? (
                    <CheckCircle2 aria-hidden="true" />
                  ) : (
                    i + 1
                  )}
                </Button>
              ))}
            </nav>
            {feedback && !passed && (
              <p className="quiz-score" role="status">
                {feedback.checks.filter((check) => check.passed).length}/
                {questions.length} correct. Review the explanations and try
                again.
              </p>
            )}
            {error && (
              <Alert variant="error">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {passed ? (
              <div className="completion-panel quiz-complete" role="status">
                <CheckCircle2 aria-hidden="true" />
                <strong>Quiz complete.</strong>
                <p>Every answer checked. Progress saved.</p>
                <Button
                  render={
                    <Link
                      href={
                        next
                          ? `/learn/${next.track}/${next.number}`
                          : "/courses"
                      }
                    />
                  }
                >
                  Next lesson
                  <ArrowRight aria-hidden="true" />
                </Button>
              </div>
            ) : (
              <Button
                disabled={answered !== questions.length || submit.isPending}
                loading={submit.isPending}
                onClick={() => void checkAnswers()}
              >
                Submit answers
                <ArrowRight aria-hidden="true" />
              </Button>
            )}
            {!passed && (
              <Button
                variant="ghost"
                disabled={submit.isPending}
                onClick={() => {
                  setAnswers(questions.map(() => -1));
                  setStep(0);
                  setFeedback(null);
                  setDirty(true);
                }}
              >
                <RotateCcw aria-hidden="true" />
                Clear answers
              </Button>
            )}
          </CardPanel>
        </Card>
      </div>
    </div>
  );
}
