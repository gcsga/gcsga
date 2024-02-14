import { ErrorGURPS } from "@util"
import {
	GCAAttackMode,
	GCAAttackModesBlock,
	GCABasicDamage,
	GCABody,
	GCABodyItem,
	GCABonus,
	GCABonusClass,
	GCABonusClassesBlock,
	GCABonusesBlock,
	GCACategoriesBlock,
	GCACategory,
	GCACharacter,
	GCADamageBreak,
	GCAExtendedTagsBlock,
	GCAFlagSymbol,
	GCAGroup,
	GCAGroupItem,
	GCAGroupingOptions,
	GCAHitLocationLine,
	GCAHitLocationNote,
	GCAHitLocationTable,
	GCAImageRef,
	GCAImageStore,
	GCAItem,
	GCAItemBlock,
	GCALayerItem,
	GCALoadout,
	GCALogEntry,
	GCALogEntryBlock,
	GCAMessage,
	GCAMessagesBlock,
	GCAModifier,
	GCAModifiersBlock,
	GCAOrderedLayers,
	GCASkillType,
	GCASymbolsBlock,
	GCATrait,
	GCATraitBlock,
	GCATraitGroupingBlock,
	GCATransform,
	GCAUnknownTag,
	gca5,
} from "./data_gca.ts"

class GCAParser {
	static parseFile(input: string): gca5 {
		const parser = new DOMParser()
		const xmlDoc = parser.parseFromString(input, "text/xml")
		const xmlNode = this.getNode(xmlDoc, "gca5")
		if (!xmlNode) throw ErrorGURPS("Not a valid GCA5 file")
		const data: gca5 = { character: [] }
		GCAParser.getNodes(xmlNode, "character").forEach(e => {
			data.character.push(GCAParser.parseCharacter(e))
		})
		return data
	}

	// private static throwError(s: string): void {
	// 	ui.notifications.error(s)
	// 	throw ErrorGURPS(s)
	// }

	private static getNode(xmlNode: Document | ChildNode, name: string): ChildNode | undefined {
		const arr = Array.from(xmlNode.childNodes).filter(node => node.nodeName === name)
		if (arr.length === 0) return undefined
		return arr[0]
	}

	private static getNodes(xmlNode: Document | ChildNode, name: string): ChildNode[] {
		return Array.from(xmlNode.childNodes).filter(node => node.nodeName === name)
	}

	private static extractStrings(xmlNode?: ChildNode[]): string[] | undefined {
		if (!xmlNode) return undefined
		const data: string[] = []
		xmlNode.forEach(e => {
			const s = GCAParser.getNode(e, "#text")?.nodeValue
			if (s && s.trim()) data.push(s.trim())
		})
		return data
	}

	private static extractString(xmlNode?: ChildNode): string | undefined {
		if (!xmlNode) return undefined
		const s = GCAParser.getNode(xmlNode, "#text")?.nodeValue
		return s && s.trim() ? s : undefined
	}

	private static extractNumber(xmlNode?: ChildNode): number | undefined {
		if (!xmlNode) return undefined
		const s = GCAParser.getNode(xmlNode, "#text")?.nodeValue
		return s && s.trim() ? parseInt(s) : undefined
	}

	private static extractBoolean(xmlNode?: ChildNode): boolean | undefined {
		if (!xmlNode) return undefined
		const s = GCAParser.getNode(xmlNode, "#text")?.nodeValue
		return s && s.trim() ? Boolean(parseInt(s)) : undefined
	}

	private static extractStringAttribute(xmlNode: ChildNode, name: string): string {
		const s = (xmlNode as Element).attributes.getNamedItem(name)
		if (!s) return ""
		return s.value.trim()
	}

	private static extractNumberAttribute(xmlNode: ChildNode, name: string): number {
		const s = (xmlNode as Element).attributes.getNamedItem(name)
		if (!s) return 0
		return parseInt(s.value) ?? 0
	}

	private static parseCharacter(xmlNode: ChildNode): GCACharacter {
		return {
			author: this.parseCharacterAuthor(this.getNode(xmlNode, "author")),
			system: this.parseCharacterSystem(this.getNode(xmlNode, "system")!),
			library: this.parseCharacterLibrary(this.getNode(xmlNode, "library")),
			settings: this.parseCharacterSettings(this.getNode(xmlNode, "settings")),
			name: this.extractString(this.getNode(xmlNode, "name"))!,
			player: this.extractString(this.getNode(xmlNode, "player")),
			bodytype: this.extractString(this.getNode(xmlNode, "bodytype"))!,
			bodyimagefile: this.extractString(this.getNode(xmlNode, "bodyimagefile")),
			bodyimage: this.extractString(this.getNode(xmlNode, "bodyimage")),
			currentloadout: this.extractString(this.getNode(xmlNode, "currentloadout"))!,
			currenttransform: this.extractString(this.getNode(xmlNode, "currenttransform")),
			output: this.parseCharacterOutput(this.getNode(xmlNode, "output")),
			vitals: this.parseCharacterVitals(this.getNode(xmlNode, "vitals")),
			basicdefense: this.parseCharacterBasicDefense(this.getNode(xmlNode, "basicdefense")),
			description: this.extractString(this.getNode(xmlNode, "description")),
			note: this.extractString(this.getNode(xmlNode, "note")),
			body: this.parseBody(this.getNode(xmlNode, "body")),
			hitlocationtable: this.parseHitLocationTable(this.getNode(xmlNode, "hitlocationtable")),
			tags: this.parseExtendedTagsBlock(this.getNode(xmlNode, "tags")),
			messages: this.parseMessagesBlock(this.getNode(xmlNode, "messages")),
			traits: this.parseCharacterTraits(this.getNode(xmlNode, "traits")!),
			loadouts: this.parseCharacterLoadouts(this.getNode(xmlNode, "loadouts")!),
			transforms: this.parseCharacterTransforms(this.getNode(xmlNode, "transforms")!),
			campaign: this.parseCampaign(this.getNode(xmlNode, "campaign")!),
			basicdamages: this.parseCharacterBasicDamages(this.getNode(xmlNode, "basicdamages")!),
			damagebreaks: this.parseCharacterDamageBreaks(this.getNode(xmlNode, "damagebreaks")!),
			skilltypes: this.parseCharacterSkillTypes(this.getNode(xmlNode, "skilltypes")!),
			groups: this.parseCharacterGroups(this.getNode(xmlNode, "groups")!),
			categories: this.parseCategoriesBlock(this.getNode(xmlNode, "categories")),
			symbols: this.parseSymbolsBlock(this.getNode(xmlNode, "symbols")),
			bonusclasses: this.parseBonusClassesBlock(this.getNode(xmlNode, "bonusclasses")),
			bodyimagestore: this.parseImageStore(this.getNode(xmlNode, "bodyimagestore")),
		}
	}

	private static parseCharacterAuthor(xmlNode?: ChildNode): GCACharacter["author"] {
		if (!xmlNode) return undefined
		return {
			name: this.extractString(this.getNode(xmlNode, "name")),
			version: this.extractString(this.getNode(xmlNode, "version")),
			copyright: this.extractString(this.getNode(xmlNode, "copyright")),
			datecreated: this.extractString(this.getNode(xmlNode, "datecreated")),
		}
	}

	private static parseCharacterSystem(xmlNode: ChildNode): GCACharacter["system"] {
		return {
			version: this.extractString(this.getNode(xmlNode, "name"))!,
			lastkey: this.extractNumber(this.getNode(xmlNode, "version"))!,
		}
	}

