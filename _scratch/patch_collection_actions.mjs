import fs from 'fs';
const path = 'src/components/ui/CollectionActions.tsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('open-rating-modal')) {
  content = content.replace('useEffect(() => {', `useEffect(() => {
      const handleOpenRatingModal = () => setShowRatingModal(true);
      document.addEventListener('open-rating-modal', handleOpenRatingModal);
      return () => document.removeEventListener('open-rating-modal', handleOpenRatingModal);
   }, []);
   
   useEffect(() => {`);
  fs.writeFileSync(path, content);
  console.log("Patched CollectionActions.tsx");
} else {
  console.log("Already patched");
}
