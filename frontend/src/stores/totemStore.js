import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

/**
 * Store global pour le mode TOTEM
 * Gère: événement sélectionné, filtres, historique de navigation
 */
export const useTotemStore = create(
  devtools(
    persist(
      (set) => ({
        // État global
        selectedEventId: null,
        selectedCategory: null,
        searchQuery: "",
        screenId: "1",
        
        // Historique de navigation
        viewHistory: [], // Array of { posterId, timestamp, eventId }
        
        // État UI
        isLoadingEvent: false,
        isLoadingPosters: false,
        
        // Actions
        setSelectedEvent: (eventId) => set({ selectedEventId: eventId }),
        setSelectedCategory: (categoryId) => set({ selectedCategory: categoryId }),
        setSearchQuery: (query) => set({ searchQuery: query }),
        setScreenId: (screenId) => set({ screenId: screenId }),
        
        addToViewHistory: (posterId, eventId) => set((state) => ({
          viewHistory: [
            { posterId, eventId, timestamp: Date.now() },
            ...state.viewHistory.slice(0, 99) // Keep last 100
          ]
        })),
        
        clearViewHistory: () => set({ viewHistory: [] }),
        
        setIsLoadingEvent: (loading) => set({ isLoadingEvent: loading }),
        setIsLoadingPosters: (loading) => set({ isLoadingPosters: loading }),
        
        resetSearch: () => set({ searchQuery: "", selectedCategory: null }),
      }),
      {
        name: "totem-storage",
        version: 1,
      }
    )
  )
);
