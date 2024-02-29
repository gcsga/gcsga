import { CompendiumPack } from "./lib/compendium-pack.ts"

// CompendiumPack.loadJSON("packs/basic-set-traits")
const conditions = [CompendiumPack.loadJSON("packs/conditions").finalizeAll()].flat()
console.log(JSON.stringify(conditions))
