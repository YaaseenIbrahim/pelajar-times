let semesters = [];
let allQuotes = [];

function formatQuote(text) {
	return text
		.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
		.replace(/\*(.*?)\*/g, "<i>$1</i>");
}

function showDailyQuote() {
	if (allQuotes.length === 0) return;

	const quoteEl = document.getElementById("daily-quote");
	const authorEl = document.getElementById("daily-author");

	if (!quoteEl || !authorEl) return;

	// Random quote every page refresh
	const quote = allQuotes[Math.floor(Math.random() * allQuotes.length)];

	quoteEl.innerHTML = `"${formatQuote(quote.text)}"`;

	if (quote.action) {
		quoteEl.innerHTML += `
			<br>
			<span style="display:block;margin-top:.5rem;">
				${formatQuote(quote.action)}
			</span>
		`;
	}

	if (quote.author) {
		authorEl.textContent = quote.dhivehi
			? `${quote.author} —`
			: `— ${quote.author}`;

		if (quote.dhivehi) {
			quoteEl.classList.add("dhivehi");
			authorEl.classList.add("dhivehi");
		}
	} else {
		authorEl.textContent = "";
	}
}
window.quotesReady = (async () => {
	try {
		const res = await fetch("quotes.json");

		semesters = await res.json();

		allQuotes = semesters.flatMap((semester) => semester.quotes);

		showDailyQuote();

		return {
			semesters,
			allQuotes,
		};
	} catch (err) {
		console.error("Failed to load quotes:", err);

		return {
			semesters: [],
			allQuotes: [],
		};
	}
})();
