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
            $(`#select-1-${ j }`).append(`<option value="${ item }">${ item }</option>`);
        }
    }
    for (let item in coursedata)
    {
        $("#select-track").append(`<option value="${ item }">${ item }</option>`);
    }
    
    cloneSelect(-2);
    
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