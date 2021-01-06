import {firebaseApp} from './init-firebase.js'
const selectedMonth=document.querySelector("#period");

selectedMonth.addEventListener("change",()=>{
  removeSpendingCategories();
  restartAnimations();
 /*  removeChats(); */
  init()
})

async function getDaySpending(period="7-2020"){
/*   let arrayOfSpending=[];

 await firebase.auth().onAuthStateChanged( function(user) {
    if (user) {
    firebaseApp.firestore().collection(user.uid).doc(period).get().then(doc=>{
        if(doc.exists){
          
          arrayOfSpending=doc.data().wydatki;
          console.log(arrayOfSpending)
          return
        }})
    } 
  }); console.log(arrayOfSpending); 
 */
const user = firebase.auth().currentUser;
console.log(user);
if(!user) return; 
const uid = user.uid;
const snap  =await firebase.firestore().collection(uid).doc(period).get();
if(snap.exists) {
  console.log(snap.data());
  return snap.data().spending;
} else {
  // handle the case where there was no data
}
console.log(snap);
}
init()
async function init () {

 const daysInMonth=new Date(2020,selectedMonth.value,0).getDate();
const arrayOfDays= getArrayOfDays(daysInMonth) 
/*  await logUser();
await userIsActive()
console.log("in init");
await getDaySpending();
console.log("after"); */
const spendings=[
  {id:"_qnab6hsff",category:"transport",desc:"Wydatki na paliwo",amount:50.35,date:"2/01/2021"},
  {id:"_he8cg7bnp",category:"kosmetyki",desc:"Wydatki na żel",amount:12.75,date:"5/01/2021"},
  {id:"_bd0u5qzwj",category:"prezenty",desc:"Wydatki na kwiaty",amount:152.35,date:"10/01/2021"},
  {id:"_dfujkyxne",category:"transport",desc:"Wydatki na paliwo",amount:82.35,date:"15/01/2021"},
  {id:"_dfujkyxne",category:"transport",desc:"Wydatki na paliwo",amount:82.35,date:"15/01/2021"},
  {id:"_dfujkyxne",category:"transport",desc:"Wydatki na paliwo",amount:82.35,date:"15/01/2021"},
  {id:"_lfsnfe8tt",category:"dom",desc:"Wydatki na saune",amount:122.11,date:"18/01/2021"},
  {id:"_lfsnfe8tt",category:"dom",desc:"Wydatki na saune",amount:122.10,date:"19/01/2021"},
  {id:"_dq62efzc1",category:"jedzenie",desc:"Wydatki na piwczywo",amount:15.54,date:"26/01/2021"},
 
  {id:"_polc04qs8",category:"zdrowie i uroda",desc:"Wydatki na piwo",amount:42.31,date:"31/01/2021"},
];
const incomes=[
  {id:"_qnab6hsff",category:"Wypłata",desc:"Wypłata za miesiąc grudzień",amount:5000.35,data:"2/01/2021"},
  {id:"_he8cg7bnp",category:"Praca dodatkowa",desc:"Kosznie trawników",amount:120.00,data:"5/01/2021"},
];
const spendingByDay=sortSpendingByDay(spendings,arrayOfDays)
const [categories,amounts]=reduceArrayWithTheSameCategory(spendings)
if(spendings){
  setTimeout(() => {
    displayCharts(categories,amounts,spendingByDay,arrayOfDays);
  removeSpinners()
  }, 1500);
  
}

const allSpending=getSum(spendings);
setLimitChart(3000,allSpending)
setSpeedometer(80)
addSpendingCategories(categories,amounts);

}

