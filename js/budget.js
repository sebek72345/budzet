import {
  firebaseApp,
  showTostify,
  getDataFromDataBase,
  userIsActive,
  logUser,
  switchSignInSingOut,
} from "./helpers.js";
const translateCategories = {
  Dom: "House.svg",
  Elektronika: "Electronics.svg",
  Jedzenie: "Food.svg",
  Odzież: "Clothes.svg",
  Prezenty: "Gifts.svg",
  Rozrywka: "Entertainment.svg",
  Transport: "Transport.svg",
  Zdrowie: "Health.svg",
  Inne: "Other.svg",
};
const colors = [
  "#F3722C",
  "#F8961E",
  "#F9844A",
  "#F9C74F",
  "#90BE6D",
  "#43AA8B",
  "#4D908E",
  "#577590",
  "#277DA1",
];
const selectedMonth = document.querySelector("#month");
const selectedYear = document.querySelector("#year");
const changeLimit = document.querySelector(".change-limit");
let isLoaded = false;
switchSignInSingOut();
changeLimit.addEventListener("keydown", (e) => changeMounthlyLimit(e));
selectedMonth.addEventListener("change", reloadData);
selectedYear.addEventListener("change", reloadData);
async function changeMounthlyLimit(e) {
  e.preventDefault();
  const user = firebaseApp.auth().currentUser;
  const userId = user.uid;
  if (!userId) return;
  if (userId && e.key === "Enter") {
    await firebaseApp
      .firestore()
      .collection(userId)
      .doc(`${selectedMonth.value}-${selectedYear.value}`)
      .set(
        {
          limit: Number(e.target.value),
        },
        { merge: true }
      )
      .then(async () => {
        showTostify("Twój miesięczny limit został", "green");
        const data = await getDataFromDataBase(
          `${selectedMonth.value}-${selectedYear.value}`
        );
        const [mounthlyLimit, transactions] = data;
        const spendings = transactions.filter((item) => !item.income);
        const allSpending = getSum(spendings);
        drawLimitChart(mounthlyLimit, allSpending);
      })
      .catch((err) => {
        showTostify("Twój miesięczny limit NIE  został", "red");
      });
  }
  changeLimit.value += e.key;
}

function reloadData() {
  isLoaded = false;
  deleteElements();
  removeSpendingCategories();
  spinnersVisability("block");
  removeChats();
  init();
}

init();
async function init() {
  const daysInMonth = new Date(
    selectedYear.value,
    selectedMonth.value,
    0
  ).getDate();
  await logUser();
  await userIsActive();
  const arrayOfDays = getArrayOfDays(daysInMonth);
  const data = await getDataFromDataBase(
    `${selectedMonth.value}-${selectedYear.value}`,
    isLoaded
  );
  const [mounthlyLimit, transactons] = data;
  let spendings = [];
  let incomes = [];
  if (transactons) {
    spendings = transactons.filter((item) => !item.income);
    incomes = transactons.filter((item) => item.income);
    isLoaded = true;
  }

  if (!spendings.length) {
    showTostify("W wybranym przez Ciebie okresie nie ma wydatków", "red");
    spinnersVisability("none");
    restoreSpeedometerAndLimitCharts();
    displayCharts();
    drawLimitChart(mounthlyLimit, null);
    drawSpeedometer();
    document.querySelector(".most-spending>h3").textContent =
      "Brak kategorii do wyświetlenia.";
    return;
  }

  const sumIncome = getSum(incomes);
  const spendingByDay = sortSpendingByDay(spendings, arrayOfDays);
  const [categories, amounts] = reduceArrayWithTheSameCategory(spendings);
  if (isLoaded) {
    displayCharts(categories, amounts, spendingByDay, arrayOfDays);
    spinnersVisability("none");
    startAnimation();
    restoreSpeedometerAndLimitCharts();
    document.querySelector(".most-spending>h3").textContent =
      "Najwięcej wydajesz na poniższe kategorie produktów:";
  }

  const allSpending = getSum(spendings);
  drawLimitChart(mounthlyLimit, allSpending);
  drawSpeedometer(sumIncome, allSpending);
  addSpendingCategories(categories, amounts);
}

