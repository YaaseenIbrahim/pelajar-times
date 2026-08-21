import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

const firebaseConfig = {
	apiKey: "AIzaSyDXjf4mzMvzbHjiitM8mp1ZfLm7ye3jdQ4",
	authDomain: "pelajar-times.firebaseapp.com",
	projectId: "pelajar-times",
	storageBucket: "pelajar-times.firebasestorage.app",
	messagingSenderId: "128391732655",
	appId: "1:128391732655:web:5478548957ae390e38635a",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
