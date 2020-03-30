Vue.component('dkg-input', {
    props: {
        type: String, // "driver", "kart", or "glider"
        side: Number // 1 for left, 2 for right
    },
    data: function () {
        let minpts = this.type == "driver" ? 400 : 200;
        return {
            klass: 'input-' + this.side,
            id: 'select-' + this.side + '-' + this.type,
            minpts: minpts
        }
    },
    template: `
      <div class="dkg-input">
        <select :class="klass + ' select-' + type" :id="id"></select>
        <br>
        lv. <input :class="klass" :id="id + '-level'" type=number value=1 min=1 max=6>
        | <input :class="klass" :id="id + '-level'" type=number :value="minpts" :min="minpts" :max="minpts*2"> pts
      </div>`
});

Vue.component('select-dkg', {
    props: {
        side: Number
    },
    data: function () {
        let minpts = this.type == "driver" ? 400 : 200;
        return {
            id: 'select-' + this.side + '-dkg',
            onclick: 'cloneSelect(-' + this.side + ')'
        }
    },
    template: `
      <div class="select-dkg" :id="id">
        <h3>Setup {{ side }}</h3>
        <dkg-input type="driver" :side="side"></dkg-input>
        <dkg-input type="kart" :side="side"></dkg-input>
        <dkg-input type="glider" :side="side"></dkg-input>
        <button :onclick="onclick">Copy other side</button>
      </div>`
})

Vue.component('tier-marker', {
    props: {
        tier: Number, // default tier on the course: 1 for bottom, 2 for middle, 3 for top
        boost: String // boost received, if any: "cup", "spotlight", or "cup & spotlight"
    },
    data: function () {
        let tiers = [, "bottom", "middle", "top"];
        let tierboost = this.boost ? this.boost.length > 10 ? 2 : 1 : 0;
        let fulltier = Math.min(+this.tier + tierboost, 3);
        let tiertext = fulltier == 3 ? 'top' : fulltier == 2 ? 'middle' : 'bottom';
        let title = `This item is ${ tiers[this.tier] }-tier on this course`;
        if (this.tier != fulltier)
            title += `, but receives a ${ this.boost } boost to become ${ tiers[fulltier] }-tier`;
        return {
            title: title,
            text: "+".repeat(fulltier)
        }
    },
    template: '<span :title="title">{{ text }}</span>'
});

Vue.component('dkg-header', {
    props: {
        object: Object
    },
    template: '<tr><th colspan=2>{{ object.name }} <tier-marker :tier=object.tier :boost=object.tierboost></tier-marker></th></tr>'
});

Vue.component('dkg-prop', {
    props: {
        name: String,
        value: String
    },
    template: `
      <tr>
        <td class="td-l">{{ name }}</td>
        <td class="td-r">{{ value }}</td>
      </tr>`
});

Vue.component('infobox', {
    props: {
        object: Object // the object representing the driver, kart, or glider
    },
    template: `
      <table class="infobox">
        <tbody>
          <tr is="dkg-header" :object="object"></tr>
          <tr is="dkg-prop" v-for="(value, name) in object.displayprops" :key="name" :name="name" :value="value"></tr>
        </tbody>
      </table>`
})

Vue.component('imagebox', {
    props: {
        type: String,
        name: String,
        rarity: String,
        skill: String
    },
    data: function () {
        return {
            mainimg: `img/${ this.type }s/${ this.name }.png`,
            rarityimg: `img/items/${ this.rarity }.png`,
            skillimg: `img/items/${ this.skill }.png`,
            skilltitle: this.type == 'driver' ? this.skill : this.skill + ' Plus'
        }
    },
    template: `
    <div class="result-dkg-img">
      <img :src="mainimg" :title="name">
      <img class="icon" :src="rarityimg" :title="rarity">
      <img class="icon" :src="skillimg" :title="skilltitle">
    </div>`
});

Vue.component('result-dkg', {
    props: {
        object: Object
    },
    template:`
      <div :class="'result-dkg result-' + object.type">
        <imagebox v-bind="object"></imagebox>
        <table is="infobox" :object="object"></table>
      </div>`
});

