// Copyright 2020-2021 The OS-NVR Authors.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation; version 2.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import { $, sortByName } from "../libs/common.mjs";
import { toUTC } from "../libs/time.mjs";

function newOptionsMenu(buttons) {
	$("#topbar-options-btn").style.visibility = "visible";

	const html = () => {
		let html = "";
		for (const btn of buttons) {
			if (btn != undefined && btn.html != undefined) {
				html += btn.html;
			}
		}
		return html;
	};
	return {
		html: html(),
		init($parent, content) {
			for (const btn of buttons) {
				if (btn != undefined && btn.init != undefined) {
					btn.init($parent, content);
				}
			}
			content.reset();
		},
	};
}

const newOptionsBtn = {
	gridSize() {
		const getGridSize = () => {
			const saved = localStorage.getItem("gridsize");
			if (saved) {
				return Number(saved);
			}
			return Number(
				getComputedStyle(document.documentElement)
					.getPropertyValue("--gridsize")
					.trim()
			);
		};
		const setGridSize = (value) => {
			localStorage.setItem("gridsize", value);
			document.documentElement.style.setProperty("--gridsize", value);
		};
		return {
			html: `
			<button class="options-menu-btn js-plus">
				<img class="icon" src="static/icons/feather/plus.svg">
			</button>
			<button class="options-menu-btn js-minus">
				<img class="icon" src="static/icons/feather/minus.svg">
			</button>`,
			init($parent, content) {
				$parent.querySelector(".js-plus").addEventListener("click", () => {
					if (getGridSize() !== 1) {
						setGridSize(getGridSize() - 1);
						content.reset();
					}
				});
				$parent.querySelector(".js-minus").addEventListener("click", () => {
					setGridSize(getGridSize() + 1);
					content.reset();
				});
				setGridSize(getGridSize());
			},
		};
	},
	date(timeZone) {
		const datePicker = newDatePicker(timeZone);
		const icon = "static/icons/feather/calendar.svg";
		const popup = newOptionsPopup("date", icon, datePicker.html);

		return {
			html: popup.html,
			init($parent, content) {
				popup.init($parent);
				datePicker.init(popup, content);
			},
		};
	},
	group(monitors, groups) {
		if (Object.keys(groups).length == 0) {
			return;
		}
		const groupPicker = newGroupPicker(monitors, groups);
		const icon = "static/icons/feather/group.svg";
		const popup = newOptionsPopup("group", icon, groupPicker.html);

		return {
			html: popup.html,
			init($parent, content) {
				popup.init($parent);
				groupPicker.init(popup, content);
			},
		};
	},
};

function newOptionsPopup(label, icon, htmlContent) {
	var element;

	const toggle = () => {
		element.classList.toggle("options-popup-open");
	};
	return {
		html: `
			<button class="options-menu-btn js-${label}">
				<img class="icon" src="${icon}">
			</button>
			<div class="options-popup js-popup-${label}">
				<div class="options-popup-content">
				${htmlContent}
				</div>
			</div>`,
		toggle: toggle,
		init($parent) {
			element = $parent.querySelector(`.js-popup-${label}`);

			$parent.querySelector(`.js-${label}`).addEventListener("click", () => {
				toggle();
			});
		},
		element() {
			return element;
		},
	};
}

const months = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];

function toMonthString(date) {
	return months[date.getMonth()];
}

function fromMonthString(string) {
	for (const i in months) {
		if (months[i] === string) {
			return i;
		}
	}
}

function nextMonth(string) {
	for (const i in months) {
		if (months[i] === string) {
			if (i == 11) {
				return [months[0], true];
			}
			return [months[Number(i) + 1], false];
		}
	}
}

function prevMonth(string) {
	for (const i in months) {
		if (months[i] === string) {
			if (i == 0) {
				return [months[11], true];
			}
			return [months[Number(i) - 1], false];
		}
	}
}

