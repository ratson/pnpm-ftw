import { execa } from "execa";
import { assert, describe, expect, it } from "vitest";

describe("npm", () => {
	it("--version", async () => {
		const { stdout: npmVersion } = await execa("tsx", [
			"src/npm.ts",
			"--version",
		]);
		const { stdout: pnpmVersion } = await execa("pnpm", ["--version"]);

		expect(npmVersion).toEqual(pnpmVersion);
	});
});
