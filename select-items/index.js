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
            "?": { "offset": 890, "width": 77 }
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
            "@": { "offset": 1005, "width": 123 }
        }
    }
};

function drawChar(ctx, font, size, char, x, y) {
    let chardata = font.chars[char];
    if (!chardata) return;
    ctx.drawImage(font.data, chardata.offset, 0, chardata.width, font.height, x, y, chardata.width * size, font.height * size);
}
function drawText(ctx, font, size, text, x, y, align = 'left') {
    let width = 0;
    for (let char of text)
        width += font.chars[char].width || 0;
    width *= size;
    x -= align == 'right' ? width : align == 'center' ? width / 2 : 0;

    for (let char of text) {
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
    let ctx = document.getElementById("canvas-driver-1").getContext("2d");
    ctx.drawImage(document.getElementById("cards-driver"), 216 * 1, 280 * 4, 216, 280, 0, 0, 216, 280);

    ctx.drawImage(document.getElementById("cards-items"), 120 * 4, 120 * 4, 120, 120, 12, 200, 64, 64);

    drawText(ctx, fonts.numbercolor, 0.4, '980', 207, 222, 'right')
    drawText(ctx, fonts.numberrodinlevel, 0.333, '@4', 207, 179, 'right')
}