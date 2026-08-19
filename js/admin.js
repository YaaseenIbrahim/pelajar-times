import { db } from "./firebase.js";

import {
	collection,
	getDocs,
	addDoc,
	updateDoc,
	deleteDoc,
	doc,
	serverTimestamp,
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
const galleryImageStatus = document.getElementById("gallery-image-status");
const dateInput = document.getElementById("article-date-input");
const manualDateInput = document.getElementById("article-manual-date-input");
const bodyInput = document.getElementById("article-body-input");
const galleryInput = document.getElementById("article-gallery-input");

const saveButton = document.getElementById("save-article");
const cancelButton = document.getElementById("cancel-edit");

const saveStatus = document.getElementById("save-status");

const articlesList = document.getElementById("articles-list");

// ==========================================
// STATE
// ==========================================

let editingArticleId = null;
let uploadedMainImage = "";
let uploadedGalleryImages = [];
// ==========================================
// CLOUDINARY
// ==========================================

const CLOUDINARY_CLOUD_NAME = "brjed17u";
const CLOUDINARY_UPLOAD_PRESET = "pelajar-times";
// ==========================================
// UPLOAD IMAGE TO CLOUDINARY
// ==========================================

async function uploadToCloudinary(file) {
	const formData = new FormData();

	formData.append("file", file);
	formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

	const response = await fetch(
		`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
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
// MAIN IMAGE SELECTION
// ==========================================

imageInput.addEventListener("change", async () => {
	const file = imageInput.files[0];

	if (!file) {
		return;
	}

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
// GALLERY IMAGE SELECTION
// ==========================================

galleryInput.addEventListener("change", async () => {
	const files = Array.from(galleryInput.files);

	if (files.length === 0) {
		return;
	}

	galleryImageStatus.textContent = `Uploading ${files.length} gallery image(s)...`;

	try {
		const uploadedUrls = [];

		for (const file of files) {
			const url = await uploadToCloudinary(file);

			uploadedUrls.push(url);
		}

		uploadedGalleryImages = uploadedUrls;

		galleryImageStatus.textContent = `${uploadedUrls.length} gallery image(s) uploaded successfully.`;
	} catch (error) {
		console.error(error);

		uploadedGalleryImages = [];

		galleryImageStatus.textContent = "Failed to upload gallery images.";

		alert("One or more gallery images failed to upload.");
	}
});
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

	const email = user.email?.toLowerCase();

	if (!email) {
		await signOut(auth);
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

	const gallery = uploadedGalleryImages;

	if (!title || !bodyText) {
		alert("Please enter a title and article body.");

		return;
	}

	if (imageInput.files.length > 0 && !uploadedMainImage) {
		alert("Please wait for the main image to finish uploading.");

		return;
	}

	if (galleryInput.files.length > 0 && uploadedGalleryImages.length === 0) {
		alert("Please wait for the gallery images to finish uploading.");

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

		gallery,

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
		const snapshot = await getDocs(collection(db, "articles"));

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

			card.innerHTML = `
                <h3>${escapeHTML(article.title || "Untitled")}</h3>

               <div class="article-meta">
	${article.language === "dv" ? "Dhivehi" : "English"}
	·
	${escapeHTML(article.author || "Unknown")}
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
		const snapshot = await getDocs(collection(db, "articles"));

		let article = null;

		snapshot.forEach((documentSnapshot) => {
			if (documentSnapshot.id === id) {
				article = {
					id: documentSnapshot.id,
					...documentSnapshot.data(),
				};
			}
		});

		if (!article) {
			alert("Article not found.");

			return;
		}

		editingArticleId = id;

		editorTitle.textContent = "Edit Article";

		titleInput.value = article.title || "";

		languageInput.value = article.language || "en";

		uploadedMainImage = article.image || "";

		uploadedGalleryImages = Array.isArray(article.gallery)
			? [...article.gallery]
			: [];

		imageInput.value = "";
		galleryInput.value = "";

		mainImageStatus.textContent = uploadedMainImage
			? "Existing main image will be kept unless you choose a new one."
			: "";

		galleryImageStatus.textContent =
			uploadedGalleryImages.length > 0
				? `${uploadedGalleryImages.length} existing gallery image(s) will be kept unless you choose new ones.`
				: "";
		manualDateInput.value = article.manualDate || "";
		bodyInput.value = article.body || "";
		galleryInput.value = Array.isArray(article.gallery)
			? article.gallery.join("\n")
			: "";

		if (article.date?.toDate) {
			const date = article.date.toDate();

			const year = date.getFullYear();

			const month = String(date.getMonth() + 1).padStart(2, "0");

			const day = String(date.getDate()).padStart(2, "0");

			dateInput.value = `${year}-${month}-${day}`;
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

	uploadedMainImage = "";
	uploadedGalleryImages = [];

	mainImageStatus.textContent = "";
	galleryImageStatus.textContent = "";

	saveStatus.textContent = "";
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
