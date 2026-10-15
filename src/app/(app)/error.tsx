"use client";
import { Button } from "~/components/ui/button";
import {
  Alert,
  AlertTitle,
  AlertDescription,
  AlertAction,
} from "~/components/ui/alert";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <Alert variant="error">
      <AlertTitle>Could not load this page.</AlertTitle>
      <AlertDescription>Your progress is saved. Try again.</AlertDescription>
      <AlertAction>
        <Button variant="outline" onClick={reset}>
          Try again
        </Button>
      </AlertAction>
    </Alert>
  );
}
