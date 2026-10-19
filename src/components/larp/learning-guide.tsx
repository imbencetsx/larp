import type { Lesson } from "~/content/curriculum";
import { getLearningGuide } from "~/content/learning-guide";
import type { RunResult } from "~/server/services/validate";
import { Check } from "pixelarticons/react/Check.js";

export function LearningGuide({
  lesson,
  checks = [],
}: {
  lesson: Lesson;
  checks?: RunResult["checks"];
}) {
  const guide = getLearningGuide(lesson);
  return (
    <div className="learning-guide">
      <p className="lesson-objective">{guide.introduction}</p>
      <p className="guide-intro">
        Build one part at a time. The help is right beside the step that needs
        it. Keep your own code in the editor and use Run to see what changed.
      </p>
      <ol className="guide-steps">
        {guide.steps.map((step, index) => {
          const passed =
            step.requirementIndex !== undefined &&
            checks[step.requirementIndex]?.passed;
          return (
            <li
              className="guide-step"
              key={`${lesson.id}-${index}`}
              data-passed={passed ? true : undefined}
            >
              <div className="guide-step-heading">
                <span
                  className="guide-step-number"
                  aria-label={
                    passed
                      ? `Step ${index + 1}, check passed`
                      : `Step ${index + 1}`
                  }
                >
                  {passed ? (
                    <Check aria-hidden="true" />
                  ) : (
                    String(index + 1).padStart(2, "0")
                  )}
                </span>
                <h3>{step.title}</h3>
              </div>
              <p className="guide-action">{step.action}</p>
              {step.explanation.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {step.example && (
                <div className="guide-example">
                  <span className="eyebrow">PATTERN TO ADAPT</span>
                  <pre>
                    <code>{step.example.code}</code>
                  </pre>
                  <p>{step.example.explanation}</p>
                  <p className="guide-practice">{step.example.practice}</p>
                </div>
              )}
              <p className="guide-checkpoint">
                <strong>Before you move on</strong>
                {step.checkpoint}
              </p>
            </li>
          );
        })}
      </ol>
      {lesson.projectBrief && (
        <section className="guide-project-review">
          <h3>Review your finished project</h3>
          <ul>
            {lesson.projectBrief.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
