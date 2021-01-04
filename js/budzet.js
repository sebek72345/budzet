import {firebaseApp} from './init-firebase.js'
 

async function init (){
  const selectedMonth=document.querySelector("#period");
  console.log(selectedMonth.value);
 
await logUser();
await userIsActive()
categoryExpencesChart();
linearChart(),
setLimitChart(3000,2500)
setSpeedometer(90)
const arrCategory=[{categoryName:"jedzenie",categoryAmount:164.95},{categoryName:"transport",categoryAmount:164.95}]
addSpengingCategories([])
console.log(Boolean([]));
}
//pobranie potrzebnych elementów
function logUser(){
  const email="Sebastian723@interia.eu"
  const password="Sebek7234"
  firebaseApp.auth().signInWithEmailAndPassword(email,password).then(user=>console.log("Jesteś zalogowany"))
}
function userIsActive(){
  firebaseApp.auth().onAuthStateChanged(user=>{
    if(user){
      console.log("user");
      return true
    }else{
      console.log("no user");
      return false
    }
  })
}
function setLimitChart(limit=3000,totalSpending){
  const limitChar=document.querySelector("#limit-chart-svg > .circle")
  const percentage=document.querySelector(".percentage")
  const limitAmountEl=document.querySelector("#limit-amount")
  const restAmountEl=document.querySelector("#rest-amount")
  const percent=(totalSpending *100/limit).toFixed(2)
  const restAmount=limit-totalSpending
  limitChar.style.strokeDasharray =`${percent},100`
  percentage.textContent=`${percent}%`
  limitAmountEl.textContent=`${limit} zł`
  restAmountEl.textContent=`${restAmount} zł`
}
function setSpeedometer(percent){
  const deg=percent*180/100
const handDeg=document.documentElement.style.setProperty('--speedometer-rotare',`${deg}deg`);
const spedingPercent=document.querySelector(".spending-percent");
spedingPercent.textContent=`${percent} %`
}
function addSpengingCategories(categories){
  const categoriesList=document.querySelector(".category-wrapper");
  if(!categories.length){
    
    categoriesList.innerHTML='<h5 class="no-category">Nie jesteś zalogowany albo nie masz wydatków w tym miesiącu</h5>'
    return
  }
  const temp=document.querySelector("#category-clone")

categories.forEach(category=>{
  const categoryClone=temp.content.cloneNode(true)
  const img=categoryClone.querySelector("img")
  img.setAttribute("alt",`${category.categoryName} icon`);
  img.setAttribute("src",`../assets/${category.categoryName}.svg`);
  categoryClone.querySelector(".category-name").textContent=category.categoryName;
  categoryClone.querySelector(".category-amount").textContent=category.categoryAmount;
  categoriesList.append(categoryClone)

})

}
init()
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
              backgroundColor: ["#3e95cd"],
              data: values.map(value=>value)
            }
          ]
        },
        options: {
          title: {
            display: true,
            text: 'Wydatki względem kategorii [zł]',
            color:"black"
          },
          aspectRatio:1
        }
       })
}
function linearChart(expences=[],days=[]){
    const  canvas = document.getElementById('line-chart');
    const ctx= canvas.getContext('2d')
const graph=new Chart(ctx, {
  type: 'line',
  data: {
    labels: days.map(day=>day),
    datasets: [{ 
        data: expences.map(expence=>expence),
        label: "Africa",
        borderColor: "#3e95cd",
        fill: false,
        steppedLine:true
      }
    ]
  },
  options: {
      scales:{
          xAxes:[{
              gridLines:{
                  display:false
              }
          }]
      },
      legend:{
          display:false
      },
    title: {
      display: true,
      text: (expences.length &&  days.length) ?'Wydatki każdego dnia miesiąca':"Brak danych"
    }
  }
});

}
