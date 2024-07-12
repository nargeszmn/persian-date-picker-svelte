import { describe, it, expect, test } from 'vitest'
import { nb } from 'date-fns/locale'
import {
	getCalendarDays,
	getMonthDays,
	toText,
	toPersianCharacter,
	toLatinCharacter,
} from './date-utils.js'
import { createFormat, parse } from './parse.js'
import { getInnerLocale, localeFromDateFnsLocale } from './locale.js'
import { newDate } from 'date-fns-jalali'

describe('getMonthDays', () => {
	describe('gets the correct amount of days', () => {
		test('for Jalali Calendar', () => {
			const esf1403 = getMonthDays(1403, 11, 'Jalali')
			expect(esf1403.length).toEqual(30)
		})

		test('for Gregorian Calendar', () => {
			const feb2021 = getMonthDays(2021, 1, 'Gregorian')
			expect(feb2021.length).toEqual(28)
		})
	})
	describe('works with leap years', () => {
		test('for Jalali Calendar', () => {
			const esf1403 = getMonthDays(1403, 11, 'Jalali')
			expect(esf1403.length).toEqual(30)
		})

		test('for Gregorian Calendar', () => {
			const feb2021 = getMonthDays(2021, 1, 'Gregorian')
			expect(feb2021.length).toEqual(28)
		})
	})
})

describe('getCalendarDays', () => {
	describe('works for all months in', () => {
		test('1403-1405 for Jalali Calendar', () => {
			const weekdayStartsOn = 6 // Saturday
			for (let year = 1403; year < 1405; year++) {
				for (let month = 0; month <= 11; month++) {
					testMonth(year, month)
				}
			}
			function testMonth(year: number, month: number) {
				const date = newDate(year, month, 1)
				const calDays = getCalendarDays(date, weekdayStartsOn, 'Jalali')
				expect(calDays.length).toEqual(42)
				for (let i = 0; i < calDays.length; i++) {
					const calDay = calDays[i]
					expect({
						year: calDay.year,
						month: calDay.month,
						number: calDay.number,
						weekday: newDate(calDay.year, calDay.month, calDay.number).getDay(),
					}).toEqual({
						year: calDay.year,
						month: calDay.month,
						number: calDay.number,
						weekday: ((i % 7) + weekdayStartsOn) % 7,
					})
				}
			}
		})

		test('1995-2025 for Gregorian Calendar', () => {
			const weekdayStartsOn = 1 // monday
			for (let year = 2022; year < 2024; year++) {
				for (let month = 0; month < 11; month++) {
					testMonth(year, month)
				}
			}
			function testMonth(year: number, month: number) {
				const date = new Date(year, month, 1)
				const calDays = getCalendarDays(date, weekdayStartsOn, 'Gregorian')
				expect(calDays.length).toEqual(42)
				for (let i = 0; i < calDays.length; i++) {
					const calDay = calDays[i]
					expect({
						year: calDay.year,
						month: calDay.month,
						number: calDay.number,
						weekday: new Date(calDay.year, calDay.month, calDay.number).getDay(),
					}).toEqual({
						year: calDay.year,
						month: calDay.month,
						number: calDay.number,
						weekday: ((i % 7) + weekdayStartsOn) % 7,
					})
				}
			}
		})
	})

	describe('gets the correct days from the prev/next month', () => {
		test('for Jalali Calendar', () => {
			const weekdayStartsOn = 6 // Saturday
			const far1403 = newDate(1403, 0, 1, 0, 0, 0, 0)
			const far1403CalDays = getCalendarDays(far1403, weekdayStartsOn, 'Jalali')
			expect(far1403CalDays).toEqual([
				{ year: 1402, month: 11, number: 26 },
				{ year: 1402, month: 11, number: 27 },
				{ year: 1402, month: 11, number: 28 },
				{ year: 1402, month: 11, number: 29 },
				...getMonthDays(1403, 0, 'Jalali'),
				{ year: 1403, month: 1, number: 1 },
				{ year: 1403, month: 1, number: 2 },
				{ year: 1403, month: 1, number: 3 },
				{ year: 1403, month: 1, number: 4 },
				{ year: 1403, month: 1, number: 5 },
				{ year: 1403, month: 1, number: 6 },
				{ year: 1403, month: 1, number: 7 },
			])
		})

		test('for Gregorian Calendar', () => {
			const weekdayStartsOn = 1 // monday
			const jan2020 = new Date(2020, 0, 1, 0, 0, 0, 0)
			const jan2020CalDays = getCalendarDays(jan2020, weekdayStartsOn, 'Gregorian')
			expect(jan2020CalDays).toEqual([
				{ year: 2019, month: 11, number: 30 },
				{ year: 2019, month: 11, number: 31 },
				...getMonthDays(2020, 0, 'Gregorian'),
				{ year: 2020, month: 1, number: 1 },
				{ year: 2020, month: 1, number: 2 },
				{ year: 2020, month: 1, number: 3 },
				{ year: 2020, month: 1, number: 4 },
				{ year: 2020, month: 1, number: 5 },
				{ year: 2020, month: 1, number: 6 },
				{ year: 2020, month: 1, number: 7 },
				{ year: 2020, month: 1, number: 8 },
				{ year: 2020, month: 1, number: 9 },
			])

			const dec2019 = new Date(2019, 11, 1, 0, 0, 0, 0)
			const dec2019CalDays = getCalendarDays(dec2019, 1, 'Gregorian')
			expect(dec2019CalDays).toEqual([
				{ year: 2019, month: 10, number: 25 },
				{ year: 2019, month: 10, number: 26 },
				{ year: 2019, month: 10, number: 27 },
				{ year: 2019, month: 10, number: 28 },
				{ year: 2019, month: 10, number: 29 },
				{ year: 2019, month: 10, number: 30 },
				...getMonthDays(2019, 11, 'Gregorian'),
				{ year: 2020, month: 0, number: 1 },
				{ year: 2020, month: 0, number: 2 },
				{ year: 2020, month: 0, number: 3 },
				{ year: 2020, month: 0, number: 4 },
				{ year: 2020, month: 0, number: 5 },
			])
		})
	})
})