Vue.component('result-box', {
    props: {
        objects: Array
    },
    template:`
      <div class="result">
        <result-dkg v-for="object in objects" :object="object"></result-dkg>
      </div>`
});

var app = new Vue({
    el: '#container',
    data: {
        setup1: [
            {
                type: "driver",
                name: "Hammer Bro",
                rarity: "Super",
                skill: "Hammer",
                tier: 2,
                tierboost: "spotlight",
                displayprops: {
                    "Level": "3",
                    "Items": "3",
                    "Frenzy chance": "+3%",
                    "Base points": "657",
                    "Bonus-points boost": "+6.57"
                }
            },
            {
                type: "kart",
                name: "Quickshaw",
                rarity: "High-End",
                skill: "Rocket Start",
                tier: 2,
                tierboost: "",
                displayprops: {
                    "Level": "4",
                    "Multiplier": "×1.8",
                    "Rocket Start bonus": "+80",
                    "Base points": "400",
                    "Bonus-points boost": "none"
                }
            },
            {
                type: "glider",
                name: "Super Glider",
                rarity: "Normal",
                skill: "Green Shell",
                tier: 3,
                tierboost: "",
                displayprops: {
                    "Level": "4",
                    "Combo time": "×2.2",
                    "Combo bonus": "×3",
                    "Green Shell bonus": "+10",
                    "Base points": "300",
                    "Bonus-points boost": "+4.5"
                }
            }
        ],
        setup2: [
            {
                type: "driver",
                name: "Black Shy Guy",
                rarity: "Super",
                skill: "Bob-omb Cannon",
                tier: 3,
                tierboost: "",
                displayprops: {
                    "Level": "3",
                    "Items": "3",
                    "Frenzy chance": "+3%",
                    "Base points": "657",
                    "Bonus-points boost": "+6.57"
                }
            },
            {
                type: "kart",
                name: "Warship",
                rarity: "Normal",
                skill: "Mini-Turbo",
                tier: 3,
                tierboost: "",
                displayprops: {
                    "Level": "1",
                    "Multiplier": "×2.0",
                    "Mini-Turbo bonus": "+2",
                    "Base points": "300",
                    "Bonus-points boost": "+0"
                }
            },
            {
                type: "glider",
                name: "Super Glider",
                rarity: "Normal",
                skill: "Green Shell",
                tier: 3,
                tierboost: "",
                displayprops: {
                    "Level": "4",
                    "Combo time": "×2.2",
                    "Combo bonus": "×3",
                    "Green Shell bonus": "+10",
                    "Base points": "300",
                    "Bonus-points boost": "+4.5"
                }
            }
        ]
    }
});