function drawLimitChart(limit, totalSpending) {
  const defaultValue = totalSpending === null;
  const limitSpendig = limit === undefined;
  const percentage = document.querySelector(".percentage");
  const limitAmountEl = document.querySelector("#limit-amount");
  const restAmountEl = document.querySelector("#rest-amount");
  const percent = limit && Number(((totalSpending * 100) / limit).toFixed(2));
  let restAmount = defaultValue ? 0 : (limit - totalSpending).toFixed(2);
  document.documentElement.style.setProperty(
    "--circle",
    `${defaultValue ? "0" : percent}`
  );
  console.log(restAmount, percent);
  restAmount = restAmount < -0.1 ? "Jesteś na minusie" : `${restAmount} zł`;
  percentage.textContent = defaultValue ? "0%" : `${percent}%`;
  limitAmountEl.textContent = limitSpendig ? "Ustal swój limit" : limit + " zł";
  restAmountEl.textContent = `${defaultValue ? "Brak danych" : restAmount}`;

  switch (true) {
    case percent < 25:
      document.documentElement.style.setProperty("--stroke-color", colors[4]);
      break;
    case percent < 25:
      document.documentElement.style.setProperty("--stroke-color", colors[3]);
      break;
    case percent < 90:
      document.documentElement.style.setProperty("--stroke-color", colors[1]);
      break;
    default:
      document.documentElement.style.setProperty(
        "--stroke-color",
        "rgb(209, 55, 55)"
      );
  }
}
function drawSpeedometer(sumIncomes, sumSpendings) {
  const defaultValue = sumIncomes === undefined && sumSpendings === undefined;
  let percent = ((sumSpendings * 100) / sumIncomes).toFixed(0);
  percent = percent > 100 ? 100 : percent;
  const deg = (percent * 180) / 100;
  document.documentElement.style.setProperty(
    "--speedometer-rotare",
    `${defaultValue ? 0 : deg}deg`
  );
  const spedingPercent = document.querySelector(".spending-percent");
  spedingPercent.textContent = `${percent >= 100 ? "powyżej " : ""}${
    defaultValue ? 0 : percent
  } %`;
}
function addSpendingCategories(categories, amounts) {
  const categoriesList = document.querySelector(".category-wrapper");
  if (!categories.length) {
    categoriesList.innerHTML =
      '<h5 class="no-category">Nie jesteś zalogowany albo nie masz wydatków w tym miesiącu</h5>';
    return;
  }
  const temp = document.querySelector("#category-clone");
  categories.forEach((category, index) => {
    if (index > 4) return;
    const categoryClone = temp.content.cloneNode(true);
    const img = categoryClone.querySelector("img");
    img.setAttribute("alt", `${category.categoryName} icon`);
    img.setAttribute(
      "src",
      `../assets/categories/${translateCategories[category]}`
    );
    categoryClone.querySelector(".category-name").textContent = category;
    categoryClone.querySelector(
      ".category-amount"
    ).textContent = `${amounts[index]} zł`;
    categoriesList.append(categoryClone);
  });
}

function categoryExpencesChart(categories = ["Brak danych"], values = [1]) {
  const canvas = document.getElementById("doughnut-chart");
  const ctx = canvas.getContext("2d");
  const graph = new Chart(ctx, {
    type: "pie",
    data: {
      labels: categories.map((category) => category),
      datasets: [
        {
          label: "Population (millions)",
          backgroundColor: [
            colors[0],
            colors[1],
            colors[2],
            colors[3],
            colors[4],
            colors[5],
            colors[6],
            colors[7],
            colors[8],
          ],
          data: values.map((value) => value),
        },
      ],
    },
    options: {
      elements: { arc: { borderWidth: 0 } },
      legend: { labels: { boxWidth: 15, fontColor: "#050202" } },
      tooltips: {
        displayColors: false,
        callbacks: {
          title: function (tooltipItem, data) {
            return "";
          },
          label: function (tooltipItem, data) {
            var dataset = data.datasets[tooltipItem.datasetIndex];
            var total = dataset.data.reduce(function (
              previousValue,
              currentValue,
              currentIndex,
              array
            ) {
              return previousValue + currentValue;
            });
            var currentValue = dataset.data[tooltipItem.index];
            var percentage = Math.floor((currentValue / total) * 100 + 0.5);
            const category = data.labels[tooltipItem.index];
            return categories.length > 1
              ? `${percentage}% wydałeś na ${category}`
              : "Brak wydatków";
          },
        },
      },
      title: {
        display: true,
        text: "Wydatki względem kategorii [zł]",
        fontColor: "#050202",
      },
      aspectRatio: 1,
      responsive: true,
    },
  });
}
function linearChart(expences = [], days = []) {
  const canvas = document.getElementById("line-chart");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth / 3;
  canvas.height = window.innerHeight / 3;
  const graph = new Chart(ctx, {
    type: "bar",
    data: {
      labels: days.map((day) => day),
      xAxisID: "Dni miesiąca",
      datasets: [
        {
          data: expences.map((expence) => expence),
          label: "Wydatki",
          borderColor: "#48c011",
          fill: true,
          backgroundColor: "#2D898B",
          steppedLine: true,
        },
      ],
    },
    options: {
      responsive: true,
      tooltips: {
        displayColors: false,
        callbacks: {
          title: function () {
            return "";
          },
          label: function (tooltipItems) {
            return `${tooltipItems.xLabel} dnia wydałeś ${tooltipItems.yLabel} zł`;
          },
        },
      },
      scales: {
        yAxes: [
          {
            scaleLabel: {
              display: true,
              labelString: "Wydatki [zł]",
              fontSize: 14,
              fontColor: "black",
            },
            gridLines: {
              display: true,
            },
            ticks: {
              beginAtZero: true,
              stepSize: 100,
              fontColor: "black",
            },
          },
        ],
        xAxes: [
          {
            scaleLabel: {
              display: true,
              labelString: "Dzień Miesiąca",
              fontSize: 14,
              fontColor: "black",
            },
            gridLines: {
              display: false,
            },
            ticks: {
              beginAtZero: true,
              maxRotation: 0,
              maxTicksLimit: 18,
              fontColor: "black",
            },
          },
        ],
      },
      legend: {
        display: false,
      },
      title: {
        display: true,
        fontFamily: "Helvetica",
        fontColor: "#050202",
        text:
          expences.length && days.length
            ? "Wydatki każdego dnia miesiąca"
            : "Brak danych",
        fontSize: 18,
      },
    },
  });
}
function getArrayOfDays(days) {
  const arrayOfDays = [];
  for (let index = 1; index <= days; index++) {
    arrayOfDays.push(index);
  }
  return arrayOfDays;
}