function logUser(){
  const wydatki=[
    {id:"_qnab6hsff",category:"transport",desc:"Wydatki na paliwo",amount:50.35,data:"2/01/2021"},
    {id:"_he8cg7bnp",category:"kosmetyki",desc:"Wydatki na żel",amount:12.75,data:"5/01/2021"},
    {id:"_bd0u5qzwj",category:"dziwczyna",desc:"Wydatki na kwiaty",amount:152.35,data:"10/01/2021"},
    {id:"_dfujkyxne",category:"transport",desc:"Wydatki na paliwo",amount:82.35,data:"15/01/2021"},
    {id:"_lfsnfe8tt",category:"relaks",desc:"Wydatki na saune",amount:1122.1,data:"18/01/2021"},
    {id:"_dq62efzc1",category:"jedzenie",desc:"Wydatki na piwczywo",amount:15.54,data:"26/01/2021"},
    {id:"_polc04qs8",category:"żarcie",desc:"Wydatki na piwo",amount:42.31,data:"31/01/2021"},
];
  const email="Sebastian723@interia.eu"
  const password="Sebek7234"
  firebaseApp.auth().signInWithEmailAndPassword(email,password).then(user=>{
    const {user:{uid}}=user
    firebaseApp.firestore().collection(uid).doc("7-2020").set({
      limit:3000,
      wydatki,
      przychody:[]
    })
  })
  console.log("in logUser");

}
function userIsActive(){
  firebaseApp.auth().onAuthStateChanged(user=>{
    if(user){
      console.log("user is active");
      return true
    }else{
      console.log("no user");
      return false
    }
  })
}
function setLimitChart(limit=3000,totalSpending){
  const percentage=document.querySelector(".percentage")
  const limitAmountEl=document.querySelector("#limit-amount")
  const restAmountEl=document.querySelector("#rest-amount")
  const percent=Number((totalSpending*100/limit).toFixed(2))
  const restAmount=limit-totalSpending
  document.documentElement.style.setProperty('--circle',`${percent}`);  
  percentage.textContent=`${percent}%`
  limitAmountEl.textContent=`${limit} zł`
  restAmountEl.textContent=`${restAmount} zł`
switch (true) {
  case percent<25:
      document.documentElement.style.setProperty('--stroke-color',"rgb(15, 226, 7)");  
    break;
  case percent<25:
      document.documentElement.style.setProperty('--stroke-color',"rgb(233, 219, 24)");  
    break;
  case percent<90:
      document.documentElement.style.setProperty('--stroke-color',"rgb(230, 125, 6)");  
    break;
  default:
    document.documentElement.style.setProperty('--stroke-color',"rgb(219, 14, 14)"); 
}
}
function setSpeedometer(percent){
  const deg=percent*180/100
document.documentElement.style.setProperty('--speedometer-rotare',`${deg}deg`);
const spedingPercent=document.querySelector(".spending-percent");
spedingPercent.textContent=`${percent} %`
}
function addSpendingCategories(categories,amounts){
  const categoriesList=document.querySelector(".category-wrapper");
  if(!categories.length){
    
    categoriesList.innerHTML='<h5 class="no-category">Nie jesteś zalogowany albo nie masz wydatków w tym miesiącu</h5>'
    return
  }
  const temp=document.querySelector("#category-clone")

categories.forEach((category,index)=>{
  if(index>4) return
  const categoryClone=temp.content.cloneNode(true)
  const img=categoryClone.querySelector("img")
  img.setAttribute("alt",`${category.categoryName} icon`);
  img.setAttribute("src",`../assets/${category}.svg`);
  categoryClone.querySelector(".category-name").textContent=category;
  categoryClone.querySelector(".category-amount").textContent=`${amounts[index]} zł`;
  categoriesList.append(categoryClone)
})

}

