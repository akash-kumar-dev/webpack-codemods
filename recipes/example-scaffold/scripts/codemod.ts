import type { SgRoot } from "codemod:ast-grep";
import type TS from "codemod:ast-grep/langs/typescript";

async function transform(root: SgRoot<TS>): Promise<string> {
	const rootNode = root.root();

	const nodes = rootNode.findAll({
		rule: {
			pattern: "var $VAR = $VALUE",
		},
	});

	const edits = nodes.map((node) => {
		const varName = node.getMatch("VAR")?.text();
		const value = node.getMatch("VALUE")?.text();
		const original = node.text();
		const suffix = original.trimEnd().endsWith(";") ? ";" : "";
		return node.replace(`const ${varName} = ${value}${suffix}`);
	});

	const newSource = rootNode.commitEdits(edits);
	return newSource;
}

export default transform;
