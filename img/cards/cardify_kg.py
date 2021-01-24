import sys
from PIL import Image
from os import listdir

for type in "karts", "gliders":
 for rarity in "Normal", "Rare", "Ultra":
  imfiles = [i for i in listdir(type + "/" + rarity) if i[-4:] == ".png" and i[0] != '_']
  print(imfiles)
  
  im_base = Image.open("../frames/" + rarity + "KartBase.png")
  im_frame = Image.open("../frames/" + rarity + "KartFrame.png")

  for file in imfiles:
    im = Image.open(type + "/" + rarity + "/" + file)
    size = im.size
    im = im.resize((round(size[0]/2.85), round(size[1]/2.85)), Image.LANCZOS)#, (+(size[0]%3>0), +(size[1]%3>0), size[0]-(size[0]%3>1), size[1]-(size[1]%3>1)))
    
    im_adj = Image.new("RGBA", (216, 280), (0, 0, 0, 0))
    im_adj.paste(im, (108 - im.size[0]//2, 146 - im.size[1]//2))
    
    final = Image.new("RGBA", (216, 280), (0, 0, 0, 0))
    final = Image.alpha_composite(final, im_base)
    final = Image.alpha_composite(final, im_adj)
    final = Image.alpha_composite(final, im_frame)
    
    final.save("../cards2/" + type + "/" + rarity + "/" + file[:-10] + ".png")
    print(file + " converted")
    
    im.close()
    im_adj.close()
    final.close()
  im_base.close()
  im_frame.close()

print("Finished resizing.")
