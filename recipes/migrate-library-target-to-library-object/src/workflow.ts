import type { SgRoot } from "codemod:ast-grep";
import type TS from "codemod:ast-grep/langs/typescript";

type Edit = ReturnType<ReturnType<SgRoot<TS>['root']>['replace']>;

export default function transform(root: SgRoot<TS>): string | null {
	const rootNode = root.root();
	const edits: Edit[] = [];
	let hasChanges = false;

	// Find all module.exports assignments
	const moduleExports = rootNode.findAll({
		rule: {
			kind: "assignment_expression",
			has: {
				kind: "member_expression",
				has: {
					field: "object",
					kind: "identifier",
					regex: "^module$"
				}
			}
		}
	});

	for (const moduleExport of moduleExports) {
		// Find the right side of the assignment (the configuration object)
		const rightSide = moduleExport.find({
			rule: {
				kind: "object"
			}
		});

		if (!rightSide) continue;

		// Find the output property
		const outputProperty = rightSide.find({
			rule: {
				kind: "pair",
				has: {
					field: "key",
					kind: "property_identifier",
					regex: "^output$"
				}
			}
		});

		if (!outputProperty) continue;

		// Find the output object value
		const outputObject = outputProperty.find({
			rule: {
				kind: "object"
			}
		});

		if (!outputObject) continue;

		// Find library and libraryTarget properties
		const libraryProperty = outputObject.find({
			rule: {
				kind: "pair",
				has: {
					field: "key",
					kind: "property_identifier",
					regex: "^library$"
				}
			}
		});

		const libraryTargetProperty = outputObject.find({
			rule: {
				kind: "pair",
				has: {
					field: "key",
					kind: "property_identifier",
					regex: "^libraryTarget$"
				}
			}
		});

		if (!libraryProperty) continue;

		// Get the library value
		const libraryValue = libraryProperty.find({
			rule: {
				kind: "string"
			}
		});

		if (!libraryValue) continue;

		const libraryName = libraryValue.text();

		// Get the libraryTarget value if it exists
		let libraryType = "undefined";
		if (libraryTargetProperty) {
			const libraryTargetValue = libraryTargetProperty.find({
				rule: {
					kind: "string"
				}
			});
			if (libraryTargetValue) {
				libraryType = libraryTargetValue.text();
			}
		}

		// Get all properties in the output object to reconstruct it properly
		const allProperties = outputObject.findAll({
			rule: {
				kind: "pair"
			}
		});

		// Build new output object content
		const newProperties: string[] = [];
		
		for (const property of allProperties) {
			const keyNode = property.find({
				rule: {
					kind: "property_identifier"
				}
			});
			
			if (!keyNode) continue;
			
			const keyName = keyNode.text();
			
			if (keyName === "library") {
				// Replace with new library object
				newProperties.push(`library: {
      name: ${libraryName},
      type: ${libraryType === "undefined" ? "undefined" : libraryType},
    }`);
			} else if (keyName === "libraryTarget") {
				// Skip libraryTarget property - it's being moved into library.type
				continue;
			} else {
				// Keep other properties as-is
				newProperties.push(property.text());
			}
		}

		// Replace the entire output object
		const newOutputObject = `{
    ${newProperties.join(",\n    ")},
  }`;

		edits.push(outputObject.replace(newOutputObject));
		hasChanges = true;
	}

	if (!hasChanges) return null;

	return rootNode.commitEdits(edits);
}