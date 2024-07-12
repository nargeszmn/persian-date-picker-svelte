import { getMonthLength } from '$lib/date-utils.js'
import { type Locale, type InnerLocale, getInnerLocale } from '$lib/locale'
import {
	newDate,
	getYear,
	getMonth,
	getDate,
	getHours,
	getMinutes,
	getSeconds,
	getMilliseconds,
} from 'date-fns-jalali'

type RuleToken = {
	id: string
	allowedValues?: string[]
	toString: (d: Date) => string
}

export type FormatToken = string | RuleToken

type ParseResult = {
	date: Date | null
	missingPunctuation: string
}

export type CalendarType = 'Gregorian' | 'Jalali'
/** Parse a string according to the supplied format tokens. Returns a date if successful, and the missing punctuation if there is any that should be after the string */
export function parse(
	str: string,
	tokens: FormatToken[],
	baseDate: Date | null,
	calendarType: CalendarType,
): ParseResult {
	let missingPunctuation = ''
	let valid = true
	let year = 0,
		month = 0,
		day = 0,
		hours = 0,
		minutes = 0,
		seconds = 0,
		ms = 0,
		monthLength = 0

	baseDate = baseDate || new Date(2020, 0, 1, 0, 0, 0, 0)

	if (calendarType == 'Gregorian') {
		year = baseDate.getFullYear()
		month = baseDate.getMonth()
		day = baseDate.getDate()
		hours = baseDate.getHours()
		minutes = baseDate.getMinutes()
		seconds = baseDate.getSeconds()
		ms = baseDate.getMilliseconds()
	} else if (calendarType == 'Jalali') {
		year = getYear(baseDate)
		month = getMonth(baseDate)
		day = getDate(baseDate)
		hours = getHours(baseDate)
		minutes = getMinutes(baseDate)
		seconds = getSeconds(baseDate)
		ms = getMilliseconds(baseDate)
	}

	function parseString(token: string) {
		for (let i = 0; i < token.length; i++) {
			if (str.startsWith(token[i])) {
				str = str.slice(1)
			} else {
				valid = false
				if (str.length === 0) missingPunctuation = token.slice(i)
				return
			}
		}
	}

	function parseUint(pattern: RegExp, min: number, max: number) {
		const matches = str.match(pattern)
		if (matches?.[0]) {
			str = str.slice(matches[0].length)
			const n = parseInt(matches[0])
			if (n > max || n < min) {
				valid = false
				return null
			} else {
				return n
			}
		} else {
			valid = false
			return null
		}
	}

	function parseEnum(allowedValues: string[]) {
		const n = allowedValues.findIndex((allowedValue) => {
			return allowedValue.toLowerCase() === str.slice(0, allowedValue.length).toLowerCase()
		})

		if (n >= 0) {
			str = str.slice(allowedValues[n].length)
			return n
		} else {
			valid = false
			return null
		}
	}

	function parseToken(token: FormatToken) {
		if (typeof token === 'string') {
			parseString(token)
		} else if (token.id === 'yy') {
			const value = parseUint(/^[0-9]{2}/, 0, 99)
			if (value !== null) {
				if (calendarType == 'Gregorian') {
					year = 2000 + value
				} else if (calendarType == 'Jalali') {
					value.toString().startsWith('0') ? (year = 1400 + value) : (year = 1300 + value)
				}
			}
		} else if (token.id === 'yyyy') {
			const value = parseUint(/^[0-9]{4}/, 0, 9999)
			if (value !== null) year = value
		} else if (token.id === 'MM') {
			const value = parseUint(/^[0-9]{2}/, 1, 12)
			if (value !== null) month = value - 1
		} else if (token.id === 'MMM') {
			const value = parseEnum(token.allowedValues || [])
			if (value !== null) month = value
		} else if (token.id === 'dd') {
			const value = parseUint(/^[0-9]{2}/, 1, 31)
			if (value !== null) day = value
		} else if (token.id === 'HH') {
			const value = parseUint(/^[0-9]{2}/, 0, 23)
			if (value !== null) hours = value
		} else if (token.id === 'mm') {
			const value = parseUint(/^[0-9]{2}/, 0, 59)
			if (value !== null) minutes = value
		} else if (token.id === 'ss') {
			const value = parseUint(/^[0-9]{2}/, 0, 59)
			if (value !== null) seconds = value
		}
	}

	for (const token of tokens) {
		parseToken(token)
		if (!valid) break
	}

	if (calendarType == 'Gregorian') {
		monthLength = getMonthLength(year, month, calendarType)
	} else if (calendarType == 'Jalali') {
		monthLength = getMonthLength(getYear(baseDate), month, calendarType)
	}

	if (day > monthLength) {
		valid = false
	}
	if (calendarType == 'Gregorian') {
		return {
			date: valid ? new Date(year, month, day, hours, minutes, seconds, ms) : null,
			missingPunctuation: missingPunctuation,
		}
	} else {
		return {
			date: valid ? newDate(year, month, day, hours, minutes, seconds, ms) : null,
			missingPunctuation: missingPunctuation,
		}
	}
}

