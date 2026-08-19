import { db } from "./firebase.js";

import {
	collection,
	getDocs,
	query,
	orderBy,
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// ==========================================
// LOAD ARTICLES
// ==========================================

async function loadHomeData() {
	try {
		const articlesQuery = query(
			collection(db, "articles"),
			orderBy("date", "desc"),
		);

		const snapshot = await getDocs(articlesQuery);

		const articles = snapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data(),
		}));

		console.log("Articles loaded:", articles);

		renderNews(articles);
	} catch (error) {
		console.error("Failed to load articles:", error);

		const newsGrid = document.getElementById("news-grid");

		if (newsGrid) {
			newsGrid.innerHTML = `
				<p class="news-error">
					Unable to load news articles.
				</p>
			`;
		}
	}
}

// ==========================================
// CREATE NEWS CARD
// ==========================================

function createNewsCard(article) {
	const card = document.createElement("article");

	card.className = "news-card";

	const language = article.language || "en";
	const isDhivehi = language === "dv";

	card.dir = isDhivehi ? "rtl" : "ltr";

	let dateText = "";

	if (article.date) {
		const date =
			typeof article.date.toDate === "function"
				? article.date.toDate()
				: new Date(article.date);

		if (!isNaN(date.getTime())) {
			dateText = new Intl.DateTimeFormat(isDhivehi ? "dv-MV" : "en-US", {
				month: "long",
				day: "numeric",
				year: "numeric",
			}).format(date);
		}
	}

	card.innerHTML = `
		${
			article.image
				? `
					<div class="news-thumb">
						<img
							src="${escapeHTML(article.image)}"
							alt="${escapeHTML(article.title || "")}"
							loading="lazy"
						>
					</div>
				`
				: ""
		}

		<div class="news-content">
			<div class="news-date">
				${escapeHTML(dateText)}
			</div>

			<h3 class="news-title-card">
				${escapeHTML(article.title || "Untitled Article")}
			</h3>
		</div>
	`;

	card.addEventListener("click", () => {
		window.location.href = `article.html?id=${article.id}`;
	});

	return card;
}

// ==========================================
// RENDER NEWS
// ==========================================

function renderNews(articles) {
	const newsGrid = document.getElementById("news-grid");

	if (!newsGrid) return;

	newsGrid.innerHTML = "";

	if (articles.length === 0) {
		newsGrid.innerHTML = "<p>No news articles yet.</p>";
		return;
	}

	articles.slice(0, 8).forEach((article) => {
		newsGrid.appendChild(createNewsCard(article));
	});
}

// ==========================================
// HTML ESCAPING
// ==========================================

function escapeHTML(value = "") {
	return String(value)
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#039;");
}

// ==========================================
// START
// ==========================================

loadHomeData();
