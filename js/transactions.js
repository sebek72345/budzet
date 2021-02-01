import {
  firebaseApp,
  getDataFromDataBase,
  switchSignInSingOut,
  showTostify,
  userIsActive,
} from "./helpers.js";

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
  const month = document.querySelector("#select-month");
  const year = document.querySelector("#select-year");
  const template = document.querySelector("#transaction-clone");
  const buttonPdf = document.querySelector("#pdf");
  const addIncome = document.querySelector("#addIncomeBtn");
  const addSpending = document.querySelector("#addSpendingBtn");
  const closeAddIncome = document.querySelector(".modal__close--income");
  const closeAddSpending = document.querySelector(".modal__close--spending");
  const filterDate = document.querySelector("#filter-transactions-date");
  const filterTypeTransaction = document.querySelector(
    "#filter-transactions-type"
  );
  let displayText = document.querySelector(".informations");
  const hamburgerIconWrapper = document.querySelector("div.menu-button");
  const menu = document.querySelector("ul.menu");
  const icon = document.querySelector("div.menu-button>img");
  hamburgerIconWrapper.addEventListener("click", () => {
    menu.classList.toggle("active");
    if (menu.className === "menu active") {
      icon.setAttribute("src", "/assets/close.png");
    } else {
      icon.setAttribute("src", "/assets/hamburger.svg");
    }
  });
  let transactions = [];
  let spendings = [];
  let incomes = [];
  let monthLimit;
  let table;
  let isLogged = await userIsActive();
  if (!isLogged) {
    return;
  }
  const userId = await firebaseApp.auth().currentUser.uid;
  console.log(userId);
  await userIsActive();
  switchSignInSingOut();

  function realTimeUpdate() {
    firebaseApp
      .firestore()
      .collection(userId)
      .doc(`${month.value}-${year.value}`)
      .onSnapshot((doc) => {
        updateView();
      });
  }
  realTimeUpdate();

  //listener start
  month.addEventListener("change", () => {
    updateView();
  });
  year.addEventListener("change", () => {
    updateView();
  });
  filterDate.addEventListener("change", () => {
    const filteredTansactions = filterItem(transactions);
    fillTable(filteredTansactions);
    drawTable();
    interactiveButtons();
  });
  filterTypeTransaction.addEventListener("change", () => {
    const filteredTansactions = filterItem(transactions);
    fillTable(filteredTansactions);
    drawTable();
    interactiveButtons();
  });
  function toggleVisabilityIncomeModal(visibility) {
    const modalBackground = document.querySelector("#modal--income");
    const modalContent = document.querySelector("#modal__content--income");
    if (visibility === "open") {
      modalBackground.style.display = "block";
      modalContent.style.display = "block";
    } else if (visibility === "close") {
      modalBackground.style.display = "none";
      modalContent.style.display = "none";
    }
  }
  function toggleVisabilitySpendingModal(visibility) {
    const modalBackground = document.querySelector("#modal--spending");
    const modalContent = document.querySelector("#modal__content--spending");
    if (visibility === "open") {
      modalBackground.style.display = "block";
      modalContent.style.display = "block";
    } else if (visibility === "close") {
      modalBackground.style.display = "none";
      modalContent.style.display = "none";
    }
  }
  addIncome.addEventListener("click", () => {
    toggleVisabilityIncomeModal("open");
    const confirmBnt = document.querySelector(".btn-confirm.income");
    let dateInput = document.querySelector("#add-income-date");
    let categoryInput = document.querySelector("#add-income-category");
    let descInput = document.querySelector("#add-income-desc");
    const amountInput = document.querySelector("#add-income-amount");
    const modalTitle = document.querySelectorAll(".modal__header>p");
    modalTitle[0].textContent = "Dodaj Tranzakcje";
    modalTitle[1].textContent = "Dodaj Tranzakcje";
    dateInput.value = getCurrentData();
    descInput.value = "";
    amountInput.value = "";
    confirmBnt.addEventListener("click", () => {
      let fixedAmount = Number(amountInput.value).toFixed(2);
      addToDataBase(
        true,
        categoryInput.value,
        descInput.value,
        fixedAmount,
        dateInput.value
      );
      toggleVisabilityIncomeModal("close");
    });
  });
  closeAddIncome.addEventListener("click", () => {
    toggleVisabilityIncomeModal("close");
  });
  closeAddSpending.addEventListener("click", () => {
    toggleVisabilitySpendingModal("close");
  });

  addSpending.addEventListener("click", () => {
    toggleVisabilitySpendingModal("open");
    const confirmBnt = document.querySelector(".btn-confirm.spending");
    let dateInput = document.querySelector("#add-spending-date");
    let categoryInput = document.querySelector("#add-spending-category");
    let descInput = document.querySelector("#add-spending-desc");
    const amountInput = document.querySelector("#add-spending-amount");
    const modalTitle = document.querySelectorAll(".modal__header>p");
    modalTitle[0].textContent = "Dodaj Tranzakcje";
    modalTitle[1].textContent = "Dodaj Tranzakcje";
    dateInput.value = getCurrentData();
    descInput.value = "";
    amountInput.value = "";
    confirmBnt.addEventListener("click", () => {
      let fixedAmount = Number(amountInput.value).toFixed(2);
      addToDataBase(
        false,
        categoryInput.value,
        descInput.value,
        fixedAmount,
        dateInput.value
      );
      toggleVisabilitySpendingModal("close");
    });
  });
  buttonPdf.addEventListener("click", () => generatePDF(transactions));
  //listener end

  //Start functions
  async function updateView() {
    let data = await getDataFromDataBase(`${month.value}-${year.value}`);
    monthLimit = data[0];
    if (!data[1] || !data[1].length) {
      displayText.innerHTML =
        'Brak wyników do wyświetlenia<br><h2 style="font-size:16px">Dodaj tranzakcje do swojej listy<h2>';
      removerContainer();
      document.querySelector(".dataTable-bottom").style.display = "none";
      transactions = [];
      return;
    }
    spendings = data[1].filter((item) => !item.income);
    incomes = data[1].filter((item) => item.income);
    transactions = incomes.concat(spendings);
    transactions = filterItem(transactions);
    fillTable(transactions);
    drawTable();
    interactiveButtons();
    changeDynamicText();
    table.on("datatable.page", function (page) {
      interactiveButtons();
    });
  }
  function changeDynamicText() {
    const savingsEl = document.querySelector("#accountBalance");
    const savingsAmounts = getSavings(spendings, incomes);
    savingsEl.innerHTML = `${savingsAmounts} <div class="accountBalance__coin">
    PLN</div>`;
    if (Number(savingsAmounts) < 0) {
      savingsEl.style.color = "#bf5656";
    } else {
      savingsEl.style.color = "#62b891";
    }

    displayText.textContent = "";
  }
  function removerContainer() {
    const li = [...document.querySelectorAll(".mainPanel__position")];
    li.forEach((item) => item.remove());
  }
  function drawTable() {
    table = new DataTable("table", {
      sortable: false,
      perPage: 5,
      perPageSelect: false,
      firstLast: true,
      nextText: ">",
      prevText: "<",
      labels: {
        info: "",
      },
    });
    table.input.attributes[1].nodeValue = "Wyszukaj...";
    table.options.labels.noRows = "Nie znaleziono żadnego wyniku";
  }
  function fillTable(array) {
    removerContainer();
    const list = document.querySelector("#table__body");
    array.forEach((item) => {
      const transactionClone = template.content.cloneNode(true);
      const row = transactionClone.querySelector(".mainPanel__position"); //add data-id
      const date = row.querySelector(".date");
      const desc = row.querySelector(".desc");
      const category = row.querySelector(".category");
      const price = transactionClone.querySelector(".price");
      row.dataset.id = item.id;
      const formatedDate = formatDate(item.date);
      category.innerHTML = item.category;
      desc.innerHTML = item.desc;
      price.innerHTML = item.amount + " PLN";
      date.innerHTML = formatedDate;
      if (!item.income) {
        price.style.color = "red";
      } else {
        price.style.color = "green";
      }
      list.append(transactionClone);
    });
  }
  function interactiveButtons() {
    const deleteButtons = [...document.querySelectorAll(".--delete")];
    const editButtons = [...document.querySelectorAll(".--edit")];
    deleteButtons.forEach((deleteItem) => {
      deleteItem.addEventListener("click", (e) => {
        removerContainer();
        deleteTransaction(e);
      });
    });
    editButtons.forEach((editItem) => {
      editItem.addEventListener("click", (e) => {
        const row = e.target.parentNode.parentNode;
        const transactionId = row.dataset.id;
        const editedTransaction = transactions.filter(
          (item) => item.id === transactionId
        )[0];
        const restTransactions = transactions.filter(
          (item) => item.id !== transactionId
        );
        const modalTitle = document.querySelectorAll(".modal__header>p");
        modalTitle[0].textContent = "Edytuj Tranzakcje";
        modalTitle[1].textContent = "Edytuj Tranzakcje";
        if (editedTransaction.income) {
          const modalBackground = document.querySelector("#modal--income");
          const modalContent = document.querySelector(
            "#modal__content--income"
          );
          modalBackground.style.display = "block";
          modalContent.style.display = "block";
          let newDate = document.querySelector("#add-income-date");
          let newCategory = document.querySelector("#add-income-category");
          let newDesc = document.querySelector("#add-income-desc");
          let newAmount = document.querySelector("#add-income-amount");
          newCategory.value = editedTransaction.category;
          newDesc.value = editedTransaction.desc;
          newDate.value = editedTransaction.date;
          newAmount.value = editedTransaction.amount;
          const confirmBnt = modalBackground.querySelector(
            ".btn-confirm.income"
          );
          confirmBnt.addEventListener("click", () => {
            removerContainer();
            modalTitle[0].textContent = "Dodaj Transakcje";
            const newIncome = {
              date: newDate.value,
              category: newCategory.value,
              desc: newDesc.value,
              amount: Number(newAmount.value),
              id: transactionId,
              income: true,
            };
            updateDatabase(
              [...restTransactions, newIncome],
              "Transackja została pomyślnie zmieniona"
            );
            modalBackground.style.display = "none";
            modalContent.style.display = "none";
          });
        } else {
          const modalBackground = document.querySelector("#modal--spending");
          const modalContent = document.querySelector(
            "#modal__content--spending"
          );
          modalBackground.style.display = "block";
          modalContent.style.display = "block";
          let newDate = document.querySelector("#add-spending-date");
          newDate.value = editedTransaction.date;
          const confirmBnt = modalBackground.querySelector(
            ".btn-confirm.spending"
          );
          let newCategory = document.querySelector("#add-spending-category");
          let newDesc = document.querySelector("#add-spending-desc");
          let newAmount = document.querySelector("#add-spending-amount");
          newCategory.value = editedTransaction.category;
          newDesc.value = editedTransaction.desc;
          newAmount.value = editedTransaction.amount;
          confirmBnt.addEventListener("click", () => {
            removerContainer();
            modalTitle[1].textContent = "Dodaj Transakcje";
            const newSpending = {
              date: newDate.value,
              category: newCategory.value,
              desc: newDesc.value,
              amount: Number(newAmount.value),
              id: transactionId,
              income: false,
            };
            updateDatabase(
              [...restTransactions, newSpending],
              "Transackja została pomyślnie zmieniona"
            );
            modalBackground.style.display = "none";
            modalContent.style.display = "none";
          });
        }
      });
    });
  }
  function formatDate(date) {
    let [day, month, year] = date.split("/");
    if (month[0] === "0") {
      month = month.substring(1);
    }
    return `${day} ${months[month - 1]} ${year}`;
  }

  function filterItem(array) {
    table && table.destroy();
    let filteredArray = [...array];
    if (filterTypeTransaction.value === "Incomes") {
      filteredArray = filteredArray.filter(({ income }) => income);
    } else if (filterTypeTransaction.value === "Spendings") {
      filteredArray = filteredArray.filter(({ income }) => !income);
    }

    if (filterDate.value === "theLatest") {
      filteredArray = filterAscending(filteredArray);
    } else if (filterDate.value === "theOldest") {
      filteredArray = filterAscending(filteredArray).reverse();
    }
    return filteredArray;
  }
  function filterAscending(array) {
    const newArray = array.sort((item1, item2) => {
      const [day1] = item1.date.split("/");
      const [day2] = item2.date.split("/");
      if (Number(day1) < Number(day2)) return 1;
      else {
        return -1;
      }
    });
    return newArray;
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
    return `${totalSavings.toFixed(2)}`;
  }

  function addToDataBase(isIncome, category, desc, amount, date) {
    const transactionId = getUniqueId();
    amount = Number(amount);
    const newTransaction = {
      date,
      category,
      desc,
      amount,
      id: transactionId,
      income: isIncome ? true : false,
    };
    const newTransactions = [...transactions, newTransaction];
    updateDatabase(newTransactions, "Transakcja została dodana");
  }
  async function deleteTransaction(e) {
    const transactionId = e.target.parentNode.parentNode.dataset.id;
    const updatedTransaction = transactions.filter(
      ({ id }) => id !== transactionId
    );
    updateDatabase(
      [...updatedTransaction],
      "Transackja została pomyślnie usunięta"
    );
  }
  async function updateDatabase(newTransactions, messageTitle) {
    const user = await firebaseApp.auth().currentUser;
    await firebaseApp
      .firestore()
      .collection(user.uid)
      .doc(`${month.value}-${year.value}`)
      .set({
        limit: monthLimit || 0,
        transactions: newTransactions,
      })
      .then(() => {
        const message =
          "Wydatki zostały dopisane do twojej listy." && messageTitle;
        showTostify(message, "success");
        realTimeUpdate();
      })
      .catch((err) => {
        showTostify("Coś poszło nie tak, spróbój ponownie.", "fail");
        console.log(err);
      });
  }
  function getUniqueId() {
    return "_" + Math.random().toString(36).substr(2, 9);
  }
  function getCurrentData() {
    const currentDay = new Date().getDate();
    const settlementDate = new Date(year.value, month.value - 1, currentDay);
    const dayValue = settlementDate.getDate();
    let monthValue = settlementDate.getMonth() + 1;
    const yearValue = settlementDate.getFullYear();
    monthValue = monthValue.toString();
    monthValue = monthValue.length < 2 ? `0${monthValue}` : monthValue;
    let formatedDatee = `${dayValue}/${monthValue}/${yearValue}`;
    return formatedDatee;
  }
  function generatePDF(array) {
    var head = [["Data", "Przychód", "Kategoria", "Opis", "Cena"]];
    const singleRow = array.map(({ date, category, desc, amount, income }) => {
      const isIncome = income ? "Tak" : "Nie";
      amount = `${amount} zł`;
      return [date, isIncome, category, desc, amount];
    });
    const body = [...singleRow];
    const savings = getSavings(spendings, incomes);
    const doc = new jsPDF();
    doc.setFont("Century Gothic");
    doc.setFontType("normal");
    doc.autoTable({
      head,
      body,
      foot: [["Podsumowanie", "", "", "", savings + " PLN"]],
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
          if (data.row.index === item.index) {
            data.cell.styles.fillColor = [200, 50, 50];
          }
        });
        incomes.forEach((item) => {
          if (data.row.index === item.index) {
            data.cell.styles.fillColor = [100, 190, 90];
          }
        });
        if (data.section === "head") {
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
    doc.save(`TwojeWydatki-${months[month.value - 1]}-${year.value}.pdf`);
  }
});
