"use client";
import Link from "next/link";
import { useState } from "react";
import { UserButton } from "@clerk/nextjs";
import { ExternalLink as ArrowUpRight } from "pixelarticons/react/ExternalLink.js";
import { CheckboxOn as CheckCircle2 } from "pixelarticons/react/CheckboxOn.js";
import { SquareAlert as CircleAlert } from "pixelarticons/react/SquareAlert.js";
import { Save } from "pixelarticons/react/Save.js";
import { Button } from "~/components/ui/button";
import { Card, CardHeader, CardTitle, CardPanel } from "~/components/ui/card";
import { Form } from "~/components/ui/form";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Spinner } from "~/components/ui/spinner";
import { Field, FieldLabel, FieldError } from "~/components/ui/field";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectPopup,
  SelectItem,
} from "~/components/ui/select";
import { Input } from "~/components/ui/input";
import { api } from "~/trpc/react";
import { useLearning } from "./learning-provider";
const goalOptions = [1, 2, 3, 4, 5].map((n) => ({
  value: n,
  label: `${n} ${n === 1 ? "lesson" : "lessons"} a day`,
}));
export function SettingsPage() {
  const { data, loading, error, refresh, authEnabled } = useLearning();
  if (loading)
    return (
      <div className="loading-panel">
        <Spinner className="size-4" />
        Loading settings…
      </div>
    );
  if (error && !data) return null;
  return (
    <SettingsForm
      key={data?.profile.id ?? "guest"}
      initial={{
        gardenName: data?.profile.gardenName ?? "Sprout",
        dailyGoal: data?.profile.dailyGoal ?? 1,
      }}
      guest={data?.guest ?? true}
      authEnabled={authEnabled}
      refresh={refresh}
    />
  );
}
function SettingsForm({
  initial,
  guest,
  authEnabled,
  refresh,
}: {
  initial: { gardenName: string; dailyGoal: number };
  guest: boolean;
  authEnabled: boolean;
  refresh: () => Promise<unknown>;
}) {
  const [form, setForm] = useState(initial);
  const [status, setStatus] = useState("");
  const mutation = api.learning.settings.useMutation();
  return (
    <>
      <section className="page-heading">
        <div>
          <span className="eyebrow">MAKE IT YOURS</span>
          <h1>Settings.</h1>
        </div>
      </section>
      <div className="settings-grid">
        <Card className="settings-panel">
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
          </CardHeader>
          <CardPanel>
            <Form
              className="settings-form"
              onSubmit={async (e) => {
                e.preventDefault();
                setStatus("");
                try {
                  await mutation.mutateAsync(form);
                  await refresh();
                  setStatus("Preferences saved.");
                } catch (error) {
                  setStatus(
                    error instanceof Error
                      ? error.message
                      : "Could not save preferences.",
                  );
                }
              }}
            >
              <Field name="gardenName">
                <FieldLabel htmlFor="garden-name">
                  Your garden’s name
                </FieldLabel>
                <Input
                  id="garden-name"
                  type="text"
                  required
                  maxLength={30}
                  value={form.gardenName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, gardenName: e.target.value }))
                  }
                />
                <FieldError />
              </Field>
              <Field name="dailyGoal">
                <FieldLabel htmlFor="daily-goal">Daily goal</FieldLabel>
                <Select
                  items={goalOptions}
                  value={form.dailyGoal}
                  onValueChange={(value) => {
                    if (value) setForm((f) => ({ ...f, dailyGoal: value }));
                  }}
                >
                  <SelectTrigger id="daily-goal">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectPopup>
                    {goalOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectPopup>
                </Select>
              </Field>
              <div>
                <Button type="submit" loading={mutation.isPending}>
                  <Save aria-hidden="true" />
                  Save preferences
                </Button>
              </div>
              {status && (
                <Alert
                  role="status"
                  variant={mutation.error ? "error" : "success"}
                >
                  {mutation.error ? <CircleAlert /> : <CheckCircle2 />}
                  <AlertDescription>{status}</AlertDescription>
                </Alert>
              )}
            </Form>
          </CardPanel>
        </Card>
        <Card className="account-panel">
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardPanel>
            <p>
              {guest
                ? "Guest session. Create an account to sync progress across devices."
                : "Your progress is synced with Clerk."}
            </p>
            {guest ? (
              <>
                <Button render={<Link href="/sign-up" />}>
                  Create account <ArrowUpRight aria-hidden="true" />
                </Button>
                <Link href="/sign-in" className="text-link">
                  Sign in <ArrowUpRight aria-hidden="true" />
                </Link>
                {!authEnabled && (
                  <p className="field-help">
                    Clerk keys required. Add them to .env and restart.
                  </p>
                )}
              </>
            ) : (
              <UserButton />
            )}
          </CardPanel>
        </Card>
      </div>
    </>
  );
}