	private static parseCharacterLibrary(xmlNode?: ChildNode): GCACharacter["library"] {
		if (!xmlNode) return undefined
		return {
			name: this.extractString(this.getNode(xmlNode, "name"))!,
			book: this.extractStrings(this.getNodes(xmlNode, "book"))!,
		}
	}

	private static parseCharacterSettings(xmlNode?: ChildNode): GCACharacter["settings"] {
		if (!xmlNode) return undefined
		return {
			ruleof: this.extractNumber(this.getNode(xmlNode, "ruleof")),
			globalruleof: this.extractNumber(this.getNode(xmlNode, "globalruleof")),
			modmultpercents: this.extractNumber(this.getNode(xmlNode, "modmultpercents")),
			usediceaddsconversion: this.extractNumber(this.getNode(xmlNode, "usediceaddsconversion")),
			allownoniqoptspecs: this.extractNumber(this.getNode(xmlNode, "allownoniqoptspecs")),
			allowstackingdeflect: this.extractNumber(this.getNode(xmlNode, "allowstackingdeflect")),
			allowstackingfortify: this.extractNumber(this.getNode(xmlNode, "allowstackingfortify")),
			inplay: this.extractNumber(this.getNode(xmlNode, "inplay")),
			showcharactertraitsymbols: this.extractNumber(this.getNode(xmlNode, "showcharactertraitsymbols")),

			rendernonloadoutitemsinactive: this.extractNumber(this.getNode(xmlNode, "rendernonloadoutitemsinactive")),
			grayoutinactiveitems: this.extractNumber(this.getNode(xmlNode, "grayoutinactiveitems")),

			includeunassigneditemsincurrentloadout: this.extractNumber(
				this.getNode(xmlNode, "includeunassigneditemsincurrentloadout"),
			),

			nodefaultleveldiscount: this.extractNumber(this.getNode(xmlNode, "nodefaultleveldiscount")),

			allowusertraitordering: this.extractNumber(this.getNode(xmlNode, "allowusertraitordering")),

			flagoverspentskills: this.extractNumber(this.getNode(xmlNode, "flagoverspentskills")),

			applydbtoactivedefenses: this.extractNumber(this.getNode(xmlNode, "applydbtoactivedefenses")),

			traitgrouping: this.parseTraitGroupingBlock(this.getNode(xmlNode, "traitgrouping")),
		}
	}

	private static parseTraitGroupingBlock(xmlNode?: ChildNode): GCATraitGroupingBlock | undefined {
		if (!xmlNode) return undefined
		return {
			groupingoptions: this.getNodes(xmlNode, "groupingoptions")!.map(e => this.parseGroupingOptions(e)),
			_count: this.extractNumberAttribute(xmlNode, "count"),
		}
	}

	private static parseGroupingOptions(xmlNode: ChildNode): GCAGroupingOptions {
		return {
			traittype: this.extractString(this.getNode(xmlNode, "traittype"))!,
			groupingtype: this.extractString(this.getNode(xmlNode, "groupingtype"))!,
			specifiedtag: this.extractString(this.getNode(xmlNode, "specifiedtag"))!,
			includetagpartinheader: this.extractString(this.getNode(xmlNode, "includetagpartinheader"))!,
			specifiedvaluesonly: this.extractString(this.getNode(xmlNode, "specifiedvaluesonly"))!,
			specifiedvalueslist: this.extractString(this.getNode(xmlNode, "specifiedvalueslist"))!,
			groupsatend: this.extractString(this.getNode(xmlNode, "groupsatend"))!,
			treataslist: this.extractString(this.getNode(xmlNode, "treataslist")),
		}
	}

	private static parseCharacterOutput(xmlNode?: ChildNode): GCACharacter["output"] {
		if (!xmlNode) return undefined
		return {
			sheetviewsheet: this.extractString(this.getNode(xmlNode, "sheetviewsheet")),
			charactersheet: this.extractString(this.getNode(xmlNode, "charactersheet")),
			altcharactersheet: this.extractString(this.getNode(xmlNode, "altcharactersheet")),
			exportsheet: this.extractString(this.getNode(xmlNode, "exportsheet")),
			altexportsheet: this.extractString(this.getNode(xmlNode, "altexportsheet")),
		}
	}

	private static parseCharacterVitals(xmlNode?: ChildNode): GCACharacter["vitals"] {
		if (!xmlNode) return undefined
		return {
			race: this.extractString(this.getNode(xmlNode, "race")),
			height: this.extractString(this.getNode(xmlNode, "height")),
			weight: this.extractString(this.getNode(xmlNode, "weight")),
			age: this.extractString(this.getNode(xmlNode, "age")),
			appearance: this.extractString(this.getNode(xmlNode, "appearance")),
			portraitfile: this.extractString(this.getNode(xmlNode, "portraitfile")),
			portraitimage: this.extractString(this.getNode(xmlNode, "portraitimage")),
		}
	}

	private static parseCharacterBasicDefense(xmlNode?: ChildNode): GCACharacter["basicdefense"] {
		if (!xmlNode) return undefined
		return {
			parryidkey: this.extractNumber(this.getNode(xmlNode, "parryidkey"))!,
			parryusing: this.extractString(this.getNode(xmlNode, "parryusing"))!,
			parryscore: this.extractNumber(this.getNode(xmlNode, "parryscore"))!,
			blockidkey: this.extractNumber(this.getNode(xmlNode, "blockidkey"))!,
			blockusing: this.extractString(this.getNode(xmlNode, "blockusing"))!,
			blockscore: this.extractNumber(this.getNode(xmlNode, "blockscore"))!,
		}
	}

	private static parseBody(xmlNode?: ChildNode): GCABody | undefined {
		if (!xmlNode) return undefined
		return {
			name: this.extractString(this.getNode(xmlNode, "name")),
			description: this.extractString(this.getNode(xmlNode, "description")),
			bodyitem: this.getNodes(xmlNode, "bodyitem")!.map(e => this.parseBodyItem(e)),
			_count: this.extractNumberAttribute(xmlNode, "count"),
		}
	}

	private static parseBodyItem(xmlNode: ChildNode): GCABodyItem {
		return {
			name: this.extractString(this.getNode(xmlNode, "name"))!,
			cat: this.extractString(this.getNode(xmlNode, "cat"))!,
			group: this.extractString(this.getNode(xmlNode, "group"))!,
			basedb: this.extractString(this.getNode(xmlNode, "basedb"))!,
			basedr: this.extractString(this.getNode(xmlNode, "basedr"))!,
			basehp: this.extractString(this.getNode(xmlNode, "basehp"))!,
			display: this.extractBoolean(this.getNode(xmlNode, "display"))!,
			posx: this.extractNumber(this.getNode(xmlNode, "posx"))!,
			posy: this.extractNumber(this.getNode(xmlNode, "posy"))!,
			width: this.extractNumber(this.getNode(xmlNode, "width")),
			height: this.extractNumber(this.getNode(xmlNode, "height")),
			expanded: this.extractBoolean(this.getNode(xmlNode, "expanded"))!,
			layers: this.extractNumber(this.getNode(xmlNode, "layers"))!,
			db: this.extractString(this.getNode(xmlNode, "db"))!,
			dr: this.extractString(this.getNode(xmlNode, "dr"))!,
			hp: this.extractString(this.getNode(xmlNode, "hp"))!,
		}
	}