function daysInMonth(date) {
	const d = new Date(date.getFullYear(), date.getMonth() + 1, 0);
	return d.getDate();
}

const datePickerHTML = `
	<div class="date-picker">
		<div class="date-picker-month">
			<button class="date-picker-month-btn js-prev-month">
				<img class="icon" src="static/icons/feather/chevron-left.svg">
			</button>
			<span class="date-picker-month-label js-month"></span>
			<button class="date-picker-month-btn js-next-month">
				<img class="icon" src="static/icons/feather/chevron-right.svg">
			</button>
		</div>
		<div class="date-picker-calendar js-calendar"></div>
		<div class="date-picker-hour">
			<div class="date-picker-hour-buttons">
				<button class="date-picker-hour-btn js-next-hour">
					<img class="icon" src="static/icons/feather/chevron-up.svg">
				</button>
				<button class="date-picker-hour-btn js-prev-hour">
					<img class="icon" src="static/icons/feather/chevron-down.svg">
				</button>
			</div>
			<div class="date-picker-hour-middle">
				<input
					class="date-picker-hour-input js-hour"
					type="number"
					min="00"
					max="23"
					style="text-align: end;"
				></input>
				<span class="date-picker-hour-label">:</span>
				<input
					class="date-picker-hour-input js-minute"
					type="number"
					min="00"
					max="59"
				></input>
			</div>
			<div class="date-picker-hour-buttons">
				<button class="date-picker-hour-btn js-next-minute">
					<img class="icon" src="static/icons/feather/chevron-up.svg">
				</button>
				<button class="date-picker-hour-btn js-prev-minute">
					<img class="icon" src="static/icons/feather/chevron-down.svg">
				</button>
			</div>
		</div>
		<div class="date-picker-bottom">
			<button class="date-picker-bottom-btn js-reset">Reset</button>
			<button class="date-picker-bottom-btn date-picker-apply js-apply">Apply</button>
		</div>
	</div>
`;

