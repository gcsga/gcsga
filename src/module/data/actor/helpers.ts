import { ActorGURPS2 } from "@module/document/actor.ts"
import { ActorType } from "../constants.ts"
import { ActorDataInstances, ActorDataTemplates, ActorTemplateType } from "./types.ts"

type ActorInst<T extends ActorType> = ActorGURPS2 & { system: ActorDataInstances[T] }

type ActorTemplateInst<T extends ActorTemplateType> = ActorGURPS2 & { system: ActorDataTemplates[T] }

export type { ActorInst, ActorTemplateInst }
