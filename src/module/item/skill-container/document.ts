// import { ActorGURPS } from "@actor"
// import { AbstractContainerGURPS } from "@item"
// import { SkillContainerSource, SkillContainerSystemData } from "./data.ts"
// import { ItemInstances } from "@item/types.ts"
// import { ItemType } from "@module/data/constants.ts"
//
// class SkillContainerGURPS<
// 	TParent extends ActorGURPS | null = ActorGURPS | null,
// > extends AbstractContainerGURPS<TParent> {
// 	get children(): Collection<
// 		| ItemInstances<TParent>[ItemType.Skill]
// 		| ItemInstances<TParent>[ItemType.Technique]
// 		| ItemInstances<TParent>[ItemType.SkillContainer]
// 	> {
// 		return new Collection(
// 			this.contents
// 				.filter(item => item.isOfType(ItemType.Skill, ItemType.Technique, ItemType.SkillContainer))
// 				.map(item => [
// 					item.id,
// 					item as
// 						| ItemInstances<TParent>[ItemType.Skill]
// 						| ItemInstances<TParent>[ItemType.Technique]
// 						| ItemInstances<TParent>[ItemType.SkillContainer],
// 				]),
// 		)
// 	}
// }
//
// interface SkillContainerGURPS<TParent extends ActorGURPS | null = ActorGURPS | null>
// 	extends AbstractContainerGURPS<TParent> {
// 	readonly _source: SkillContainerSource
// 	system: SkillContainerSystemData
// }
//
// export { SkillContainerGURPS }
