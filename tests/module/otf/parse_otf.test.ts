/* eslint-disable jest/no-disabled-tests */
import { OtFLinkedAction, OtFTestAction, OtFCostsAction, parselink } from "@module/otf"

describe("too small or non-matching", () => {
	it("empty", () => {
		const s = ""
		const parsed_otf = parselink(s)
		expect(parsed_otf.action).toBeUndefined()
		expect(parsed_otf.text).toBe(s)
	})
	it("size 1", () => {
		const s = "X"
		const parsed_otf = parselink(s)
		expect(parsed_otf.action).toBeUndefined()
		expect(parsed_otf.text).toBe(s)
	})
	it("non-matching", () => {
		const s = "this should not match anything"
		const parsed_otf = parselink(s)
		expect(parsed_otf.action).toBeUndefined()
		expect(parsed_otf.text).toBe(s)
	})
})
describe("modifiers", () => {
	it("+1", () => {
		const s = "+1"
		const parsed_otf = parselink(s)
		const action = <OtFCostsAction>parsed_otf.action
		expect(action.type).toBe("modifier")
		expect(action.num).toBe(1)
	})
	it("-1", () => {
		const s = "-1"
		const parsed_otf = parselink(s)
		const action = <OtFCostsAction>parsed_otf.action
		expect(action.type).toBe("modifier")
		expect(action.num).toBe(-1)
	})
	it("+1 desc", () => {
		const s = "+1 desc"
		const parsed_otf = parselink(s)
		const action = <OtFCostsAction>parsed_otf.action
		expect(action.type).toBe("modifier")
		expect(action.num).toBe(1)
		expect(action.desc).toBe("desc")
	})
	it("-1 desc", () => {
		const s = "-1 desc"
		const parsed_otf = parselink(s)
		const action = <OtFCostsAction>parsed_otf.action
		expect(action.type).toBe("modifier")
		expect(action.num).toBe(-1)
		expect(action.desc).toBe("desc")
	})
	it("+1 desc & -2 desc2", () => {
		const s = "+1 desc & -2 desc2"
		const parsed_otf = parselink(s)
		let action = <OtFCostsAction>parsed_otf.action
		expect(action.type).toBe("modifier")
		expect(action.num).toBe(1)
		expect(action.desc).toBe("desc")
		action = <OtFCostsAction>action.next
		expect(action.type).toBe("modifier")
		expect(action.num).toBe(-2)
		expect(action.desc).toBe("desc2")
	})
	it("-@margin desc", () => {
		const s = "-@margin desc"
		const parsed_otf = parselink(s)
		const action = <OtFCostsAction>parsed_otf.action
		expect(action.type).toBe("modifier")
		expect(action.num).toBeUndefined()
		expect(action.margin).toBe("-@margin")
		expect(action.desc).toBe(s)
	})
})
describe("chat", () => {
	it("/cmd", () => {
		const s = "/cmd"
		const parsed_otf = parselink(s)
		const action = <OtFCostsAction>parsed_otf.action
		expect(action.type).toBe("chat")
		expect(action.orig).toBe(s)
		expect(parsed_otf.text).toMatch(new RegExp(`<span[^>]+>${s}</span>`))
	})
	it("!/cmd", () => {
		const s = "!/cmd"
		const parsed_otf = parselink(s)
		const action = <OtFCostsAction>parsed_otf.action
		expect(action).toBeDefined()
		expect(action.type).toBe("chat")
		expect(action.orig).toBe("/cmd")
		// Expect(action.blindroll).toBeDefined()
		expect(parsed_otf.text).toMatch(/<span[^>]+>\/cmd<\/span>/)
	})
	it("'override'/cmd", () => {
		const s = "'override'/cmd"
		const parsed_otf = parselink(s)
		const action = <OtFCostsAction>parsed_otf.action
		expect(action.type).toBe("chat")
		expect(action.orig).toBe("/cmd")
		expect(parsed_otf.text).toMatch(/override/)
	})
	it('"override"/cmd', () => {
		const s = "'override'/cmd"
		const parsed_otf = parselink(s)
		const action = <OtFCostsAction>parsed_otf.action
		expect(action.type).toBe("chat")
		expect(action.orig).toBe("/cmd")
		expect(parsed_otf.text).toMatch(/override/)
	})
})
describe("html", () => {
	it("http:///someplace", () => {
		const s = "http:///someplace"
		const parsed_otf = parselink(s)
		const action = <OtFLinkedAction>parsed_otf.action
		expect(action.type).toBe("href")
		expect(action.orig).toBe(s)
		expect(parsed_otf.text).toMatch(new RegExp(`<a href="${s}">${s}</a>`))
	})
	it("https:///someplace", () => {
		const s = "https:///someplace"
		const parsed_otf = parselink(s)
		const action = <OtFLinkedAction>parsed_otf.action
		expect(action.type).toBe("href")
		expect(action.orig).toBe(s)
		// expect(action.blindroll).toBeTruthy()
		expect(parsed_otf.text).toMatch(new RegExp(`<a href="${s}">${s}</a>`))
	})
	it("'override'http:///someplace", () => {
		const s = "'override'http:///someplace"
		const parsed_otf = parselink(s)
		const action = <OtFCostsAction>parsed_otf.action
		expect(action.type).toBe("href")
		expect(action.orig).toBe("http:///someplace")
		expect(parsed_otf.text).toMatch(/<a href="http:\/\/\/someplace">override<\/a>/)
	})
})
describe("[@margin] [@isCritSuccess] [@IsCritFailure]", () => {
	it("[@margin]", () => {
		const s = "@margin"
		const parsed_otf = parselink(s)
		const action = <OtFTestAction>parsed_otf.action
		expect(action.type).toBe("test-if")
		expect(action.orig).toBe(s)
		expect(action.desc).toBe(s.substring(1))
		expect(action.formula).toBeUndefined()
	})
	it("[@isCritSuccess]", () => {
		const s = "@isCritSuccess"
		const parsed_otf = parselink(s)
		const action = <OtFTestAction>parsed_otf.action
		expect(action.type).toBe("test-if")
		expect(action.orig).toBe(s)
		expect(action.desc).toBe(s.substring(1))
		expect(action.formula).toBeUndefined()
	})
	it("[@IsCritFailure]", () => {
		const s = "@IsCritFailure"
		const parsed_otf = parselink(s)
		const action = <OtFTestAction>parsed_otf.action
		expect(action.type).toBe("test-if")
		expect(action.orig).toBe(s)
		expect(action.desc).toBe(s.substring(1))
		expect(action.formula).toBeUndefined()
	})
	it("[@margin > 1]", () => {
		const s = "@margin > 1"
		const parsed_otf = parselink(s)
		const action = <OtFTestAction>parsed_otf.action
		expect(action.type).toBe("test-if")
		expect(action.orig).toBe(s)
		expect(action.desc).toBe("margin")
		expect(action.formula).toBe("> 1")
	})
	it("[@margin = 99]", () => {
		const s = "@margin = 99"
		const parsed_otf = parselink(s)
		const action = <OtFTestAction>parsed_otf.action
		expect(action.type).toBe("test-if")
		expect(action.orig).toBe(s)
		expect(action.desc).toBe("margin")
		expect(action.formula).toBe("= 99")
	})
})
