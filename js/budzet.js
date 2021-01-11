import {
  firebaseApp,
  showTostify,
  getDataFromDataBase,
  userIsActive,
} from "./helpers.js";
const selectedMonth = document.querySelector("#month");
const selectedYear = document.querySelector("#year");
const changeLimit = document.querySelector(".change-limit");
let isLoaded = false;
changeLimit.addEventListener("keydown", (e) => changeMounthlyLimit(e));
selectedMonth.addEventListener("change", reloadData);
selectedYear.addEventListener("change", reloadData);
async function changeMounthlyLimit(e) {
  e.preventDefault();
  const user = firebaseApp.auth().currentUser;
  if (!userId) return;
  const userId = user.uid;
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
        const [mounthlyLimit, spendings, incomes] = data;
        const allSpending = getSum(spendings);
        setLimitChart(mounthlyLimit, allSpending);
      })
      .catch((err) => {
        showTostify("Twój miesięczny limit NIE  został", "red");
        console.log(err);
      });
  }
  changeLimit.value += e.key;
}

function reloadData() {
  console.log("ss");
  isLoaded = false;
  console.log("Sss");
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
  const arrayOfDays = getArrayOfDays(daysInMonth);
  /*  await logUser();  */
  await userIsActive();
  const data = await getDataFromDataBase(
    `${selectedMonth.value}-${selectedYear.value}`,
    isLoaded
  );
  const [mounthlyLimit, spendings, incomes] = data;
  console.log({ data });
  console.log(spendings);
  if (data.length) {
    isLoaded = true;
  }
  if (!spendings) {
    showTostify("W wybranym przez Ciebie okresie nie ma wydatków", "red");
    spinnersVisability("none");
    restoreElements();
    displayCharts();
    setLimitChart();
    setSpeedometer();
    const limitAmountEl = document.querySelector("#limit-amount");
    limitAmountEl.textContent = mounthlyLimit;
    return;
  }

  const sumIncome = getSum(incomes);
  const spendingByDay = sortSpendingByDay(spendings, arrayOfDays);
  const [categories, amounts] = reduceArrayWithTheSameCategory(spendings);
  if (isLoaded) {
    displayCharts(categories, amounts, spendingByDay, arrayOfDays);
    spinnersVisability("none");
    startAnimation();
    restoreElements();
  }

  const allSpending = getSum(spendings);
  setLimitChart(mounthlyLimit, allSpending);
  setSpeedometer(sumIncome, allSpending);
  addSpendingCategories(categories, amounts);
}

function setLimitChart(limit = 3000, totalSpending) {
  const defaultValue = totalSpending === undefined;
  const percentage = document.querySelector(".percentage");
  const limitAmountEl = document.querySelector("#limit-amount");
  const restAmountEl = document.querySelector("#rest-amount");
  const percent = Number(((totalSpending * 100) / limit).toFixed(2));
  let restAmount = (limit - totalSpending).toFixed(2);
  document.documentElement.style.setProperty(
    "--circle",
    `${defaultValue ? "0" : percent}`
  );
  restAmount = restAmount < 0 ? "Jesteś na minusie" : `${restAmount} zł`;
  percentage.textContent = defaultValue ? "0%" : `${percent}%`;
  limitAmountEl.textContent = `${defaultValue ? "Brak danych" : limit} zł`;
  restAmountEl.textContent = `${defaultValue ? "Brak danych" : restAmount}`;
  switch (true) {
    case percent < 25:
      document.documentElement.style.setProperty(
        "--stroke-color",
        "rgb(15, 226, 7)"
      );
      break;
    case percent < 25:
      document.documentElement.style.setProperty(
        "--stroke-color",
        "rgb(233, 219, 24)"
      );
      break;
    case percent < 90:
      document.documentElement.style.setProperty(
        "--stroke-color",
        "rgb(230, 125, 6)"
      );
      break;
    default:
      document.documentElement.style.setProperty(
        "--stroke-color",
        "rgb(219, 14, 14)"
      );
  }
}
function setSpeedometer(sumIncomes, sumSpendings) {
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
    img.setAttribute("src", `../assets/${category}.svg`);
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
            "#3e95cd",
            "#003f5c",
            "#2f4b7c",
            "#665191",
            "#a05195",
            "#d45087",
            "#f95d6a",
            "#ff7c43",
            "#ffa600",
          ],
          data: values.map((value) => value),
        },
      ],
    },
    options: {
      elements: { arc: { borderWidth: 0 } },
      legend: { labels: { boxWidth: 15 } },
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
            return `${percentage}% wydałeś na ${category}`;
          },
        },
      },
      title: {
        display: true,
        text: "Wydatki względem kategorii [zł]",
        color: "black",
      },
      aspectRatio: 1,
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
          backgroundColor: "#328011",
          steppedLine: true,
        },
      ],
    },
    options: {
      tooltips: {
        displayColors: false,
        callbacks: {
          title: function () {
            return "";
          },
          label: function (tooltipItems) {
            return `Wydałeś ${tooltipItems.xLabel} dnia ${tooltipItems.yLabel} zł`;
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
            },
            gridLines: {
              display: true,
            },
            ticks: {
              beginAtZero: true,
              stepSize: 50,
            },
          },
        ],
        xAxes: [
          {
            scaleLabel: {
              display: true,
              labelString: "Dzień Miesiąca",
              fontSize: 14,
            },
            ticks: {
              beginAtZero: true,
              maxRotation: 0,
              maxTicksLimit: 18,
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
        fontColor: "#1b0ba7",
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
function restoreElements() {
  const speedometer = document.querySelector(".ratio-spending-container");
  const ringChart = document.querySelector(".rest-money-wrapper");
  ringChart.style.display = "flex";
  speedometer.style.display = "block";
}
function deleteElements() {
  const speedometer = document.querySelector(".ratio-spending-container");
  const ringChart = document.querySelector(".rest-money-wrapper");
  ringChart.style.display = "none";
  speedometer.style.display = "none";
}
