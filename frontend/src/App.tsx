import { Route, Routes } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import Dashboard from '@/pages/Dashboard';
import Trends from '@/pages/Trends';
import News from '@/pages/News';
import Shopping from '@/pages/Shopping';
import Reports from '@/pages/Reports';
import NotFound from '@/pages/NotFound';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="trends" element={<Trends />} />
        <Route path="news" element={<News />} />
        <Route path="shopping" element={<Shopping />} />
        <Route path="reports" element={<Reports />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
