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

export function showTostify(text, color) {
  const modal = document.querySelector(".modal");
  modal.style.backgroundColor = color;
  modal.textContent = text;
  modal.classList.add("active");
  setTimeout(() => {
    modal.classList.remove("active");
  }, 3000);
}
export async function getDataFromDataBase(period = "7-2020") {
  const user = firebaseApp.auth().currentUser;
  if (!user) return;
  const uid = user.uid;
  const snap = await firebaseApp.firestore().collection(uid).doc(period).get();
  if (snap.exists) {
    const mounthlyLimit = snap.data().limit;
    const incomes = snap.data().przychody;
    const spendings = snap.data().wydatki;
    return [mounthlyLimit, spendings, incomes];
  } else {
    return [];
  }
}
export function logUser() {
  const email = "Sebastian723@interia.eu";
  const password = "Sebek7234";
  console.log("loggin");
  firebaseApp
    .auth()
    .signInWithEmailAndPassword(email, password)
    .then((user) => {
      console.log("you are loged");
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
