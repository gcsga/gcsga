import { ActorGURPS } from "@actor"
import { LocalizeGURPS, StringBuilder, feature, selfctrl } from "@util"
import { ConditionalModifierBonus, Feature, ReactionBonus } from "./feature/index.ts"
import { ItemType } from "@module/data/constants.ts"
import { ActorItemCollectionMap } from "@actor/base/item-collection-map.ts"

export class ConditionalModifier {
	from: string

	amounts: number[]

	sources: string[]

	constructor(source: string, from: string, amount: number) {
		this.from = from
		this.amounts = [amount]
		this.sources = [source]
	}

	add(source: string, amount: number): void {
		this.amounts.push(amount)
		this.sources.push(source)
	}

	get total(): number {
		return this.amounts.reduce((partialSum, a) => partialSum + a, 0)
	}

	get tooltip(): string {
		const buffer = new StringBuilder()
		this.sources.forEach((value, index) => {
			if (buffer.length !== 0) buffer.push("<br>")
			buffer.push(`${this.amounts[index].signedString()} ${value}`)
		})
		return buffer.toString()
	}

	static modifiersFromItems(
		type: feature.Type.ReactionBonus | feature.Type.ConditionalModifierBonus,
		collections: ActorItemCollectionMap<ActorGURPS>,
	): ConditionalModifier[] {
		const reactionMap: Map<string, ConditionalModifier> = new Map()
		for (const t of collections.traits) {
			const source = LocalizeGURPS.format(LocalizeGURPS.translations.gurps.reaction.from_trait, {
				name: t.name ?? "",
			})
			this.modifiersFromFeatureList(type, source, t.features, reactionMap)
			for (const mod of t.deepModifiers) {
				if (!mod.enabled) continue
				this.modifiersFromFeatureList(type, source, mod.features, reactionMap)
			}
			if (t.CR !== 0 && t.CRAdj === selfctrl.Adjustment.ReactionPenalty) {
				const amount = selfctrl.Adjustment.adjustment(t.CRAdj, t.CR)
				const situation = LocalizeGURPS.format(LocalizeGURPS.translations.gurps.reaction.cr, {
					trait: t.name ?? "",
				})
				if (reactionMap.has(situation)) reactionMap.get(situation)!.add(source, amount)
				else reactionMap.set(situation, new ConditionalModifier(source, situation, amount))
			}
		}
		for (const e of collections.carriedEquipment) {
			if (e.equipped && e.system.quantity > 0) {
				const source = LocalizeGURPS.format(LocalizeGURPS.translations.gurps.reaction.from_equipment, {
					name: e.name ?? "",
				})
				this.modifiersFromFeatureList(type, source, e.features, reactionMap)
				for (const mod of e.deepModifiers) {
					this.modifiersFromFeatureList(type, source, mod.features, reactionMap)
				}
			}
		}
		for (const sk of collections.skills) {
			let source = LocalizeGURPS.format(LocalizeGURPS.translations.gurps.reaction.from_skill, {
				name: sk.name ?? "",
			})
			if (sk.isOfType(ItemType.Technique))
				source = LocalizeGURPS.format(LocalizeGURPS.translations.gurps.reaction.from_technique, {
					name: sk.name ?? "",
				})
			this.modifiersFromFeatureList(type, source, sk.features, reactionMap)
		}
		const reactionList = Array.from(reactionMap.values()).sort((a, b) =>
			a.from < b.from ? -1 : a.from > b.from ? 1 : 0,
		)
		return reactionList
	}

	private static modifiersFromFeatureList(
		type: feature.Type.ReactionBonus | feature.Type.ConditionalModifierBonus,
		source: string,
		features: Feature[],
		m: Map<string, ConditionalModifier>,
	): void {
		const bonuses = features.filter(
			f =>
				(type === feature.Type.ReactionBonus && f instanceof ReactionBonus) ||
				(type === feature.Type.ConditionalModifierBonus && f instanceof ConditionalModifierBonus),
		) as (ReactionBonus | ConditionalModifierBonus)[]
		bonuses.forEach(f => {
			const amt = f.adjustedAmount
			if (m.has(f.situation)) m.get(f.situation)!.add(source, amt)
			else m.set(f.situation, new ConditionalModifier(source, f.situation, amt))
		})
	}
}
