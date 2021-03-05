import { firebaseApp, showTostify } from "./helpers.js";
const sign_in_btn = document.querySelector("#sign-in-btn");
const sign_up_btn = document.querySelector("#sign-up-btn");
const container = document.querySelector(".container");
sign_up_btn.addEventListener("click", () => {
  container.classList.add("sign-up-mode");
});

sign_in_btn.addEventListener("click", () => {
  container.classList.remove("sign-up-mode");
});

const signInForm = document.querySelector(".sign-in-form");
const signUpForm = document.querySelector(".sign-up-form");

signInForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = e.target.elements.email.value;
  const password = e.target.elements.password.value;
  signIn(email, password);
});
function signIn(email, password) {
  firebaseApp
    .auth()
    .signInWithEmailAndPassword(email, password)
    .then((user) => {
      showTostify(
        "Zostałeś zalogowany. Za chwilę zostaniesz przekierowany na stronę główną.",
        "success"
      );
      setTimeout(() => {
        window.location.href = "/budget.html";
      }, 2000);
    })
    .catch((err) => {
      showTostify("Coś poszło nie tak, spróbuj ponownie. ", "red");
    });
}
signUpForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = e.target.elements.email.value;
  const password = e.target.elements.password.value;
  signUp(email, password);
});
function signUp(email, password) {
  firebaseApp
    .auth()
    .createUserWithEmailAndPassword(email, password)
    .then((user) => {
      showTostify(
        "Zostałeś zarejestrowany. Dziękujemy za zaufanie :)",
        "success"
      );
      setTimeout(() => {
        window.location.href = "/budget.html";
      }, 2000);
    })
    .catch((err) =>
      showTostify("Coś poszło nie tak, spróbuj ponownie.", "red")
    );
}
$(document).ready(function () {
  $(window).scroll(function () {
    // toggle menu/navbar script
    $(".menu-button").click(function () {
      $(".navbar .menu").toggleClass("active");
      $(".menu-button i").toggleClass("active");
    });
  });
});
