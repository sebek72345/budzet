// Modal
var modal = document.getElementById("modal");
// Przycisk 'Dodaj przychód'
var btn = document.getElementById("addBtn");

// Zamknięcie modalu
var span = document.getElementById("modal__close")[0];

// Jeśli user kliknie button, doda się klasa 'block' do styli modala
btn.onclick = function () {
  modal.style.display = "block";
};

// Jeśli user kliknie span, zamknie modal
span.onclick = function () {
  modal.style.display = "none";
};

// Jeśli user kliknie gdziekolwiek, zamknie modal
window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};

// Szukaj wydatku
function filterFunction() {
    var input, filter, table, tr, td, i, txtValue;
    input = document.getElementById("mainPanel__inputS");
    filter = input.value.toUpperCase();
    table = document.getElementById("table");
    tr = table.getElementsByTagName("tr");
    for (i = 0; i < tr.length; i++) {
      td = tr[i].getElementsByTagName("td")[0];
      if (td) {
        txtValue = td.textContent || td.innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
          tr[i].style.display = "";
        } else {
          tr[i].style.display = "none";
        }
      }
    }
  }