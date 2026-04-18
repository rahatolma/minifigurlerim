const fs = require('fs');
let content = fs.readFileSync('src/services/client_dal.ts', 'utf8');
content = content.replace("  const { data } = await supabase", "export const getUserCollectionStatus = async (userId: string) => {\n  const { data } = await supabase");
fs.writeFileSync('src/services/client_dal.ts', content);
