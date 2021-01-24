import sys
from PIL import Image
from os import listdir

for rarity in "Normal", "Rare", "Ultra":
  imfiles = [i for i in listdir("drivers/" + rarity) if i[-4:] == ".png" and i[0] != '_']
  print(imfiles)

  for file in imfiles:
    im = Image.open("drivers/" + rarity + "/" + file)
    size = im.size
    
    crop_l = max(im.crop((0, 0, 2, size[1])).tobytes("raw", "A")) > 15
    crop_t = max(im.crop((0, 0, size[0], 2)).tobytes("raw", "A")) > 15
    crop_r = max(im.crop((size[0] - 2, 0, size[0], size[1])).tobytes("raw", "A")) > 15
    crop_b = max(im.crop((0, size[1] - 2, size[0], size[1])).tobytes("raw", "A")) > 15
    edges = (crop_l, crop_t, crop_r, crop_b)
    print(file[0:12], im.size, edges)
    
    offsetX = 0
    if crop_l:
        offsetX = 0
    elif crop_r:
        offsetX = 204 - im.size[0]
    else:
        offsetX = (204 - im.size[0]) // 2
    
    offsetY = 0
    if crop_t:
        offsetY = 0
    elif crop_b:
        offsetY = 256 - im.size[1]
    else:
        offsetY = (256 - im.size[1]) // 2
    print(offsetX, offsetY)
    
    im_adj = Image.new("RGBA", (204, 256), (0, 0, 0, 0))
    im_adj.paste(im, (offsetX, offsetY))
    
    name = file[0:-13]
    im_adj.save("adj_drivers/" + rarity + "/" + name + ".png")
    
    print(name + ".png resized")
    
    im.close()
    im_adj.close()

print("Finished resizing.")
