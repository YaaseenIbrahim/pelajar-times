const hero = document.querySelector(".hero");
const masthead = document.querySelector(".masthead");
const memoryWall = document.getElementById("memory-wall");

let photos = [];
const memoryImages = [
	"images/memories/memory (1).jpeg",
	"images/memories/memory (2).jpeg",
	"images/memories/memory (3).jpeg",
	"images/memories/memory (4).jpeg",
	"images/memories/memory (5).jpeg",
	"images/memories/memory (6).jpeg",
	"images/memories/memory (7).jpeg",
	"images/memories/memory (8).jpeg",
	"images/memories/memory (9).jpeg",
	"images/memories/memory (10).jpeg",
	"images/memories/memory (11).jpeg",
	"images/memories/memory (12).jpeg",
];

function createMemoryWall() {
	if (!memoryWall) return;

	memoryWall.innerHTML = "";

	memoryImages.forEach((imagePath) => {
		const memory = document.createElement("div");

		memory.className = "memory";

		const image = document.createElement("img");

		image.src = imagePath;
		image.alt = "";

		memory.appendChild(image);

		memoryWall.appendChild(memory);
	});
}

createMemoryWall();

function refreshMemoryPhotos() {
	photos = Array.from(document.querySelectorAll(".memory"));
}

refreshMemoryPhotos();

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

	hero.style.setProperty("--bg-x", `${currentX * 35}px`);
	hero.style.setProperty("--bg-y", `${currentY * 35}px`);

	masthead.style.transform = `translate(${currentX * -8}px, ${currentY * -8}px)`;

	photos.forEach((photo) => {
		photo.style.translate = `${currentX * 10}px ${currentY * 10}px`;
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
				{ translate: "0px 0px" },
				{ translate: `${x}px -8px` },
				{ translate: "0px 0px" },
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
