import sys
from PIL import Image
from os import listdir

for rarity in "Normal", "Rare", "Ultra":
  imfiles = [i for i in listdir("adj_drivers/" + rarity) if i[-4:] == ".png" and i[0] != '_']
  print(imfiles)
  
  im_base = Image.open("../frames/" + rarity + "DriverBase.png")
  im_frame = Image.open("../frames/" + rarity + "DriverFrame.png")

  for file in imfiles:
    im = Image.open("adj_drivers/" + rarity + "/" + file)
    size = im.size
    
    im_adj = Image.new("RGBA", (216, 280), (0, 0, 0, 0))
    im_adj.paste(im, (6, 7))
    
    final = Image.new("RGBA", (216, 280), (0, 0, 0, 0))
    final = Image.alpha_composite(final, im_base)
    final = Image.alpha_composite(final, im_adj)
    final = Image.alpha_composite(final, im_frame)
    
    final.save("../cards2/drivers/" + rarity + "/" + file)
    print(file + " converted")
    
    im.close()
    im_adj.close()
    final.close()
  im_base.close()
  im_frame.close()

print("Finished resizing.")