function reduceArrayWithTheSameCategory(spendings) {
  let array = reduceArrayOfObjectByKey(spendings, "category");
  const newArray = array.sort((a, b) => {
    if (a.amount > b.amount) return -1;
    return 1;
  }); //sort by higest spending
  const amounts = newArray.map((a) => a.amount);
  const categories = array.map((a) => a.category);
  return [categories, amounts];
}
function getSum(array) {
  if (!array.length) return 0;
  const sum = array.reduce((acc, item) => {
    return (acc += item.amount);
  }, 0);
  return sum;
}
function reduceArrayOfObjectByKey(array, key) {
  let tempObj = {};
  array.forEach((data) => {
    if (tempObj.hasOwnProperty(data[key])) {
      let newAmount = (tempObj[data[key]] + data.amount).toFixed(2);
      tempObj[data[key]] = Number(newAmount);
    } else {
      tempObj[data[key]] = data.amount;
    }
    return;
  });
  let newArray = []; //convert array to object
  for (let prop in tempObj) {
    newArray.push({ [key]: prop, amount: tempObj[prop] });
  }
  return newArray;
}
function sortSpendingByDay(spendings, days) {
  const array = reduceArrayOfObjectByKey(spendings, "date");
  let daysWithSpending = array.map((arr) => {
    const newDate = arr.date.slice(0, 2);
    if (newDate[1] === "/") {
      return { date: Number(newDate.slice(0, -1)), amount: arr.amount };
    }
    return { date: Number(newDate), amount: arr.amount };
  });
  let expencesAssignToDay = new Array(days.length).fill(0);
  days.map((day, index) => {
    daysWithSpending.map(({ date, amount }) => {
      if (day === date) {
        expencesAssignToDay[index] = amount;
      }
    });
  });
  return expencesAssignToDay;
}
function removeSpendingCategories() {
  const categories = document.querySelector(".category-wrapper");
  const text = categories.firstChild;
  const template = text && text.nextSibling;

  while (categories.lastChild && categories.lastChild !== template) {
    categories.removeChild(categories.lastChild);
  }
}
function removeChats() {
  //remove categories chart
  removeChart(".spending-by-categories", "doughnut-chart");
  //remove bar chart
  removeChart(".main-chart-wrapper", "line-chart");
}
function removeChart(wrapperClass, chartClass) {
  const canvas = document.querySelector(`#${chartClass}`);
  const wrapper = document.querySelector(wrapperClass);
  canvas.remove();
  const newCanvas = document.createElement("canvas");
  newCanvas.id = chartClass;

  if (chartClass === "line-chart") {
    const elementBefore = wrapper.querySelector(".most-spending");
    return wrapper.insertBefore(newCanvas, elementBefore);
  }
  wrapper.append(newCanvas);
}
function displayCharts(categories, amounts, spendingByDay, arrayOfDays) {
  categoryExpencesChart(categories, amounts);
  linearChart(spendingByDay, arrayOfDays);
}
function spinnersVisability(visable) {
  const spinners = [...document.getElementsByClassName("loader")];
  spinners.forEach((item) => (item.style.display = visable));
}
function startAnimation() {
  const hand = document.querySelector(".speedometer-arrow");
  const circle = document.querySelector(".circle");

  hand.style.animationPlayState = "running";
  circle.style.animationPlayState = "running";
}
function restoreSpeedometerAndLimitCharts() {
  const speedometer = document.querySelector(".ratio-spending-container");
  const ringChart = document.querySelector(".rest-money-wrapper");
  const mostSpending = document.querySelector(".most-spending>h3");
  const desc = document.querySelector(".spedometer-desc");
  ringChart.style.display = "flex";
  speedometer.style.display = "block";
  mostSpending.style.display = "block";
  desc.style.display = "block";
}
function deleteElements() {
  const speedometer = document.querySelector(".ratio-spending-container");
  const ringChart = document.querySelector(".rest-money-wrapper");
  const mostSpending = document.querySelector(".most-spending>h3");
  const most = document.querySelector(".spedometer-desc");
  console.log(most);
  ringChart.style.display = "none";
  speedometer.style.display = "none";
  mostSpending.style.display = "none";
}
