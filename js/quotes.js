
function createCard(quote) {
	const card = document.createElement("div");

	card.className = "card";

	if (quote.dhivehi) {
		card.classList.add("dhivehi");
	}

	let actionHTML = "";

	if (quote.action) {
		actionHTML = `
			<p style="margin-top:-1rem;">
				${formatQuote(quote.action)}
			</p>
		`;
	}

	if (!quote.author) {
		if (quote.conversation) {
			card.innerHTML = `
				<p class="quote no-quotes">
					${formatQuote(quote.text)}
				</p>

				<p class="quote no-quotes">
					${formatQuote(quote.conversation)}
				</p>

				${actionHTML}
			`;
		} else {
			card.classList.add("centered-text");

			card.innerHTML = `
				<p class="quote no-quotes">
					${formatQuote(quote.text)}
				</p>

				${actionHTML}
			`;
		}
	} else {
		const author = quote.dhivehi
			? `${quote.author} —`
			: `— ${quote.author}`;

		card.innerHTML = `
			<p class="quote">
				"${formatQuote(quote.text)}"
			</p>

			${actionHTML}

			<p class="author">
				${author}
			</p>
		`;
	}

	return card;
}

function renderQuotes(filter = "") {
	const container = document.getElementById("quote-sections");

	if (!container) return;

	container.innerHTML = "";

	semesters.forEach((semester) => {
		const filteredQuotes = semester.quotes.filter((quote) => {
			const search = filter.toLowerCase();

			return (
				quote.text.toLowerCase().includes(search) ||
				(quote.author || "").toLowerCase().includes(search) ||
				(quote.action || "").toLowerCase().includes(search) ||
				(quote.conversation || "").toLowerCase().includes(search)
			);
		});

		if (filteredQuotes.length === 0) return;

		const section = document.createElement("section");

		section.className = "semester";

		section.innerHTML = `
			<h2>${semester.title}</h2>
			<div class="grid"></div>
		`;

		const grid = section.querySelector(".grid");

		filteredQuotes.forEach((quote) => {
			grid.appendChild(createCard(quote));
		});

		container.appendChild(section);
	});
}

window.quotesReady.then((data) => {
	semesters = data.semesters;
	allQuotes = data.allQuotes;

	renderQuotes();

	const search = document.getElementById("search");

	if (search) {
		search.addEventListener("input", (e) => {
			renderQuotes(e.target.value);
		});
	}
});
