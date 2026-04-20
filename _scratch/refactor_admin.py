import re

def process_admin(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Form Data State & Inputs
    content = content.replace("figure_no: '',", "figure_number: '',")
    content = content.replace("figure_no: fig.figure_no || '',", "figure_number: fig.figure_number || '',")
    content = content.replace('name="figure_no"', 'name="figure_number"')
    content = content.replace('formData.figure_no', 'formData.figure_number')
    
    # Payload Save phase
    content = content.replace("figure_no: formData.figure_number,", "figure_number: formData.figure_number,\n            figure_no: formData.figure_number,")

    with open(filepath, 'w') as f:
        f.write(content)
        
process_admin('/Users/Gungor/Documents/GitHub/minifigurlerim/src/app/admin/(protected)/figurler/[id]/page.tsx')
process_admin('/Users/Gungor/Documents/GitHub/minifigurlerim/src/app/admin/(protected)/figurler/yeni/page.tsx')
print("Admin files refactored.")
