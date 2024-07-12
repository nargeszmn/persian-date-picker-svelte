export type Locale = {
	weekdays?: string[]
	months?: string[]
	shortMonths?: string[]
	weekStartsOn?: number
	calendarType?: string
}
export type InnerLocale = {
	weekdays: string[]
	months: string[]
	shortMonths: string[]
	weekStartsOn: number
	calendarType: string
}
export type CalendarType = 'Gregorian' | 'Jalali'

export function getLocaleDefaults(calendarType: CalendarType): InnerLocale {
	let localeDefaults: InnerLocale = {
		weekdays: [],
		months: [],
		shortMonths: [],
		weekStartsOn: 0,
		calendarType: 'Gregorian',
	}

	if (calendarType == 'Jalali') {
		const jalaliLocale = {
			weekdays: ['ی', 'د', 'س', 'چ', 'پ', 'ج', 'ش'],
			months: [
				'فروردین',
				'اردیبهشت',
				'خرداد',
				'تیر',
				'مرداد',
				'شهریور',
				'مهر',
				'آبان',
				'آذر',
				'دی',
				'بهمن',
				'اسفند',
			],
			shortMonths: [
				'فرو',
				'ارد',
				'خرد',
				'تیر',
				'مرد',
				'شهر',
				'مهر',
				'آبا',
				'آذر',
				'دی',
				'بهم',
				'اسف',
			],
			weekStartsOn: 6,
			calendarType: 'Jalali',
		}
		localeDefaults = jalaliLocale
	} else {
		const gregorianLocale = {
			weekdays: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
			months: [
				'January',
				'February',
				'March',
				'April',
				'May',
				'June',
				'July',
				'August',
				'September',
				'October',
				'November',
				'December',
			],
			shortMonths: [
				'Jan',
				'Feb',
				'Mar',
				'Apr',
				'May',
				'Jun',
				'Jul',
				'Aug',
				'Sep',
				'Oct',
				'Nov',
				'Dec',
			],
			weekStartsOn: 1,
			calendarType: 'Gregorian',
		}
		localeDefaults = gregorianLocale
	}

	return localeDefaults
}
export function getInnerLocale(locale: Locale, calendarType: CalendarType): InnerLocale {
	const innerLocale = getLocaleDefaults(calendarType)
	if (calendarType == 'Gregorian' && locale?.calendarType == calendarType) {
		if (typeof locale.weekStartsOn === 'number') {
			innerLocale.weekStartsOn = locale.weekStartsOn
		}
		if (locale.months) innerLocale.months = locale.months
		if (locale.shortMonths) innerLocale.shortMonths = locale.shortMonths
		if (locale.weekdays) innerLocale.weekdays = locale.weekdays
	}
	return innerLocale
}

type Month = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11
type Day = 0 | 1 | 2 | 3 | 4 | 5 | 6
type LocaleWidth = 'short' | 'wide' | 'abbreviated' | 'narrow' | 'any'
type DateFnsLocale = {
	options?: {
		weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
	}
	localize?: {
		month: (n: Month, options?: { width?: LocaleWidth }) => string
		day: (i: Day, options?: { width?: LocaleWidth }) => string
	}
}
/** Create a Locale from a date-fns locale, which only works for Gregorian calendar */
export function localeFromDateFnsLocale(
	dateFnsLocale: DateFnsLocale,
	calendarType: CalendarType,
): InnerLocale {
	const locale = getLocaleDefaults(calendarType)
	if (calendarType == 'Gregorian') {
		if (typeof dateFnsLocale.options?.weekStartsOn === 'number') {
			locale.weekStartsOn = dateFnsLocale.options.weekStartsOn
		}
		if (dateFnsLocale.localize) {
			for (let i = 0; i < 7; i++) {
				// widths: narrow, short, abbreviated, wide, any
				locale.weekdays[i] = dateFnsLocale.localize.day(i as Day, { width: 'short' })
			}

			for (let i = 0; i < 12; i++) {
				locale.months[i] = dateFnsLocale.localize.month(i as Month, { width: 'wide' })
				locale.shortMonths[i] = dateFnsLocale.localize.month(i as Month, { width: 'abbreviated' })
			}
		}
	}
	return locale
}