	private static parseHitLocationTable(xmlNode?: ChildNode): GCAHitLocationTable | undefined {
		if (!xmlNode) return undefined
		return {
			name: this.extractString(this.getNode(xmlNode, "name"))!,
			description: this.extractString(this.getNode(xmlNode, "description")),
			hitlocationline: this.getNodes(xmlNode, "hitlocationline").map(e => this.parseHitLocationLine(e)),
			hitlocationnote: this.getNodes(xmlNode, "hitlocationnote").map(e => this.parseHitLocationNote(e)),
		}
	}

	private static parseHitLocationLine(xmlNode: ChildNode): GCAHitLocationLine {
		return {
			roll: this.extractString(this.getNode(xmlNode, "roll"))!,
			location: this.extractString(this.getNode(xmlNode, "location"))!,
			penalty: this.extractString(this.getNode(xmlNode, "penalty")),
			notes: this.extractString(this.getNode(xmlNode, "notes")),
		}
	}

	private static parseHitLocationNote(xmlNode: ChildNode): GCAHitLocationNote {
		return {
			key: this.extractString(this.getNode(xmlNode, "key"))!,
			value: this.extractString(this.getNode(xmlNode, "value"))!,
		}
	}

	private static parseExtendedTagsBlock(xmlNode?: ChildNode): GCAExtendedTagsBlock | undefined {
		if (!xmlNode) return undefined
		return {
			extendedtag: this.getNodes(xmlNode, "extendedtag")!.map(e => this.parseUnknownTag(e)),
			_count: this.extractNumberAttribute(xmlNode, "count"),
		}
	}

	private static parseUnknownTag(xmlNode: ChildNode): GCAUnknownTag {
		return {
			tagname: this.extractString(this.getNode(xmlNode, "tagname"))!,
			tagvalue: this.extractString(this.getNode(xmlNode, "tagvalue"))!,
		}
	}

	private static parseMessagesBlock(xmlNode?: ChildNode): GCAMessagesBlock | undefined {
		if (!xmlNode) return undefined
		return {
			message: this.getNodes(xmlNode, "extendedtag")!.map(e => this.parseMessage(e)),
			_count: this.extractNumberAttribute(xmlNode, "count"),
		}
	}

	private static parseMessage(xmlNode: ChildNode): GCAMessage {
		return {
			caption: this.extractString(this.getNode(xmlNode, "caption"))!,
			text: this.extractString(this.getNode(xmlNode, "text"))!,
		}
	}

	private static parseCharacterTraits(xmlNode: ChildNode): GCACharacter["traits"] {
		return {
			attributes: this.parseTraitBlock(this.getNode(xmlNode, "attributes")!),
			cultures: this.parseTraitBlock(this.getNode(xmlNode, "cultures")!),
			languages: this.parseTraitBlock(this.getNode(xmlNode, "languages")!),
			advantages: this.parseTraitBlock(this.getNode(xmlNode, "advantages")!),
			disadvantages: this.parseTraitBlock(this.getNode(xmlNode, "disadvantages")!),
			quirks: this.parseTraitBlock(this.getNode(xmlNode, "quirks")!),
			perks: this.parseTraitBlock(this.getNode(xmlNode, "perks")!),
			features: this.parseTraitBlock(this.getNode(xmlNode, "features")!),
			skills: this.parseTraitBlock(this.getNode(xmlNode, "skills")!),
			spells: this.parseTraitBlock(this.getNode(xmlNode, "spells")!),
			equipment: this.parseTraitBlock(this.getNode(xmlNode, "equipment")!),
			templates: this.parseTraitBlock(this.getNode(xmlNode, "templates")!),
		}
	}

	private static parseTraitBlock(xmlNode: ChildNode): GCATraitBlock {
		return {
			trait: this.getNodes(xmlNode, "trait").map(e => this.parseTrait(e)),
			_count: this.extractNumberAttribute(xmlNode, "count"),
		}
	}

	private static parseTrait(xmlNode: ChildNode): GCATrait {
		return {
			name: this.extractString(this.getNode(xmlNode, "name"))!,
			nameext: this.extractString(this.getNode(xmlNode, "nameext")),
			symbol: this.extractString(this.getNode(xmlNode, "symbol")),
			parentkey: this.extractString(this.getNode(xmlNode, "parentkey")),
			childkeylist: this.extractString(this.getNode(xmlNode, "childkeylist")),
			cat: this.extractString(this.getNode(xmlNode, "cat")),
			tl: this.extractString(this.getNode(xmlNode, "tl")),
			bonuslist: this.extractString(this.getNode(xmlNode, "bonuslist")),
			conditionallist: this.extractString(this.getNode(xmlNode, "conditionallist")),
			needscheck: this.extractBoolean(this.getNode(xmlNode, "needscheck")),
			taboofailed: this.extractBoolean(this.getNode(xmlNode, "taboofailed")),
			points: this.extractNumber(this.getNode(xmlNode, "points")),
			score: this.extractNumber(this.getNode(xmlNode, "score")),
			type: this.extractString(this.getNode(xmlNode, "type")),
			level: this.extractNumber(this.getNode(xmlNode, "level")),
			step: this.extractString(this.getNode(xmlNode, "step")),
			stepoff: this.extractString(this.getNode(xmlNode, "stepoff")),
			cost: this.extractNumber(this.getNode(xmlNode, "cost")),
			count: this.extractNumber(this.getNode(xmlNode, "count")),
			weight: this.extractNumber(this.getNode(xmlNode, "weight")),
			parrylevel: this.extractNumber(this.getNode(xmlNode, "parrylevel")),
			blocklevel: this.extractNumber(this.getNode(xmlNode, "blocklevel")),
			hide: this.extractString(this.getNode(xmlNode, "hide")),
			lock: this.extractString(this.getNode(xmlNode, "lock")),

			displaynameformula: this.extractString(this.getNode(xmlNode, "displaynameformula")),
			vars: this.extractString(this.getNode(xmlNode, "vars")),

			calcs: this.parseTraitCalcs(this.getNode(xmlNode, "calcs")!),
			weaponmodesdata: this.parseTraitWeaponModesData(this.getNode(xmlNode, "weaponmodesdata")!),
			armordata: this.parseTraitArmorData(this.getNode(xmlNode, "armordata")!),
			ref: this.parseTraitRef(this.getNode(xmlNode, "ref")),

			attackmodes: this.parseAttackModesBlock(this.getNode(xmlNode, "attackmodes")),

			extended: this.parseExtendedTagsBlock(this.getNode(xmlNode, "extended")),

			modifiers: this.parseModifiersBlock(this.getNode(xmlNode, "modifiers")),
			bonuses: this.parseBonusesBlock(this.getNode(xmlNode, "bonuses")),
			conditionals: this.parseBonusesBlock(this.getNode(xmlNode, "conditionals")),

			_type: this.extractStringAttribute(xmlNode, "type"),
			_idkey: this.extractStringAttribute(xmlNode, "idkey"),
		}
	}

