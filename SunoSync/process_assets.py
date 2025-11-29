import os
import shutil
from PIL import Image

src_logo = r"C:/Users/justi/.gemini/antigravity/brain/f7731669-9670-4412-b34c-1be92ce66ae4/uploaded_image_0_1764454087670.jpg"
src_splash = r"C:/Users/justi/.gemini/antigravity/brain/f7731669-9670-4412-b34c-1be92ce66ae4/uploaded_image_1_1764454087670.png"

dst_dir = r"e:\SunoSync-main\resources"

# Copy files
shutil.copy(src_splash, os.path.join(dst_dir, "splash.png"))
shutil.copy(src_logo, os.path.join(dst_dir, "logo.jpg"))

# Convert Logo to ICO
img = Image.open(os.path.join(dst_dir, "logo.jpg"))
img.save(os.path.join(dst_dir, "icon.ico"), format='ICO', sizes=[(256, 256)])

print("Assets processed.")
