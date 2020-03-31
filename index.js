Vue.component('dkg-input', {
    props: {
        type: String, // "driver", "kart", or "glider"
        side: Number // 1 for left, 2 for right
    },
    data: function () {
        let minpts = this.type == "driver" ? 400 : 200;
        return {
            klass: 'input-' + this.side + ' ' + this.type,
            id: 'select-' + this.side + '-' + this.type,
            minpts: minpts
        }
    },
    template: `
      <div class="dkg-input">
        <select :class="klass + '-name'" :id="id + '-name'"></select>
        <br>
        lv. <select :class="klass + ' number'" :id="id + '-level'"></select>
        | <select :class="klass + ' number'" :id="id + '-points-1'"></select>
          <select :class="klass + ' number hidden'" :id="id + '-points-2'"></select>
          <select :class="klass + ' number hidden'" :id="id + '-points-3'"></select> pts
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
    computed: {
        fulltier: function () {
            let tierboost = this.boost ? this.boost.length > 10 ? 2 : 1 : 0;
            return Math.min(+this.tier + tierboost, 3);
        },
        title: function () {
            let tiers = [, "bottom", "middle", "top"];
            let title = `This item is ${ tiers[this.tier] }-tier on this course`;
            if (this.tier != this.fulltier)
                title += `, but receives a ${ this.boost } boost to become ${ tiers[this.fulltier] }-tier`;
            return title;
        },
        text: function () {
            return "+".repeat(this.fulltier);
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
        nametitle: String,
        value: String,
        valuetitle: String
    },
    template: `
      <tr>
        <td class="td-l"><span :title="nametitle">{{ name }}</span></td>
        <td class="td-r"><span :title="valuetitle">{{ value }}</span></td>
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
          <tr is="dkg-prop" v-for="prop in object.displayprops" :key="prop.name" v-bind="prop"></tr>
        </tbody>
      </table>`
})

Vue.component('imagebox', {
    props: {
        type: String,
        name: String,
        rarity: Number,
        skill: String
    },
    computed: {
        mainimg: function () {
            return `img/${ this.type }s/${ this.name.replace(/\?/g, "Q") }.png`;
        },
        raritytitle: function () {
            return [, "Normal", "Super", "High-End"][this.rarity];
        },
        rarityimg: function () {
            return `img/items/${ this.raritytitle }.png`;
        },
        skilltitle: function () {
            return this.type == 'driver' ? this.skill : this.skill + ' Plus';
        },
        skillimg: function () {
            return `img/items/${ this.skill }.png`;
        },
    },
    template: `
    <div class="result-dkg-img">
      <img :src="mainimg" :title="name">
      <img class="icon" :src="rarityimg" :title="raritytitle">
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
        <result-dkg v-for="object in objects" :key="Math.random()" :object="object"></result-dkg>
      </div>`
});

Vue.component('comparison-prop-name', {
    props: {
        name: String,
        title: String
    },
    template: `<td class="td-l"><span :title="title">{{ name }}</span></td>`
});
Vue.component('comparison-prop-val', {
    props: {
        value: String,
        title: String,
        highlight: Boolean
    },
    template: `<td :class="highlight ? 'td-r bold' : 'td-r'"><span :title="title">{{ value }}</span></td>`
});
Vue.component('comparison-prop', {
    props: {
        name: String,
        nametitle: String,
        values: Array
    },
    template: `
      <tr>
        <td is=comparison-prop-name :name="name" :title="nametitle"></td>
        <td is=comparison-prop-val v-for="(value, key) in values" :key="key" v-bind="value"></td>
      </tr>`
});
Vue.component('comparison-table', {
    props: {
        props: Array
    },
    template: `
      <table>
        <tr>
          <td></td>
          <th v-for="(_, key) in (props[0] ? props[0].values : [1,2])">Setup {{ key + 1 }}</th>
        </tr>
        <tr is=comparison-prop v-for="row in props" :key="row.name" v-if="row.display" v-bind="row"></tr>
      </table>`
});

function buildDKG(type) {
    let obj = {
        type: type,
        name: "default",
        rarity: 0,
        skill: "default",
        level: 0,
        points: 0,
        tier: 0,
        tierboost: "",
        fulltier: 0,
        calcprops: { bpb: 0, skillpoints: 0 },
        displayprops: []
    };
    if (type === "driver")
        obj.calcprops.items = 0,
        obj.calcprops.frenzyinc = 0;
    if (type === "kart")
        obj.calcprops.multiplier = 0;
    if (type === "glider")
        obj.calcprops.combotime = 0,
        obj.calcprops.multiplier = 0;
    return obj;
}

var app = new Vue({
    el: '#container',
    data: {
        setups: [
            { course: "", variant: "", fullname: "" },
            [
                buildDKG("driver"),
                buildDKG("kart"),
                buildDKG("glider")
            ],
            [
                buildDKG("driver"),
                buildDKG("kart"),
                buildDKG("glider")
            ]
        ],
        stats: [],
        comparisons: { summary: [], points: [] }
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
            if ("NRTX".includes(variant))
                track = track.slice(0, -1);
            else
                variant = "N";
            
            track = trackmap[track] || "Bowser's Castle 1";
            if (/\D$/.test(track))
                track += " ";
            track += variant;
            return track;
        };
        loadActionData();
    });
}
function loadActionData()
{
    fetchLocal('data/actions.csv').then(response => response.text()).then(text => {
        let rawdata = text.split("\r\n").map(l => l.split(","));
        let actiondata = {};
        
        for (let i = 0; i < rawdata.length; i++)
        {
            let rawaction = rawdata[i];
            let actionname = rawaction.shift();
            let actionobj = actiondata[actionname] = {};
            
            let points = +rawaction.shift();
            let skill = rawaction.shift();
            if (skill === '$')
                skill = actionname.replace(/ accuracy| strike!/, '');
            else if (skill === '')
                skill = 'N/A';
            else if (!skill) {
                actionobj.points = [points];
                continue;
            }
            actionobj.bonusskill = skill;
            actionobj.points = [points, ...rawaction.splice(0, 3).map(Number)];
        }
        
        console.log("actions:", window.actiondata = actiondata);
        loadDKGData();
    });
}
function loadDKGData()
{
    let promises = 3;
    ["driver", "kart", "glider"].forEach(type => fetchLocal('data/' + type + 's.csv').then(res => res.text()).then(text =>
    {
        let rawdata = text.split("\r\n").map(l => l.split(","));
        let rows = [], data = {map:[]}, curritem;
        
        for (let i = 0; i < rawdata.length; i++)
        {
            curritem = data[rawdata[i][1]] = {};
            curritem.id = +rawdata[i][0];
            data.map[curritem.id] = rawdata[i][1];
            curritem.skill = rawdata[i][2];
            curritem.rarity = +rawdata[i][3];
            curritem.tracks_ttier = [], curritem.tracks_mtier = [];
            rawdata[i].slice(4).forEach(course =>
            {
                if (course.slice(-1) == "+")
                    curritem.tracks_ttier.push(maptrack(course));
                else
                    curritem.tracks_mtier.push(maptrack(course));
            })
        }
        
        console.log(type + "s:", window[type + 'data'] = data);
        if (--promises <= 0)
            setupMenu();
    }));
}

function cloneSelect(n)
{
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
            if (item === 'map') continue;
            $(`.${ j }-name`).append(`<option value="${ item }">${ item }</option>`);
        }
        for (let side of [1, 2]) {
            for (let i = 1; i <= 6; i++)
                $(`#select-${ side }-${ j }-level`).append(`<option value="${ i }">${ i }</option>`);
            for (let rarity = 1; rarity <= 3; rarity++) {
                for (let i = 25; i >= 0; i--) {
                    $(`#select-${ side }-${ j }-points-${ rarity }`).append(`<option value="${ i }">${ calcPoints(j, rarity, i) }</option>`);
                }
            }
        }
    }
    for (let item in coursedata)
    {
        $("#select-track").append(`<option value="${ item }">${ item }</option>`);
    }
    
    let urlParams = new URLSearchParams(window.location.search);
    for (let [name, value] of urlParams.entries()) {
        if (name === 'course') {
            let track = maptrack(value);
            $('#select-track').val(track.slice(0, -1).trim());
            $('#select-course').val(track.slice(-1));
        }
        else if (name.slice(0, 5) === 'setup') {
            let side = +name.slice(5);
            for (let i = 0; i < 3; i++) {
                let type = ['driver', 'kart', 'glider'][i];
                if (value.length < 4) value = '0139';
                
                let name = window[type + 'data'].map[parseInt(value.slice(0, 2), 16)] || "Baby Mario";
                $(`#select-${ side }-${ type }-name`).val(name);
                
                let level = Math.max(1, Math.min(5, parseInt(value.slice(2, 4), 16) >> 5));
                $(`#select-${ side }-${ type }-level`).val(level);
                
                let rarity = window[type + 'data'][name].rarity;
                if (rarity !== 1) {
                    $(`#select-${ side }-${ type }-points-1`).hide();
                    $(`#select-${ side }-${ type }-points-${ rarity }`).show();
                }
                
                let points = Math.min(parseInt(value.slice(2, 4), 16) & 31, 25);
                $(`#select-${ side }-${ type }-points-${ rarity }`).val(points);
                value = value.slice(4);
            }
        }
    }
    
    onInput();
    
    $("select").on("input", onInput);
    $("input").on("input", onInput);
}

