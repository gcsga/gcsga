import { ActiveEffectGURPS } from "@module/documents/active-effect.ts"
import { EffectType } from "../constants.ts"
import { EffectDataInstances } from "./types.ts"
import { ItemDataTemplates, ItemTemplateType } from "../item/types.ts"

type EffectInst<T extends EffectType> = ActiveEffectGURPS & { system: EffectDataInstances[T] }

type EffectTemplateInst<T extends ItemTemplateType> = ActiveEffectGURPS & { system: ItemDataTemplates[T] }

export type { EffectInst, EffectTemplateInst }
