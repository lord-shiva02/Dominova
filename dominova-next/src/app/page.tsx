import Hero from "@/components/Hero";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <Hero />
      
      {/* Spacer to test smooth scrolling */}
      <div className="h-screen w-full flex items-center justify-center bg-black-light">
        <h2 className="text-3xl font-bold text-gold-primary">More sections coming soon...</h2>
      </div>
    </main>
  );
}
