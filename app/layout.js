// import './globals.css' // Temporarily disabled

export const metadata = {
  title: 'Progress Tracker',
  description: 'A simple progress tracking app with Next.js and Supabase',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}