let semesters = [];
let allQuotes = [];

let currentPage = 0;
const quotesPerPage = 5;

async function loadQuotes() {
	try {
		const res = await fetch("quotes.json");

		semesters = await res.json();

		allQuotes = semesters.flatMap((semester) => semester.quotes);

		renderQuotes();
		showDailyQuote();
	} catch (err) {
		console.error("Failed to load quotes:", err);
	}
}

function formatQuote(text) {
	return text
		.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
		.replace(/\*(.*?)\*/g, "<i>$1</i>");
}

function showDailyQuote() {
	if (allQuotes.length === 0) return;

	const random = allQuotes[Math.floor(Math.random() * allQuotes.length)];

	const quoteEl = document.getElementById("daily-quote");

	const authorEl = document.getElementById("daily-author");

	quoteEl.innerHTML = `"${formatQuote(random.text)}"`;

	if (random.action) {
		quoteEl.innerHTML += `
			<br>
			<span style="margin-top: 0.5rem;">
				${formatQuote(random.action)}
			</span>
		`;
	}

	if (random.author) {
		authorEl.textContent = random.dhivehi
			? `${random.author} —`
			: `— ${random.author}`;
	} else {
		authorEl.textContent = "";
	}
}

function createCard(quote) {
	const card = document.createElement("div");

	card.className = "card";

	if (quote.dhivehi === true) {
		card.classList.add("dhivehi");
	}

	let actionHTML = "";

	if (quote.action) {
		actionHTML = `
			<p style="margin-top: -1rem;">
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
		const quoteText = `"${formatQuote(quote.text)}"`;

		const authorText = quote.dhivehi
			? `${quote.author} —`
			: `— ${quote.author}`;

		card.innerHTML = `
			<p class="quote">
				${quoteText}
			</p>

			${actionHTML}

			<p class="author">
				${authorText}
			</p>
		`;
	}

	return card;
}

function renderQuotes(filter = "") {
	const container = document.getElementById("quote-sections");

	container.innerHTML = "";

	semesters.forEach((semester) => {
		const filteredQuotes = semester.quotes.filter((q) => {
			const text = q.text.toLowerCase();

			const author = (q.author || "").toLowerCase();

			const action = (q.action || "").toLowerCase();

			const conversation = (q.conversation || "").toLowerCase();

			const search = filter.toLowerCase();

			return (
				text.includes(search) ||
				author.includes(search) ||
				action.includes(search) ||
				conversation.includes(search)
			);
		});

		if (filteredQuotes.length === 0) return;

		const section = document.createElement("section");

		section.className = "semester";

		section.innerHTML = `
			<h2>
				${semester.title}
			</h2>

			<div class="grid"></div>
		`;

		const grid = section.querySelector(".grid");

		filteredQuotes.forEach((quote) => {
			grid.appendChild(createCard(quote));
		});

		container.appendChild(section);
	});
}

document.getElementById("search").addEventListener("input", (e) => {
	renderQuotes(e.target.value);
});

loadQuotes();