	private static parseTraitCalcs(xmlNode: ChildNode): GCATrait["calcs"] {
		return {
			cost: this.extractString(this.getNode(xmlNode, "cost")),
			sd: this.extractString(this.getNode(xmlNode, "sd")),
			deflevel: this.extractString(this.getNode(xmlNode, "deflevel")),
			deffrom: this.extractString(this.getNode(xmlNode, "deffrom")),
			deffromid: this.extractString(this.getNode(xmlNode, "deffromid")),
			pointmult: this.extractString(this.getNode(xmlNode, "pointmult")),
			levelmult: this.extractString(this.getNode(xmlNode, "levelmult")),
			syslevels: this.extractString(this.getNode(xmlNode, "syslevels")),
			bonuslevels: this.extractString(this.getNode(xmlNode, "bonuslevels")),
			extralevels: this.extractString(this.getNode(xmlNode, "extralevels")),
			baselevel: this.extractString(this.getNode(xmlNode, "baselevel")),
			basepoints: this.extractString(this.getNode(xmlNode, "basepoints")),
			multpoints: this.extractString(this.getNode(xmlNode, "multpoints")),
			appoints: this.extractString(this.getNode(xmlNode, "appoints")),
			premodspoints: this.extractString(this.getNode(xmlNode, "premodspoints")),

			preformulacost: this.extractString(this.getNode(xmlNode, "preformulacost")),
			preformulaweight: this.extractString(this.getNode(xmlNode, "preformulaweight")),
			postformulacost: this.extractString(this.getNode(xmlNode, "postformulacost")),
			postformulaweight: this.extractString(this.getNode(xmlNode, "postformulaweight")),
			prechildrencost: this.extractString(this.getNode(xmlNode, "prechildrencost")),
			prechildrenweight: this.extractString(this.getNode(xmlNode, "prechildrenweight")),

			childpoints: this.extractString(this.getNode(xmlNode, "childpoints")),
			baseappoints: this.extractString(this.getNode(xmlNode, "baseappoints")),
			defpoints: this.extractString(this.getNode(xmlNode, "defpoints")),
			extrapoints: this.extractString(this.getNode(xmlNode, "extrapoints")),
			basecost: this.extractString(this.getNode(xmlNode, "basecost")),
			baseweight: this.extractString(this.getNode(xmlNode, "baseweight")),
			childrencosts: this.extractString(this.getNode(xmlNode, "childrencosts")),
			childrenweights: this.extractString(this.getNode(xmlNode, "childrenweights")),
			precountcost: this.extractString(this.getNode(xmlNode, "precountcost")),
			precountweight: this.extractString(this.getNode(xmlNode, "precountweight")),
			premodscost: this.extractString(this.getNode(xmlNode, "premodscost")),
			basevalue: this.extractString(this.getNode(xmlNode, "basevalue")),
			maxscore: this.extractString(this.getNode(xmlNode, "maxscore")),
			minscore: this.extractString(this.getNode(xmlNode, "minscore")),
			up: this.extractString(this.getNode(xmlNode, "up")),
			down: this.extractString(this.getNode(xmlNode, "down")),
			step: this.extractString(this.getNode(xmlNode, "step")),
			round: this.extractString(this.getNode(xmlNode, "round")),
			basescore: this.extractString(this.getNode(xmlNode, "basescore")),
			parryat: this.extractString(this.getNode(xmlNode, "parryat")),
			blockat: this.extractString(this.getNode(xmlNode, "blockat")),
			upto: this.extractString(this.getNode(xmlNode, "upto")),
			downto: this.extractString(this.getNode(xmlNode, "downto")),
			levelnames: this.extractString(this.getNode(xmlNode, "levelnames")),

			baseweightconverted: this.extractString(this.getNode(xmlNode, "baseweightconverted")),
			baseweightunconverted: this.extractString(this.getNode(xmlNode, "baseweightunconverted")),
			charammo: this.extractString(this.getNode(xmlNode, "charammo")),
			charammounits: this.extractString(this.getNode(xmlNode, "charammounits")),
		}
	}

	private static parseTraitWeaponModesData(xmlNode?: ChildNode): GCATrait["weaponmodesdata"] {
		if (!xmlNode) return undefined
		return {
			mode: this.extractString(this.getNode(xmlNode, "mode")),
			damage: this.extractString(this.getNode(xmlNode, "damage")),
			damtype: this.extractString(this.getNode(xmlNode, "damtype")),
			dmg: this.extractString(this.getNode(xmlNode, "dmg")),
			reach: this.extractString(this.getNode(xmlNode, "reach")),
			parry: this.extractString(this.getNode(xmlNode, "parry")),
			minst: this.extractString(this.getNode(xmlNode, "minst")),
			skillused: this.extractString(this.getNode(xmlNode, "skillused")),
			acc: this.extractString(this.getNode(xmlNode, "acc")),
			rangehalfdam: this.extractString(this.getNode(xmlNode, "rangehalfdam")),
			rangemax: this.extractString(this.getNode(xmlNode, "rangemax")),
			rof: this.extractString(this.getNode(xmlNode, "rof")),
			rcl: this.extractString(this.getNode(xmlNode, "rcl")),
			shots: this.extractString(this.getNode(xmlNode, "shots")),
			armordivisor: this.extractString(this.getNode(xmlNode, "armordivisor")),
			break: this.extractString(this.getNode(xmlNode, "break")),
			radius: this.extractString(this.getNode(xmlNode, "radius")),
			bulk: this.extractString(this.getNode(xmlNode, "bulk")),
			damagebasedon: this.extractString(this.getNode(xmlNode, "damagebasedon")),
			minstbasedon: this.extractString(this.getNode(xmlNode, "minstbasedon")),
			reachbasedon: this.extractString(this.getNode(xmlNode, "reachbasedon")),
			damageistext: this.extractString(this.getNode(xmlNode, "damageistext")),
			calcrange: this.extractString(this.getNode(xmlNode, "calcrange")),
			chardamage: this.extractString(this.getNode(xmlNode, "chardamage")),
			chardamtype: this.extractString(this.getNode(xmlNode, "chardamtype")),
			charreach: this.extractString(this.getNode(xmlNode, "charreach")),
			charparry: this.extractString(this.getNode(xmlNode, "charparry")),
			charminst: this.extractString(this.getNode(xmlNode, "charminst")),
			charskillused: this.extractString(this.getNode(xmlNode, "charskillused")),
			charskillscore: this.extractString(this.getNode(xmlNode, "charskillscore")),
			charparryscore: this.extractString(this.getNode(xmlNode, "charparryscore")),
			characc: this.extractString(this.getNode(xmlNode, "characc")),
			charrangehalfdam: this.extractString(this.getNode(xmlNode, "charrangehalfdam")),
			charrangemax: this.extractString(this.getNode(xmlNode, "charrangemax")),
			charrof: this.extractString(this.getNode(xmlNode, "charrof")),
			charrcl: this.extractString(this.getNode(xmlNode, "charrcl")),
			charshots: this.extractString(this.getNode(xmlNode, "charshots")),
			chararmordivisor: this.extractString(this.getNode(xmlNode, "chararmordivisor")),
			charbreak: this.extractString(this.getNode(xmlNode, "charbreak")),
			charradius: this.extractString(this.getNode(xmlNode, "charradius")),
			chareffectivest: this.extractString(this.getNode(xmlNode, "chareffectivest")),

			charbulk: this.extractString(this.getNode(xmlNode, "charbulk")),
			stcap: this.extractString(this.getNode(xmlNode, "stcap")),
		}
	}

