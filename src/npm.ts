#!/usr/bin/env node
import path from "node:path";
import process from "node:process";
import { execa } from "execa";
import findCacheDir from "find-cache-dir";
import { pino } from "pino";
import { temporaryDirectory } from "tempy";
import which from "which";
import pkg from "../package.json";

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			NPM_WRAPPER?: "1";
			PATH?: string;
		}
	}
}

async function main() {
	const { name } = pkg;
	const cacheDir =
		findCacheDir({ name, create: true }) ??
		temporaryDirectory({ prefix: name });

	const transport = pino.transport({
		targets: [
			{
				level: "warn",
				target: "pino-pretty",
				options: { destination: 2 },
			},
			{
				level: "debug",
				target: "pino/file",
				options: {
					level: "debug",
					destination: path.join(cacheDir, "run.log"),
				},
			},
		],
	});
	const logger = pino(transport);

	const args = process.argv.slice(2);

	logger.child({ argv: process.argv, cwd: process.cwd() }).info("npm command");

	if (args.includes("install") || args.includes("uninstall")) return;
	if (args.indexOf("--no-save") > -1) {
		args.splice(args.indexOf("--no-save"), 1);
	}

	if (process.env.NPM_WRAPPER) {
		const npmSelf = await which("npm");
		const npm = await which("npm", {
			path: process.env.PATH?.split(path.delimiter)
				.filter((s) => s !== path.dirname(npmSelf))
				.join(path.delimiter),
		});
		await execa(npm, args, { stdio: "inherit" });
		return;
	}

	await execa("pnpm", args, { env: { NPM_WRAPPER: "1" }, stdio: "inherit" });
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
