import './globals.css'
import { UserProvider } from '@/components/auth/UserProvider'
import Navigation from '@/components/navigation'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <UserProvider>
          <div className="min-h-screen bg-background">
            <Navigation />
            <main className="flex-1">
              {children}
            </main>
          </div>
        </UserProvider>
      </body>
    </html>
  )
}