	private static parseTraitArmorData(xmlNode: ChildNode): GCATrait["armordata"] {
		return {
			dr: this.extractString(this.getNode(xmlNode, "dr")),
			chardr: this.extractString(this.getNode(xmlNode, "chardr")),
			db: this.extractString(this.getNode(xmlNode, "db")),
			chardb: this.extractString(this.getNode(xmlNode, "chardb")),

			chardeflect: this.extractNumber(this.getNode(xmlNode, "chardeflect")),
			charfortify: this.extractNumber(this.getNode(xmlNode, "charfortify")),

			location: this.extractString(this.getNode(xmlNode, "location")),

			coverage: this.extractString(this.getNode(xmlNode, "coverage")),
			charlocation: this.extractString(this.getNode(xmlNode, "charlocation")),
			locationcoverage: this.extractString(this.getNode(xmlNode, "locationcoverage")),

			aa: this.extractString(this.getNode(xmlNode, "aa")),

			drnotes: this.extractString(this.getNode(xmlNode, "drnotes")),
		}
	}

	private static parseTraitRef(xmlNode?: ChildNode): GCATrait["ref"] {
		if (!xmlNode) return undefined
		return {
			basedon: this.extractString(this.getNode(xmlNode, "basedon")),
			page: this.extractString(this.getNode(xmlNode, "page")),
			itemnotes: this.extractString(this.getNode(xmlNode, "itemnotes")),
			usernotes: this.extractString(this.getNode(xmlNode, "usernotes")),
			familiarities: this.extractString(this.getNode(xmlNode, "familiarities")),
			notes: this.extractString(this.getNode(xmlNode, "notes")),
			description: this.extractString(this.getNode(xmlNode, "description")),

			units: this.extractString(this.getNode(xmlNode, "units")),

			shortcat: this.extractString(this.getNode(xmlNode, "shortcat")),
			prereqcount: this.extractString(this.getNode(xmlNode, "prereqcount")),
			magery: this.extractString(this.getNode(xmlNode, "magery")),
			class: this.extractString(this.getNode(xmlNode, "class")),
			time: this.extractString(this.getNode(xmlNode, "time")),
			duration: this.extractString(this.getNode(xmlNode, "duration")),
			castingcost: this.extractString(this.getNode(xmlNode, "castingcost")),

			countasneed: this.extractString(this.getNode(xmlNode, "countasneed")),
			ident: this.extractString(this.getNode(xmlNode, "ident")),

			needs: this.extractString(this.getNode(xmlNode, "needs")),
			gives: this.extractString(this.getNode(xmlNode, "gives")),
			conditional: this.extractString(this.getNode(xmlNode, "conditional")),
			taboo: this.extractString(this.getNode(xmlNode, "taboo")),
			default: this.extractString(this.getNode(xmlNode, "default")),
			mods: this.extractString(this.getNode(xmlNode, "mods")),
			initmods: this.extractString(this.getNode(xmlNode, "initmods")),
			techlvl: this.extractString(this.getNode(xmlNode, "techlvl")),
			load: this.extractString(this.getNode(xmlNode, "load")),
			lc: this.extractString(this.getNode(xmlNode, "lc")),
			ndl: this.extractString(this.getNode(xmlNode, "ndl")),

			highlight: this.extractString(this.getNode(xmlNode, "highlight")),
			highlightme: this.extractString(this.getNode(xmlNode, "highlightme")),
			hideme: this.extractString(this.getNode(xmlNode, "hideme")),
			collapse: this.extractString(this.getNode(xmlNode, "collapse")),
			collapseme: this.extractString(this.getNode(xmlNode, "collapseme")),

			keep: this.extractString(this.getNode(xmlNode, "keep")),
			owned: this.extractString(this.getNode(xmlNode, "owned")),
			locked: this.extractString(this.getNode(xmlNode, "locked")),
			owns: this.extractString(this.getNode(xmlNode, "owns")),
			pkids: this.extractString(this.getNode(xmlNode, "pkids")),

			gms: this.extractString(this.getNode(xmlNode, "gms")),
			mainwin: this.extractString(this.getNode(xmlNode, "mainwin")),
			display: this.extractString(this.getNode(xmlNode, "display")),
			isparent: this.extractString(this.getNode(xmlNode, "isparent")),
			noresync: this.extractString(this.getNode(xmlNode, "noresync")),
			disadat: this.extractString(this.getNode(xmlNode, "disadat")),

			brokenlinks: this.extractString(this.getNode(xmlNode, "brokenlinks")),
			linked: this.extractString(this.getNode(xmlNode, "linked")),
			linkedname: this.extractString(this.getNode(xmlNode, "linkedname")),
			linkedfrom: this.extractString(this.getNode(xmlNode, "linkedfrom")),
			linkedfromnames: this.extractString(this.getNode(xmlNode, "linkedfromnames")),

			weightcapacity: this.extractString(this.getNode(xmlNode, "weightcapacity")),
			weightcapacitylevel: this.extractString(this.getNode(xmlNode, "weightcapacitylevel")),
			overweightcapacity: this.extractString(this.getNode(xmlNode, "overweightcapacity")),
			overweightcapacityby: this.extractString(this.getNode(xmlNode, "overweightcapacityby")),
			countcapacity: this.extractString(this.getNode(xmlNode, "countcapacity")),
			countcapacitylevel: this.extractString(this.getNode(xmlNode, "countcapacitylevel")),
			overcountcapacity: this.extractString(this.getNode(xmlNode, "overcountcapacity")),
			overcountcapacityby: this.extractString(this.getNode(xmlNode, "overcountcapacityby")),

			childcapacity: this.extractString(this.getNode(xmlNode, "childcapacity")),
			childcapacitylevel: this.extractString(this.getNode(xmlNode, "childcapacitylevel")),
			overchildcapacity: this.extractString(this.getNode(xmlNode, "overchildcapacity")),
			overchildcapacityby: this.extractString(this.getNode(xmlNode, "overchildcapacityby")),

			charunits: this.extractString(this.getNode(xmlNode, "charunits")),
			weightcapacityunits: this.extractString(this.getNode(xmlNode, "weightcapacityunits")),
			charweightcapacity: this.extractString(this.getNode(xmlNode, "charweightcapacity")),
			charweightcapacityunits: this.extractString(this.getNode(xmlNode, "charweightcapacityunits")),

			vttnotes: this.extractString(this.getNode(xmlNode, "vttnotes")),

			appliedsymbols: this.extractString(this.getNode(xmlNode, "appliedsymbols")),
		}
	}

	private static parseAttackModesBlock(xmlNode?: ChildNode): GCAAttackModesBlock | undefined {
		if (!xmlNode) return undefined
		return {
			attackmode: this.getNodes(xmlNode, "attackmode")!.map(e => this.parseAttackMode(e)),
			_count: this.extractNumberAttribute(xmlNode, "count"),
		}
	}

