// Utility functions for stats formatting and calculations

// Format numbers for display (e.g., 1234 -> "1.2K")
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  } else {
    return num.toString();
  }
}

// Fallback function for simulated active readers
export function getSimulatedActiveReaders(): number {
  const hour = new Date().getHours();
  let baseCount = 150;
  
  // Simulate realistic traffic patterns
  if (hour >= 6 && hour <= 9) {
    // Morning peak
    baseCount = Math.floor(Math.random() * 200) + 300; // 300-500
  } else if (hour >= 12 && hour <= 14) {
    // Lunch peak
    baseCount = Math.floor(Math.random() * 150) + 250; // 250-400
  } else if (hour >= 18 && hour <= 22) {
    // Evening peak
    baseCount = Math.floor(Math.random() * 300) + 400; // 400-700
  } else if (hour >= 0 && hour <= 6) {
    // Night time
    baseCount = Math.floor(Math.random() * 50) + 50; // 50-100
  } else {
    // Regular hours
    baseCount = Math.floor(Math.random() * 100) + 150; // 150-250
  }
  
  return baseCount;
}

// Generate session ID for user tracking
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

// Check if a date is today
export function isToday(date: Date | string): boolean {
  const today = new Date();
  const checkDate = new Date(date);
  
  return (
    checkDate.getDate() === today.getDate() &&
    checkDate.getMonth() === today.getMonth() &&
    checkDate.getFullYear() === today.getFullYear()
  );
}

// Get today's date range for database queries
export function getTodayDateRange(): { start: string; end: string } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = today.toISOString();
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowISO = tomorrow.toISOString();
  
  return {
    start: todayISO,
    end: tomorrowISO
  };
}
