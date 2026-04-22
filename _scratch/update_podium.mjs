import fs from 'fs';
const path = 'src/components/ui/CollectorPodium.tsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('next/navigation')) {
  content = content.replace("import Image from 'next/image';", "import Image from 'next/image';\nimport { useRouter, usePathname } from 'next/navigation';");
  content = content.replace("export default function CollectorPodium({ ratings }: { ratings: any[] }) {", "export default function CollectorPodium({ ratings }: { ratings: any[] }) {\n    const router = useRouter();\n    const pathname = usePathname();");
  content = content.replace("document.dispatchEvent(new CustomEvent('open-rating-modal'));", "router.push(`${pathname}?rate=true`, { scroll: false });");
  fs.writeFileSync(path, content);
  console.log("Updated CollectorPodium.tsx");
}