	private static parseAttackMode(xmlNode: ChildNode): GCAAttackMode {
		return {
			name: this.extractString(this.getNode(xmlNode, "name")),
			acc: this.extractString(this.getNode(xmlNode, "acc")),
			armordivisor: this.extractString(this.getNode(xmlNode, "armordivisor")),
			break: this.extractString(this.getNode(xmlNode, "break")),
			bulk: this.extractString(this.getNode(xmlNode, "bulk")),
			damage: this.extractString(this.getNode(xmlNode, "damage")),
			damtype: this.extractString(this.getNode(xmlNode, "damtype")),
			dmg: this.extractString(this.getNode(xmlNode, "dmg")),
			lc: this.extractString(this.getNode(xmlNode, "lc")),
			minst: this.extractString(this.getNode(xmlNode, "minst")),
			notes: this.extractString(this.getNode(xmlNode, "notes")),
			parry: this.extractString(this.getNode(xmlNode, "parry")),
			rangehalfdam: this.extractString(this.getNode(xmlNode, "rangehalfdam")),
			rangemax: this.extractString(this.getNode(xmlNode, "rangemax")),
			radius: this.extractString(this.getNode(xmlNode, "radius")),
			rcl: this.extractString(this.getNode(xmlNode, "rcl")),
			reach: this.extractString(this.getNode(xmlNode, "reach")),
			rof: this.extractString(this.getNode(xmlNode, "rof")),
			shots: this.extractString(this.getNode(xmlNode, "shots")),
			skillused: this.extractString(this.getNode(xmlNode, "skillused")),
			stcap: this.extractString(this.getNode(xmlNode, "stcap")),

			scopeacc: this.extractString(this.getNode(xmlNode, "scopeacc")),
			malf: this.extractString(this.getNode(xmlNode, "malf")),

			damagebasedon: this.extractString(this.getNode(xmlNode, "damagebasedon")),
			minstbasedon: this.extractString(this.getNode(xmlNode, "minstbasedon")),
			reachbasedon: this.extractString(this.getNode(xmlNode, "reachbasedon")),
			damageistext: this.extractString(this.getNode(xmlNode, "damageistext")),

			characc: this.extractString(this.getNode(xmlNode, "characc")),
			chararmordivisor: this.extractString(this.getNode(xmlNode, "chararmordivisor")),
			charbreak: this.extractString(this.getNode(xmlNode, "charbreak")),
			charbulk: this.extractString(this.getNode(xmlNode, "charbulk")),
			chardamage: this.extractString(this.getNode(xmlNode, "chardamage")),
			chardamtype: this.extractString(this.getNode(xmlNode, "chardamtype")),
			chareffectivest: this.extractString(this.getNode(xmlNode, "chareffectivest")),
			charminst: this.extractString(this.getNode(xmlNode, "charminst")),
			charparry: this.extractString(this.getNode(xmlNode, "charparry")),
			charparryscore: this.extractString(this.getNode(xmlNode, "charparryscore")),

			charblockscore: this.extractString(this.getNode(xmlNode, "charblockscore")),

			charradius: this.extractString(this.getNode(xmlNode, "charradius")),
			charrangehalfdam: this.extractString(this.getNode(xmlNode, "charrangehalfdam")),
			charrangemax: this.extractString(this.getNode(xmlNode, "charrangemax")),
			charrcl: this.extractString(this.getNode(xmlNode, "charrcl")),
			charreach: this.extractString(this.getNode(xmlNode, "charreach")),
			charrof: this.extractString(this.getNode(xmlNode, "charrof")),
			charshots: this.extractString(this.getNode(xmlNode, "charshots")),
			charskillscore: this.extractString(this.getNode(xmlNode, "charskillscore")),
			charskillused: this.extractString(this.getNode(xmlNode, "charskillused")),

			charskillusedkey: this.extractString(this.getNode(xmlNode, "charskillusedkey")),

			charscopeacc: this.extractString(this.getNode(xmlNode, "charscopeacc")),
			charmalf: this.extractString(this.getNode(xmlNode, "charmalf")),

			uses: this.extractString(this.getNode(xmlNode, "uses")),
			uses_sections: this.extractString(this.getNode(xmlNode, "sections")),
			uses_used: this.extractString(this.getNode(xmlNode, "used")),
			uses_settings: this.extractString(this.getNode(xmlNode, "settings")),

			itemnotes: this.extractString(this.getNode(xmlNode, "itemnotes")),

			vttmodenotes: this.extractString(this.getNode(xmlNode, "vttmodenotes")),

			rollto: this.extractString(this.getNode(xmlNode, "rollto")),
			rolltophrase: this.extractString(this.getNode(xmlNode, "rolltophrase")),

			minimode_damage: this.extractString(this.getNode(xmlNode, "damage")),
			minimode_damtype: this.extractString(this.getNode(xmlNode, "damtype")),
			minimode_armordivisor: this.extractString(this.getNode(xmlNode, "armordivisor")),
			minimode_radius: this.extractString(this.getNode(xmlNode, "radius")),
		}
	}

	private static parseModifiersBlock(xmlNode?: ChildNode): GCAModifiersBlock | undefined {
		if (!xmlNode) return undefined
		return {
			modifier: this.getNodes(xmlNode, "modifier")!.map(e => this.parseModifier(e)),
			_count: this.extractNumberAttribute(xmlNode, "count"),
		}
	}

	private static parseBonusesBlock(xmlNode?: ChildNode): GCABonusesBlock | undefined {
		if (!xmlNode) return undefined
		return {
			bonus: this.getNodes(xmlNode, "modifier")!.map(e => this.parseBonus(e)),
			_count: this.extractNumberAttribute(xmlNode, "count"),
		}
	}

	private static parseModifier(xmlNode: ChildNode): GCAModifier {
		return {
			name: this.extractString(this.getNode(xmlNode, "name"))!,
			nameext: this.extractString(this.getNode(xmlNode, "nameext")),
			group: this.extractString(this.getNode(xmlNode, "group"))!,
			cost: this.extractString(this.getNode(xmlNode, "cost"))!,
			formula: this.extractString(this.getNode(xmlNode, "formula")),
			forceformula: this.extractString(this.getNode(xmlNode, "forceformula")),
			level: this.extractNumber(this.getNode(xmlNode, "level"))!,
			premodsvalue: this.extractString(this.getNode(xmlNode, "premodsvalue"))!,
			value: this.extractString(this.getNode(xmlNode, "value"))!,
			valuenum: this.extractString(this.getNode(xmlNode, "valuenum"))!,

			gives: this.extractString(this.getNode(xmlNode, "gives")),
			conditional: this.extractString(this.getNode(xmlNode, "conditional")),
			round: this.extractString(this.getNode(xmlNode, "round")),
			shortname: this.extractString(this.getNode(xmlNode, "shortname")),
			page: this.extractString(this.getNode(xmlNode, "page")),
			mods: this.extractString(this.getNode(xmlNode, "mods")),
			tier: this.extractString(this.getNode(xmlNode, "tier")),
			upto: this.extractString(this.getNode(xmlNode, "upto")),
			levelname: this.extractString(this.getNode(xmlNode, "levelname")),
			description: this.extractString(this.getNode(xmlNode, "description")),

			extended: this.parseExtendedTagsBlock(this.getNode(xmlNode, "extended")),

			modifiers: this.parseModifiersBlock(this.getNode(xmlNode, "modifiers")),
			bonuses: this.parseBonusesBlock(this.getNode(xmlNode, "bonuses")),
			conditionals: this.parseBonusesBlock(this.getNode(xmlNode, "conditionals")),

			_idkey: this.extractNumberAttribute(xmlNode, "idkey"),
		}
	}

