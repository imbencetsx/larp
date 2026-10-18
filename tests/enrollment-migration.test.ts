import { createClient } from "@libsql/client";
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
it("carries forward only an existing account’s selected onboarding course", async () => {
  const client = createClient({ url: "file::memory:" });
  const apply = async (file: string) => {
    for (const statement of readFileSync(`drizzle/${file}`, "utf8").split(
      "--> statement-breakpoint",
    )) {
      if (statement.trim()) await client.execute(statement);
    }
  };
  try {
    await apply("0000_amused_jazinda.sql");
    await apply("0001_slimy_moon_knight.sql");
    await apply("0002_flashy_marauders.sql");
    await client.execute(
      "INSERT INTO larp_user (id, learningTrack, onboardingCompletedAt) VALUES ('existing-account', 'css', 1700000000), ('unfinished-account', 'html', null), ('old-guest', null, null)",
    );
    await apply("0003_known_johnny_blaze.sql");
    const result = await client.execute(
      "SELECT userId, trackId, experience, source FROM larp_enrollment",
    );
    expect(result.rows).toEqual([
      {
        userId: "existing-account",
        trackId: "css",
        experience: null,
        source: "onboarding",
      },
    ]);
    expect(
      (await client.execute("SELECT count(*) AS count FROM larp_user")).rows[0]
        ?.count,
    ).toBe(3);
  } finally {
    client.close();
  }
});
