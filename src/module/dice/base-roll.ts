import { RollModifierSchema } from "@module/data/roll-modifier.ts"

abstract class BaseRollGURPS extends Roll {
	constructor(formula: string, data: Record<string, unknown>, options: BaseRollOptions) {
		super(formula, data, options)
	}

	// Replace all instances of a blank "d" with "d6"
	static override replaceFormulaData(
		formula: string,
		data: Record<string, unknown>,
		{ missing, warn }: { missing?: string; warn?: boolean } = {},
	): string {
		const blankSidesRegex = /([0-9])[dD]([^0-9]|$)/g
		const formulaWithSixes = formula.replace(blankSidesRegex, "$1d6$2")
		return super.replaceFormulaData(formulaWithSixes, data, { missing, warn })
	}

	get modifierTotal(): number {
		let total = 0
		for (const mod of this.options.modifiers ?? []) {
			total += mod.modifier ?? 0
		}
		return 0
	}
}

interface BaseRollGURPS extends Roll {
	options: BaseRollOptions
}

type BaseRollOptions = RollOptions & {
	rollMode: RollMode | "roll"
	modifiers?: DeepPartial<SourceFromSchema<RollModifierSchema>>[]
}

export { BaseRollGURPS, type BaseRollOptions }