	private static parseBonus(xmlNode: ChildNode): GCABonus {
		return {
			targetprefix: this.extractString(this.getNode(xmlNode, "targetprefix")),
			targetname: this.extractString(this.getNode(xmlNode, "targetname"))!,
			targettext: this.extractString(this.getNode(xmlNode, "targettext")),
			targetttag: this.extractString(this.getNode(xmlNode, "targetttag")),
			targettype: this.extractString(this.getNode(xmlNode, "targettype"))!,
			affects: this.extractString(this.getNode(xmlNode, "affects"))!,
			bonuspart: this.extractString(this.getNode(xmlNode, "bonuspart"))!,
			bonustype: this.extractString(this.getNode(xmlNode, "bonustype"))!,
			fullbonustext: this.extractString(this.getNode(xmlNode, "fullbonustext"))!,
			upto: this.extractString(this.getNode(xmlNode, "upto")),
			value: this.extractNumber(this.getNode(xmlNode, "value"))!,
			stringvalue: this.extractString(this.getNode(xmlNode, "stringvalue")),
			stringvaluetext: this.extractString(this.getNode(xmlNode, "stringvaluetext")),
			notes: this.extractString(this.getNode(xmlNode, "notes")),
			listas: this.extractString(this.getNode(xmlNode, "listas")),
			unnless: this.extractString(this.getNode(xmlNode, "unnless")),
			onlyif: this.extractString(this.getNode(xmlNode, "onlyif")),
			classes: this.extractString(this.getNode(xmlNode, "classes")),
			fromname: this.extractString(this.getNode(xmlNode, "fromname")),
			fromtype: this.extractString(this.getNode(xmlNode, "fromtype")),
			fromprefix: this.extractString(this.getNode(xmlNode, "fromprefix")),
			fromtext: this.extractString(this.getNode(xmlNode, "fromtext")),
			fromtag: this.extractString(this.getNode(xmlNode, "fromtag")),
		}
	}

	private static parseCharacterLoadouts(xmlNode: ChildNode): GCACharacter["loadouts"] {
		return {
			loadout: this.getNodes(xmlNode, "loadout")!.map(e => this.parseLoadout(e)),
			_count: this.extractNumberAttribute(xmlNode, "count"),
		}
	}

	private static parseCharacterTransforms(xmlNode: ChildNode): GCACharacter["transforms"] {
		return {
			transform: this.getNodes(xmlNode, "transform")!.map(e => this.parseTransform(e)),
			_count: this.extractNumberAttribute(xmlNode, "count"),
		}
	}

	private static parseCharacterBasicDamages(xmlNode: ChildNode): GCACharacter["basicdamages"] {
		return {
			basicdamage: this.getNodes(xmlNode, "basicdamage")!.map(e => this.parseBasicDamage(e)),
			_count: this.extractNumberAttribute(xmlNode, "count"),
		}
	}

	private static parseCharacterDamageBreaks(xmlNode: ChildNode): GCACharacter["damagebreaks"] {
		return {
			damagebreak: this.getNodes(xmlNode, "damagebreak")!.map(e => this.parseDamageBreak(e)),
			_count: this.extractNumberAttribute(xmlNode, "count"),
		}
	}

	private static parseCharacterSkillTypes(xmlNode: ChildNode): GCACharacter["skilltypes"] {
		return {
			skilltype: this.getNodes(xmlNode, "skilltype")!.map(e => this.parseSkillType(e)),
			_count: this.extractNumberAttribute(xmlNode, "count"),
		}
	}

	private static parseCharacterGroups(xmlNode: ChildNode): GCACharacter["groups"] {
		return {
			group: this.getNodes(xmlNode, "group")!.map(e => this.parseGroup(e)),
			_count: this.extractNumberAttribute(xmlNode, "count"),
		}
	}

	private static parseCategoriesBlock(xmlNode?: ChildNode): GCACategoriesBlock | undefined {
		if (!xmlNode) return undefined
		return {
			category: this.getNodes(xmlNode, "category")!.map(e => this.parseCategory(e)),
			_count: this.extractNumberAttribute(xmlNode, "count"),
		}
	}

	private static parseSymbolsBlock(xmlNode?: ChildNode): GCASymbolsBlock | undefined {
		if (!xmlNode) return undefined
		return {
			symbol: this.getNodes(xmlNode, "symbol")!.map(e => this.parseSymbol(e)),
			_count: this.extractNumberAttribute(xmlNode, "count"),
		}
	}

	private static parseBonusClassesBlock(xmlNode?: ChildNode): GCABonusClassesBlock | undefined {
		if (!xmlNode) return undefined
		return {
			bonusclass: this.getNodes(xmlNode, "bonusclass")!.map(e => this.parseBonusClass(e)),
			_count: this.extractNumberAttribute(xmlNode, "count"),
		}
	}

	private static parseImageStore(xmlNode?: ChildNode): GCAImageStore | undefined {
		if (!xmlNode) return undefined
		return {
			imageref: this.getNodes(xmlNode, "bonusclass")!.map(e => this.parseImageRef(e)),
			_count: this.extractNumberAttribute(xmlNode, "count"),
		}
	}

	private static parseLogEntryBlock(xmlNode: ChildNode): GCALogEntryBlock {
		return {
			logentry: this.getNodes(xmlNode, "logentry")!.map(e => this.parseLogEntry(e)),
			_count: this.extractNumberAttribute(xmlNode, "count"),
		}
	}

	private static parseItemBlock(xmlNode: ChildNode): GCAItemBlock {
		return {
			item: this.getNodes(xmlNode, "item")!.map(e => this.parseItem(e)),
			_count: this.extractNumberAttribute(xmlNode, "count"),
		}
	}

	private static parseOrderedLayers(xmlNode?: ChildNode): GCAOrderedLayers | undefined {
		if (!xmlNode) return undefined
		return {
			layeritem: this.getNodes(xmlNode, "layeritem")!.map(e => this.parseLayerItem(e)),
			_count: this.extractNumberAttribute(xmlNode, "count"),
		}
	}

	private static parseCampaign(xmlNode: ChildNode): GCACharacter["campaign"] {
		return {
			name: this.extractString(this.getNode(xmlNode, "basetl"))!,
			basetl: this.extractNumber(this.getNode(xmlNode, "basetl"))!,
			basepoints: this.extractNumber(this.getNode(xmlNode, "basepoints"))!,
			disadlimit: this.extractNumber(this.getNode(xmlNode, "disadlimit"))!,
			quirklimit: this.extractNumber(this.getNode(xmlNode, "quirklimit"))!,
			hasdisadlimit: this.extractBoolean(this.getNode(xmlNode, "hasdisadlimit"))!,
			hasquirklimit: this.extractBoolean(this.getNode(xmlNode, "hasquirklimit"))!,
			loggedpoints: this.extractNumber(this.getNode(xmlNode, "loggedpoints"))!,
			otherpoints: this.extractNumber(this.getNode(xmlNode, "otherpoints"))!,
			totalpoints: this.extractNumber(this.getNode(xmlNode, "totalpoints"))!,

			loggedmoney: this.extractNumber(this.getNode(xmlNode, "loggedmoney")),
			othermoney: this.extractNumber(this.getNode(xmlNode, "othermoney")),
			totalmoney: this.extractNumber(this.getNode(xmlNode, "totalmoney")),

			logentries: this.parseLogEntryBlock(this.getNode(xmlNode, "logentries")!),
		}
	}

