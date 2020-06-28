async function loadData() {
    return await loadCourseData();
}

function loadCSV(file)
{
    return fetch(file)
        .then(response => response.text())
        .then(text => text.split(/\r?\n/).map(l => l.split(",")));
}
function loadCourseData()
{
    return loadCSV('../data/courses.csv').then(rawdata => {
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
        return loadTourData();
    });
}
function loadTourData()
{
    return loadCSV('../data/tours.csv').then(rawdata => {
        let tourdata = [];
        
        for (let i = 0; i < rawdata.length; i++)
        {
            let rawtour = rawdata[i];
            let tour = tourdata[i] = {};
            
            tour.name = rawtour.shift();
            tour.date = new Date(rawtour.shift() + "T06:00:00Z");
            
            tour.spotlights = rawtour.splice(0, 3).map(x => x.split("|"));
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
        return loadActionData();
    });
}
function loadActionData()
{
    return loadCSV('../data/actions.csv').then(rawdata => {
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
        
        return loadItemData();
    });
}
function loadItemData()
{
    return loadCSV('../data/items.csv').then(rawdata => {
        let itemdata = { map: [] };
        
        for (let i = 1; i < rawdata.length; i++)
        {
            let rawitem = rawdata[i];
            let id = +rawitem.shift();
            let name = rawitem.shift();
            let itemobj = itemdata[name] = { id, name };
            itemdata.map[id] = name;
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
        return loadDKGData();
    });
}
function loadDKGData()
{
    function loadDKGType(type)
    {
        return loadCSV('../data/' + type + 's.csv').then(rawdata =>
        {
            let rows = [], data = {map:[]}, curritem;

            for (let i = 0; i < rawdata.length; i++)
            {
                let rawdkg = rawdata[i];
                let name = rawdkg[1];
                curritem = data[name] = {};
                curritem.id = +rawdkg.shift();
                data.map[curritem.id] = rawdkg.shift();
                curritem.skill = +rawdkg.shift();
                curritem.rarity = +rawdkg.shift();
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
        });
    }
    return loadDKGType("driver")
        .then(() => loadDKGType("kart"))
        .then(() => loadDKGType("glider"));
}