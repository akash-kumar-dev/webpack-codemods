import type { SgRoot } from "codemod:ast-grep";
import type JS from "codemod:ast-grep/langs/javascript";

type Edit = ReturnType<ReturnType<SgRoot<JS>['root']>['replace']>;

export default function transform(root: SgRoot<JS>): string | null {
	const rootNode = root.root();
	const edits: Edit[] = [];
	let hasChanges = false;

	// Find all pairs in the code
	const pairs = rootNode.findAll({
		rule: {
			kind: "pair"
		}
	});

	for (const pair of pairs) {
		const pairText = pair.text();
		
		// Check if this is a target property with a call expression
		if (pairText.startsWith('target:')) {
			// Find call expressions in this pair
			const callExpressions = pair.findAll({
				rule: {
					kind: "call_expression"
				}
			});
			
			if (callExpressions.length > 0) {
				const callExpressionText = callExpressions[0].text();
				
				// Replace this pair with both target: false and plugins array
				edits.push(pair.replace(`target: false,\n  plugins: [${callExpressionText}]`));
				hasChanges = true;
			}
		}
	}

	if (!hasChanges) return null;

	return rootNode.commitEdits(edits);
}