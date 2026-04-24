import { useLocalStorage } from '@vueuse/core';

const isSidebarOpen = useLocalStorage('musea-sidebar-open', true);

export function useSidebar() {
  const toggleSidebar = () => {
    isSidebarOpen.value = !isSidebarOpen.value;
  };

  const setSidebarOpen = (value: boolean) => {
    isSidebarOpen.value = value;
  };

  return {
    isSidebarOpen,
    toggleSidebar,
    setSidebarOpen,
  };
}
