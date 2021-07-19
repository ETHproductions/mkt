let tourStart = +new Date("Wed Sep 25 2019 02:00:00 GMT-0400");
const tourDuration = 14*24*60*60*1000;
const cupDuration = 13*60*1000;
let now = new Date;
while (tourStart + tourDuration <= now)
    tourStart += tourDuration;

tourStart = new Date(tourStart)

function changeCup(a) {
    let cupStart = +tourStart;
    now = new Date;
    cupStart += cupDuration * (a-1);
    while (cupStart + cupDuration <= now)
        cupStart += 12*cupDuration;
    
    let output = "Next 10 times: (each cup lasts 13 minutes)<br>";
    for (let i = 0; i <= 10; i++) {
        output += new Date(cupStart).toString() + "<br>";
        cupStart += 12*cupDuration;
    }
    document.getElementById("output").innerHTML = output;
}

changeCup(1);