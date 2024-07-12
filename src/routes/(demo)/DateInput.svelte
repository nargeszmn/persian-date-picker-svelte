<script lang="ts">
	import DateInput from '$lib/DateInput.svelte'
	import Prop from './prop.svelte'
	import Split from './split.svelte'
	import { localeFromDateFnsLocale, type CalendarType } from '$lib/locale.js'
	import { hy, de, nb } from 'date-fns/locale'

	let id: string
	let placeholder: string
	let value: Date
	let min: Date
	let max: Date
	let valid: boolean
	let visible: boolean
	let disabled: boolean
	let required: boolean
	let closeOnSelection: boolean
	let browseWithoutSelecting: boolean
	let format: string
	let dynamicPositioning: boolean = true
	let timePrecision: 'minute' | 'second' | 'millisecond' | null = null
	let calendarType: CalendarType = 'Jalali'
	let showGregorianCalendar: boolean = false
	$: showGregorianCalendar ? (calendarType = 'Gregorian') : (calendarType = 'Jalali')
	let locales = [
		{ key: 'default', value: localeFromDateFnsLocale({}, calendarType) },
		{ key: 'nb (date-fns)', value: localeFromDateFnsLocale(nb, 'Gregorian') },
		{ key: 'de (date-fns)', value: localeFromDateFnsLocale(de, 'Gregorian') },
		{ key: 'hy (date-fns)', value: localeFromDateFnsLocale(hy, 'Gregorian') },
	]
	let locale = locales[0]
</script>

<Split>
	<DateInput
		slot="left"
		bind:id
		bind:value
		bind:min
		bind:max
		bind:placeholder
		bind:valid
		bind:format
		bind:visible
		bind:disabled
		bind:required
		bind:closeOnSelection
		bind:browseWithoutSelecting
		bind:dynamicPositioning
		bind:timePrecision
		bind:locale={locale.value}
		bind:calendarType
	/>

	<svelte:fragment slot="right">
		<h3 class="no-top">Props</h3>
		<Prop label="value">{value}</Prop>
		<Prop label="Gregorian Calendar" bind:value={showGregorianCalendar} />
		<Prop label="min" bind:value={min} />
		<Prop label="max" bind:value={max} />
		<Prop label="placeholder" bind:value={placeholder} />
		<Prop label="valid" bind:value={valid} />
		<Prop label="format" bind:value={format} />
		<Prop label="locale" bind:value={locale} values={locales} />
		<Prop
			label="timePrecision"
			bind:value={timePrecision}
			values={[null, 'minute', 'second', 'millisecond']}>{timePrecision}</Prop
		>
		<Prop label="visible" bind:value={visible} />
		<Prop label="id" bind:value={id} />
		<Prop label="disabled" bind:value={disabled} />
		<Prop label="required" bind:value={required} />
		<Prop label="closeOnSelection" bind:value={closeOnSelection} />
		<Prop label="browseWithoutSelecting" bind:value={browseWithoutSelecting} />
		<Prop label="dynamicPositioning" bind:value={dynamicPositioning} />
	</svelte:fragment>
</Split>
