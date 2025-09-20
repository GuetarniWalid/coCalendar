export interface BottomNavigationProps {
  activeTab?: number; // 1 to 5 for the selected item
  onTabPress?: (index: number) => void; // Add navigation callback
}
