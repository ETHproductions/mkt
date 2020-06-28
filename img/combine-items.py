import sys
from PIL import Image
from os import listdir

im = Image.new('RGBA', (10 * 120, 5 * 120))

def add_images(index):
    for file in imfiles:
        im_dkg = Image.open("items/" + file)
        im_dkg.copy()
        im.paste(im_dkg, (index % 10 * 120, index // 10 * 120), im_dkg)
        
        print("Finished with " + file)
        im_dkg.close()
        index += 1

imfiles = list(map(lambda x:x + '.png', "default,Slipstream,Dash Panel,Jump Boost,Rocket Start,Mini-Turbo".split(",")))
add_images(0)
print("Finished with kart skills.\n")

imfiles = list(map(lambda x:x + '.png', "Mushroom,Blooper,Green Shell,Red Shell,Banana,Bob-omb,Coin,Super Horn,Bullet Bill,Lightning,Mega Mushroom,Spiny Shell,Super Star".split(",")))
add_images(10)
print("Finished with glider skills.\n")

imfiles = list(map(lambda x:x + '.png', "Boomerang Flower,Bubble,Triple Green Shells,Double Bob-ombs,Fire Flower,Heart,Yoshi's Egg,Triple Mushrooms,Bowser's Shell,Giant Banana,Banana Barrels,Mushroom Cannon,Lucky 7,Dash Ring,Coin Box,Bob-omb Cannon,Triple Bananas,Birdo's Egg,Ice Flower,Hammer".split(",")))
add_images(30)

print("Finished with driver skills.")
im.save("items/all.png")
