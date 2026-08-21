import { db } from "./firebase.js";

import {
	collection,
	getDocs,
	query,
	orderBy,
	limit,
	startAfter,
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// ==========================================
// PAGINATION SETTINGS
// ==========================================

// Number of articles shown on each page
const ARTICLES_PER_PAGE = 10;

let currentPage = 1;

// Stores the last Firestore document of each loaded page.
// This allows us to use startAfter() when moving forward.
const pageCursors = new Map();

let isLoading = false;

// ==========================================
// LOAD ARTICLES
// ==========================================

async function loadHomeData(page = 1) {
	if (isLoading) return;

	isLoading = true;

	const newsGrid = document.getElementById("news-grid");

	if (!newsGrid) {
		isLoading = false;
		return;
	}

	try {
		let articlesQuery;

		// ==========================================
		// FIRST PAGE
		// ==========================================

		if (page === 1) {
			articlesQuery = query(
				collection(db, "articles"),
				orderBy("date", "desc"),
				limit(ARTICLES_PER_PAGE),
			);
		}

		// ==========================================
		// LATER PAGES
		// ==========================================

		else {
			const previousPageCursor = pageCursors.get(page - 1);

			if (!previousPageCursor) {
				console.error("No cursor found for page", page);
				isLoading = false;
				return;
			}

			articlesQuery = query(
				collection(db, "articles"),
				orderBy("date", "desc"),
				startAfter(previousPageCursor),
				limit(ARTICLES_PER_PAGE),
			);
		}

		const snapshot = await getDocs(articlesQuery);

		const articles = snapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data(),
		}));

		// Save the last document from this page.
		// It becomes the cursor for the next page.
		if (snapshot.docs.length > 0) {
			pageCursors.set(
				page,
				snapshot.docs[snapshot.docs.length - 1],
			);
		}

		currentPage = page;

		renderNews(articles);

		renderPagination(snapshot.docs.length);

	} catch (error) {
		console.error("Failed to load articles:", error);

		newsGrid.innerHTML = `
			<p class="news-error">
				Unable to load news articles.
			</p>
		`;
	} finally {
		isLoading = false;
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
			dateText = new Intl.DateTimeFormat(
				isDhivehi ? "dv-MV" : "en-US",
				{
					month: "long",
					day: "numeric",
					year: "numeric",
				},
			).format(date);
		}
	}

	card.innerHTML = `
		${
			article.image
				? `
					<div class="news-thumb">
						<img
							src="${escapeHTML(
								optimizeCloudinaryImage(article.image, 700),
							)}"
							alt="${escapeHTML(article.title || "")}"
							loading="lazy"
							decoding="async"
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
				${escapeHTML(
					article.title || "Untitled Article",
				)}
			</h3>
		</div>
	`;

	card.addEventListener("click", () => {
		window.location.href = `article.html?id=${encodeURIComponent(
			article.id,
		)}`;
	});

	return card;
}

// ==========================================
// CLOUDINARY OPTIMIZATION
// ==========================================

function optimizeCloudinaryImage(url, width = 700) {
	if (!url || !url.includes("res.cloudinary.com")) {
		return url;
	}

	return url.replace(
		"/upload/",
		`/upload/f_auto,q_auto,w_${width}/`,
	);
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

	articles.forEach((article) => {
		newsGrid.appendChild(createNewsCard(article));
	});
}

// ==========================================
// PAGINATION
// ==========================================

function renderPagination(currentPageArticleCount) {
	const pagination = document.getElementById("pagination");

	if (!pagination) return;

	pagination.innerHTML = "";

	/*
		We don't know the total number of articles
		without doing another Firestore read.

		Instead, we determine whether another page exists
		by checking whether this page was full.

		If we received fewer than ARTICLES_PER_PAGE,
		this is the final page.
	*/

	const hasNextPage =
		currentPageArticleCount === ARTICLES_PER_PAGE;

	// ==========================================
	// PREVIOUS BUTTON
	// ==========================================

	if (currentPage > 1) {
		const previousButton = createPaginationButton(
			"←",
			currentPage - 1,
			"Previous page",
		);

		pagination.appendChild(previousButton);
	}

	// ==========================================
	// CURRENT PAGE
	// ==========================================

	const currentButton = document.createElement("button");

	currentButton.className = "pagination-button active";
	currentButton.textContent = currentPage;
	currentButton.disabled = true;
	currentButton.setAttribute(
		"aria-current",
		"page",
	);

	pagination.appendChild(currentButton);

	// ==========================================
	// NEXT BUTTON
	// ==========================================

	if (hasNextPage) {
		const nextButton = createPaginationButton(
			"→",
			currentPage + 1,
			"Next page",
		);

		pagination.appendChild(nextButton);
	}
}

// ==========================================
// PAGINATION BUTTON
// ==========================================

function createPaginationButton(
	text,
	page,
	ariaLabel,
) {
	const button = document.createElement("button");

	button.className = "pagination-button";
	button.textContent = text;
	button.setAttribute("aria-label", ariaLabel);

	button.addEventListener("click", () => {
		loadHomeData(page);

		// Bring the user back to the beginning
		// of the news cards.
		document
			.querySelector(".news-title")
			?.scrollIntoView({
				behavior: "smooth",
			});
	});

	return button;
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

loadHomeData(1);