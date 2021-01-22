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

    emailjs.send(
      "service_qhiee3g",
      "template_ro2rfhf",
      templateParams,
      "user_rKSxubFxTbH8A7cKq1w1S"
    );
    emailEl.reset();
  });
});