function newDatePicker(timeZone) {
	let $month, $calendar, $hour, $minute;

	const getDay = () => {
		for (const child of $calendar.children) {
			if (child.classList.contains("date-picker-day-selected")) {
				return child.innerHTML.trim();
			}
		}
	};

	const setDay = (date) => {
		const firstDay = new Date(date.getTime());
		firstDay.setDate(1);
		let day = (firstDay.getDay() - 2) * -1;
		if (day > 0) {
			day = day - 7;
		}
		const nDays = daysInMonth(date);

		let daysHTML = "";
		for (let i = 0; i < 7 * 6; i++) {
			const text = day > 0 && day <= nDays ? day : "";
			if (day == date.getDate()) {
				daysHTML += `
						<button class="date-picker-day-btn date-picker-day-selected">
							${text}
						</button>`;
				day++;
				continue;
			}
			daysHTML += `<button class="date-picker-day-btn">${text}</button>`;
			day++;
		}
		$calendar.innerHTML = daysHTML;
	};

	const getDate = () => {
		const [year, monthString] = $month.innerHTML.split(" ");
		const month = fromMonthString(monthString);
		const day = getDay();
		const hour = $hour.value;
		const minute = $minute.value;

		return new Date(year, month, day, hour, minute);
	};

	const setDate = (date) => {
		const year = date.getFullYear();
		const month = toMonthString(date);
		$month.textContent = `${year} ${month}`;
		setDay(date);
		$hour.value = pad(date.getHours());
		$minute.value = pad(date.getMinutes());
	};

	let content;
	const apply = () => {
		content.setDate(toUTC(getDate(), timeZone));
	};

	const reset = () => {
		const now = new Date(new Date().toLocaleString("en-US", { timeZone: timeZone }));
		setDate(now);
	};

	return {
		html: datePickerHTML,
		init(popup, c) {
			const $parent = popup.element();
			content = c;

			$month = $parent.querySelector(".js-month");
			$calendar = $parent.querySelector(".js-calendar");
			$hour = $parent.querySelector(".js-hour");
			$minute = $parent.querySelector(".js-minute");

			$parent.querySelector(".js-prev-month").addEventListener("click", () => {
				let [year, month] = $month.innerHTML.split(" ");
				let [month2, prevYear] = prevMonth(month);
				if (prevYear) {
					year--;
				}
				$month.textContent = `${year} ${month2}`;
				setDay(new Date(year, fromMonthString(month2), getDay()));
			});
			$parent.querySelector(".js-next-month").addEventListener("click", () => {
				let [year, month] = $month.innerHTML.split(" ");
				let [month2, nextYear] = nextMonth(month);
				if (nextYear) {
					year++;
				}
				$month.textContent = `${year} ${month2}`;
				setDay(new Date(year, fromMonthString(month2), getDay()));
			});

			$calendar.addEventListener("click", (event) => {
				if (!event.target.classList.contains("date-picker-day-btn")) {
					return;
				}

				if (event.target.innerHTML === "") {
					return;
				}

				for (const child of $calendar.children) {
					child.classList.remove("date-picker-day-selected");
				}
				event.target.classList.add("date-picker-day-selected");
			});

			$parent.querySelector(".js-next-hour").addEventListener("click", () => {
				const hour = $hour.value;
				if (hour === "23") {
					$hour.value = "00";
					return;
				}
				$hour.value = pad(Number(hour) + 1);
			});
			$parent.querySelector(".js-prev-hour").addEventListener("click", () => {
				const hour = $hour.value;
				if (hour === "00") {
					$hour.value = "23";
					return;
				}
				$hour.value = pad(Number(hour) - 1);
			});

			$parent.querySelector(".js-next-minute").addEventListener("click", () => {
				const minute = $minute.value;
				if (minute === "59") {
					$minute.value = "00";
					return;
				}
				$minute.value = pad(Number(minute) + 1);
			});
			$parent.querySelector(".js-prev-minute").addEventListener("click", () => {
				const minute = $minute.value;
				if (minute === "00") {
					$minute.value = "59";
					return;
				}
				$minute.value = pad(Number(minute) - 1);
			});

			$parent.querySelector(".js-apply").addEventListener("click", () => {
				apply();
			});

			$parent.querySelector(".js-reset").addEventListener("click", () => {
				reset();
				apply();
			});

			reset();
		},
	};
}

function newGroupPicker(monitors, groups) {
	let groupsHTML = "";
	for (const group of sortByName(groups)) {
		groupsHTML += `
			<span 
				class="group-picker-item"
				data="${group.id}"
			>${group.name}</span>`;
	}

	return {
		html: `
			<div class="group-picker">
				<span class="group-picker-label">Groups</span>
				${groupsHTML}
			</div>`,
		init(popup, content) {
			const $parent = popup.element();
			const element = $parent.querySelector(".group-picker");

			const saved = localStorage.getItem("group");
			if (groups[saved] != undefined) {
				element
					.querySelector(`.group-picker-item[data="${saved}"]`)
					.classList.add("group-picker-item-selected");
				const monitors = JSON.parse(groups[saved]["monitors"]);
				content.setMonitors(monitors);
			}

			element.addEventListener("click", (event) => {
				if (!event.target.classList.contains("group-picker-item")) {
					return;
				}

				// Clear selection.
				const fields = element.querySelectorAll(".group-picker-item");
				for (const field of fields) {
					field.classList.remove("group-picker-item-selected");
				}

				event.target.classList.add("group-picker-item-selected");

				const groupID = event.target.attributes["data"].value;
				const groupMonitors = JSON.parse(groups[groupID]["monitors"]);
				content.setMonitors(groupMonitors);
				content.reset();

				localStorage.setItem("group", groupID);
			});
		},
	};
}

function pad(n) {
	return n < 10 ? "0" + n : n;
}

export { newOptionsMenu, newOptionsBtn, newOptionsPopup };