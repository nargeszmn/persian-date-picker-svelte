<script lang="ts">
	import DatePicker from './DatePicker.svelte'
	import DateInput from './DateInput.svelte'
</script>

<svelte:head>
	<title>Persian Date Picker Svelte</title>
</svelte:head>

<p>Persian Date Picker Svelte is a package which supports both Jalali and Gregorian calendars</p>

<p>Features:</p>
<ul>
	<li>Theming</li>
	<li>Custom formats</li>
	<li>Internationalization for the Gregorian Calendar (i18n)</li>
	<li>
		Auto-punctuation (e.g typing "20201111111111" gives you "2020-11-11 11:11:11" with the default
		format)
	</li>
	<li>Keyboard shortcuts</li>
</ul>

<h2 id="install">Install</h2>
<pre class="language-">npm install -D persian-date-picker-svelte</pre>

<h2 id="dateinput">DateInput</h2>
<DateInput />

<h2 id="datepicker">DatePicker</h2>
<DatePicker />
