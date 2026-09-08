import { db } from "./firebase.js";

import {
	doc,
	getDoc,
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

	if (!articleId) {
		renderMissingArticle("No article specified.");
		return;
	}

	try {
		const articleRef = doc(db, "articles", articleId);
		const articleSnapshot = await getDoc(articleRef);

		if (!articleSnapshot.exists()) {
			renderMissingArticle("Article not found.");
			return;
		}

		const article = articleSnapshot.data();

		document.querySelector(".article").classList.remove("article-loading");
		// ==========================================
		// LANGUAGE
		// ==========================================

		const language = article.language || "en";
		const isDhivehi = language === "dv";

		document.documentElement.lang = isDhivehi ? "dv" : "en";

		document.body.classList.toggle("dhivehi", isDhivehi);
		// ==========================================
		// TITLE
		// ==========================================

		titleEl.textContent = article.title || "Untitled Article";

		document.title = `${article.title || "Article"}`;

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
			imageEl.src = optimizeCloudinaryImage(article.image, 1600);
			imageEl.alt = article.title || "";

			imageEl.loading = "eager";
			imageEl.fetchPriority = "high";

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

		if (
			article.gallery?.length ||
			article.galleryVideos?.length ||
			article.youtubeVideo
		) {
			renderMedia(article, mediaEl);
		}
	} catch (error) {
		console.error("Failed to load article from Firestore:", error);
		renderMissingArticle("Unable to load article. Please try again later.");
	}
}
function optimizeCloudinaryImage(url, width = 1600) {
	if (!url || !url.includes("res.cloudinary.com")) {
		return url;
	}

	return url.replace("/upload/", `/upload/f_auto,q_auto,w_${width}/`);
}
// ==========================================
// DATE FORMAT
// ==========================================

function formatDate(date, isDhivehi) {
	return new Intl.DateTimeFormat(isDhivehi ? "dv-MV" : "en-GB", {
		month: "long",
		day: "numeric",
		year: "numeric",
	}).format(date);
}
// ==========================================
// IMAGE LIGHTBOX
// ==========================================

function openLightbox(src, alt = "") {
	const lightbox = document.getElementById("image-lightbox");
	const lightboxImage = document.getElementById("lightbox-image");

	if (!lightbox || !lightboxImage) {
		return;
	}

	lightboxImage.src = src;
	lightboxImage.alt = alt;

	lightbox.classList.remove("hidden");
	document.body.classList.add("lightbox-open");
}

function closeLightbox() {
	const lightbox = document.getElementById("image-lightbox");
	const lightboxImage = document.getElementById("lightbox-image");

	if (!lightbox || !lightboxImage) {
		return;
	}

	lightbox.classList.add("hidden");
	document.body.classList.remove("lightbox-open");

	lightboxImage.src = "";
	lightboxImage.alt = "";
}
// ==========================================
// ARTICLE BODY - MARKDOWN
// ==========================================

function renderBody(body, container) {
	if (!body) {
		container.innerHTML = "";
		return;
	}

	// Convert Markdown to HTML, then sanitize it
	// so articles cannot inject unsafe HTML/JavaScript.
	if (typeof body === "string") {
		const html = marked.parse(body);

		container.innerHTML = DOMPurify.sanitize(html);
		return;
	}

	// Keep compatibility with any old articles
	// that may still use the previous array format.
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

	container.innerHTML = "";
}
// ==========================================
// MEDIA
// ==========================================

