import { firebaseApp, userIsActive } from "./init-firebase.js";

const form = document.querySelector("form");
console.log(form);
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = e.target.elements.uname.value;
  const password = e.target.elements.psw.value;
  logUser(email, password);
});
function logUser(email, password) {
  const wydatki = [
    {
      id: "_qnab6hsff",
      category: "transport",
      desc: "Wydatki na paliwo",
      amount: 50.35,
      data: "2/01/2021",
    },
    {
      id: "_he8cg7bnp",
      category: "kosmetyki",
      desc: "Wydatki na żel",
      amount: 12.75,
      data: "5/01/2021",
    },
    {
      id: "_bd0u5qzwj",
      category: "dziwczyna",
      desc: "Wydatki na kwiaty",
      amount: 152.35,
      data: "10/01/2021",
    },
    {
      id: "_dfujkyxne",
      category: "transport",
      desc: "Wydatki na paliwo",
      amount: 82.35,
      data: "15/01/2021",
    },
    {
      id: "_lfsnfe8tt",
      category: "relaks",
      desc: "Wydatki na saune",
      amount: 1122.1,
      data: "18/01/2021",
    },
    {
      id: "_dq62efzc1",
      category: "jedzenie",
      desc: "Wydatki na piwczywo",
      amount: 15.54,
      data: "26/01/2021",
    },
    {
      id: "_polc04qs8",
      category: "żarcie",
      desc: "Wydatki na piwo",
      amount: 42.31,
      data: "31/01/2021",
    },
  ];
  /* const email="Sebastian723@interia.eu"
    const password="Sebek7234" */
  firebaseApp
    .auth()
    .createUserWithEmailAndPassword(email, password)
    .then((user) => {
      console.log("Success");
    })
    .catch((err) =>
      firebase
        .auth()
        .signInWithEmailAndPassword(email, password)
        .then((user) => {
          console.log("zalogowano");
          console.log(user);
        })
    );
}
