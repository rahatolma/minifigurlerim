import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Replace 'figure_no, ' in select fields
    content = content.replace('series_no, figure_no, role', 'series_no, role')
    content = content.replace('name, figure_no, series_name', 'name, figure_number, series_name')
    
    # Actually figure_no is in action_dal.ts differently: 'id, name, figure_no, series_name, images, value_usd, affiliate_link'
    content = content.replace('id, name, figure_no, series_name', 'id, name, figure_number, series_name')
    
    # Replace order
    content = content.replace(".order('figure_no'", ".order('figure_number'")

    with open(filepath, 'w') as f:
        f.write(content)
        
process_file('/Users/Gungor/Documents/GitHub/minifigurlerim/src/services/dal.ts')
process_file('/Users/Gungor/Documents/GitHub/minifigurlerim/src/services/action_dal.ts')
print("DAL files refactored.")
