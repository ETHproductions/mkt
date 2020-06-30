let fonts = {
    numbercolor: {
        "data": $("#font-numbercolor")[0],
        "name": "numbercolor",
        "height": 108,
        "charset": "0123456789,.+?",
        "chars": {
            "0": { "offset": 0, "width": 77 },
            "1": { "offset": 77, "width": 77 },
            "2": { "offset": 154, "width": 77 },
            "3": { "offset": 231, "width": 77 },
            "4": { "offset": 308, "width": 77 },
            "5": { "offset": 385, "width": 77 },
            "6": { "offset": 462, "width": 77 },
            "7": { "offset": 539, "width": 77 },
            "8": { "offset": 616, "width": 77 },
            "9": { "offset": 693, "width": 77 },
            ",": { "offset": 770, "width": 31 },
            ".": { "offset": 801, "width": 31 },
            "+": { "offset": 832, "width": 58 },
            "?": { "offset": 890, "width": 77 },
            "!": { "offset": 88, "width": 50 }, // alternate 1 for the thousands place
            " ": { "offset": 138, "width": 16 } // no-break space for French locales
        }
    },
    numberrodinlevel: {
        "data": $("#font-numberrodinlevel")[0],
        "name": "numberrodinlevel",
        "height": 119,
        "charset": "0123456789@",
        "chars": {
            "0": { "offset": 0, "width": 104 },
            "1": { "offset": 104, "width": 64 },
            "2": { "offset": 168, "width": 103 },
            "3": { "offset": 271, "width": 105 },
            "4": { "offset": 376, "width": 109 },
            "5": { "offset": 485, "width": 103 },
            "6": { "offset": 588, "width": 105 },
            "7": { "offset": 693, "width": 100 },
            "8": { "offset": 793, "width": 107 },
            "9": { "offset": 900, "width": 105 },
            "@": { "offset": 1005, "width": 123 } // LV symbol
        }
    }
};

let DKGCard = Vue.component('dkg-card', {
    props: {
        card: Object
    },
    mounted: function () {
        this.update();
    },
    methods: {
        update: function () {
            let card = this.card;
            let item = card.item;
            let dkgdata = window[card.type + 'data'][item.name];
            let index = dkgdata.id - 1;
            if (card.type != "driver")
                index += 20;
            
            let ctx = this.$el.getContext("2d");
            ctx.clearRect(0, 0, 216, 280);
            
            ctx.drawImage(document.getElementById("cards-" + card.type), 216 * (index % 10), 280 * (index / 10 | 0), 216, 280, 0, 0, 216, 280);

            if (item.level === 0)
            {
                ctx.fillStyle = "#000a";
                ctx.fillRect(0, 0, 216, 280);
            }
            else
            {
                ctx.drawImage(document.getElementById("cards-items"), 120 * (dkgdata.skill % 10), 120 * (dkgdata.skill / 10 | 0), 120, 120, 12, 200, 64, 64);
                let basepoints = getBasePoints(card.type, item.rarity, item.bplevel);
                drawText(ctx, fonts.numbercolor, 0.4, basepoints.toLocaleString().replace(/^1/, "!") + 'p', 207, 222, 'right')
                drawText(ctx, fonts.numberrodinlevel, 0.333, '@' + item.level, 207, 179, 'right')
            }
        },
        setCard: function (name) {
            app.openCard(name);
        }
    },
    template: `<canvas class="card" :id='"canvas-" + card.type + "-" + card.itemid' v-on:click="setCard(card)" width=216 height=280></canvas>`
});

Vue.component('section-drivers', {
    template: `<dkg-section type="driver"></dkg-section>`
});
Vue.component('section-karts', {
    template: `<dkg-section type="kart"></dkg-section>`
});
Vue.component('section-gliders', {
    template: `<dkg-section type="glider"></dkg-section>`
});

let inventory = localStorage.getItem("user-inventory");
if (inventory == null) {
    inventory = { drivers: {}, karts: {}, gliders: {} };
    console.log('Created empty inventory:', inventory);
} else {
    console.log('Loaded user inventory:', JSON.parse(inventory));
    inventory = JSON.parse(inventory);
}
let allcards = {};

Vue.component('dkg-section', {
    props: {
        type: String
    },
    render: function (createElement) {
        let children = [];
        let dkgdata = window[this.type + 'data'];
        for (let name in dkgdata) if (name != 'map') {
            let itemid = dkgdata[name].id;
            let item = inventory[this.type + 's'][itemid] || {
                name: name,
                rarity: dkgdata[name].rarity,
                itemid: itemid,
                level: 0,
                sublevel: 0,
                pointscap: 0,
                bplevel: 25
            };
            inventory[this.type + 's'][itemid] = item;
            let card = { item: item, type: this.type };
            
            let elem = createElement(DKGCard, {
                props: { card }
            });
            children.push(elem);
            
            card.elem = elem;
            card.type = this.type;
            allcards[name] = card;
        }
        return createElement('div', { attrs: { id: 'section-' + this.type, class: 'dkg-section' }}, children);
    }
});

Vue.component('nav-item', {
    props: {
        tab: String,
        active: Boolean
    },
    template: `
    <li :class="'nav-item' + (active ? ' active' : '')">
        <a :href="'#' + tab" v-on:click="$emit('change-tab')">
            <img :src="'../img/items/' + tab + '.png'">
        </a>
    </li>`
});

Vue.component('editor-select', {
    props: ['values', 'defaultval'],
    methods: {
        onInput: function () {
            app.updateCard();
        }
    },
    template: `
    <select v-on:change="$emit('input', $event.target.value); onInput()">
        <option v-for="(name, value) in values" :value=value :selected="value == defaultval">{{name}}</option>
    </select>`
});