function categoryExpencesChart(categories=["Brak danych"],values=[1]){
    const  canvas = document.getElementById('doughnut-chart')
  const   ctx=canvas.getContext("2d")
    const graph= new Chart(ctx, {
        type: 'pie',
        data: {
          labels: categories.map(category=> category),
          datasets: [
            {
              label: "Population (millions)",
              backgroundColor: ["#3e95cd","#003f5c","#2f4b7c","#665191","#a05195","#d45087",,"#f95d6a","#ff7c43","#ffa600"],
              data: values.map(value=>value),
             
            }
          ]
        },
        options: {
          elements:{arc:{borderWidth:0}},
          legend:{labels:{boxWidth:15}},
          tooltips:{
            displayColors:false,
            callbacks:{
              title:function(tooltipItem, data) {
               return ""
              },
              label: function(tooltipItem, data) {
                var dataset = data.datasets[tooltipItem.datasetIndex];
                var total = dataset.data.reduce(function(previousValue, currentValue, currentIndex, array) {
                  return previousValue + currentValue;
                });
                var currentValue = dataset.data[tooltipItem.index];
                var percentage = Math.floor(((currentValue/total) * 100)+0.5);
                 const category=data.labels[tooltipItem.index]
                return`${percentage}% wydałeś na ${category}`
              }
            }
          },
          title: {
            display: true,
            text: 'Wydatki względem kategorii [zł]',
            color:"black"
          },
          aspectRatio:1
        },
       })
}
function linearChart(expences=[],days=[],){
    const  canvas = document.getElementById('line-chart');
    const ctx= canvas.getContext('2d');
    canvas.width=window.innerWidth/3;
    canvas.height=window.innerHeight/3;
const graph=new Chart(ctx, {
  type: 'bar',
  data: {
    labels: days.map(day=>day),
    xAxisID:"Dni miesiąca",
    datasets: [{ 
        data: expences.map(expence=>expence),
        label: "Wydatki",
        borderColor: "#48c011",
        fill: true,
        backgroundColor:'#328011',
        steppedLine:true
      }
    ]
  },
  options: {
    tooltips:{
      displayColors:false,
      callbacks: {
        title:function() {
          return '';
        },
        label: function(tooltipItems) { 
            return `Wydałeś ${tooltipItems.xLabel} dnia ${tooltipItems.yLabel} zł` 
        }
    }},
      scales:{
          yAxes:[{
            scaleLabel :{
              display: true,
              labelString: 'Wydatki [zł]',
              fontSize:14
            },
              gridLines:{
                  display:true
              },
              ticks:{
                beginAtZero:true,
                stepSize:50
              }
          }],
          xAxes:[{
            scaleLabel: {
              display: true,
              labelString: 'Dzień Miesiąca',
              fontSize:14
            },
              ticks:{
                beginAtZero:true,
                maxRotation:0,
                maxTicksLimit:18,
              }
          }]
      },
      legend:{
          display:false
      },
    title: {
      display: true,
      fontFamily:"Helvetica",
      fontColor:"#1b0ba7",
      text: (expences.length &&  days.length) ?'Wydatki każdego dnia miesiąca':"Brak danych",
      fontSize:18,
      
    }, 
  }
});

}
function getArrayOfDays(days){
  const arrayOfDays=[];
  for (let index = 1; index <= days; index++) {
    arrayOfDays.push(index)
  }
  return arrayOfDays
}
function getUniqueId(){
  return '_' + Math.random().toString(36).substr(2, 9);
}
function reduceArrayWithTheSameCategory(spendings){

 let newObject={};
 spendings.forEach(({category,amount})=>{
   if(newObject.hasOwnProperty(category)){
    let newAmount=(newObject[category]+amount).toFixed(2)
     newObject[category]=Number(newAmount)
   }else{
     newObject[category]=amount
   }
 })
let array=[] //convert array to object
for (let prop in newObject) {
  array.push({ category: prop, amount: newObject[prop] }); 
} ;
array=array.sort((a,b)=>{
  if(a.amount>b.amount)return -1
  return 1
}) //sort by higest spending
const amounts=array.map(a=>a.amount)
const categories=array.map(a=>a.category)
return [categories,amounts]
}
function getSum(array){
const sum=array.reduce((acc,item)=>{return acc+=item.amount},0)
return sum
}
function sortSpendingByDay(spendings,days){
let dailyExpences={}
spendings.forEach(({date,amount})=>{
  if(dailyExpences.hasOwnProperty(date)){
    let newAmount=(dailyExpences[date]+amount).toFixed(2)
    dailyExpences[date]=Number(newAmount)
  }else{
    dailyExpences[date]=amount
  }
})
let array=[] //convert array to object
for (let prop in dailyExpences) {
 array.push({ date: prop, amount: dailyExpences[prop] }); 
} ;
let daysWithSpending=array.map(arr=>{
  const newDate=arr.date.slice(0,2)
 
  if(newDate[1]==="/"){
    return {date:Number(newDate.slice(0,-1)),amount:arr.amount}
  }
  return {date:Number(newDate),amount:arr.amount}
})
let expencesAssignToDay = new Array(days.length).fill(0);
days.map((day, index) => {
  daysWithSpending.map(({ date, amount }) => {
    if (day === date) {
      expencesAssignToDay[index] = amount;
    }
  });
});

return expencesAssignToDay
}
function removeSpendingCategories(){
  const categories=document.querySelector(".category-wrapper");
    const text = categories.firstChild;
    const template = text && text.nextSibling;
    while (categories.lastChild && categories.lastChild !== template) {
        categories.removeChild(categories.lastChild);
    }
}
/* function removeChats(){
  //remove categories chart
  removeChart(".spending-by-categories","doughnut-chart")
  //remove bar chart
  removeChart(".main-chart-wrapper","line-chart")
}
function removeChart(wrapperClass,chartClass){
  const canvas=document.querySelector(`#${chartClass}`);
const wrapper=document.querySelector(wrapperClass);
canvas.remove();
const newCanvas=document.createElement("canvas")
newCanvas.id=chartClass
wrapper.append(newCanvas)
} */
function restartAnimations(){
  restartSingle("circle")
/* 
  restartSingle("speedometer-arrow") */
};
function restartSingle(className){
  const hand=document.querySelector(`.${className}`)
  hand.classList.remove(className);
  void hand.offsetWidth;
   hand.classList.add(className)
}
function displayCharts(categories,amounts,spendingByDay,arrayOfDays){
  categoryExpencesChart(categories,amounts);
  linearChart(spendingByDay,arrayOfDays);
}
function removeSpinners(){
const spinners=[...document.getElementsByClassName("loader")];
spinners.forEach(item=>item.remove())
}