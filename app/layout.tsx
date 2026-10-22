import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'מעבדת השוקולד | ממוצק לנוזל ובחזרה',description:'חוקרים מעברי מצבי צבירה, בונים מודל חלקיקי ויוצרים סרטון מדעי.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="he" dir="rtl"><body>{children}</body></html>}