function twoDigit(value: number) {
	return ('0' + value.toString()).slice(-2)
}

function greParseRule(s: string, innerLocale: InnerLocale) {
	if (s.startsWith('yyyy')) {
		return {
			id: 'yyyy',
			toString: (d: Date) => d.getFullYear().toString(),
		}
	} else if (s.startsWith('yy')) {
		return {
			id: 'yy',
			toString: (d: Date) => d.getFullYear().toString().slice(-2),
		}
	} else if (s.startsWith('MMM')) {
		return {
			id: 'MMM',
			allowedValues: innerLocale.shortMonths,
			toString: (d: Date) => innerLocale.shortMonths[d.getMonth()],
		}
	} else if (s.startsWith('MM')) {
		return {
			id: 'MM',
			toString: (d: Date) => twoDigit(d.getMonth() + 1),
		}
	} else if (s.startsWith('dd')) {
		return {
			id: 'dd',
			toString: (d: Date) => twoDigit(d.getDate()),
		}
	} else if (s.startsWith('HH')) {
		return {
			id: 'HH',
			toString: (d: Date) => twoDigit(d.getHours()),
		}
	} else if (s.startsWith('mm')) {
		return {
			id: 'mm',
			toString: (d: Date) => twoDigit(d.getMinutes()),
		}
	} else if (s.startsWith('ss')) {
		return {
			id: 'ss',
			toString: (d: Date) => twoDigit(d.getSeconds()),
		}
	}
}

function jalParseRule(s: string, innerLocale: InnerLocale) {
	if (s.startsWith('yyyy')) {
		return {
			id: 'yyyy',
			toString: (d: Date) => getYear(d).toString(),
		}
	} else if (s.startsWith('yy')) {
		return {
			id: 'yy',
			toString: (d: Date) => getYear(d).toString().slice(-2),
		}
	} else if (s.startsWith('MMM')) {
		return {
			id: 'MMM',
			allowedValues: innerLocale.shortMonths,
			toString: (d: Date) => innerLocale.shortMonths[getMonth(d)],
		}
	} else if (s.startsWith('MM')) {
		return {
			id: 'MM',
			toString: (d: Date) => twoDigit(getMonth(d) + 1),
		}
	} else if (s.startsWith('dd')) {
		return {
			id: 'dd',
			toString: (d: Date) => twoDigit(getDate(d)),
		}
	} else if (s.startsWith('HH')) {
		return {
			id: 'HH',
			toString: (d: Date) => twoDigit(getHours(d)),
		}
	} else if (s.startsWith('mm')) {
		return {
			id: 'mm',
			toString: (d: Date) => twoDigit(getMinutes(d)),
		}
	} else if (s.startsWith('ss')) {
		return {
			id: 'ss',
			toString: (d: Date) => twoDigit(getSeconds(d)),
		}
	}
}

export function createFormat(
	s: string,
	calendarType: CalendarType,
	locale: Locale = {},
): FormatToken[] {
	const innerLocale = getInnerLocale(locale, calendarType)
	const tokens = []

	while (s.length > 0) {
		let token

		if (calendarType == 'Gregorian') {
			token = greParseRule(s, innerLocale)
		} else if (calendarType == 'Jalali') {
			token = jalParseRule(s, innerLocale)
		}

		if (token) {
			// parsed a token like "yyyy"
			tokens.push(token)
			s = s.slice(token.id.length)
		} else if (typeof tokens[tokens.length - 1] === 'string') {
			// last token is a string token, so append to it
			tokens[tokens.length - 1] += s[0]
			s = s.slice(1)
		} else {
			// add string token
			tokens.push(s[0])
			s = s.slice(1)
		}
	}

	return tokens
}