function fetchLocal(url)
{
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = function()
        {
            resolve({text: () => new Promise((resolve, reject) => resolve(xhr.responseText))});
        };
        xhr.open('GET', url);
        xhr.send();
    });
}
function loadTracks()
{
    fetchLocal('data/tracks.csv').then(response => response.text()).then(text => {
        let rawdata = text.split("\r\n").map(l => l.split(","));
        let rows = [], trackmap = {}, coursedata = {}, currtrack, currcourse;
        
        for (let j = 0; j < rawdata.length; j++)
        {
            rows[j] = rawdata[j][0];
        }
        for (let i = 1; i < rawdata[0].length; i++)
        {
            if (rawdata[0][i])
            {
                currtrack = coursedata[rawdata[0][i]] = {};
                let trackkey = rawdata[0][i].match(/[\w']+/g).map(x => x[0]).join("");
                trackmap[trackkey] = rawdata[0][i];
            }
            if (rawdata[1][i])
            {
                currcourse = currtrack[rawdata[1][i]] = {};
                for (let j = 2; j < rows.length; j++)
                {
                    currcourse[rows[j]] = +rawdata[j][i];
                }
            }
        }
        
        console.log("tracks:", window.coursedata = coursedata);
        window.maptrack = function maptrack(track)
        {
            track = track.replace(/\+$/, "");
            let variant = track.slice(-1);
            track = track.slice(0, -1);
            track = trackmap[track];
            if (variant != "N" && /\D$/.test(track))
                track += " ";
            track += (variant == "X" ? "R/T" : variant == "N" ? "" : variant);
            return track;
        };
        loadDKGData();
    });
}
function loadDKGData()
{
    let promises = 3;
    ["driver", "kart", "glider"].forEach(type => fetchLocal('data/' + type + 's.csv').then(res => res.text()).then(text =>
    {
        let rawdata = text.split("\r\n").map(l => l.split(","));
        let rows = [], data = {}, curritem;
        
        for (let i = 0; i < rawdata.length; i++)
        {
            curritem = data[rawdata[i][0]] = {};
            curritem.skill = rawdata[i][1];
            curritem.rarity = +rawdata[i][2];
            curritem.tracks_tier1 = [], curritem.tracks_tier2 = [];
            rawdata[i].slice(3).forEach(course =>
            {
                if (course.slice(-1) == "+")
                    curritem.tracks_tier1.push(maptrack(course));
                else
                    curritem.tracks_tier2.push(maptrack(course));
            })
        }
        
        console.log(type + "s:", window[type + 'data'] = data);
        if (--promises <= 0)
            setupMenu();
    }));
}

function cloneSelect(n)
{
    $(`#select${ n }-dkg`).html($($(`#select${ n^1 }-dkg`).html().split(n^1).join(n)));
    $(`.input${ n }`).each((_, el) => el.value = $("#" + el.id.split(n).join(n^1)).val())
    onInput();
}
function setupMenu()
{
    console.log(`Data loaded in ${ new Date - startTime }ms`);
    
    for (let j of ["driver", "kart", "glider"])
    {
        for (let item in window[j + "data"])
        {
            $(`.select-${ j }`).append(`<option value="${ item }">${ item }</option>`);
        }
    }
    for (let item in coursedata)
    {
        $("#select-track").append(`<option value="${ item }">${ item }</option>`);
    }
    
    onInput();
    
    $("select").on("input", onInput);
    $("input").on("input", onInput);
}

let dkg = [[], {}, {}];

function onInput()
{
    for (let i of [1, 2])
    {
        for (let j of ["driver", "kart", "glider"])
        {
            for (let k of ["", "-level", "-points"])
            {
                k = j + k;
                let val = $(`#select-${ i }-${ k }`).val();
                if (dkg[i][k] !== val)
                {
                    dkg[i][k] = val;
                    let data = window[j + "data"][dkg[i][j]];
                    /*$(`#result-${ i }-${ j }`).html(`<img class="dkg" src="img/${ j }s/${ dkg[i][j] || "default" }.png">`
                    + `<div class="infobox">${ data ? [, "Normal", "Super", "High-End"][data.rarity] : "?" } lv. ${ dkg[i][j + '-level'] }<br>`
                    + `Base pts: ${ dkg[i][j + '-points'] }<br>`
                    + `Skill: <img class="icon" src="img/items/${ data ? data.skill : "default" }.png"></div>`);*/
                }
            }
        }
        let updatecourse = false;
        let val = $("#select-track").val();
        if (dkg[0][0] !== val)
        {
            updatecourse = true;
            dkg[0][0] = val;
            if (coursedata[val] && "R/T" in coursedata[val])
            {
                $("#course-rt").prop("disabled", false);
            }
            else
            {
                $("#course-rt").prop("disabled", "disabled");
                if ($("#select-course").val() == null)
                {
                    $("#select-course").val("N");
                    dkg[0][1] = "N";
                }
            }
        }
        
        val = $("#select-course").val();
        if (dkg[0][1] !== val)
        {
            updatecourse = true;
            dkg[0][1] = val;
        }
        
        if (updatecourse)
        {
            let course = dkg[0][0];
            if (/\D$/.test(course) && dkg[0][1] != "N")
                course += " ";
            course += dkg[0][1] == "R/T" ? "RT" : dkg[0][1] == "N" ? "" : dkg[0][1];
            $("#result-track").html(`<img src="img/courses/${ course }.png">`);
            $("#select-course-actions").val()
        }
    }
}

let startTime = new Date;
loadTracks();