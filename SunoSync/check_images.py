from PIL import Image
try:
    img0 = Image.open(r"C:/Users/justi/.gemini/antigravity/brain/f7731669-9670-4412-b34c-1be92ce66ae4/uploaded_image_0_1764454087670.jpg")
    print(f"Img0 (JPG): {img0.size}")
except:
    print("Img0 failed")

try:
    img1 = Image.open(r"C:/Users/justi/.gemini/antigravity/brain/f7731669-9670-4412-b34c-1be92ce66ae4/uploaded_image_1_1764454087670.png")
    print(f"Img1 (PNG): {img1.size}")
except:
    print("Img1 failed")