describe('toText', () => {
	describe('basic conversion', () => {
		test('for Jalali Calendar', () => {
			const calendarType = 'Jalali'
			const format = createFormat('yyyy-MM-dd HH:mm:ss', calendarType)
			const text = toText(newDate(1403, 0, 1, 0, 0, 0, 0), format)
			expect(text).toEqual('1403-01-01 00:00:00')
		})
		test('for Gregorian Calendar', () => {
			const calendarType = 'Gregorian'
			const format = createFormat('yyyy-MM-dd HH:mm:ss', calendarType)
			const text = toText(new Date(2020, 0, 1, 0, 0, 0, 0), format)
			expect(text).toEqual('2020-01-01 00:00:00')
		})
	})

	describe('conversion to month string', () => {
		test('for Jalali Calendar', () => {
			const calendarType = 'Jalali'
			const format = createFormat('dd MMM yyyy HH:mm:ss', calendarType)
			const text = toText(newDate(1403, 0, 1, 0, 0, 0, 0), format)
			expect(text).toEqual('01 فرو 1403 00:00:00')
		})
		test('for Gregorian Calendar', () => {
			const calendarType = 'Gregorian'
			const format = createFormat('dd MMM yyyy HH:mm:ss', calendarType)
			const text = toText(new Date(2020, 0, 1, 0, 0, 0, 0), format)
			expect(text).toEqual('01 Jan 2020 00:00:00')
		})
	})

	test('conversion to month string using non-en locale', () => {
		const calendarType = 'Gregorian'
		const format = createFormat(
			'dd MMM yyyy HH:mm:ss',
			calendarType,
			localeFromDateFnsLocale(nb, calendarType),
		)
		const text = toText(new Date(2020, 0, 1, 0, 0, 0, 0), format)
		expect(text).toEqual('01 jan. 2020 00:00:00')
	})
})

describe('toPersianCharacter', () => {
	it('converts latin expression to persian expression', () => {
		const latinExpression = '1403-03-30 23:00:00'
		const persianExpression = toPersianCharacter(latinExpression)
		expect(persianExpression).toEqual('۱۴۰۳-۰۳-۳۰ ۲۳:۰۰:۰۰')
	})
})

describe('toLatinCharacter', () => {
	it('converts persian expression to latin expression', () => {
		const persianExpression = '۱۴۰۳-۰۳-۳۰ ۲۳:۰۰:۰۰'
		const latinExpression = toLatinCharacter(persianExpression)
		expect(latinExpression).toEqual('1403-03-30 23:00:00')
	})
})

