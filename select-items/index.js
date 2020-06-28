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
        type: String, // "driver", "kart", or "glider"
        name: String,
        id: Number,
        level: Number,
        pointscap: Number,
        basepoints: Number
    },
    mounted: function () {
        this.update();
    },
    methods: {
        update: function () {
            let data = window[this.type + 'data'][this.name];
            console.log(data)
            let index = data.id - 1;
            if (this.type != "driver")
                index += 20;
            
            let ctx = this.$el.getContext("2d");
            ctx.drawImage(document.getElementById("cards-" + this.type), 216 * (index % 10), 280 * (index / 10 | 0), 216, 280, 0, 0, 216, 280);

            if (this.level === 0)
            {
                ctx.fillStyle = "#000a";
                ctx.fillRect(0, 0, 216, 280);
            }
            else
            {
                ctx.drawImage(document.getElementById("cards-items"), 120 * (data.skill % 10), 120 * (data.skill / 10 | 0), 120, 120, 12, 200, 64, 64);
                drawText(ctx, fonts.numbercolor, 0.4, this.basepoints.toLocaleString().replace(/^1/, "!") + 'p', 207, 222, 'right')
                drawText(ctx, fonts.numberrodinlevel, 0.333, '@' + this.level, 207, 179, 'right')
            }
        }
    },
    template: `<canvas class="card" :id='"canvas-" + type + "-" + id' width=216 height=280></canvas>`
});

Vue.component('dkg-section', {
    props: {
        type: String
    },
    render: function (createElement) {
        let children = [];
        let data = window[this.type + 'data']
        for (let name in data) if (name != 'map') {
            let id = data[name].id;
            let elem = createElement(DKGCard, {
                props: {
                    type: this.type,
                    name: name,
                    id: id,
                    level: Math.random()**(data[name].rarity/2 + 0.5) * 5 + (3 - data[name].rarity) - id/100 | 0,
                    pointscap: 0,
                    basepoints: (this.type == 'drivers' ? [, 600, 675, 800] : [, 300, 330, 400])[data[name].rarity]
                }
            })
            children.push(elem)
            console.log(elem)
        }
        return createElement('div', { attrs: { id: 'section-' + this.type + 's', class: 'dkg-section' }}, children)
    }
})

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

function finishedLoading() {
    let app = new Vue({
        el: '#container',
        data: {
            inventory: { drivers: [], karts: [], gliders: [] }
        }
    });
}