function calcPoints(type, rarity, index) {
    if (type === 'driver') {
        return [,400,450,500][rarity] + [,8,9,12][rarity] * index; 
    }
    else if (rarity === 2) {
        return 220 + 4 * index + Math.max(index - 15, 0);
    }
    else {
        return [,200,,250][rarity] + [,4,,6][rarity] * index;
    }
}
function uncalcPoints(type, rarity, points) {
    if (type === 'driver') {
        return (points - [,400,450,500][rarity]) / [,8,9,12][rarity];
    }
    else if (rarity === 2) {
        if (points > 280)
            return (points - 205) / 5;
        return (points - 220) / 4;
    }
    else {
        return (points - [,200,,250][rarity]) / [,4,,6][rarity];
    }
}

function onInput()
{
    let updatecourse = false, course = app.setups[0].fullname;
    let val = $("#select-track").val()
    if (app.setups[0].course !== val)
    {
        updatecourse = true;
        app.setups[0].course = val;
        if (coursedata[val] && "Z" in coursedata[val])
        {
            $("#course-rt").prop("disabled", false);
        }
        else
        {
            $("#course-rt").prop("disabled", "disabled");
            if ($("#select-course").val() == null)
            {
                $("#select-course").val("N");
                app.setups[0].variant = "N";
            }
        }
    }

    val = $("#select-course").val();
    if (app.setups[0].variant !== val)
    {
        updatecourse = true;
        app.setups[0].variant = val;
    }
    
    if (updatecourse)
    {
        course = app.setups[0].course;
        if (/\D$/.test(course))
            course += " ";
        course += app.setups[0].variant;
        app.setups[0].fullname = course;
        $("#result-track").html(`<img src="img/courses/${ course }.png">`);
    }
    
    for (let side of [1, 2])
    {
        let setup = app.setups[side];
        for (let j of [0, 1, 2])
        {
            let type = ["driver", "kart", "glider"][j];
            let item = setup[j];
            let changed = false;
            for (let k of ["name", "level", "points"])
            {
                let val = $(`#select-${ side }-${ type }-${ k === "points" ? k + '-' + item.rarity : k }`).val();
                if (k === 'points')
                    val = calcPoints(type, item.rarity, val);
                
                if (item[k] !== val)
                {
                    changed = true;
                    item[k] = val;
                    let data = window[type + "data"][item[k]];
                    if (k === "name")
                    {
                        if (item.rarity !== data.rarity)
                        {
                            $(`#select-${ side }-${ type }-points-${ item.rarity }`).hide();
                            $(`#select-${ side }-${ type }-points-${ data.rarity }`).show();
                        }
                        item.rarity = data.rarity;
                        item.skill = data.skill;
                    }
                }
            }
            let data = window[type + "data"][item.name];
            if (changed || updatecourse) {
                item.tier = item.fulltier = data.tracks_ttier.includes(course) ? 3 : data.tracks_mtier.includes(course) ? 2 : 1;
                item.calcprops.bpb = Math.round(item.points / 200 * (item.level - 1) * 1000) / 1000;
                let dp = item.displayprops = [];
                dp.push({
                    name: "Level",
                    value: String(item.level)
                });
                dp.push({
                    name: "Base points",
                    value: String(item.points)
                });
                
                if (item.type === 'kart') {
                    item.calcprops.multiplier = Math.round((1 + ((item.level >> 1) + item.rarity - 1) / 20) * (item.fulltier + 1) / 2 * 1000) / 1000;
                    dp.push({
                        name: "Points multiplier",
                        nametitle: "Multiplier applied to the base points of each action",
                        value: "×" + item.calcprops.multiplier
                    });
                }
                if (item.type === 'glider') {
                    item.calcprops.combotime = Math.round((1 + ((item.level >> 1) + item.rarity - 1) / 20) * (item.fulltier + 1) / 2 * 1000) / 1000;
                    dp.push({
                        name: "Combo time",
                        value: "×" + item.calcprops.combotime
                    });
                    dp.push({
                        name: "Combo multiplier",
                        value: "×" + item.fulltier
                    });
                }
                if (item.type === 'driver') {
                    item.calcprops.frenzyinc = [,[0,2,4,6],[1,3,5,8],[2,4,7,10]][item.rarity][item.level >> 1];
                    dp.push({
                        name: "Items",
                        value: String(item.fulltier)
                    });
                    dp.push({
                        name: "Frenzy increase",
                        nametitle: "Increase above base frenzy chance",
                        value: item.fulltier === 3 ? "+" + item.calcprops.frenzyinc + "%" : "N/A",
                        valuetitle: item.fulltier === 3 ? undefined : "Driver must be top-tier to receive frenzies"
                    });
                }
                else {
                    let action = Object.keys(actiondata).find(x => actiondata[x].bonusskill === item.skill);
                    item.calcprops.skillpoints = actiondata[action].points[item.rarity];
                    dp.push({
                        name: item.skill + " bonus",
                        nametitle: ["Coin", "Mushroom"].includes(item.skill) ? "Only applies to " + item.skill + "s used as items, not those gathered from the track" : undefined,
                        value: "+" + item.calcprops.skillpoints
                    });
                }
                
                dp.push({
                    name: "Bonus-points boost",
                    nametitle: "Bonus points awarded for every action",
                    value: item.fulltier === 3 ? "+" + item.calcprops.bpb : "none",
                    valuetitle: item.fulltier === 3 ? item.level === "1" ? "Item must be level 2 or above to receive bonus-points boost" : undefined : "Item must be top-tier to receive bonus-points boost"
                });
            }
        }
    }
    
    encodeLink();
    
    app.comparisons.summary = [];
    app.stats = [];
    
    let basepoints = [];
    let bpb = [];
    for (let i = 1; i < app.setups.length; i++) {
        let basetotal = 0;
        let bpbtotal = 0;
        for (let item of app.setups[i]) {
            basetotal += item.points;
            if (item.fulltier !== 3) continue;
            bpbtotal += item.calcprops.bpb;
        }
        basetotal = Math.round(basetotal * 1000) / 1000;
        bpbtotal = Math.round(bpbtotal * 1000) / 1000;
        basepoints.push(basetotal);
        bpb.push(bpbtotal);
        app.stats.push({ basepoints: basetotal, bpb: bpbtotal });
    }
    let frenzyinc = app.setups.slice(1).map(setup => setup[0].calcprops.frenzyinc);
    let kartmulti = app.setups.slice(1).map(setup => setup[1].calcprops.multiplier);
    let combotime = app.setups.slice(1).map(setup => setup[2].calcprops.combotime);
    
    let table = [
        { name: "Base points", title: "Points awarded for the chosen driver/kart/glider at the beginning of the race", format: "_", array: basepoints },
        { name: "Frenzy chance increase", title: "Bonus added to the base chance of rolling a frenzy", format: "+_%", array: frenzyinc },
        { name: "Action points multiplier", title: "Multiplier applied to each action's base points", format: "×_", array: kartmulti },
        { name: "Combo time multiplier", title: "Time increase for combos (over base ~1 second)", format: "×_", array: combotime },
        { name: "Bonus-points boost", title: "Bonus points awarded for every action", format: "+_", array: bpb}
    ];
    for (let row of table) {
        app.comparisons.summary.push({
            name: row.name,
            nametitle: row.title,
            values: row.array.map(x => {
                return { value: row.format.replace('_', x), highlight: x === Math.max(...row.array) }
            }),
            display: true
        })
    }
    
    app.comparisons.points = [];
    let actions = [].concat(...app.setups.slice(1)).map(x => x.type === 'driver' ? [] : Object.keys(actiondata).filter(y => actiondata[y].bonusskill === x.skill));
    actions = ["Dash Panel", "Jump Boost", "Mini-Turbo", "Super Mini-Turbo", "Ultra Mini-Turbo", "Rocket Start", "Slipstream", "Traffic cone", "Coin", "1st place!"].concat(...actions);
    for (let action of new Set(actions)) {
        let points = actiondata[action].points;
        let compoints = app.setups.slice(1).map((setup, i) => {
            return Math.ceil(points[0] * setup[1].calcprops.multiplier + app.stats[i].bpb + setup.reduce((p, item) => p + item.calcprops.skillpoints * (actiondata[action].bonusskill == item.skill), 0));
        });
        app.comparisons.points.push({
            name: action,
            nametitle: action === "Item hit" ? "Landing a hit with any item excluding those listed above" : undefined,
            values: compoints.map(x => {
                return { value: String(x), highlight: x === Math.max(...compoints)}
            }),
            display: true
        });
    }
    let compoints = app.setups.slice(1).map((setup, i) => {
        return Math.ceil(25 * setup[1].calcprops.multiplier + app.stats[i].bpb);
    });
    app.comparisons.points.push({
        name: "Item hit",
        nametitle: "Landing a hit with an item other than those already listed",
        values: compoints.map(x => {
            return { value: String(x), highlight: x === Math.max(...compoints)}
        }),
        display: true
    });
    app.comparisons.points.push({
        name: "1st place bonus-points boost",
        nametitle: "Points awarded at the end of the race for each action performed",
        values: bpb.map(x => ({ value: '+' + x, highlight: x === Math.max(...bpb) })),
        display: true
    });
}

function encodeLink() {
    let query = '?course=';
    query += app.setups[0].course.match(/[\w']+/g).map(x => x[0]).join("") + app.setups[0].variant;
    for (i = 1; i < app.setups.length; i++) {
        let setup = app.setups[i];
        query += '&setup' + i + '=';
        for (let j = 0; j < 3; j++) {
            let item = setup[j];
            query += (window[item.type + 'data'][item.name].id + 256).toString(16).slice(1);
            query += (uncalcPoints(item.type, item.rarity, item.points) + item.level * 32).toString(16);
        }
    }
    
    window.history.replaceState(null, '', query);
}

let startTime = new Date;
loadTracks();