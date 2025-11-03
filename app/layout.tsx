export const metadata = { title: "AcertÔ", description: "Divisão de despesas" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, fontFamily: "Inter, system-ui, Avenir, Arial, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
