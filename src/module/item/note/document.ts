// import { ActorGURPS } from "@actor"
// import { ItemGURPS } from "@item"
// import { NoteSource, NoteSystemData } from "./data.ts"
// import { Nameable } from "@module/util/nameable.ts"
//
// class NoteGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends ItemGURPS<TParent> {
// 	/** Nameables */
// 	fillWithNameableKeys(m: Map<string, string>, existing?: Map<string, string>): void {
// 		if (!existing) existing = this.nameableReplacements
//
// 		Nameable.extract(this.system.text, m, existing)
// 	}
// }
//
// interface NoteGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends ItemGURPS<TParent> {
// 	readonly _source: NoteSource
// 	system: NoteSystemData
// }
//
// export { NoteGURPS }
