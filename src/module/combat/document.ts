import { TokenDocumentGURPS } from "@module/token"
import { DocumentModificationOptions } from "types/foundry/common/abstract/document.mjs"
import { CombatData } from "types/foundry/common/data/module.mjs"

// The whole point of this class is to not send messages when you roll initiative
export class CombatGURPS extends Combat {
	protected _onDelete(options: DocumentModificationOptions, userId: string): void {
		game.messages
			?.filter(e => Boolean(e.getFlag("core", "initiativeRoll")))
			.forEach(e => {
				e.delete()
			})
		return super._onDelete(options, userId)
	}

	// Helper function to update the damageMap flag for a list of tokens
	static async updateDamageMapForTokens(tokenIds: (string | undefined)[]): Promise<void> {
		const updates = tokenIds
			.filter(it => !!it) // Remove any undefined elements.
			.map(tokenId => ({
				_id: <string>tokenId,
				flags: {
					gcsga: {
						damageMap: undefined,
					},
				},
			})) // Map to a data object that contains the delta.

		if (updates.length > 0) {
			await canvas?.scene?.updateEmbeddedDocuments("Token", updates)
		}
	}

	static async deleteCombat(combat: CombatGURPS) {
		// const tokenIds = combat.combatants.map(combatant => combatant.token?.id ?? undefined).filter(it => !!it)
		const tokens = combat.combatants.map(combatant => combatant.token) as TokenDocumentGURPS[]
		tokens.forEach(async token => await token.actor?.resetManeuvers())
		await CombatGURPS.updateDamageMapForTokens(tokens.map(t => t?.id) as string[])
	}

	static async updateCombat(combat: Combat, updateData: CombatData) {
		if (!updateData.combatants) return

		const previousCombatants = combat.data.combatants
		const updatedCombatants = updateData.combatants
		const removedCombatants = previousCombatants.filter(
			prevCombatant => !updatedCombatants.some(updatedCombatant => updatedCombatant.id === prevCombatant.id)
		)

		const tokenIds = removedCombatants.map(combatant => combatant.token?.id ?? undefined)
		await CombatGURPS.updateDamageMapForTokens(tokenIds)
	}
}
