import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { AppSettingsProvider } from '@/context/AppSettingsContext';
import { ThemeProvider } from '@/context/ThemeContext';

export const metadata = {
  title: 'RetailMind AI — Intelligent Retail Sales, Inventory & Customer Platform',
  description: 'AI-powered retail sales, inventory risk prediction, customer segmentation, RFM & demand forecasting platform.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <AuthProvider>
          <AppSettingsProvider>
            <ThemeProvider>
              {children}
            </ThemeProvider>
          </AppSettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
