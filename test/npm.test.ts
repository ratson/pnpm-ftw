import { execa } from "execa";
import { describe, expect, it } from "vitest";

describe("npm", () => {
	it("--version", async () => {
		const { stdout: npmVersion } = await execa("tsx", [
			"src/npm.ts",
			"--version",
		]);
		const { stdout: pnpmVersion } = await execa("pnpm", ["--version"]);

		expect(npmVersion).toEqual(pnpmVersion);
	});

	it("lib", async () => {
		const { stdout: npmVersion } = await execa("./lib/npm.js", ["--version"]);

		expect(npmVersion).to.be.string;
	});
});
