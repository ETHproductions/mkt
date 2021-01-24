import sys
from PIL import Image
from os import listdir

imfiles = []
colors = [
  "Black", "Blue", "Brown", "Green", "Orange",
  "Pink", "Red", "WineRed", "EmeraldGreen",
  "Black", "Gray", "LightBlue", "LightGreen",
  "PinkGold", "Purple", "Silver", "Ultramarine",
  "White", "Yellow"
]

def add_images(index):
  for file in imfiles:
      im_dkg = Image.open(dir + "/" + file)
      im_dkg.copy()
      im.paste(im_dkg, (index % 10 * 216, index // 10 * 280), im_dkg)
      
      print("Finished with " + file)
      im_dkg.close()
      index += 1

dir = ""

if len(sys.argv) > 1:
    dir = sys.argv[1]

print("dir: " + dir)

if dir == "gliders":
    imfiles = ["Normal/Wing_Std_" + i + ".png" for i in colors]
elif dir == "karts":
    imfiles = ["Normal/Machine_70048_" + str(i) + "_20008.png" for i in range(10038, 10057)]


index = 0
if len(imfiles) > 0:
    print("Finished with color variants.\n")
    index = 20

lines = {}
maxid = 0
file = open('../../data/' + dir + '_new.csv', encoding='utf8')
for line in file.readlines():
    line = line.split(',')
    print(line[2] + ': ' + line[3])
    line[2] = int(line[2])
    lines[line[2]] = line
    maxid = max(maxid, line[2])

im = Image.new('RGBA', (10 * 216, (len(lines) + 20*(dir != "drivers") + 9) // 10 * 280))
add_images(0)

lines = [lines[i] for i in range(1, maxid+1)]
imfiles = [[0,"Normal","Rare","Ultra"][int(x[5])] + "/" + ("Machine_" + x[0][4:] if dir == "karts" else x[1]) + ".png" for x in lines]

print(imfiles)
add_images(index)

print("Finished resizing.")
im.save(dir + ".png")
