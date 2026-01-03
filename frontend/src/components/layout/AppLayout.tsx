import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

export default function AppLayout() {
  return (
    <div className="min-h-screen px-6 py-8 md:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <Header />
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <Sidebar />
          <main className="flex flex-col gap-8">
            <section className="glass glow-ring rounded-3xl border border-ink-700/10 p-8">
              <Outlet />
            </section>
            <Footer />
          </main>
        </div>
      </div>
    </div>
  );
}
