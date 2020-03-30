import sys
from PIL import Image
from os import listdir

size = 120
dir = ""

if len(sys.argv) > 1:
    dir = sys.argv[1]

if len(sys.argv) > 2:
    size = int(sys.argv[2])

print("dir: " + dir)
print("size: " + str(size))

imfiles = [i for i in listdir(dir) if i[-4:] == ".png"]
print(imfiles)

for file in imfiles:
    dirfile = dir + ("/" if dir[-1:] != "/" else "") + file
    im = Image.open(dirfile)
    
    if im.size[0] == im.size[1] == size:
        print(file + " is already " + str(im.size))
        im.close()
        continue
    
    maxd = max([*im.size, size])
    xoff = 0 if im.size[0] == maxd else (maxd - im.size[0]) // 2
    yoff = 0 if im.size[1] == maxd else (maxd - im.size[1]) // 2

    blank = Image.new("RGBA", (maxd, maxd), (0, 0, 0, 0))
    im.copy()
    blank.paste(im, (xoff, yoff))
    
    rs = blank.resize((size, size), Image.LANCZOS) if maxd != size else blank
    rs.save(dirfile)
    print(file + " resized from " + str(im.size) + " to " + str(rs.size))
    
    im.close()
    blank.close()
    rs.close()

print("Finished resizing.")
