import { db } from "./firebase.js";

import {
	collection,
	getDocs,
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// ==========================================
// LOAD ARTICLE
// ==========================================

async function loadArticle() {
	const articleId = new URLSearchParams(window.location.search).get("id");

	const titleEl = document.getElementById("article-title");
	const dateEl = document.getElementById("article-date");
	const imageEl = document.getElementById("article-image");
	const bodyEl = document.getElementById("article-body");
	const mediaEl = document.getElementById("article-media");
	const navigationEl = document.getElementById("article-navigation");

	if (!articleId) {
		renderMissingArticle("No article specified.");
		return;
	}

	console.log("Loading article:", articleId);

	try {
		const snapshot = await getDocs(collection(db, "articles"));

		let article = null;

		snapshot.forEach((doc) => {
			if (doc.id === articleId) {
				article = {
					id: doc.id,
					...doc.data(),
				};
			}
		});

		console.log("Article found:", article);

		if (!article) {
			renderMissingArticle("Article not found.");
			return;
		}

		// ==========================================
		// LANGUAGE
		// ==========================================

		const language = article.language || "en";
		const isDhivehi = language === "dv";

		document.documentElement.dir = isDhivehi ? "rtl" : "ltr";
		document.documentElement.lang = isDhivehi ? "dv" : "en";

		document.body.classList.toggle("dhivehi", isDhivehi);

		// ==========================================
		// TITLE
		// ==========================================

		titleEl.textContent = article.title || "Untitled Article";

		document.title = `${article.title || "Article"} | PELAJAR TIMES`;

		// ==========================================
		// DATE
		// ==========================================

		if (article.manualDate) {
			dateEl.textContent = article.manualDate;
		} else if (article.date) {
			const date = article.date.toDate();

			dateEl.textContent = formatDate(date, isDhivehi);
		}

		// ==========================================
		// IMAGE
		// ==========================================

		if (article.image) {
			imageEl.src = article.image;
			imageEl.alt = article.title || "";
			imageEl.style.display = "";
		} else {
			imageEl.style.display = "none";
		}

		// ==========================================
		// ARTICLE BODY
		// ==========================================

		renderBody(article.body, bodyEl);

		// ==========================================
		// MEDIA
		// ==========================================

		if (article.gallery || article.video || article.embed) {
			renderMedia(article, mediaEl);
		}
	} catch (error) {
		console.error("Failed to load article from Firestore:", error);
		renderMissingArticle("Unable to load article. Please try again later.");
	}
}

// ==========================================
// DATE FORMAT
// ==========================================

function formatDate(date, isDhivehi) {
	return new Intl.DateTimeFormat(isDhivehi ? "dv-MV" : "en-US", {
		month: "long",
		day: "numeric",
		year: "numeric",
	}).format(date);
}

// ==========================================
// ARTICLE BODY
// ==========================================

function renderBody(body, container) {
	if (!body) {
		container.innerHTML = "";
		return;
	}

	// Array of content blocks
	if (Array.isArray(body)) {
		container.innerHTML = body
			.map((block) => {
				if (block.type === "blockquote") {
					return `<blockquote>${escapeHTML(block.text)}</blockquote>`;
				}

				return `<p>${escapeHTML(block.text)}</p>`;
			})
			.join("\n");

		return;
	}

	// Simple string
	container.innerHTML = `<p>${escapeHTML(body)}</p>`;
}

// ==========================================
// MEDIA
// ==========================================

function renderMedia(article, container) {
	const sections = [];

	// Gallery
	if (Array.isArray(article.gallery) && article.gallery.length) {
		const images = article.gallery
			.map(
				(src) => `
                    <img
                        src="${escapeAttribute(src)}"
                        alt="${escapeAttribute(article.title || "")}"
                        loading="lazy"
                    />
                `,
			)
			.join("\n");

		sections.push(`
            <div class="media-grid">
                ${images}
            </div>
        `);
	}

	// Video
	if (article.video) {
		sections.push(`
            <video controls>
                <source
                    src="${escapeAttribute(article.video.src || "")}"
                    type="${escapeAttribute(article.video.type || "video/mp4")}"
                />
                Your browser does not support the video tag.
            </video>
        `);
	}

	// Embed
	if (article.embed) {
		sections.push(`
            <iframe
                src="${escapeAttribute(article.embed.src || "")}"
                title="${escapeAttribute(article.embed.title || "")}"
                allowfullscreen>
            </iframe>
        `);
	}

	container.innerHTML = sections.join("\n");
}

// ==========================================
// MISSING ARTICLE
// ==========================================

function renderMissingArticle(message) {
	const titleEl = document.getElementById("article-title");
	const bodyEl = document.getElementById("article-body");
	const articleHero = document.querySelector(".article-hero");
	const navigationEl = document.getElementById("article-navigation");

	if (articleHero) {
		articleHero.style.display = "none";
	}

	titleEl.textContent = message;

	bodyEl.innerHTML = `
        <p>
            Please return to
            <a href="index.html">the homepage</a>
            and choose another story.
        </p>
    `;

	if (navigationEl) {
		navigationEl.innerHTML = "";
	}
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
// ATTRIBUTE ESCAPING
// ==========================================

function escapeAttribute(value = "") {
	return escapeHTML(value);
}

// ==========================================
// START
// ==========================================

loadArticle();