	private static parseLoadout(xmlNode: ChildNode): GCALoadout {
		return {
			name: this.extractString(this.getNode(xmlNode, "name"))!,
			bodyimagefile: this.extractString(this.getNode(xmlNode, "bodyimagefile")),
			weight: this.extractNumber(this.getNode(xmlNode, "weight"))!,
			shielddb: this.extractNumber(this.getNode(xmlNode, "shielddb"))!,
			hexmask: this.extractString(this.getNode(xmlNode, "hexmask"))!,
			alwaysautocalcarmor: this.extractString(this.getNode(xmlNode, "alwaysautocalcarmor")),
			userorderedlayers: this.extractString(this.getNode(xmlNode, "userorderedlayers")),
			facingdb: this.parseLoadoutFacingDB(this.getNode(xmlNode, "facingdb")!),
			items: this.parseItemBlock(this.getNode(xmlNode, "items")!),
			armoritems: this.parseItemBlock(this.getNode(xmlNode, "armoritems")!),
			shielditems: this.parseItemBlock(this.getNode(xmlNode, "shielditems")!),

			orderedlayers: this.parseOrderedLayers(this.getNode(xmlNode, "orderedlayers")),

			body: this.parseBody(this.getNode(xmlNode, "body")),
			hitlocationtable: this.parseHitLocationTable(this.getNode(xmlNode, "hitlocationtable")),
		}
	}

	private static parseTransform(xmlNode: ChildNode): GCATransform {
		return {
			name: this.extractString(this.getNode(xmlNode, "name"))!,
			points: this.extractNumber(this.getNode(xmlNode, "points"))!,
			items: this.parseItemBlock(this.getNode(xmlNode, "items")!),
		}
	}

	private static parseBasicDamage(xmlNode: ChildNode): GCABasicDamage {
		return {
			st: this.extractBoolean(this.getNode(xmlNode, "st"))!,
			thbase: this.extractString(this.getNode(xmlNode, "thbase"))!,
			thadd: this.extractString(this.getNode(xmlNode, "thadd"))!,
			swbase: this.extractString(this.getNode(xmlNode, "swbase"))!,
			swadd: this.extractString(this.getNode(xmlNode, "swadd"))!,
		}
	}

	private static parseDamageBreak(xmlNode: ChildNode): GCADamageBreak {
		return {
			break: this.extractBoolean(this.getNode(xmlNode, "break"))!,
			addice: this.extractBoolean(this.getNode(xmlNode, "addice"))!,
			subtract: this.extractBoolean(this.getNode(xmlNode, "subtract"))!,
		}
	}

	private static parseSkillType(xmlNode: ChildNode): GCASkillType {
		return {
			name: this.extractString(this.getNode(xmlNode, "name"))!,
			costs: this.extractString(this.getNode(xmlNode, "costs"))!,
			baseadj: this.extractBoolean(this.getNode(xmlNode, "baseadj"))!,
			adds: this.extractNumber(this.getNode(xmlNode, "adds"))!,
			defaultstat: this.extractString(this.getNode(xmlNode, "defaultstat"))!,
			relname: this.extractString(this.getNode(xmlNode, "relname"))!,
			zeropointsokay: this.extractNumber(this.getNode(xmlNode, "zeropointsokay"))!,
			subzero: this.extractNumber(this.getNode(xmlNode, "subzero"))!,
		}
	}

	private static parseGroup(xmlNode: ChildNode): GCAGroup {
		return {
			name: this.extractString(this.getNode(xmlNode, "name"))!,
			groupitem: this.getNodes(xmlNode, "groupitem")!.map(e => this.parseGroupItem(e)),
			_count: this.extractNumberAttribute(xmlNode, "count"),
		}
	}

	private static parseGroupItem(xmlNode: ChildNode): GCAGroupItem {
		return {
			name: this.extractString(this.getNode(xmlNode, "name"))!,
			nameext: this.extractString(this.getNode(xmlNode, "nameext")),
			itemtype: this.extractString(this.getNode(xmlNode, "itemtype"))!,
		}
	}

	private static parseCategory(xmlNode: ChildNode): GCACategory {
		return {
			name: this.extractString(this.getNode(xmlNode, "name"))!,
			code: this.extractString(this.getNode(xmlNode, "code")),
			itemtype: this.extractString(this.getNode(xmlNode, "itemtype"))!,
		}
	}

	private static parseSymbol(xmlNode: ChildNode): GCAFlagSymbol {
		return {
			name: this.extractString(this.getNode(xmlNode, "name"))!,
			filename: this.extractString(this.getNode(xmlNode, "filename"))!,
			criteria: this.extractString(this.getNode(xmlNode, "criteria"))!,
			image: this.extractString(this.getNode(xmlNode, "image"))!,
		}
	}

	private static parseBonusClass(xmlNode: ChildNode): GCABonusClass {
		return {
			name: this.extractString(this.getNode(xmlNode, "name"))!,
			affects: this.extractString(this.getNode(xmlNode, "affects")),
			stacks: this.extractString(this.getNode(xmlNode, "stacks")),
			upto: this.extractString(this.getNode(xmlNode, "upto")),
			downto: this.extractString(this.getNode(xmlNode, "downto")),
			uptoisset: this.extractNumber(this.getNode(xmlNode, "uptoisset")),
			downtoisset: this.extractNumber(this.getNode(xmlNode, "downtoisset")),
			best: this.extractString(this.getNode(xmlNode, "best")),
			worst: this.extractString(this.getNode(xmlNode, "worst")),
		}
	}

	private static parseImageRef(xmlNode: ChildNode): GCAImageRef {
		return {
			filename: this.extractString(this.getNode(xmlNode, "filename"))!,
			fullfilename: this.extractString(this.getNode(xmlNode, "fullfilename"))!,
			purpose: this.extractString(this.getNode(xmlNode, "purpose")),
			image: this.extractString(this.getNode(xmlNode, "image")),
		}
	}

	private static parseLogEntry(xmlNode: ChildNode): GCALogEntry {
		return {
			entrydate: this.extractString(this.getNode(xmlNode, "entrydate"))!,
			campaigndate: this.extractString(this.getNode(xmlNode, "campaigndate"))!,
			charpoints: this.extractNumber(this.getNode(xmlNode, "charpoints"))!,

			charmoney: this.extractNumber(this.getNode(xmlNode, "charmoney")),

			caption: this.extractString(this.getNode(xmlNode, "caption"))!,
			notes: this.extractString(this.getNode(xmlNode, "notes"))!,
		}
	}

	private static parseLoadoutFacingDB(xmlNode: ChildNode): GCALoadout["facingdb"] {
		return {
			leftflank: this.extractNumber(this.getNode(xmlNode, "leftflank"))!,
			leftfront: this.extractNumber(this.getNode(xmlNode, "leftfront"))!,
			centerfront: this.extractNumber(this.getNode(xmlNode, "centerfront"))!,
			rightfront: this.extractNumber(this.getNode(xmlNode, "rightfront"))!,
			rightflank: this.extractNumber(this.getNode(xmlNode, "rightflank"))!,
			rear: this.extractNumber(this.getNode(xmlNode, "rear"))!,
		}
	}

	private static parseItem(xmlNode: ChildNode): GCAItem {
		return {
			name: this.extractString(this.getNode(xmlNode, "name"))!,
			_idkey: this.extractNumberAttribute(xmlNode, "idkey"),
		}
	}

	private static parseLayerItem(xmlNode: ChildNode): GCALayerItem {
		return {
			itemname: this.extractString(this.getNode(xmlNode, "itemname"))!,
			isinnate: this.extractBoolean(this.getNode(xmlNode, "isinnate"))!,
			countaslayer: this.extractBoolean(this.getNode(xmlNode, "countaslayer"))!,
			isflexible: this.extractBoolean(this.getNode(xmlNode, "isflexible"))!,
			_idkey: this.extractNumberAttribute(xmlNode, "idkey"),
		}
	}
}

export { GCAParser }
