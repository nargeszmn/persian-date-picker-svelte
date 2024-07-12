<script lang="ts">
	import DatePicker from '$lib/DatePicker.svelte'
	import { localeFromDateFnsLocale, type CalendarType } from '$lib/locale.js'
	import Prop from './prop.svelte'
	import Split from './split.svelte'
	import { hy, de, nb } from 'date-fns/locale'

	let value: Date
	let min: Date
	let max: Date
	let calendarType: CalendarType = 'Jalali'
	let locales = [
		{ key: 'default', value: localeFromDateFnsLocale({}, calendarType) },
		{ key: 'nb (date-fns)', value: localeFromDateFnsLocale(nb, 'Gregorian') },
		{ key: 'de (date-fns)', value: localeFromDateFnsLocale(de, 'Gregorian') },
		{ key: 'hy (date-fns)', value: localeFromDateFnsLocale(hy, 'Gregorian') },
	]
	let locale = locales[0]
	let browseWithoutSelecting: boolean
	let showGregorianCalendar: boolean = false
	$: showGregorianCalendar ? (calendarType = 'Gregorian') : (calendarType = 'Jalali')
	let timePrecision: 'minute' | 'second' | 'millisecond' | null = 'millisecond'
</script>

<Split>
	<div class="left" slot="left">
		<DatePicker
			bind:value
			bind:min
			bind:max
			bind:calendarType
			locale={locale.value}
			bind:browseWithoutSelecting
			{timePrecision}
		/>
	</div>
	<div slot="right">
		<h3 class="no-top">Props</h3>
		<Prop label="value">{value}</Prop>
		<Prop label="Gregorian Calendar" bind:value={showGregorianCalendar} />
		<Prop label="locale" bind:value={locale} values={locales} />
		<Prop label="min" bind:value={min} />
		<Prop label="max" bind:value={max} />
		<Prop label="locale" bind:value={locale} values={locales} />
		<Prop label="browseWithoutSelecting" bind:value={browseWithoutSelecting} />
		<Prop
			label="timePrecision"
			bind:value={timePrecision}
			values={[null, 'minute', 'second', 'millisecond']}>{timePrecision}</Prop
		>
	</div>
</Split>
