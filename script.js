const memoryWall = document.getElementById("memory-wall");

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

function random(min, max) {
	return Math.random() * (max - min) + min;
}

function createMemory(image) {
	const frame = document.createElement("div");

	frame.className = "memory";

	const img = document.createElement("img");

	img.src = `images/${image}`;

	img.loading = "lazy";

	frame.appendChild(img);

	const isMobile = window.innerWidth < 800;

	/*
        Random sizes
        but controlled
    */

	const size = isMobile ? random(90, 140) : random(130, 240);

	frame.style.width = `${size}px`;

	frame.style.height = `${size * 1.25}px`;

	/*
        Safe positioning
        Keeps center clear
    */

	let x;
	let y;

	if (isMobile) {
		x = random(3, 75);

		y = random(5, 80);
	} else {
		x = random(2, 82);

		y = random(5, 82);
	}

	frame.style.left = `${x}%`;

	frame.style.top = `${y}%`;

	/*
        Same opacity
    */

	frame.style.opacity = "0.5";

	/*
        Random rotation only
    */

	const rotation = random(-18, 18);

	frame.style.transform = `rotate(${rotation}deg)`;

	/*
        Same layer
        ALWAYS behind title
    */

	frame.style.zIndex = "2";

	/*
        Slight movement variation
    */

	frame.style.setProperty("--float-time", `${random(8, 14)}s`);

	frame.style.setProperty("--float-delay", `${random(-5, 0)}s`);

	memoryWall.appendChild(frame);
}

memories.forEach((image) => {
	createMemory(image);
});

/*
    Mouse parallax
    Background + photos + title
*/

const hero = document.querySelector(".hero");

const masthead = document.querySelector(".masthead");

const photos = document.querySelectorAll(".memory");

document.addEventListener("mousemove", (e) => {
	if (window.innerWidth < 800) return;

	const x = e.clientX / window.innerWidth - 0.5;

	const y = e.clientY / window.innerHeight - 0.5;

	/*
        Background moves most
    */

	hero.style.setProperty(
		"--bg-x",

		`${x * 30}px`,
	);

	hero.style.setProperty(
		"--bg-y",

		`${y * 30}px`,
	);

	/*
        Photos move slightly
    */

	photos.forEach((photo) => {
		photo.style.marginLeft = `${x * 12}px`;

		photo.style.marginTop = `${y * 12}px`;
	});

	/*
        Title moves least
    */

	masthead.style.transform = `
    translate(
    ${x * -8}px,
    ${y * -8}px
    )
    `;
});

/*
    Mobile gentle movement
*/

if (window.innerWidth < 800) {
	photos.forEach((photo) => {
		const amountX = random(-12, 12);

		const amountY = random(-15, 15);

		photo.animate(
			[
				{
					transform: photo.style.transform,
				},

				{
					transform: `
                ${photo.style.transform}
                translate(
                ${amountX}px,
                ${amountY}px
                )
                `,
				},
			],

			{
				duration: random(9000, 15000),

				iterations: Infinity,

				direction: "alternate",

				easing: "ease-in-out",
			},
		);
	});
}
