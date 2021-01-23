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
  const month = document.querySelector("#select-month");
  const year = document.querySelector("#select-year");
  const template = document.querySelector("#transaction-clone");
  const buttonPdf = document.querySelector("#pdf");
  const addIncome = document.querySelector("#addIncomeBtn");
  const addSpending = document.querySelector("#addSpendingBtn");
  const closeAddIncome = document.querySelector(".modal__close--income");
  const closeAddSpending = document.querySelector(".modal__close--spending");

  let transations = [];
  let spendings = [];
  let incomes = [];
  let table;

  /*  await logUser();
  await userIsActive(); */

  await firebaseApp
    .firestore()
    .collection("8SenRtWDipgvAi3Q4Ptz7slJeXV2")
    .doc(`${month.value}-${year.value}`)
    .onSnapshot(async (doc) => {
      updateView();
      console.log("first");
    });

  //listener start
  month.addEventListener("change", updateView);
  year.addEventListener("change", updateView);
  addIncome.addEventListener("click", () => {
    const modalBackground = document.querySelector("#modal--income");
    const modalContent = document.querySelector("#modal__content--income");
    modalBackground.style.display = "block";
    modalContent.style.display = "block";
    let newDate = document.querySelector("#add-income-date");
    newDate.value = getCurrentData();
    const confirmBnt = modalBackground.querySelector(".btn-confirm.income");
    confirmBnt.addEventListener("click", () => {
      let newCategory = document.querySelector("#add-income-category").value;
      let newDesc = document.querySelector("#add-income-desc").value;
      let newAmount = Number(
        document.querySelector("#add-income-amount").value
      );
      const dataValue = newDate.value;
      addToDataBase(true, newCategory, newDesc, newAmount, dataValue);
      modalBackground.style.display = "none";
      modalContent.style.display = "none";
      /* newCategory = "Wynagrodzenie";
      newAmount = "";
      newDesc = ""; */
    });
  });
  closeAddSpending.addEventListener("click", () => {
    const modalBackground = document.querySelector("#modal--spending");
    const modalContent = document.querySelector("#modal__content--spending");
    modalBackground.style.display = "none";
    modalContent.style.display = "none";
  });
  closeAddIncome.addEventListener("click", () => {
    "#modamodal--income";
    const modalBackground = document.querySelector("#modal--income");
    const modalContent = document.querySelector("#modal__content--income");
    modalBackground.style.display = "none";
    modalContent.style.display = "none";
  });

  addSpending.addEventListener("click", () => {
    const modalBackground = document.querySelector("#modal--spending");
    const modalContent = document.querySelector("#modal__content--spending");
    modalBackground.style.display = "block";
    modalContent.style.display = "block";
    let newDate = document.querySelector("#add-spending-date");
    newDate.value = getCurrentData();
    const confirmBnt = modalBackground.querySelector(".btn-confirm.spending");
    confirmBnt.addEventListener("click", () => {
      let newCategory = document.querySelector("#add-spending-category").value;
      let newDesc = document.querySelector("#add-spending-desc").value;
      let newAmount = Number(
        document.querySelector("#add-spending-amount").value
      );
      const dataValue = newDate.value;
      addToDataBase(false, newCategory, newDesc, newAmount, dataValue);
      modalBackground.style.display = "none";
      modalContent.style.display = "none";
      /* newCategory = "Wynagrodzenie";
      newAmount = "";
      newDesc = ""; */
    });
  });
  buttonPdf.addEventListener("click", () => generatePDF(transations));
  //listener end
  async function updateView() {
    removerContainer();
    const data = await getDataFromDataBase(`${month.value}-${year.value}`);
    spendings = data[1].filter((item) => !item.income);
    incomes = data[1].filter((item) => item.income);
    transations = incomes.concat(spendings);
    dateDown(transations);
    /* drawTable(); */
    /* table.destroy(); */
    interactiveButtons();
    const savingsEl = document.querySelector("#accountBalance");
    const savingsAmounts = getSavings(spendings, incomes);
    savingsEl.innerHTML = `${savingsAmounts} <div class="accountBalance__coin">
      PLN</div>`;
    console.log("update");
  }
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
    const li = [...document.querySelectorAll(".mainPanel__position")];
    li.forEach((item) => item.remove());
  }
  function drawTable() {
    table = new DataTable("table", {
      sortable: false,
      perPage: 5,
      perPageSelect: false,
      labels: {
        info: "",
      },
    });
  }
  //show transactions
  function fillTabele(array) {
    console.log();
    removerContainer();
    const list = document.querySelector("#table__body");
    array.forEach((item) => {
      const transactionClone = template.content.cloneNode(true);
      const row = transactionClone.querySelector(".mainPanel__position"); //add data-id
      const date = row.querySelector(".date");
      const desc = row.querySelector(".desc");
      const category = row.querySelector(".category");
      const price = transactionClone.querySelector(".price");
      const deleteIcon = transactionClone.querySelector(".--delete"); //add data set data-uid
      const editIcon = transactionClone.querySelector(".--edit"); //add data set data-uid
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
  //delate item from DOM
  function interactiveButtons() {
    const deleteButtons = [...document.querySelectorAll(".--delete")];
    const editButtons = [...document.querySelectorAll(".--edit")];

    deleteButtons.forEach((deleteItem) => {
      deleteItem.addEventListener("click", (e) => {
        /* table.destroy(); */
        console.log(e);
        removerContainer();
        deleteTransaction(e);
      });
    });
    editButtons.forEach((editItem) => {
      editItem.addEventListener("click", (e) => {
        console.log(e.target);
        const row = e.target.parentNode.parentNode;
        const transactionId = row.dataset.id;
        const editedTransaction = transations.filter(
          (item) => item.id === transactionId
        )[0];
        const restTransactions = transations.filter(
          (item) => item.id !== transactionId
        );
        if (editedTransaction.income) {
          console.log("wydprzychowatek");

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
          newDate.value = getCurrentData();
          newAmount.value = editedTransaction.amount;
          const confirmBnt = modalBackground.querySelector(
            ".btn-confirm.income"
          );
          confirmBnt.addEventListener("click", () => {
            const newIncome = {
              //assign values from parameters
              date: newDate.value,
              category: newCategory.value,
              desc: newDesc.value,
              amount: Number(newAmount.value),
              id: transactionId,
              income: true,
            };
            console.log(newAmount.value);
            updateDatabase([...restTransactions, newIncome]);
            modalBackground.style.display = "none";
            modalContent.style.display = "none";
            /* newCategory = "Wynagrodzenie";
    newAmount = "";
    newDesc = ""; */
          });
        } else {
          console.log("wydatek");
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
            const newSpending = {
              //assign values from parameters
              date: newDate.value,
              category: newCategory.value,
              desc: newDesc.value,
              amount: Number(newAmount.value),
              id: transactionId,
              income: false,
            };
            console.log(newAmount.value);
            updateDatabase([...restTransactions, newSpending]);
            modalBackground.style.display = "none";
            modalContent.style.display = "none";
            /* newCategory = "Wynagrodzenie";
      newAmount = "";
      newDesc = ""; */
          });
        }
        //openmodalValue(editedTransaction.category,editedTransaction.desc,editedTransaction.amount,editedTransaction.date)
        console.log(editedTransaction);
        /* updateDatabase([...restTransactions, editedTransaction], "7-2020"); */ //na klikniecie w modalu
      });
    });
  }
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
    return `${totalSavings.toFixed(2)}`;
  }

  function addToDataBase(isIncome, category, desc, amount, date) {
    //income true false
    const transactionId = getUniqueId();
    const newTransaction = {
      //assign values from parameters
      date,
      category,
      desc,
      amount,
      id: transactionId,
      income: isIncome ? true : false,
    };
    const newTransactions = [...transations, newTransaction];
    updateDatabase(newTransactions, "7-2020");
  }
  async function deleteTransaction(e) {
    const transactionId = e.target.parentNode.parentNode.dataset.id;
    const user = await firebaseApp.auth().currentUser;
    const updatedTransaction = transations.filter(
      ({ id }) => id !== transactionId
    );
    updateDatabase([...updatedTransaction], "7-2020");
  }
  async function updateDatabase(newTransactions, period) {
    console.log(newTransactions);
    const user = await firebaseApp.auth().currentUser;
    await firebaseApp
      .firestore()
      .collection(user.uid)
      .doc(`${month.value}-${year.value}`)
      .set({
        transactions: newTransactions,
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
    const dayValue = dateObj.getDate();
    let monthValue = dateObj.getMonth() + 1;
    const yearValue = dateObj.getFullYear();
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
    console.log({ spendings, incomes, array });
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

    doc.text("Dziękujemy za skorzystanie z naszej aplikacji", 45, 10);
    const finalY = doc.lastAutoTable.finalY;

    doc.text(
      20,
      finalY + 20,
      "Mamy nadzieję że dzięki nam zaoszczędzisz dużo pieniędzy"
    );

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
