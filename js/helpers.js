const firebaseConfig = {
  apiKey: "AIzaSyBhxlyjVkLCwLgBsx57ca9Hgo5riF8Mmkw",
  authDomain: "budget-app-dade0.firebaseapp.com",
  databaseURL: "https://budget-app-dade0-default-rtdb.firebaseio.com",
  projectId: "budget-app-dade0",
  storageBucket: "budget-app-dade0.appspot.com",
  messagingSenderId: "200568586554",
  appId: "1:200568586554:web:79b4ad80c286c4cc279003",
};
export const firebaseApp = firebase.initializeApp(firebaseConfig);

export function showTostify(text, type) {
  const succesColor = "#3db134";
  const errorColor = "#df2424";
  const color = type === "success" ? succesColor : errorColor;
  const modal = document.querySelector(".modal--info");
  modal.style.backgroundColor = color;
  modal.textContent = text;
  modal.classList.add("active");
  setTimeout(() => {
    modal.classList.remove("active");
  }, 4000);
}
export async function getDataFromDataBase(period = "7-2020") {
  const user = firebaseApp.auth().currentUser;
  if (!user) return;
  const uid = user.uid;
  const snap = await firebaseApp.firestore().collection(uid).doc(period).get();
  if (snap.exists) {
    const mounthlyLimit = snap.data().limit;
    const transactions = snap.data().transactions || [];
    return [mounthlyLimit, transactions];
  } else {
    return [];
  }
}
export function logUser() {
  const email = "Sebastian723@interia.eu";
  const password = "123456";

  firebaseApp
    .auth()
    .signInWithEmailAndPassword(email, password)
    .then((user) => {})
    .catch((err) => {
      console.log(err);
    });
}
export function userIsActive() {
  return new Promise((resolve, reject) =>
    firebaseApp.auth().onAuthStateChanged((user) => {
      if (user) {
        console.log("user is active");
        return resolve(true);
      } else {
        console.log("no user");
        return resolve(false);
      }
    })
  );
}
export async function switchSignInSingOut() {
  const isLogged = await userIsActive();
  const userStatus = document.querySelector(".menu>li:last-child a");
  if (isLogged) {
    userStatus.textContent = "Wyloguj";
    userStatus.addEventListener("click", () => {
      firebaseApp
        .auth()
        .signOut()
        .then(() => {
          window.location.href = "/index.html";
        })
        .catch((error) => {
          console.log(error);
        });
    });
  } else {
    userStatus.textContent = "Zaloguj";
    userStatus.addEventListener("click", () => {
      window.location.href = "/signUp.html";
    });
  }
}
