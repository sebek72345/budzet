const wydatki={
    miesiecznyLimit:3000,
    wydatki:[
    {id:"_qnab6hsff",category:"Transport",desc:"Wydatki na paliwo",amount:50.35,date:"2/01/2021"},
    {id:"_he8cg7bnp",category:"Dom",desc:"Wydatki na żel",amount:12.75,date:"5/01/2021"},
    {id:"_bd0u5qzwj",category:"Jedzenie",desc:"Wydatki na kwiaty",amount:152.35,date:"10/01/2021"},
    ],
    przychody:[{id:"_qnaf6hff",category:"Wypłata",desc:"Wypłata za miesiąc listopad",amount:5000.35,date:"6/12/2021"},
    {id:"_qnapshff",category:"Praca dodatkowa",desc:"Koszenie trawników",amount:50.35,date:"10/12/2021"}],
}

function getUniqueId(){
    return '_' + Math.random().toString(36).substr(2, 9);
  }