function renderMedia(article, container) {
	const sections = [];

	// ==========================================
	// IMAGE GALLERY
	// ==========================================

	if (Array.isArray(article.gallery) && article.gallery.length) {
		const images = article.gallery
			.map(
				(src) => `
					<img
						src="${escapeAttribute(optimizeCloudinaryImage(src, 1200))}"
						data-full-image="${escapeAttribute(src)}"
						alt="${escapeAttribute(article.title || "")}"
						loading="lazy"
						decoding="async"
						class="gallery-clickable"
					/>
				`,
			)
			.join("\n");

		sections.push(`
			<div class="media-section">
				<div class="media-grid">
					${images}
				</div>
			</div>
		`);
	}

	// ==========================================
	// CLOUDINARY VIDEO GALLERY
	// ==========================================

	if (Array.isArray(article.galleryVideos) && article.galleryVideos.length) {
		const videos = article.galleryVideos
			.map(
				(src) => `
					<video
						controls
						preload="metadata"
						playsinline
					>
						<source
							src="${escapeAttribute(src)}"
							type="video/mp4"
						/>
						Your browser does not support the video tag.
					</video>
				`,
			)
			.join("\n");

		sections.push(`
			<div class="media-section">
				<div class="media-grid">
					${videos}
				</div>
			</div>
		`);
	}

	// ==========================================
	// YOUTUBE VIDEO
	// ==========================================

	if (article.youtubeVideo) {
		const youtubeEmbed = getYouTubeEmbedUrl(article.youtubeVideo);

		if (youtubeEmbed) {
			sections.push(`
				<div class="media-section">
					<div class="youtube-container">
						<iframe
							src="${escapeAttribute(youtubeEmbed)}"
							title="${escapeAttribute(article.title || "YouTube video")}"
							loading="lazy"
							allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
							allowfullscreen
						></iframe>
					</div>
				</div>
			`);
		}
	}

	container.innerHTML = sections.join("\n");

	// ==========================================
	// LIGHTBOX
	// ==========================================

	container.querySelectorAll(".gallery-clickable").forEach((image) => {
		image.addEventListener("click", () => {
			const fullImage = image.dataset.fullImage || image.src;

			openLightbox(fullImage, image.alt);
		});
	});
}
// ==========================================
// YOUTUBE URL → EMBED URL
// ==========================================

function getYouTubeEmbedUrl(url) {
	if (!url) return "";

	try {
		const parsed = new URL(url);

		// youtube.com/watch?v=VIDEO_ID
		if (
			parsed.hostname.includes("youtube.com") &&
			parsed.pathname === "/watch"
		) {
			const videoId = parsed.searchParams.get("v");

			if (videoId) {
				return `https://www.youtube.com/embed/${videoId}`;
			}
		}

		// youtu.be/VIDEO_ID
		if (parsed.hostname === "youtu.be") {
			const videoId = parsed.pathname.replace("/", "");

			if (videoId) {
				return `https://www.youtube.com/embed/${videoId}`;
			}
		}

		// youtube.com/shorts/VIDEO_ID
		if (
			parsed.hostname.includes("youtube.com") &&
			parsed.pathname.startsWith("/shorts/")
		) {
			const videoId = parsed.pathname.split("/")[2];

			if (videoId) {
				return `https://www.youtube.com/embed/${videoId}`;
			}
		}

		// youtube.com/embed/VIDEO_ID
		if (
			parsed.hostname.includes("youtube.com") &&
			parsed.pathname.startsWith("/embed/")
		) {
			return url;
		}
	} catch (error) {
		console.error("Invalid YouTube URL:", error);
	}

	return "";
}
// ==========================================
// MISSING ARTICLE
// ==========================================

function renderMissingArticle(message) {
	const titleEl = document.getElementById("article-title");
	const bodyEl = document.getElementById("article-body");
	const articleHero = document.querySelector(".article-hero");
	const navigationEl = document.getElementById("article-navigation");
	const articleEl = document.querySelector(".article");

	if (articleEl) {
		articleEl.classList.remove("article-loading");
	}

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
// LIGHTBOX CONTROLS
// ==========================================

document
	.getElementById("lightbox-close")
	?.addEventListener("click", closeLightbox);

document
	.getElementById("image-lightbox")
	?.addEventListener("click", (event) => {
		if (event.target.id === "image-lightbox") {
			closeLightbox();
		}
	});

document.addEventListener("keydown", (event) => {
	if (event.key === "Escape") {
		closeLightbox();
	}
});
// ==========================================
// START
// ==========================================

loadArticle();
