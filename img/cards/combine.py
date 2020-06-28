import sys
from PIL import Image
from os import listdir

imfiles = []

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
    imfiles = [i for i in listdir(dir) if i[:13] == "Super Glider "]
elif dir == "karts":
    imfiles = [i for i in listdir(dir) if i[:11] == "Pipe Frame "]

im = Image.new('RGBA', (10 * 216, (len(listdir(dir)) + (dir != "drivers") + 9) // 10 * 280))

add_images(0)

index = 0
if len(imfiles) > 0:
    print("Finished with color variants.\n")
    index = 20

ids = {}
file = open('../../data/' + dir + '.csv', encoding='utf8')
for line in file.readlines():
    line = line.replace('?', 'Q').split(',')
    print(line[1] + ': ' + line[0])
    ids[line[1]] = line[0]

imfiles = [i for i in listdir(dir) if i[-4:] == ".png" and i not in imfiles and i[:-4] in ids]

def dkg_index(name):
    return int(ids[name[:-4]])

imfiles.sort(key=dkg_index)

add_images(index)

print("Finished resizing.")
im.save(dir + ".png")
