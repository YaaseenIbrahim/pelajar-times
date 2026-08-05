const hero = document.querySelector(".hero");
const masthead = document.querySelector(".masthead");
const photos = document.querySelectorAll(".memory");
const memoryWall = document.getElementById("memory-wall");
const memories = [
	"memory (1).jpeg",
	"memory (2).jpeg",
	"memory (3).jpeg",
	"memory (4).jpeg",
	"memory (5).jpeg",
	"memory (6).jpeg",
	"memory (7).jpeg",
	"memory (8).jpeg",
	"memory (9).jpeg",
	"memory (10).jpeg",
	"memory (11).jpeg",
	"memory (12).jpeg",
];

memories.forEach((image) => {
	const frame = document.createElement("div");
	frame.className = "memory";

	const img = document.createElement("img");
	img.src = `images/memories/${image}`;
	img.loading = "lazy";

	frame.appendChild(img);
	memoryWall.appendChild(frame);
});

/*
=====================================
Mouse Tracking
=====================================
*/
let mouseX = 0;
let mouseY = 0;

let currentX = 0;
let currentY = 0;

window.addEventListener("mousemove", (e) => {
	if (window.innerWidth <= 700) return;

	mouseX = e.clientX / window.innerWidth - 0.5;
	mouseY = e.clientY / window.innerHeight - 0.5;
});

/*
=====================================
Parallax Animation
=====================================
*/

function animate() {
	currentX += (mouseX - currentX) * 0.08;
	currentY += (mouseY - currentY) * 0.08;

	/*
	Background
	*/

	hero.style.setProperty("--bg-x", `${currentX * 35}px`);
	hero.style.setProperty("--bg-y", `${currentY * 35}px`);

	/*
	Title
	*/

	masthead.style.transform = `translate(${currentX * -8}px,${currentY * -8}px)`;

	/* Card Only translate. CSS keeps all the positions and rotations. */

	photos.forEach((photo) => {
		photo.style.translate = `
			${currentX * 10}px
			${currentY * 10}px
		`;
	});

	requestAnimationFrame(animate);
}

animate();

/*
=====================================
Mobile Floating
=====================================
*/

if (window.innerWidth <= 700) {
	photos.forEach((photo, index) => {
		const x = index % 2 === 0 ? 6 : -6;

		photo.animate(
			[
				{
					translate: "0px 0px",
				},

				{
					translate: `${x}px -8px`,
				},

				{
					translate: "0px 0px",
				},
			],

			{
				duration: 9000 + index * 350,
				iterations: Infinity,
				easing: "ease-in-out",
			},
		);
	});
}

/*
    Reload when switching
    between desktop and mobile
*/

let wasMobile = window.innerWidth <= 600;

window.addEventListener("resize", () => {
	const isMobile = window.innerWidth <= 600;

	if (wasMobile !== isMobile) {
		location.reload();
	}

	wasMobile = isMobile;
});

/*
=====================================
News Articles
=====================================
*/

const news = [
	{
		title: "lorem ipsum blah blah",
		date: "July 28, 2026",
		image: "images/thumbnails/thumbnail (1).jpeg",
		link: "article.html",
	},

	{
		title: "this is testing a very long sentence to see what it would do to the card and if it would break the layout or not",
		date: "July 23, 2026",
		image: "images/thumbnails/thumbnail (2).jpeg",
		link: "article.html",
	},

	{
		title: "short",
		date: "July 17, 2026",
		image: "images/thumbnails/thumbnail (3).jpeg",
		link: "article.html",
	},

	{
		title: "lorem",
		date: "July 10, 2026",
		image: "images/thumbnails/thumbnail (4).jpeg",
		link: "article.html",
	},

	{
		title: "goku eats pokemon in library",
		date: "July 2, 2026",
		image: "images/thumbnails/thumbnail (5).jpeg",
		link: "article.html",
	},

	{
		title: "Breaking: laisa Finally Pays Back RM5",
		date: "June 18, 2026",
		image: "images/thumbnails/thumbnail (6).jpeg",
		link: "article.html",
	},
	{
		title: "Breaking: laisa Finally Pays Back RM5",
		date: "June 18, 2026",
		image: "images/thumbnails/thumbnail (6).jpeg",
		link: "article.html",
	},
	{
		title: "Breaking: laisa Finally Pays Back RM5",
		date: "June 18, 2026",
		image: "images/thumbnails/thumbnail (6).jpeg",
		link: "article.html",
	},
	{
		title: "Breaking: laisa Finally Pays Back RM5",
		date: "June 18, 2026",
		image: "images/thumbnails/thumbnail (6).jpeg",
		link: "article.html",
	},
];

const newsGrid = document.getElementById("news-grid");

news.forEach((article) => {
	const card = document.createElement("article");

	card.className = "news-card";

	card.innerHTML = `
		<div class="news-thumb">
			<img src="${article.image}" alt="${article.title}">
		</div>

		<div class="news-content">
			<div class="news-date">
				${article.date}
			</div>

			<h3 class="news-title-card">
				${article.title}
			</h3>
		</div>
	`;

	card.addEventListener("click", () => {
		window.location.href = article.link;
	});

	newsGrid.appendChild(card);
});

const dailyQuote = {
	text: "I'm not late. Everyone else just came early.",
	author: "Laisa",
};

document.getElementById("daily-quote-preview").textContent =
	`"${dailyQuote.text}"`;

document.getElementById("daily-quote-author").textContent =
	`— ${dailyQuote.author}`;