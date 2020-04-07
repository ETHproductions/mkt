Vue.component('dkg-input', {
    props: {
        type: String, // "driver", "kart", or "glider"
        side: Number // 1 for left, 2 for right
    },
    data: function () {
        return {
            klass: 'input-' + this.side + ' ' + this.type,
            id: 'select-' + this.side + '-' + this.type
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
});

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
});

Vue.component('imagebox', {
    props: {
        type: String,
        name: String,
        color: String,
        rarity: Number,
        skill: String
    },
    computed: {
        mainimg: function () {
            let img = this.name.replace(/\?/g, "Q");
            if (img === "Pipe Frame" || img === "Super Glider")
                img += " " + this.color;
            return `../img/${ this.type }s/${ img }.png`;
        },
        raritytitle: function () {
            return ["default", "Normal", "Super", "High-End"][this.rarity];
        },
        rarityimg: function () {
            return `../img/items/${ this.raritytitle }.png`;
        },
        skilltitle: function () {
            return this.type == 'driver' ? this.skill : this.skill + ' Plus';
        },
        skillimg: function () {
            return `../img/items/${ this.skill }.png`;
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

let hiddenComparisons = { summary: 0, points: 1, scores: 0 };
Vue.component('show-hide-toggle', {
    props: {
        name: String,
        collapsed: Boolean
    },
    computed: {
        hiddenComparisons: function () {
            return hiddenComparisons;
        }
    },
    template: `<span class="show-hide" :id="'show-hide-' + name" v-on:click="hiddenComparisons[name]^=1">{{ hiddenComparisons[name] ? 'Show' : 'Hide' }}</span>`
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
Vue.component('comparison-section', {
    props: {
        name: String,
        prop: String,
        props: Array,
        collapsed: Boolean
    },
    created: function () {
        this.collapsed && $(this.prop).hide();
    },
    computed: {
        show: function () {
            return !hiddenComparisons[this.prop];
        }
    },
    template: `
      <div>
        <h3>{{ name }} (<show-hide-toggle :name="prop" :collapsed=collapsed></show-hide-toggle>)</h3>
        <table v-if="show" :id="'comparison-' + prop" is="comparison-table" :props="props"></table>
      </div>`
});

function buildSetup() {
    let setup = {};
    setup.dkg = [];
    
    for (let type of ["driver", "kart", "glider"])
    {
        let obj = {
            type: type,
            name: "default",
            color: "red",
            rarity: 0,
            skill: "default",
            skillpoints: 0,
            level: 0,
            points: 0,
            tier: 0,
            tierboost: "",
            fulltier: 0,
            calcprops: { bpb: 0, skillpoints: 0 },
            displayprops: []
        };
        if (type === "driver")
            obj.calcprops.frenzyinc = 0;
        if (type === "kart")
            obj.calcprops.multiplier = 0;
        if (type === "glider")
            obj.calcprops.combotime = 0;
        
        setup[type] = obj;
        setup.dkg.push(obj);
    }
    
    setup.stats = {};
    return setup;
}

var app = new Vue({
    el: '#container',
    data: {
        course: { tour: -1, cup: -1, index: -1, course: "", variant: "", fullname: "", displayname: "" },
        setups: [
            buildSetup(),
            buildSetup()
        ],
        level: 50,
        comparisons: { summary: [], points: [], scores: [] },
        hiddenComparisons: hiddenComparisons
    }
});


function loadCSV(file)
{
    return fetch(file)
        .then(response => response.text())
        .then(text => text.split("\r\n").map(l => l.split(",")));
}
function loadCourseData()
{
    loadCSV('../data/courses.csv').then(rawdata => {
        let rows = [], trackmap = {}, coursedata = {}, currtrack, currcourse;
        
        for (let j = 0; j < rawdata.length; j++)
        {
            rows[j] = rawdata[j][0];
        }
        for (let i = 1; i < rawdata[0].length; i++)
        {
            let coursename = rawdata[0][i],
                variant = rawdata[1][i];
            if (coursename)
            {
                currtrack = coursedata[coursename] = {};
                let trackkey = coursename.match(/[\w']+/g).map(x => x[0]).join("");
                trackmap[trackkey] = coursename;
            }
            if (variant)
            {
                currcourse = currtrack[variant] = {};
                currcourse.dkg_ttier = { drivers: [], karts: [], gliders: [] };
                currcourse.dkg_mtier = { drivers: [], karts: [], gliders: [] };
                for (let j = 2; j < rows.length; j++)
                {
                    currcourse[rows[j]] = +rawdata[j][i];
                }
            }
        }
        
        console.log("tracks:", window.coursedata = coursedata);
        window.maptrack = function maptrack(track, format = "")
        {
            track = track.replace(/\+$/, "");
            let variant = track.slice(-1);
            if ("NRTZ".includes(variant))
                track = track.slice(0, -1);
            else
                variant = "N";
            
            track = trackmap[track] || "Bowser's Castle 1";
            if (format === "object")
                return { course: track, variant: variant };
            if (format === "data")
                return coursedata[track][variant];
            
            if (/\D$/.test(track) && !(variant === "N" && format === "display"))
                track += " ";
            track += format === "display" ? variant === "N" ? "" : variant === "Z" ? "R/T" : variant : variant;
            return track;
        };
        loadTourData();
    });
}
function loadTourData()
{
    loadCSV('../data/tours.csv').then(rawdata => {
        let tourdata = [];
        
        for (let i = 0; i < rawdata.length; i++)
        {
            let rawtour = rawdata[i];
            let tour = tourdata[i] = {};
            
            tour.name = rawtour.shift();
            tour.date = new Date(rawtour.shift() + "T06:00:00Z");
            
            tour.spotlights = [rawtour.splice(0, 3), rawtour.splice(0, 3)];
            tour.cups = [];
            while (rawtour.length) {
                let cup = {};
                tour.cups.push(cup);
                cup.name = rawtour[0] + " Cup";
                cup.favored = rawtour.splice(0, 3);
                cup.courses = rawtour.splice(0, 3);
            }
        }
        
        console.log("tours:", window.tourdata = tourdata);
        loadActionData();
    });
}
function loadActionData()
{
    loadCSV('../data/actions.csv').then(rawdata => {
        let actiondata = { actions: [] };
        
        for (let i = 0; i < rawdata.length; i++)
        {
            let rawaction = rawdata[i];
            let actionname = rawaction.shift();
            actiondata.actions.push(actionname);
            let actionobj = actiondata[actionname] = {};
            
            let points = +rawaction.shift();
            let skill = rawaction.shift();
            if (skill === '')
                skill = 'N/A';
            else if (!skill) {
                actionobj.points = [points];
                continue;
            }
            actionobj.bonusskill = skill;
            actionobj.points = [points, ...rawaction.splice(0, 3).map(Number)];
        }
        
        console.log("actions:", window.actiondata = actiondata);
        
        loadItemData();
    });
}
function loadItemData()
{
    loadCSV('../data/items.csv').then(rawdata => {
        let itemdata = {};
        
        for (let i = 1; i < rawdata.length; i++)
        {
            let rawitem = rawdata[i];
            let itemobj = itemdata[rawitem.shift()] = {};
            itemobj.avpos = +rawitem.shift();
            
            let actions = rawitem.shift().split("|");
            itemobj.actionsn = {};
            for (let action of actions)
            {
                let [actionname, actioncount] = action.split("@");
                itemobj.actionsn[actionname] = actioncount;
            }
            actions = rawitem.shift().split("|");
            itemobj.actionsf = {};
            for (let action of actions)
            {
                let [actionname, actioncount] = action.split("@");
                itemobj.actionsf[actionname] = actioncount;
            }
        }
        
        console.log("items:", window.itemdata = itemdata);
        loadDKGData();
    });
}
function loadDKGData()
{
    let promises = 3;
    ["driver", "kart", "glider"].forEach(type => loadCSV('../data/' + type + 's.csv').then(rawdata =>
    {
        let rows = [], data = {map:[]}, curritem;
        
        for (let i = 0; i < rawdata.length; i++)
        {
            let rawdkg = rawdata[i];
            let name = rawdkg[1];
            curritem = data[name] = {};
            curritem.id = +rawdkg.shift();
            data.map[curritem.id] = rawdkg.shift();
            curritem.skill = rawdkg.shift();
            curritem.rarity = +rawdkg.shift();
            if (type === "driver")
                curritem.color = rawdkg.shift();
            
            curritem.tracks_ttier = [], curritem.tracks_mtier = [];
            rawdkg.forEach(course =>
            {
                let courseitem = maptrack(course, "data");
                if (course.slice(-1) == "+")
                {
                    curritem.tracks_ttier.push(maptrack(course));
                    courseitem.dkg_ttier[type + "s"].push(name);
                }
                else
                {
                    curritem.tracks_mtier.push(maptrack(course));
                    courseitem.dkg_mtier[type + "s"].push(name);
                }
            })
        }
        
        console.log(type + "s:", window[type + 'data'] = data);
        if (--promises <= 0)
            setupMenu();
    }));
}

function cloneSelect(n)
{
    $(`.input${ n }`).each((_, el) => el.value = $("#" + el.id.replace(n,n^1)).val())
    refreshSetups();
}
function setupMenu()
{
    console.log(`Data loaded in ${ new Date - startTime }ms`);
    
    for (let i = tourdata.length; i-- > 0; )
    {
        $("#select-tour").append(`<option value="${ i }">${ tourdata[i].name }</option>`);
    }
    for (let item in coursedata)
    {
        $("#select-course").append(`<option value="${ item }">${ item }</option>`);
    }
    for (let j of ["driver", "kart", "glider"])
    {
        for (let item in window[j + "data"])
        {
            if (item === 'map') continue;
            $(`.${ j }-name`).append(`<option value="${ item }">${ item }</option>`);
        }
        for (let side of [1, 2])
        {
            for (let i = 1; i <= 6; i++)
                $(`#select-${ side }-${ j }-level`).append(`<option value="${ i }">${ i }</option>`);
            for (let rarity = 1; rarity <= 3; rarity++)
            {
                for (let i = 25; i >= 0; i--)
                {
                    $(`#select-${ side }-${ j }-points-${ rarity }`).append(`<option value="${ i }">${ calcBasePoints(j, rarity, i) }</option>`);
                }
            }
        }
    }
    
    let urlParams = new URLSearchParams(window.location.search);
    for (let [name, value] of urlParams.entries())
    {
        if (name === 'tour')
        {
            if (!/^[0-9a-f]{4}$/i.test(value))
                value = 'fffb';
            
            let tourid = parseInt(value.slice(0, 2), 16);
            if (tourid >= tourdata.length)
            {
                $('#select-tour').val(-1);
                onTourChange(false);
            }
            else
            {
                $('#select-tour').val(tourid);
                onTourChange(false);
                
                value = parseInt(value.slice(2, 4), 16);
                let cup = value >> 2, index = value & 3;
                if (cup >= tourdata[tourid].cups.length) cup = 0;
                if (index === 3) index = 0;
                
                $('#select-cup-course').val(cup * 4 + index);
                onCourseChange(false);
            }
                
        }
        else if (name === 'course')
        {
            let track = maptrack(value);
            $('#select-course').val(track.slice(0, -1).trim());
            $('#select-variant').val(track.slice(-1));
        }
        else if (name === 'level')
        {
            app.level = value = Math.min(99, Math.max(1, Math.floor(value) || 50));
            $('#select-player-level').val(value);
        }
        else if (name.slice(0, 5) === 'setup')
        {
            let side = +name.slice(5);
            if (![1, 2].includes(side)) continue;
            for (let i = 0; i < 3; i++)
            {
                let type = ['driver', 'kart', 'glider'][i];
                if (value.length < 4) value = '0139';
                
                let name = window[type + 'data'].map[parseInt(value.slice(0, 2), 16)] || "Baby Mario";
                $(`#select-${ side }-${ type }-name`).val(name);
                
                let level = Math.max(1, Math.min(5, parseInt(value.slice(2, 4), 16) >> 5));
                $(`#select-${ side }-${ type }-level`).val(level);
                
                let rarity = window[type + 'data'][name].rarity;
                if (rarity !== 1)
                {
                    $(`#select-${ side }-${ type }-points-1`).hide();
                    $(`#select-${ side }-${ type }-points-${ rarity }`).show();
                }
                
                let points = Math.min(parseInt(value.slice(2, 4), 16) & 31, 25);
                $(`#select-${ side }-${ type }-points-${ rarity }`).val(points);
                value = value.slice(4);
            }
        }
    }
    
    onCourseChange();
    
    $(".dkg-input select").on("input", refreshSetups);
}

function calcBasePoints(type, rarity, index) {
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
function uncalcBasePoints(type, rarity, points) {
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

function onTourChange(propagate = true)
{
    let newtourid = +$("#select-tour").val(),
        course = app.course,
        newtour = tourdata[newtourid];
    
    if (course.tour === -1 && newtourid !== -1)
    {
        $("#select-course-full").hide();
        $("#select-course-tour").show();
    }
    
    if (newtourid === -1)
    {
        course.tour = -1;
        course.cup = -1;
        course.index = -1;
        $("#select-course-tour").hide();
        $("#select-course-full").show();
        $("#select-course").val(course.course);
        $("#select-variant").val(course.variant);
        propagate && onCourseChange();
    }
    else
    {
        course.tour = newtourid;
        course.cup = 0;
        $("#select-cup-course").empty();
        for (let i in newtour.cups)
        {
            let newcup = newtour.cups[i];
            
            for (let j in newcup.courses)
            {
                $("#select-cup-course").append(`<option value="${ i*4 + +j }">${ newcup.name + ' — ' + maptrack(newcup.courses[j], "display") }</option>`);
            }
        }
        propagate && onCourseChange();
    }
}
function onCourseChange(propagate = true) {
    let data = app.course;
    let oldcourse = data.course, oldvariant = data.variant;
    let course, variant;
    
    if (data.tour === -1)
    {
        course = $("#select-course").val();
        variant = $("#select-variant").val();
        
        if (oldcourse !== course)
        {
            data.course = course;
            if (coursedata[course] && "Z" in coursedata[course])
            {
                $("#course-rt").prop("disabled", false);
            }
            else
            {
                $("#course-rt").prop("disabled", "disabled");
                if ($("#select-variant").val() == null)
                {
                    $("#select-variant").val("N");
                    variant = "N";
                }
            }
        }
        data.variant = variant;
    }
    else
    {
        let tour = data.tour,
            index = +$("#select-cup-course").val(),
            cup = index >> 2;
        data.index = index %= 4;
        data.cup = cup;
        
        let newcourse = maptrack(tourdata[tour].cups[cup].courses[data.index], "object");
        data.course = course = newcourse.course;
        data.variant = variant = newcourse.variant;
    }
    
    data.fullname = course + (/\D$/.test(course) ? " " : "") + variant;
    data.displayname = data.fullname.replace(/Z$/, "R/T").replace(/N$/, "");
    $("#result-track").html(`<img src="../img/courses/${ data.fullname }.png" title="${ data.displayname }">`);
    
    propagate && refreshSetups();
}
function refreshSetups()
{
    let side = 0;
    for (let setup of app.setups)
    {
        side++;
        setup.stats = { basepoints: 0, bpb: 0 };
        for (let type of ["driver", "kart", "glider"])
        {
            let item = setup[type];
            for (let k of ["name", "level", "points"])
            {
                let val = $(`#select-${ side }-${ type }-${ k === "points" ? k + '-' + item.rarity : k }`).val();
                if (k === 'points')
                    val = calcBasePoints(type, item.rarity, val);
                
                if (item[k] !== val)
                {
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
                        if (type === "driver")
                        {
                            item.color = data.color;
                            setup.kart.color = data.color;
                            setup.glider.color = data.color;
                        }
                        else
                            item.skillpoints = actiondata[actiondata.actions.find(x => actiondata[x].bonusskill === data.skill)].points[data.rarity];
                    }
                }
            }
            let data = window[type + "data"][item.name];
            let course = app.course, tour = tourdata[course.tour];

            item.tier = item.fulltier = data.tracks_ttier.includes(course.fullname) ? 3 : data.tracks_mtier.includes(course.fullname) ? 2 : 1;

            item.tierboost = undefined;
            if ((course.index === 1 && tour.spotlights[0].includes(item.name))
             || (course.index === 2 && tour.spotlights[1].includes(item.name)))
                item.tierboost = "spotlight",
                item.fulltier++;
            if (tour && tour.cups[course.cup].favored.includes(item.name))
                item.tierboost = item.tierboost ? "cup & spotlight" : "cup",
                item.fulltier++;
            item.fulltier = Math.min(item.fulltier, 3);

            setup.stats.basepoints = roundDecimals(setup.stats.basepoints + item.points);

            item.calcprops.bpb = item.fulltier === 3 ? roundDecimals(item.points / 200 * (item.level - 1)) : 0;
            setup.stats.bpb = roundDecimals(setup.stats.bpb + item.calcprops.bpb);
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
                item.calcprops.multiplier = roundDecimals((1 + ((item.level >> 1) + item.rarity - 1) / 20) * (item.fulltier + 1) / 2);
                dp.push({
                    name: "Points multiplier",
                    nametitle: "Multiplier applied to the base points of each action",
                    value: "×" + item.calcprops.multiplier
                });
            }
            if (item.type === 'glider') {
                item.calcprops.combotime = roundDecimals((1 + ((item.level >> 1) + item.rarity - 1) / 20) * (item.fulltier + 1) / 2);
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
                let action = actiondata.actions.find(x => actiondata[x].bonusskill === item.skill);
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
    
    encodeLink();
    calcResults();
}

function calcResults()
{
    app.comparisons.summary = [];
    app.stats = [];
    let sm = f => app.setups.map(f);
    
    let table = [
        { name: "Base points", title: "Points awarded for the chosen driver/kart/glider at the beginning of the race", format: "_", array: sm(x => x.stats.basepoints) },
        app.setups[0].driver.fulltier * app.setups[1].driver.fulltier === 9
          ? { name: "Frenzy chance increase", title: "Bonus added to the base chance of rolling a frenzy", format: "+_%", array: sm(x => x.driver.calcprops.frenzyinc) }
          : { name: "Items per item box", title: "Number of items the driver can hold", format: "_", array: sm(x => x.driver.fulltier) },
        { name: "Action points multiplier", title: "Multiplier from the kart applied to each action's base points", format: "×_", array: sm(x => x.kart.calcprops.multiplier) },
        app.setups[0].glider.fulltier === app.setups[1].glider.fulltier
          ? { name: "Base combo time", title: "The base amount of time after most actions before the combo expires", format: "×_", array: sm(x => x.glider.calcprops.combotime) }
          : { name: "Combo multiplier", title: "The increase in bonus points for every action in a combo (up to the 16th)", format: "×_", array: sm(x => x.glider.fulltier) },
        { name: "Bonus-points boost", title: "Bonus points awarded for every action", format: "+_", array: sm(x => x.stats.bpb) }
    ];
    for (let row of table) {
        app.comparisons.summary.push({
            name: row.name,
            nametitle: row.title,
            values: row.array.map(x => {
                return { value: typeof x === "number" ? row.format.replace('_', x) : x, highlight: x === Math.max(...row.array) }
            }),
            display: true
        })
    }
    
    app.comparisons.points = [];
    
    let addMaxRow = function(action, title, actionpoints) {
        let compoints = app.setups.map(setup => calcActionPoints(setup, actionpoints || action));
        app.comparisons.points.push({
            name: action,
            nametitle: title,
            values: compoints.map(x => {
                return { value: String(x), highlight: x === Math.max(...compoints.filter(x => typeof x === "number")) }
            }),
            display: true
        });
    };
    
    let actions = [];
    for (let j of ["glider", "driver"])
        for (let x of app.setups)
            actions.push(...actiondata.actions.filter(y => actiondata[y].bonusskill === x[j].skill));

    actions = ["Dash Panel", "Jump Boost", "Mini-Turbo", "Super Mini-Turbo", "Ultra Mini-Turbo", "Rocket Start", "Slipstream", "Traffic cone", "Coin (action)"].concat(...actions);
    
    for (let action of new Set(actions))
        addMaxRow(action, 
                 action === "Coin (action)" ? "Picking up a coin from the track" :
                 action === "Coin" ? "Occurs twice when a coin item is rolled" :
                 action === "Mushroom" ? "Using a Mushroom obtained from an item box" : undefined);
    
    addMaxRow("Item hit", "Landing a hit with an item other than those already listed", 25);
    addMaxRow("1st place!", "Finishing the 1st lap (or 1st or 2nd segment) in 1st place", 200);
    app.comparisons.points.push({
        name: "1st place bonus-points boost",
        nametitle: "Points awarded at the end of the race for each action performed",
        values: sm(x => x.stats.bpb).map((x, i, a) => ({ value: '+' + x, highlight: x === Math.max(...a) })),
        display: true
    });
    
    app.comparisons.scores = [];
    let course = coursedata[app.course.course][app.course.variant];
    let baseactioncount = course["Dash Panel"] + course["Jump Boost"] + course["Mini-Turbo"] + course["Slipstream"] + 3 * course["Item Box"];
    let stats = [];
    for (let i in app.setups)
    {
        let stat = stats[i] = {};
        let setup = app.setups[i];
        
        stat.kartskill = setup.kart.skill;
        stat.kartskillpoints = setup.kart.skillpoints;
        stat.kartskillactions = stat.kartskill == "Rocket Start" ? 1 : course[setup.kart.skill];
        stat.kartpoints = stat.kartskillpoints * stat.kartskillactions;
        
        stat.bpb = roundDecimals(setup.stats.bpb);
        stat.driveractions = (setup.driver.fulltier + (setup.driver.fulltier === 3 ? (10 + setup.driver.calcprops.frenzyinc) / 20 : 0)) * course["Item Box"];
        stat.totalactions = Math.round(baseactioncount + stat.driveractions);
        stat.totalbpb = Math.ceil(stat.totalactions * stat.bpb * 2);
        
        stat.basepoints = setup.stats.basepoints;
        
        stat.baseactionpoints = course["Dash Panel"] * 10 + course["Jump Boost"] * 10 + course["Mini-Turbo"] * 5 + 1 * 30 + course["Slipstream"] * 30 + 3 * course["Item Box"] * 10 + stat.driveractions * 5 + 200;
        stat.kartmultiplier = setup.kart.calcprops.multiplier;
        stat.totalactionpoints = Math.ceil(stat.baseactionpoints * stat.kartmultiplier);
        
        stat.comborating = roundDecimals(stat.totalactions / (course["Item Box"] + course["Mini-Turbo"]/3));
        stat.combotime = setup.glider.calcprops.combotime;
        stat.comboscore = setup.glider.fulltier;
        stat.combopoints = Math.ceil(Math.min(stat.comborating * stat.combotime * 0.8, 15) * stat.comboscore * (stat.totalactions - 8));
        
        stat.level = app.level;
        stat.positionpoints =
            stat.level <= 10 ? 2350 + stat.level * 50 :
            stat.level <= 20 ? 2460 + stat.level * 40 : 
            stat.level <= 30 ? 2670 + stat.level * 30 :
            2980 + (stat.level + (stat.level > 42)) * 20;
        stat.totalpoints = stat.basepoints + stat.totalactionpoints + stat.kartpoints + stat.combopoints + stat.totalbpb + stat.positionpoints;
    }

    app.comparisons.scores.push({
        name: "Base points",
        values: stats.map(stat => {
            return {
                value: String(stat.basepoints),
                highlight: stat.basepoints === Math.max(...stats.map(x => x.basepoints))
            };
        }),
        display: true
    });
    
    app.comparisons.scores.push({
        name: "Position points",
        values: stats.map(stat => {
            return {
                value: String(stat.positionpoints),
                title: "1st place position points for a player level of " + app.level,
                highlight: true
            };
        }),
        display: true
    });
    
    app.comparisons.scores.push({
        name: "Action points",
        values: stats.map(stat => {
            return {
                value: String(stat.totalactionpoints),
                title: `${ stat.kartmultiplier } action points multiplier × ${ stat.baseactionpoints } base action points estimated for a great race on ${ app.course.displayname }`,
                highlight: stat.totalactionpoints === Math.max(...stats.map(x => x.totalactionpoints))
            };
        }),
        display: true
    });
    
    app.comparisons.scores.push({
        name: "Combo bonus",
        values: stats.map(stat => {
            return {
                value: String(stat.combopoints),
                title: `${ roundDecimals(stat.combopoints / (stat.totalactions - 8)) } average combo points × (${ stat.totalactions } - 8) actions estimated for a great race on ${ app.course.displayname }`,
                highlight: stat.combopoints === Math.max(...stats.map(x => x.combopoints))
            };
        }),
        display: true
    });
    
    app.comparisons.scores.push({
        name: "Kart skill bonus",
        values: stats.map(stat => {
            return {
                value: String(stat.kartpoints),
                title: `${ stat.kartskillpoints } bonus points × ${ stat.kartskillactions } ${ stat.kartskill }${ stat.kartskillactions === 1 ? "" : "s" } estimated to be feasible on ${ app.course.displayname }`,
                highlight: stat.kartpoints === Math.max(...stats.map(x => x.kartpoints))
            };
        }),
        display: true
    });
    
    app.comparisons.scores.push({
        name: "Bonus-points boost",
        values: stats.map(stat => {
            return {
                value: String(stat.totalbpb),
                title: `2 × ${ stat.bpb } bonus-points boost × ${ stat.totalactions } actions estimated for a great race on ${ app.course.displayname }`,
                highlight: stat.totalbpb === Math.max(...stats.map(x => x.totalbpb))
            };
        }),
        display: true
    });
    
    app.comparisons.scores.push({
        name: "Total estimated score",
        nametitle: "Estimated total for a great race with each setup",
        values: stats.map(stat => {
            return {
                value: String(stat.totalpoints),
                highlight: stat.totalpoints === Math.max(...stats.map(x => x.totalpoints))
            };
        }),
        display: true
    });
}

function calcActionPoints(setup, action)
{
    let data = actiondata[action];
    let points = typeof action === "number" ? action : data.points[0];
    points *= setup.kart.calcprops.multiplier;

    if (data)
    {
        if (data.bonusskill && data.points.length === 1)
            if (setup.driver.skill !== data.bonusskill)
                return "N/A";

        if (setup.kart.skill === data.bonusskill)
            points += setup.kart.calcprops.skillpoints;
        if (setup.glider.skill === data.bonusskill)
            points += setup.glider.calcprops.skillpoints;
    }

    points += setup.stats.bpb;
    
    return Math.ceil(points);
}
function roundDecimals(num, decimals = 3)
{
    let mult = 10 ** decimals;
    return Math.round(num * mult) / mult;
}
function to8bHex(value)
{
    return (value + 256).toString(16).slice(-2);
}
function encodeLink()
{
    let query = '?tour=';
    query += to8bHex(app.course.tour) + to8bHex(app.course.cup * 4 + app.course.index);
    query += '&course='
    query += app.course.course.match(/[\w']+/g).map(x => x[0]).join("") + app.course.variant;
    query += '&level=' + app.level;
    for (i = 0; i < app.setups.length; i++)
    {
        let setup = app.setups[i];
        query += '&setup' + (i + 1) + '=';
        for (let j = 0; j < 3; j++)
        {
            let item = setup.dkg[j];
            query += to8bHex(window[item.type + 'data'][item.name].id);
            query += to8bHex(uncalcBasePoints(item.type, item.rarity, item.points) + item.level * 32);
        }
    }
    
    window.history.replaceState(null, '', query);
}

let startTime = new Date;
loadCourseData();