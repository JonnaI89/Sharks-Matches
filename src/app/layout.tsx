import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { AdminDataProvider } from '@/context/admin-data-context';
import { AuthProvider } from '@/context/auth-context';

export const metadata: Metadata = {
  title: 'Live Center',
  description: 'The best live score center for floorball',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased h-full">
        <AuthProvider>
          <AdminDataProvider>
            {children}
            <Toaster />
          </AdminDataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
