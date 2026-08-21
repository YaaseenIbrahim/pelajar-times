import { db } from "./firebase.js";

import {
	collection,
	getDocs,
	addDoc,
	updateDoc,
	deleteDoc,
	doc,
	getDoc,
	serverTimestamp,
	query,
	orderBy,
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
	getAuth,
	GoogleAuthProvider,
	signInWithPopup,
	signOut,
	onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

// ==========================================
// FIREBASE AUTH
// ==========================================

const auth = getAuth();
const provider = new GoogleAuthProvider();

// ==========================================
// ELEMENTS
// ==========================================

const loginSection = document.getElementById("login-section");
const dashboardSection = document.getElementById("dashboard-section");

const googleLogin = document.getElementById("google-login");
const signOutButton = document.getElementById("sign-out");

const userName = document.getElementById("user-name");
const loginError = document.getElementById("login-error");

const newArticleButton = document.getElementById("new-article");

const editor = document.getElementById("editor");
const editorTitle = document.getElementById("editor-title");

const titleInput = document.getElementById("article-title-input");
const languageInput = document.getElementById("article-language");

const imageInput = document.getElementById("article-image-input");
const mainImageStatus = document.getElementById("main-image-status");

const dateInput = document.getElementById("article-date-input");
const manualDateInput = document.getElementById("article-manual-date-input");

const bodyInput = document.getElementById("article-body-input");

const galleryInput = document.getElementById("article-gallery-input");
const galleryImageStatus = document.getElementById("gallery-image-status");

const galleryPreview = document.getElementById("gallery-preview");
const addGalleryImagesButton = document.getElementById("add-gallery-images");

const videoInput = document.getElementById("article-video-input");
const videoStatus = document.getElementById("video-status");
const videoPreview = document.getElementById("video-preview");

const addGalleryVideosButton = document.getElementById("add-gallery-videos");

const youtubeInput = document.getElementById("article-youtube-input");

const saveButton = document.getElementById("save-article");
const cancelButton = document.getElementById("cancel-edit");

const saveStatus = document.getElementById("save-status");

const articlesList = document.getElementById("articles-list");

// ==========================================
// STATE
// ==========================================

let editingArticleId = null;

let uploadedMainImage = "";

let galleryImages = [];

let galleryVideos = [];

let youtubeVideo = "";

// ==========================================
// CLOUDINARY
// ==========================================

const CLOUDINARY_CLOUD_NAME = "brjed17u";
const CLOUDINARY_UPLOAD_PRESET = "pelajar-times";

// ==========================================
// CLOUDINARY UPLOAD
// ==========================================

async function uploadToCloudinary(file, resourceType = "image") {
	const formData = new FormData();

	formData.append("file", file);
	formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

	const response = await fetch(
		`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
		{
			method: "POST",
			body: formData,
		},
	);

	if (!response.ok) {
		const errorData = await response.json().catch(() => null);

		console.error("Cloudinary upload failed:", errorData);

		throw new Error(
			errorData?.error?.message || "Cloudinary upload failed.",
		);
	}

	const data = await response.json();

	return data.secure_url;
}

// ==========================================
// MAIN IMAGE
// ==========================================

imageInput.addEventListener("change", async () => {
	const file = imageInput.files[0];

	if (!file) return;

	mainImageStatus.textContent = "Uploading main image...";

	try {
		uploadedMainImage = await uploadToCloudinary(file);

		mainImageStatus.textContent = "Main image uploaded successfully.";
	} catch (error) {
		console.error(error);

		uploadedMainImage = "";

		mainImageStatus.textContent = "Failed to upload main image.";

		alert("Failed to upload the main image. Please try again.");
	}
});

// ==========================================
// GALLERY IMAGES
// ==========================================

galleryInput.addEventListener("change", async () => {
	const files = Array.from(galleryInput.files);

	if (files.length === 0) return;

	galleryImageStatus.textContent = `Uploading ${files.length} gallery image(s)...`;

	try {
		for (const file of files) {
			const url = await uploadToCloudinary(file);

			galleryImages.push(url);
		}

		galleryImageStatus.textContent = `${files.length} gallery image(s) uploaded successfully.`;

		renderGalleryPreview();
	} catch (error) {
		console.error(error);

		galleryImageStatus.textContent = "Failed to upload gallery images.";

		alert("One or more gallery images failed to upload.");
	}

	galleryInput.value = "";
});

// ==========================================
// ADD GALLERY IMAGES
// ==========================================

addGalleryImagesButton.addEventListener("click", () => {
	galleryInput.click();
});

// ==========================================
// VIDEO GALLERY
// ==========================================

videoInput.addEventListener("change", async () => {
	const files = Array.from(videoInput.files);

	if (files.length === 0) return;

	videoStatus.textContent = `Uploading ${files.length} video(s)...`;

	try {
		for (const file of files) {
			const url = await uploadToCloudinary(file, "video");

			galleryVideos.push(url);
		}

		videoStatus.textContent = `${files.length} video(s) uploaded successfully.`;

		renderVideoPreview();
	} catch (error) {
		console.error(error);

		videoStatus.textContent = "Failed to upload video(s).";

		alert("One or more videos failed to upload.");
	}

	videoInput.value = "";
});

// ==========================================
// ADD GALLERY VIDEOS
// ==========================================

addGalleryVideosButton.addEventListener("click", () => {
	videoInput.click();
});

// ==========================================
// YOUTUBE
// ==========================================

youtubeInput.addEventListener("input", () => {
	youtubeVideo = youtubeInput.value.trim();
});

// ==========================================
// OPTIMIZE CLOUDINARY IMAGE
// ==========================================

function optimizeCloudinaryImage(url, width = 1600) {
	if (!url || !url.includes("res.cloudinary.com")) {
		return url;
	}

	return url.replace("/upload/", `/upload/f_auto,q_auto,w_${width}/`);
}

// ==========================================
// RENDER GALLERY PREVIEW
// ==========================================

function renderGalleryPreview() {
	galleryPreview.innerHTML = "";

	if (galleryImages.length === 0) {
		galleryPreview.innerHTML = `
			<p class="gallery-empty">
				No gallery images selected.
			</p>
		`;

		return;
	}

	galleryImages.forEach((url, index) => {
		const item = document.createElement("div");

		item.className = "gallery-preview-item";

		const previewUrl = optimizeCloudinaryImage(url, 400);

		item.innerHTML = `
			<img
				src="${escapeHTML(previewUrl)}"
				alt="Gallery image ${index + 1}"
				loading="lazy"
				decoding="async"
			>

			<button
				type="button"
				class="gallery-remove-button"
				data-index="${index}"
				aria-label="Remove gallery image"
			>
				×
			</button>
		`;

		galleryPreview.appendChild(item);
	});

	galleryPreview
		.querySelectorAll(".gallery-remove-button")
		.forEach((button) => {
			button.addEventListener("click", () => {
				const index = Number(button.dataset.index);

				galleryImages.splice(index, 1);

				renderGalleryPreview();
			});
		});
}

// ==========================================
// RENDER VIDEO PREVIEW
// ==========================================

function renderVideoPreview() {
	videoPreview.innerHTML = "";

	if (galleryVideos.length === 0) {
		videoPreview.innerHTML = `
			<p class="video-empty">
				No video clips selected.
			</p>
		`;

		return;
	}

	galleryVideos.forEach((url, index) => {
		const item = document.createElement("div");

		item.className = "video-preview-item";

		item.innerHTML = `
			<video
				src="${escapeHTML(url)}"
				controls
				preload="metadata"
			></video>

			<button
				type="button"
				class="video-remove-button"
				data-index="${index}"
				aria-label="Remove video"
			>
				×
			</button>
		`;

		videoPreview.appendChild(item);
	});

	videoPreview.querySelectorAll(".video-remove-button").forEach((button) => {
		button.addEventListener("click", () => {
			const index = Number(button.dataset.index);

			galleryVideos.splice(index, 1);

			renderVideoPreview();
		});
	});
}

// ==========================================
// GOOGLE LOGIN
// ==========================================

googleLogin.addEventListener("click", async () => {
	loginError.textContent = "";

	try {
		await signInWithPopup(auth, provider);
	} catch (error) {
		console.error(error);

		loginError.textContent = "Login failed. Please try again.";
	}
});

// ==========================================
// SIGN OUT
// ==========================================

signOutButton.addEventListener("click", async () => {
	await signOut(auth);
});

// ==========================================
// AUTH STATE
// ==========================================

onAuthStateChanged(auth, async (user) => {
	if (!user) {
		loginSection.classList.remove("hidden");
		dashboardSection.classList.add("hidden");

		userName.textContent = "";

		return;
	}

	loginSection.classList.add("hidden");
	dashboardSection.classList.remove("hidden");

	userName.textContent = `Signed in as ${user.displayName || user.email}`;

	loadArticles();
});

// ==========================================
// NEW ARTICLE
// ==========================================

newArticleButton.addEventListener("click", () => {
	editingArticleId = null;

	editorTitle.textContent = "New Article";

	clearEditor();

	editor.classList.remove("hidden");

	window.scrollTo({
		top: editor.offsetTop - 20,
		behavior: "smooth",
	});
});

// ==========================================
// CANCEL
// ==========================================

cancelButton.addEventListener("click", () => {
	editor.classList.add("hidden");

	editingArticleId = null;

	clearEditor();
});

// ==========================================
// SAVE ARTICLE
// ==========================================

saveButton.addEventListener("click", async () => {
	const user = auth.currentUser;

	if (!user) {
		alert("You must be signed in.");
		return;
	}

	const title = titleInput.value.trim();
	const language = languageInput.value;
	const image = uploadedMainImage;

	const dateValue = dateInput.value;
	const manualDate = manualDateInput.value.trim();

	const bodyText = bodyInput.value.trim();

	const youtube = youtubeInput.value.trim();

	if (!title || !bodyText) {
		alert("Please enter a title and article body.");
		return;
	}

	if (imageInput.files.length > 0 && !uploadedMainImage) {
		alert("Please wait for the main image to finish uploading.");

		return;
	}

	if (galleryInput.files.length > 0 && galleryImages.length === 0) {
		alert("Please wait for the gallery images to finish uploading.");

		return;
	}

	if (videoInput.files.length > 0 && galleryVideos.length === 0) {
		alert("Please wait for the videos to finish uploading.");

		return;
	}

	saveButton.disabled = true;
	saveStatus.textContent = "Saving...";

	const articleData = {
		title,
		language,

		manualDate,

		image,

		body: bodyText,

		gallery: [...galleryImages],

		galleryVideos: [...galleryVideos],

		youtubeVideo: youtube,

		author: user.displayName || user.email,
		authorEmail: user.email,

		updatedAt: serverTimestamp(),
	};

	try {
		if (editingArticleId) {
			await updateDoc(doc(db, "articles", editingArticleId), articleData);
		} else {
			articleData.createdAt = serverTimestamp();

			if (dateValue) {
				articleData.date = new Date(`${dateValue}T12:00:00`);
			} else {
				articleData.date = serverTimestamp();
			}

			await addDoc(collection(db, "articles"), articleData);
		}

		saveStatus.textContent = "Saved successfully!";

		editor.classList.add("hidden");

		editingArticleId = null;

		clearEditor();

		await loadArticles();
	} catch (error) {
		console.error(error);

		saveStatus.textContent = "Failed to save article.";

		alert(error.message);
	} finally {
		saveButton.disabled = false;
	}
});

// ==========================================
// LOAD ARTICLES
// ==========================================

async function loadArticles() {
	articlesList.innerHTML = "Loading articles...";

	try {
		const articlesQuery = query(
			collection(db, "articles"),
			orderBy("date", "desc"),
		);

		const snapshot = await getDocs(articlesQuery);

		if (snapshot.empty) {
			articlesList.innerHTML = "<p>No articles yet.</p>";

			return;
		}

		articlesList.innerHTML = "";

		snapshot.forEach((documentSnapshot) => {
			const article = {
				id: documentSnapshot.id,
				...documentSnapshot.data(),
			};

			const card = document.createElement("div");

			card.className = "article-admin-card";

			let formattedDate = "No date";

			if (article.date?.toDate) {
				formattedDate = article.date
					.toDate()
					.toLocaleDateString("en-GB", {
						day: "numeric",
						month: "long",
						year: "numeric",
					});
			}

			card.innerHTML = `
				<h3>
					${escapeHTML(article.title || "Untitled")}
				</h3>

				<div class="article-meta">
					${article.language === "dv" ? "Dhivehi" : "English"}
					·
					${escapeHTML(article.author || "Unknown")}
					·
					${escapeHTML(formattedDate)}
				</div>

				<div class="article-actions">
					<button
						class="edit-button"
						data-id="${article.id}"
					>
						Edit
					</button>

					<button
						class="delete-button"
						data-id="${article.id}"
					>
						Delete
					</button>
				</div>
			`;

			articlesList.appendChild(card);
		});

		document.querySelectorAll(".edit-button").forEach((button) => {
			button.addEventListener("click", () =>
				editArticle(button.dataset.id),
			);
		});

		document.querySelectorAll(".delete-button").forEach((button) => {
			button.addEventListener("click", () =>
				deleteArticle(button.dataset.id),
			);
		});
	} catch (error) {
		console.error(error);

		articlesList.innerHTML = "<p>Failed to load articles.</p>";
	}
}

// ==========================================
// EDIT ARTICLE
// ==========================================

async function editArticle(id) {
	try {
		const articleSnapshot = await getDoc(doc(db, "articles", id));

		if (!articleSnapshot.exists()) {
			alert("Article not found.");
			return;
		}

		const article = {
			id: articleSnapshot.id,
			...articleSnapshot.data(),
		};

		editingArticleId = id;

		editorTitle.textContent = "Edit Article";

		titleInput.value = article.title || "";

		languageInput.value = article.language || "en";

		uploadedMainImage = article.image || "";

		galleryImages = Array.isArray(article.gallery)
			? [...article.gallery]
			: [];

		galleryVideos = Array.isArray(article.galleryVideos)
			? [...article.galleryVideos]
			: [];

		youtubeVideo = article.youtubeVideo || "";

		imageInput.value = "";
		galleryInput.value = "";
		videoInput.value = "";

		youtubeInput.value = youtubeVideo;

		mainImageStatus.textContent = uploadedMainImage
			? "Existing main image will be kept unless you choose a new one."
			: "";

		galleryImageStatus.textContent =
			galleryImages.length > 0
				? `${galleryImages.length} existing gallery image(s).`
				: "No gallery images.";

		videoStatus.textContent =
			galleryVideos.length > 0
				? `${galleryVideos.length} existing video(s).`
				: "No videos.";

		renderGalleryPreview();
		renderVideoPreview();

		manualDateInput.value = article.manualDate || "";

		bodyInput.value = article.body || "";

		if (article.date?.toDate) {
			const date = article.date.toDate();

			const year = date.getFullYear();

			const month = String(date.getMonth() + 1).padStart(2, "0");

			const day = String(date.getDate()).padStart(2, "0");

			dateInput.value = `${year}-${month}-${day}`;
		} else {
			dateInput.value = "";
		}

		editor.classList.remove("hidden");

		window.scrollTo({
			top: editor.offsetTop - 20,
			behavior: "smooth",
		});
	} catch (error) {
		console.error(error);

		alert("Failed to load article.");
	}
}

// ==========================================
// DELETE ARTICLE
// ==========================================

async function deleteArticle(id) {
	const confirmed = confirm("Are you sure you want to delete this article?");

	if (!confirmed) return;

	try {
		await deleteDoc(doc(db, "articles", id));

		await loadArticles();
	} catch (error) {
		console.error(error);

		alert("Failed to delete article: " + error.message);
	}
}

// ==========================================
// CLEAR EDITOR
// ==========================================

function clearEditor() {
	titleInput.value = "";

	languageInput.value = "en";

	imageInput.value = "";

	dateInput.value = "";

	manualDateInput.value = "";

	bodyInput.value = "";

	galleryInput.value = "";

	videoInput.value = "";

	youtubeInput.value = "";

	uploadedMainImage = "";

	galleryImages = [];

	galleryVideos = [];

	youtubeVideo = "";

	mainImageStatus.textContent = "";

	galleryImageStatus.textContent = "";

	videoStatus.textContent = "";

	saveStatus.textContent = "";

	renderGalleryPreview();

	renderVideoPreview();
}

// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(value = "") {
	return String(value)
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#039;");
}
