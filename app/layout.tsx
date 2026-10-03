// layout.tsx wraps every page. It must render <html> and <body>.
export const metadata = { title: "To-Do" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "sans-serif", maxWidth: 400, margin: "40px auto" }}>
        {children}
      </body>
    </html>
  );
}
