import { create } from 'zustand';

export type ViewMode = 'overview' | 'analysis' | 'comparison';

export interface FilterState {
  dateRange: string;
  geo: string;
  category?: string;
  property?: string;
}

export interface ExportSettings {
  format: 'json' | 'csv';
  dataSource: 'time_series' | 'region' | 'related' | 'news' | 'shopping' | 'report';
  filename: string;
}

interface UIState {
  sidebarOpen: boolean;
  viewMode: ViewMode;
  filters: FilterState;
  exportSettings: ExportSettings;
  setSidebarOpen: (open: boolean) => void;
  setViewMode: (mode: ViewMode) => void;
  updateFilters: (updates: Partial<FilterState>) => void;
  updateExportSettings: (updates: Partial<ExportSettings>) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  viewMode: 'overview',
  filters: {
    dateRange: 'today 12-m',
    geo: 'KR',
    category: undefined,
    property: undefined,
  },
  exportSettings: {
    format: 'json',
    dataSource: 'report',
    filename: 'trend-report',
  },
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setViewMode: (mode) => set({ viewMode: mode }),
  updateFilters: (updates) =>
    set((state) => ({ filters: { ...state.filters, ...updates } })),
  updateExportSettings: (updates) =>
    set((state) => ({ exportSettings: { ...state.exportSettings, ...updates } })),
}));
