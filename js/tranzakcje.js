import {
  firebaseApp,
  getDataFromDataBase,
  userIsActive,
  logUser,
  showTostify,
} from "./helpers.js";
// dodac do kazdej tranzakcji income:false or true

const months = [
  "Styczeń",
  "Luty",
  "Marzec",
  "Kwiecień",
  "Maj",
  "Czerwiec",
  "Lipiec",
  "Sierpień",
  "Wrzesień",
  "Październik",
  "Listopad",
  "Grudzień",
];

window.addEventListener("DOMContentLoaded", async () => {
  let spendings = [];
  let incomes = []; /* await logUser();
  await userIsActive(); */ /* await firebaseApp
    .firestore()
    .collection("8SenRtWDipgvAi3Q4Ptz7slJeXV2")
    .doc("7-2020")
    .onSnapshot(async (doc) => {
      const data = await getDataFromDataBase();
      spendings = data[1];
      incomes = data[2];
      const allTransactions = spendings.concat(incomes); //combine incomes and spandings
      dateDown(allTransactions); //default search
      const savingsEl = document.querySelector("#accountBalance");
      const savingsAmounts = getSavings(spendings, incomes);
      savingsEl.textContent = savingsAmounts;
      console.log({ spendings, incomes });
      console.log("update");
    }); */ //action search
  /* const btn = document.querySelector("#btn");
  btn.addEventListener("click", () =>
    addToDataBase(true, {
      category: "zakupy",
      desc: "kupno makaronu",
      amount: 256,
    })
  ); */ const search = document.querySelector(
    "#mainPanel__input"
  );
  search.addEventListener("keyup", (e) => searchByTitle(e));
  //function searchElemant
  function searchByTitle(e) {
    const ul = document.querySelector(".mainPanel__list");
    const li = [...document.querySelectorAll(".mainPanel__item")];

    const filterValue = search.value.toLowerCase();
    li.forEach((item, index) => {
      const descValue = li[index].querySelector("h2").textContent.toLowerCase();
      if (descValue.includes(filterValue)) {
        item.style.display = "";
      } else {
        item.style.display = "none";
      }
    });
  }
  // search end

  function dateDown(array) {
    array.sort((item1, item2) => {
      const [day1] = item1.date.split("/");
      const [day2] = item2.date.split("/");
      if (Number(day1) > Number(day2)) return 1;
      else {
        return -1;
      }
    });
    fillTabele(array);
    return array;
  }
  //remove previous list item
  function removerContainer() {
    const li = [...document.querySelectorAll(".mainPanel__item")];
    li.forEach((item) => item.remove());
  }
  //show transactions
  function fillTabele(array) {
    removerContainer();
    const list = document.querySelector("#mainPanel__list");
    const temp = document.querySelector("#transaction-clone");
    array.forEach((item) => {
      const transactionClone = temp.content.cloneNode(true);

      /* const container = document.querySelector(); //add data-id
    const image = document.querySelector();
    const date = document.querySelector();
    const desc = document.querySelector();
    const price = document.querySelector();  */
      const h2 = transactionClone.querySelector("h2"); //add data set data-uid
      const deleteIcon = transactionClone.querySelector(".delate-button"); //add data set data-uid
      const editIcon = transactionClone.querySelector(".edit-button"); //add data set data-uid
      deleteIcon.dataset.id = item.id;
      editIcon.dataset.id = item.id;

      const formatedDate = formatDate(item.date);
      const isPositiveValue = item.income ? item.amount : item.amount * -1;
      h2.textContent = item.amount;
      if (item.amount) {
        //add class to make price red
      }
      list.append(transactionClone);
      deleteIcon.addEventListener("click", deleteTransaction);
      editIcon.addEventListener("click", () => console.log("edit"));
    });
  }
  //delate item from DOM

  //format data from dd/mm/yyy to  mm dd
  function formatDate(date) {
    let [day, month, year] = date.split("/");
    if (month[0] === "0") {
      month = month.substring(1);
    }
    return `${day} ${months[month - 1]} ${year}`;
  }
  //filter type
  const filterType = ["spendings", "incomes", "najnowsze", "najstarsze"];
  /* filterItem(allTransactions, "incomes"); */
  function filterItem(array, type) {
    let filteredArray;
    switch (type) {
      case "spendings":
        filteredArray = array.filter(({ income }) => !income);
        break;
      case "incomes":
        filteredArray = array.filter(({ income }) => income);
        break;
      case "najnowsze":
        filteredArray = dateDown(array);
        break;
      case "najstarsze":
        filteredArray = dateDown(array);
        filteredArray.reverse();
        break;

      default:
        filteredArray = array;
        break;
    }
    console.log(filteredArray);

    return fillTabele(filteredArray);
  }
  //get sum of array
  function getSum(array) {
    if (!array.length) return 0;
    const sum = array.reduce((acc, item) => {
      return (acc += item.amount);
    }, 0);
    return sum;
  }
  //calculate savings
  function getSavings(spendings, incomes) {
    const sumSpending = getSum(spendings);
    const sumIncome = getSum(incomes);
    const totalSavings = sumIncome - sumSpending;
    return `${totalSavings.toFixed(2)} PLN`;
  }

  async function addToDataBase(isIncome, { category, desc, amount }) {
    //income true false
    const newDate = getCurrentData();
    const transactionId = getUniqueId();
    const newTransaction = {
      //assign values from parameters
      date: newDate,
      category,
      desc,
      amount,
      id: transactionId,
      income: isIncome ? true : false,
    };
    if (isIncome) {
      const newTransactions = [...incomes, newTransaction];
      updateDatabase(newTransactions, spendings, "7-2020");
    } else {
      const newTransactions = [...spendings, newTransaction];
      updateDatabase(incomes, newTransactions, "7-2020");
    }
  }
  async function deleteTransaction(e) {
    const transactionId = e.target.dataset.id;
    const user = firebaseApp.auth().currentUser;
    const newIncomes = incomes.filter(({ id }) => id !== transactionId);
    const newSpendings = spendings.filter(({ id }) => id !== transactionId);
    updateDatabase(newIncomes, newSpendings, "7-2020");
  }
  async function updateDatabase(newIncomes, newSpendings, period) {
    const user = await firebaseApp.auth().currentUser;
    const newData = await firebaseApp
      .firestore()
      .collection(user.uid)
      .doc(period)
      .set({
        przychody: newIncomes,
        wydatki: newSpendings,
      })
      .then(() => {
        showTostify("Wydatki zostały dopisane do twojej listy", "green");
      })
      .catch((err) =>
        showTostify("Coś poszło nie tak, spróbój ponownie", "red")
      );
  }
  function getUniqueId() {
    return "_" + Math.random().toString(36).substr(2, 9);
  }
  function getCurrentData() {
    const dateObj = new Date();
    const day = dateObj.getDay();
    let month = dateObj.getMonth() + 1;
    const year = dateObj.getFullYear();
    month = month.toString();
    month = month.length < 2 ? `0${month}` : month;
    let formatedDate = `${day}/${month}/${year}`;
    return formatedDate;
  }

  const wydatki = [
    {
      id: "_qnab6hsff",
      category: "Transport",
      desc: "Wydatki na paliwo",
      amount: 50.35,
      date: "2/01/2021",
      income: false,
    },
    {
      id: "_he8cg7bnp",
      category: "Dom",
      desc: "Wydatki na żel",
      amount: 12.75,
      date: "5/01/2021",
      income: false,
    },
    {
      id: "_bd0u5qzwj",
      category: "Jedzenie",
      desc: "Wydatki na kwiaty",
      amount: 152.35,
      date: "10/01/2021",
      income: false,
    },
  ];
  const przychody = [
    {
      id: "_qnaf6hff",
      category: "Wypłata",
      desc: "Wyplata za miesiac listopad",
      amount: 5000.35,
      date: "6/12/2021",
      income: true,
    },
    {
      id: "_qnapshff",
      category: "ą ę ł ć ź ż",
      desc: "Koszenie trawników",
      amount: 50.35,
      date: "10/12/2021",
      income: true,
    },
  ];
  const news = wydatki.concat(przychody);
  const rightArr = dateDown(news);
  generatePDF(news);
  function generatePDF(array) {
    var head = [["Data", "Przychód", "Kategoria", "Opis", "Cena"]];
    const singleRow = array.map(({ date, category, desc, amount, income }) => {
      const isIncome = income ? "Tak" : "Nie";
      amount = `${amount} zl`;
      return [date, isIncome, category, desc, amount];
    });
    const body = [...singleRow];
    const savings = getSavings(wydatki, przychody);
    const doc = new jsPDF();
    console.log(doc.getFontList());
    doc.setFont("Century Gothic");
    doc.setFontType("normal");
    doc.autoTable({
      head,
      body,
      foot: [["Podsumowanie", "", "", "", savings]],
      lineColor: [152, 0, 0],
      styles: {
        font: "Century Gothic",
        textColor: "black",
        fontSize: 12,
        cellWidth: "auto",
        halign: "center",
        valign: "middle",
        lineColor: [160, 160, 160],
        lineWidth: 0.25,
      },
      startY: 20,

      didParseCell: function (data) {
        var rows = data.table.body;
        const spendings = rows.filter((row) => row.raw[1] === "Nie");
        const incomes = rows.filter((row) => row.raw[1] === "Tak");
        spendings.forEach((item) => {
          //spending
          if (data.row.index === item.index) {
            data.cell.styles.fillColor = [230, 50, 50];
          }
        });
        incomes.forEach((item) => {
          //income
          if (data.row.index === item.index) {
            data.cell.styles.fillColor = [70, 156, 50];
          }
        });
        if (data.section === "head") {
          //header
          data.cell.styles.fillColor = [211, 211, 211];
          data.cell.styles.fontSize = 16;
        }

        if (data.cell.raw === "Podsumowanie") {
          data.cell.colSpan = 4;
          data.cell.styles.fontSize = 20;
        }
        if (data.section === "foot") {
          data.cell.styles.fillColor = [238, 238, 238];
        }
      },
      columnStyles: {
        4: { cellWidth: 30 },
      },
    });
    const splitTitle = doc.splitTextToSize(
      "Dziękujemy za skorzystanie z naszej aplikacji",
      120
    );
    doc.text(splitTitle, 10, 10, "center");
    const finalY = doc.lastAutoTable.finalY;

    doc.text(
      20,
      finalY + 20,
      "Mamy nadzieję że dzięki nam zaoszczędzisz dużo pieniędzy"
    );
    const splitSummary = doc.splitTextToSize(
      "Dziękujemy za skorzystanie z naszej aplikacji :)",
      120
    );
    doc.text(splitSummary, 10, finalY + 30);
    doc.output("dataurlnewwindow");
    var string = doc.output("datauristring");
    var iframe =
      "<iframe width='100%' height='100%' src='" + string + "'></iframe>";
    var x = window.open();
    x.document.open();
    x.document.write(iframe);
    x.document.close();
    /*  doc.save("listaTranzakcji.pdf"); */
  }
});