let bpobjCache = {};
function getBasePointsObj(type, rarity, pointscap) {
    let cacheKey = type + rarity + pointscap;
    if (bpobjCache[cacheKey])
        return bpobjCache[cacheKey];
    
    let driver = type == 'driver';
    let bpobj = {};
    let bp = (driver ? [,400,450,500] : [,200,220,250])[rarity];
    let inc = (driver ? [,8,9,12] : [,4,4,6])[rarity];

    let index = 0;
    while (index < 15)
        bpobj[index++] = bp, bp += inc;

    if (!driver && rarity == 2) inc = 5;
    while (index < 25)
        bpobj[index++] = bp, bp += inc;

    inc = (driver ? [,8,15,30] : [,4,6,15])[rarity];
    let caplevel = [25,31,38,45][pointscap];
    while (index <= caplevel)
        bpobj[index++] = bp, bp += inc;
    
    bpobjCache[cacheKey] = bpobj;

    return bpobj;
}
function getBasePoints(type, rarity, bplevel) {
    let bpobj = bpobjCache[type + rarity + 3];
    if (!bpobj)
        bpobj = getBasePointsObj(type, rarity, 3);
    return bpobj[bplevel];
}

let slobjCache = {};
function getSubLevelMax(rarity, level) {
    return [,
        [,2,5,8,11,14],
        [,1,2,3,4,5],
        [,1,1,2,2,3]
    ][rarity][level];
}
function getSubLevelObj(rarity, level) {
    let cacheKey = "" + rarity + level;
    if (slobjCache[cacheKey])
        return slobjCache[cacheKey];
    
    let slmax = getSubLevelMax(rarity, level);
    let slobj = {};
    
    let sl = 0;
    while (sl < slmax)
        slobj[sl] = sl++ + "/" + slmax;
    
    slobjCache[cacheKey] = slobj;
    
    return slobj;
}

function drawChar(ctx, font, size, char, x, y) {
    let chardata = font.chars[char];
    if (!chardata) return;
    ctx.drawImage(font.data, chardata.offset, 0, chardata.width, font.height, x, y, chardata.width * size, font.height * size);
}
function drawText(ctx, font, size, text, x, y, align = 'left') {
    let width = 0;
    for (let char of text) if (char in font.chars)
        width += font.chars[char].width || 0;
    width *= size;
    x -= align == 'right' ? width : align == 'center' ? width / 2 : 0;

    for (let char of text) if (char in font.chars) {
        drawChar(ctx, font, size, char, x, y);
        x += font.chars[char].width * size || 0;
    }
}

let imgs = document.images, remaining = imgs.length;
[].forEach.call(imgs, function(img) {
    if (img.complete)
        imageLoaded();
    else
        img.addEventListener('load', imageLoaded);
});
function imageLoaded() {
    remaining -= 1;
    if (remaining === 0)
        loadData().then(finishedLoading);
}

let app;
function finishedLoading() {
    $('#card-editor').removeClass('hidden');
    app = new Vue({
        el: '#container',
        data: {
            activeTab: 'drivers',
            inventory: inventory,
            editorOpen: false,
            activeCard: null,
            levelObj: {
                "1": 1,
                "2": 2,
                "3": 3,
                "4": 4,
                "5": 5,
                "6": 6
            },
            pointscapObj: {
                "0": "Base",
                "1": "+1",
                "2": "+2",
                "3": "Max"
            }
        },
        computed: {
            currentTabComponent: function() {
                return 'section-' + this.activeTab;
            },
            basepointsObj: function() {
                if (!this.activeCard) throw new ReferenceError("Cannot retrieve possible base points for a null item");
                let card = this.activeCard;
                return getBasePointsObj(card.type, card.item.rarity, card.item.pointscap);
            },
            sublevelObj: function() {
                if (!this.activeCard) throw new ReferenceError("Cannot retrieve possible base points for a null item");
                let item = this.activeCard.item;
                return getSubLevelObj(item.rarity, item.level);
            }
        },
        methods: {
            closeEditor: function () {
                this.editorOpen = false;
                this.activeCard = null;
            },
            openCard: function (card) {
                if (this.activeCard == card)
                    return;
                this.closeEditor();
                setTimeout(() => {
                    this.activeCard = card;
                    this.editorOpen = true;
                }, 1);
            },
            updateCard: function () {
                if (!this.activeCard) throw new ReferenceError("Cannot update card for a null item");
                let item = this.activeCard.item;
                item.level |= 0;
                item.sublevel |= 0;
                item.pointscap |= 0;
                item.bplevel |= 0;
                this.activeCard.elem.componentInstance.update();
                $("#card-editor-card")[0].__vue__.update();
                localStorage.setItem('user-inventory', JSON.stringify(inventory));
            },
            toggleOwned: function () {
                if (!this.activeCard) throw new ReferenceError("Cannot toggle ownership of a null item");
                if (this.activeCard.item.level == 0)
                    this.activeCard.item.level = 1;
                else
                    this.activeCard.item.level = 0;
                this.updateCard();
            },
            confirmReset: function () {
                this.closeEditor();
                if (!confirm("Do you really want to reset everything in your inventory? This cannot be undone."))
                    return;
                for (let type in inventory) {
                    let items = inventory[type];
                    for (let id in items) {
                        let item = items[id];
                        item.level = 0;
                        item.sublevel = 0;
                        item.pointscap = 0;
                        item.bplevel = 25;
                    }
                }
                localStorage.setItem('user-inventory', JSON.stringify(inventory));
                for (let name in allcards)
                    allcards[name].elem.componentInstance.update();
            }
        }
    });
}