#!/usr/bin/env node
import { readdirSync, statSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

function findWorkflows(dir) {
	return readdirSync(dir)
		.map((name) => join(dir, name))
		.filter((p) => statSync(p).isDirectory())
		.map((recipeDir) => ({
			recipeDir,
			workflowPath: join(recipeDir, "workflow.yaml"),
		}))
		.filter(({ workflowPath }) => {
			try {
				statSync(workflowPath);
				return true;
			} catch {
				return false;
			}
		});
}

function extractJsAstGrepConfig(workflowYaml) {
	// Very simple heuristics to find js-ast-grep block
	// js_file: <path>
	// language: <lang>
	const jsFileMatch = workflowYaml.match(/js_file:\s*["']?([^"'\n]+)["']?/);
	const languageMatch = workflowYaml.match(/language:\s*["']?([^"'\n]+)["']?/);
	return {
		jsFile: jsFileMatch ? jsFileMatch[1].trim() : null,
		language: languageMatch ? languageMatch[1].trim() : "typescript",
	};
}

function run() {
	const recipesRoot = join(process.cwd(), "recipes");
	const recipes = findWorkflows(recipesRoot);
	for (const { recipeDir, workflowPath } of recipes) {
		process.stdout.write(`Running tests in ${recipeDir}\n\n`);

		// Prefer per-recipe test script if present
		try {
			const pkgJson = JSON.parse(readFileSync(join(recipeDir, "package.json"), "utf8"));
			if (pkgJson?.scripts?.test) {
				const r1 = spawnSync("npm", ["run", "test"], { cwd: recipeDir, stdio: "inherit" });
				if (r1.status !== 0) {
					process.exit(r1.status ?? 1);
				}
				continue;
			}
		} catch {}

		// Fallback: parse workflow and run jssg tests directly
		const wf = readFileSync(workflowPath, "utf8");
		const { jsFile, language } = extractJsAstGrepConfig(wf);
		if (!jsFile) {
			continue;
		}
		const transformPath = join(recipeDir, jsFile);
		const res = spawnSync("npx", ["-y", "codemod@latest", "jssg", "test", "-l", language, transformPath], {
			cwd: recipeDir,
			stdio: "inherit",
		});
		if (res.status !== 0) {
			process.exit(res.status ?? 1);
		}
	}
}

run();
