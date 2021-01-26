import { showTostify } from "./helpers.js";
$(document).ready(function () {
  $(window).scroll(function () {
    // sticky navbar on scroll script
    if (this.scrollY > 20) {
      $(".navbar").addClass("sticky");
    } else {
      $(".navbar").removeClass("sticky");
    }

    //scroll-up button show/hide
    if (this.scrollY > 500) {
      $(".scroll-up-btn").addClass("show");
    } else {
      $(".scroll-up-btn").removeClass("show");
    }
  });
  //slide-up script
  $(".scroll-up-btn").click(function () {
    $("html").animate({ scrollTop: 0 });
    //removing smooth scroll on slide-up btn click
    $("html").css("scrollBehavior", "auto");
  });

  $(".navbar .menu li a").click(function () {
    // applying smooth scroll on click menu
    $("html").css("scrollBehavior", "smooth");
  });

  // toggle menu/navbar script
  $(".menu-button").click(function () {
    $(".navbar .menu").toggleClass("active");
    $(".menu-button i").toggleClass("active");
  });

  //typing text animation
  var typed = new Typed(".typing-1", {
    strings: ["Wynagrodzenie", "Praca dodatkowa", "Inne"],
    typeSpeed: 100,
    backSpeed: 60,
    loop: true,
  });
  var typed = new Typed(".typing-2", {
    strings: ["Wynagrodzenie z firmy", "Wynagrodzenie za prace dodatkową"],
    typeSpeed: 100,
    backSpeed: 60,
    loop: true,
  });
  var typed = new Typed(".typing-3", {
    strings: ["8000", "5500", "6800", "4200"],
    typeSpeed: 100,
    backSpeed: 60,
    loop: true,
  });
  var typed = new Typed(".typing-4", {
    strings: [
      "Dom",
      "Elektronika",
      "Jedzenie",
      "Odzież",
      "Prezenty",
      "Rozrywka",
      "Transport",
      "Zdrowie",
      "Inne",
    ],
    typeSpeed: 100,
    backSpeed: 60,
    loop: true,
  });
  var typed = new Typed(".typing-5", {
    strings: [
      "Zakup telefonu",
      "Rachunki",
      "Zakupy w markecie",
      "Zakup spodni oraz koszulki",
      "Prezent dla drugiej połówki",
      "Wypad do kina",
      "Paliwo",
      "Leki w aptece",
    ],
    typeSpeed: 100,
    backSpeed: 60,
    loop: true,
  });
  var typed = new Typed(".typing-6", {
    strings: ["500", "30", "80", "430", "120", "270"],
    typeSpeed: 100,
    backSpeed: 60,
    loop: true,
  });

  //carousel script
  $(".carousel").owlCarousel({
    margin: 20,
    loop: true,
    autoplayTimeOut: 2000,
    autoplayHoverPause: true,
    responsive: {
      0: {
        items: 1,
        nav: false,
      },
      600: {
        items: 2,
        nav: false,
      },
      1000: {
        items: 3,
        nav: false,
      },
    },
  });
  //Sending email
  const emailEl = document.querySelector(".contact-email");

  emailEl.addEventListener("submit", (e) => {
    e.preventDefault();
    const firstName = e.target.elements.firstName.value;
    const email = e.target.elements.email.value;
    const subject = e.target.elements.subject.value;
    const content = e.target.elements.content.value;
    const templateParams = {
      name: firstName,
      email,
      subject,
      content,
    };

    emailjs
      .send(
        "service_qhiee3g",
        "template_ro2rfhf",
        templateParams,
        "user_rKSxubFxTbH8A7cKq1w1S"
      )
      .then(() => showTostify("Widaomość została wysłana"))
      .catch((err) => showTostify("Widaomość nie została wysłana", "#df2424"));
    emailEl.reset();
  });
});
