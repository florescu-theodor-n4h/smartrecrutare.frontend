#!/usr/bin/env python3
# -*- coding: utf-8 -*-

#import subprocess
#import sys

#subprocess.check_call([sys.executable, "-m", "pip", "install", "pillow"])

from PIL import Image

source = r"./icon-192.png"
output = r"./favicon.ico"

img = Image.open(source)

img.save(
    output,
    sizes=[(16, 16), (32, 32), (48, 48)]
)

print("Created:", output)
