/*
 * Updates theme, where theme is of the form:
 * {
 *   id: string,
 *   name: string | null,
 * }
 */

function updateTheme(theme) {
	Cookies.set('theme', theme.id, { expires: 365, path: '/', sameSite: 'strict' });

	let stylesheet = document.getElementById('theme-stylesheet');
	let tempStylesheet = null;

	if (stylesheet === null) {
		const head = document.getElementsByTagName('head')[0];

		stylesheet = document.createElement('link');
		stylesheet.id = 'theme-stylesheet';
		stylesheet.rel = 'stylesheet';
		stylesheet.type = 'text/css';
		head.appendChild(stylesheet);

		if (theme.id in themeColours) {
			tempStylesheet = document.createElement('style');
			tempStylesheet.innerHTML = `body { --theme-base-background: ${themeColours[theme.id].backgroundColour}; }`;
			head.appendChild(tempStylesheet);
		}
	}

	const current = document.getElementById('theme-current');
	if (theme.name !== null && current !== null) {
		current.innerHTML = theme.name;
	}

	stylesheet.href = `/assets/themes/${theme.id}.css`;
	stylesheet.onload = function() {
		if (tempStylesheet !== null) {
			tempStylesheet.remove();
			tempStylesheet = null;
		}
	}
}

const defaultDarkTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
const theme = Cookies.get('theme') || (defaultDarkTheme ? 'nocturnal' : 'plain');
updateTheme({
	id: theme,
});

window.addEventListener('load', function() {
	const dropdownContainer = document.getElementById('theme-selector');
	dropdownContainer.style.visibility = 'visible';

	const dropdownOptionElem = document.getElementById('theme-dropdown-options');
	let dropdownOptions = {};

	for (const child of dropdownOptionElem.children) {
		dropdownOptions[child.dataset.value] = child;
	}

	const current = document.getElementById('theme-current');
	current.innerText = dropdownOptions[theme].innerHTML;

	for (const [optionTheme, dropdownOption] of Object.entries(dropdownOptions)) {
		dropdownOption.addEventListener('click', function() {
			updateTheme({
				id: optionTheme,
				name: dropdownOption.innerText
			});
		});
	}
});
