import type { FormatToken } from './parse.js'
import { newDate, getYear, getMonth, isLeapYear as isJalaliLeapYear } from 'date-fns-jalali'

export function toText(date: Date | null, formatTokens: FormatToken[]): string {
	let text = ''
	if (date) {
		for (const token of formatTokens) {
			if (typeof token === 'string') {
				text += token
			} else {
				text += token.toString(date)
			}
		}
	}
	return text
}

export function toPersianCharacter(expression: string): string {
	const persianZero = '۰'
	const persianZeroUTF8 = persianZero.charCodeAt(0)

	const latinZero = '0'
	const latinZeroUTF8 = latinZero.charCodeAt(0)

	const charDiff = persianZeroUTF8 - latinZeroUTF8

	const expressionChars = [...expression]
		.map((digit) => {
			if (digit.charCodeAt(0) >= latinZeroUTF8 && digit.charCodeAt(0) <= latinZeroUTF8 + 9) {
				return String.fromCharCode(digit.charCodeAt(0) + charDiff)
			}
			return digit
		})
		.join('')
	return expressionChars
}

export function toLatinCharacter(expression: string): string {
	const persianZero = '۰'
	const persianZeroUTF8 = persianZero.charCodeAt(0)

	const latinZero = '0'
	const latinZeroUTF8 = latinZero.charCodeAt(0)

	const charDiff = persianZeroUTF8 - latinZeroUTF8

	const expressionChars = [...expression]
		.map((digit) => {
			if (digit.charCodeAt(0) >= persianZeroUTF8 && digit.charCodeAt(0) <= persianZeroUTF8 + 9) {
				return String.fromCharCode(digit.charCodeAt(0) - charDiff)
			}
			return digit
		})
		.join('')
	return expressionChars
}

export function isLeapYear(year: number): boolean {
	return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

export type CalendarType = 'Gregorian' | 'Jalali'
export function getMonthLength(year: number, month: number, calendarType: CalendarType): number {
	let leapMonthLength: number,
		monthLengths: number[] = []

	if (calendarType == 'Gregorian') {
		leapMonthLength = isLeapYear(year) ? 29 : 28
		monthLengths = [31, leapMonthLength, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
	} else if (calendarType == 'Jalali') {
		const gregorianFirstDayOfMonth = newDate(year, month, 1)
		leapMonthLength = isJalaliLeapYear(gregorianFirstDayOfMonth) ? 30 : 29
		monthLengths = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, leapMonthLength]
	}

	return monthLengths[month]
}

export type CalendarDay = {
	year: number
	month: number
	number: number
}
export function getMonthDays(
	year: number,
	month: number,
	calendarType: CalendarType,
): CalendarDay[] {
	const monthLength = getMonthLength(year, month, calendarType)
	const days: CalendarDay[] = []
	for (let i = 0; i < monthLength; i++) {
		days.push({
			year: year,
			month: month,
			number: i + 1,
		})
	}
	return days
}

export function getCalendarDays(
	value: Date,
	weekStartsOn: number,
	calendarType: CalendarType,
): CalendarDay[] {
	let year = 0,
		month = 0,
		firstWeekday = 0

	if (calendarType == 'Gregorian') {
		year = value.getFullYear()
		month = value.getMonth()
		firstWeekday = new Date(year, month, 1).getDay()
	} else if (calendarType == 'Jalali') {
		year = getYear(value)
		month = getMonth(value)
		firstWeekday = newDate(year, month, 1).getDay()
	}

	let days: CalendarDay[] = []

	// add last month
	const daysBefore = (firstWeekday - weekStartsOn + 7) % 7
	if (daysBefore > 0) {
		let lastMonth = month - 1
		let lastMonthYear = year
		if (lastMonth === -1) {
			lastMonth = 11
			lastMonthYear = year - 1
		}
		days = getMonthDays(lastMonthYear, lastMonth, calendarType).slice(-daysBefore)
	}

	// add current month
	days = days.concat(getMonthDays(year, month, calendarType))

	// add next month
	let nextMonth = month + 1
	let nextMonthYear = year
	if (nextMonth === 12) {
		nextMonth = 0
		nextMonthYear = year + 1
	}
	const daysAfter = 42 - days.length
	days = days.concat(getMonthDays(nextMonthYear, nextMonth, calendarType).slice(0, daysAfter))
	return days
}
