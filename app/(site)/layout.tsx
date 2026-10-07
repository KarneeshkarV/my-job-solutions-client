import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { SiteProvider } from "@/components/site/site-provider";

export default function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <SiteProvider>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </SiteProvider>
  );
}
