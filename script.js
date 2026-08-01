const memoryWall = document.getElementById("memory-wall");

const hero = document.querySelector(".hero");

const masthead = document.querySelector(".masthead");

const memories = [
	"pelajar background 1.jpeg",
	"pelajar background 2.jpeg",
	"pelajar background 3.jpeg",
	"pelajar background 4.jpeg",
	"pelajar background 5.jpeg",
	"pelajar background 6.jpeg",
	"pelajar background 7.jpeg",
	"pelajar background 8.jpeg",
	"pelajar background 9.jpeg",
	"pelajar background 10.jpeg",
	"pelajar background 11.jpeg",
	"pelajar background 12.jpeg",
];

memories.forEach((image) => {
	const frame = document.createElement("div");

	frame.className = "memory";

	const img = document.createElement("img");

	img.src = `images/${image}`;

	img.loading = "lazy";

	img.draggable = false;

	frame.appendChild(img);

	memoryWall.appendChild(frame);
});
/*
    PARALLAX
*/

const photos = document.querySelectorAll(".memory");

let mouseX = 0;
let mouseY = 0;

let currentX = 0;
let currentY = 0;

document.addEventListener("mousemove", (e) => {
	if (window.innerWidth <= 700) return;

	mouseX = e.clientX / window.innerWidth - 0.5;
	mouseY = e.clientY / window.innerHeight - 0.5;
});

/*
    Save each photo's original rotation
*/

photos.forEach((photo) => {
	photo.dataset.baseTransform = window.getComputedStyle(photo).transform;
});

/*
    Main animation loop
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

	masthead.style.transform = `
translate(
${currentX * -8}px,
${currentY * -8}px
)
`;

	/*
        Photos
    */

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
    Mobile floating animation
*/

if (window.innerWidth <= 700) {
	photos.forEach((photo, index) => {
		const x = index % 2 === 0 ? 8 : -8;

		const y = index % 3 === 0 ? -10 : -6;

		photo.animate(
			[
				{
					translate: "0px 0px",
				},

				{
					translate: `${x}px ${y}px`,
				},

				{
					translate: "0px 0px",
				},
			],

			{
				duration: 8500 + index * 450,

				iterations: Infinity,

				direction: "alternate",

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
