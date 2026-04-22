import fs from 'fs';
const path = 'src/components/ui/CollectionActions.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add useSearchParams, usePathname
content = content.replace("import { useRouter } from 'next/navigation';", "import { useRouter, useSearchParams, usePathname } from 'next/navigation';");

// Add searchParams hooks inside component
content = content.replace("const router = useRouter();", "const router = useRouter();\n  const searchParams = useSearchParams();\n  const pathname = usePathname();");

// Replace EventListener with URL param effect
content = content.replace(`useEffect(() => {
      const handleOpenRatingModal = () => setShowRatingModal(true);
      document.addEventListener('open-rating-modal', handleOpenRatingModal);
      return () => document.removeEventListener('open-rating-modal', handleOpenRatingModal);
   }, []);`, `useEffect(() => {
     if (searchParams.get('rate') === 'true') {
        setShowRatingModal(true);
     }
  }, [searchParams]);

  const closeRatingModal = () => {
     setShowRatingModal(false);
     if (searchParams.has('rate')) {
        router.replace(pathname, { scroll: false });
     }
  };`);

// Replace setShowRatingModal(false) with closeRatingModal()
content = content.replace(/setShowRatingModal\(false\)/g, "closeRatingModal()");

fs.writeFileSync(path, content);
console.log("Updated CollectionActions.tsx");