describe('parse()', () => {
	const baseDate = newDate(1403, 0, 1, 0, 0, 0, 999)

	describe('works with a basic date', () => {
		test('for Jalali Calendar', () => {
			const calendarType = 'Jalali'
			const format = createFormat('yyyy--MM-dd HH:mm:ss', calendarType)
			const result = parse('1403--12-30 23:59:59', format, baseDate, calendarType)
			expect(result).toEqual({
				date: newDate(1403, 11, 30, 23, 59, 59, 999),
				missingPunctuation: '',
			})
		})

		test('for Gregorian Calendar', () => {
			const calendarType = 'Gregorian'
			const format = createFormat('yyyy--MM-dd HH:mm:ss', calendarType)
			const result = parse('1234--12-31 23:59:59', format, baseDate, calendarType)
			expect(result).toEqual({
				date: new Date(1234, 11, 31, 23, 59, 59, 999),
				missingPunctuation: '',
			})
		})
	})

	describe('works with a short month date', () => {
		test('for Jalali Calendar', () => {
			const calendarType = 'Jalali'
			const format = createFormat('dd MMM yyyy HH:mm:ss', calendarType)
			const result = parse('31 فرو 1403 23:59:59', format, baseDate, calendarType)
			expect(result).toEqual({
				date: newDate(1403, 0, 31, 23, 59, 59, 999),
				missingPunctuation: '',
			})
		})

		test('for Gregorian Calendar', () => {
			const calendarType = 'Gregorian'
			const format = createFormat('dd MMM yyyy HH:mm:ss', calendarType)
			const result = parse('31 Dec 2022 23:59:59', format, baseDate, calendarType)
			expect(result).toEqual({
				date: new Date(2022, 11, 31, 23, 59, 59, 999),
				missingPunctuation: '',
			})
		})
	})

	describe('works with a short month date in non-En locale', () => {
		test('for Gregorian Calendar', () => {
			const calendarType = 'Gregorian'
			const format = createFormat(
				'dd MMM yyyy HH:mm:ss',
				calendarType,
				localeFromDateFnsLocale(nb, calendarType),
			)
			const result = parse('31 des. 2022 23:59:59', format, baseDate, calendarType)
			expect(result).toEqual({
				date: new Date(2022, 11, 31, 23, 59, 59, 999),
				missingPunctuation: '',
			})
		})
	})

	describe('handles badly formed month name', () => {
		test('for Jalali Calendar', () => {
			const calendarType = 'Jalali'
			const format = createFormat('dd MMM yyyy HH:mm:ss', calendarType)
			const result = parse('۳۱ قرد ۱۴۰۳ ۲۳:۵۹:۵۹', format, baseDate, calendarType)
			expect(result).toEqual({
				date: null,
				missingPunctuation: '',
			})
		})

		test('for Gregorian Calendar', () => {
			const calendarType = 'Gregorian'
			const format = createFormat('dd MMM yyyy HH:mm:ss', calendarType)
			const result = parse('31 Dex 2022 23:59:59', format, baseDate, calendarType)
			expect(result).toEqual({
				date: null,
				missingPunctuation: '',
			})
		})
	})

	it('handles missing punctuation', () => {
		const calendarType = 'Gregorian'
		const format = createFormat('yyyy--MM-dd HH:mm:ss', calendarType)
		const result = parse('2345', format, baseDate, calendarType)
		expect(result).toEqual({
			date: null,
			missingPunctuation: '--',
		})
	})

	it('fails with too high minute', () => {
		const calendarType = 'Gregorian'
		const format = createFormat('yyyy--MM-dd HH:mm:ss', calendarType)
		const result = parse('1234--12-31 23:99:59', format, baseDate, calendarType)
		expect(result).toEqual({
			date: null,
			missingPunctuation: '',
		})
	})

	it('fails with too high date-of-month', () => {
		const calendarType = 'Gregorian'
		const format = createFormat('yyyy--MM-dd HH:mm:ss', calendarType)
		const dayOfMonthOverflow = parse('1234--04-31 23:59:59', format, baseDate, calendarType)
		expect(dayOfMonthOverflow).toEqual({
			date: null,
			missingPunctuation: '',
		})
	})

	it('fails when the second has a non-numeric character', () => {
		const calendarType = 'Gregorian'
		const format = createFormat('yyyy--MM-dd HH:mm:ss', calendarType)
		const noNumber = parse('1234--02-31 23:59:5d', format, baseDate, calendarType)
		expect(noNumber).toEqual({
			date: null,
			missingPunctuation: '',
		})
	})
})

describe('locale', () => {
	const nbLocale = {
		weekdays: ['sø', 'ma', 'ti', 'on', 'to', 'fr', 'lø'],
		months: [
			'januar',
			'februar',
			'mars',
			'april',
			'mai',
			'juni',
			'juli',
			'august',
			'september',
			'oktober',
			'november',
			'desember',
		],
		shortMonths: [
			'jan.',
			'feb.',
			'mars',
			'apr.',
			'mai',
			'juni',
			'juli',
			'aug.',
			'sep.',
			'okt.',
			'nov.',
			'des.',
		],
		weekStartsOn: 1,
		calendarType: 'Gregorian',
	}

	test('getInnerLocale', () => {
		const locale = getInnerLocale(
			{
				months: nbLocale.months,
				shortMonths: nbLocale.shortMonths,
				weekStartsOn: 4,
				calendarType: 'Gregorian',
			},
			'Gregorian',
		)

		expect(locale).toEqual({
			weekdays: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
			months: nbLocale.months,
			shortMonths: nbLocale.shortMonths,
			weekStartsOn: 4,
			calendarType: 'Gregorian',
		})
	})

	test('localeFromDateFnsLocale', () => {
		const locale = localeFromDateFnsLocale(nb, 'Gregorian')
		expect(locale).toEqual(nbLocale)
	})
})
