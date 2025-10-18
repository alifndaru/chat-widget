/**
 * Simple and robust time formatter for chat messages
 */
export const formatMessageTime = (timeInput: any): string => {
  // Handle empty/null/undefined
  if (!timeInput) {
    const now = new Date();
    return now.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  }

  // If it's already a formatted time string, return as-is
  if (typeof timeInput === 'string') {
    // Check if it's already formatted (contains AM/PM or just time like 12:40)
    if (timeInput.includes('AM') || timeInput.includes('PM') || /^\d{1,2}:\d{2}/.test(timeInput)) {
      return timeInput;
    }
  }

  try {
    let date: Date;
    
    // Try to create Date object from various inputs
    if (timeInput instanceof Date) {
      date = timeInput;
    } else if (typeof timeInput === 'string') {
      // Try parsing as ISO string first
      date = new Date(timeInput);
      
      // If invalid, try as timestamp
      if (isNaN(date.getTime())) {
        const timestamp = parseInt(timeInput);
        if (!isNaN(timestamp)) {
          date = new Date(timestamp);
        } else {
          // Fallback: return current time
          date = new Date();
        }
      }
    } else if (typeof timeInput === 'number') {
      date = new Date(timeInput);
    } else {
      // Unknown type, use current time
      date = new Date();
    }
    
    // Final check if date is valid
    if (isNaN(date.getTime())) {
      date = new Date(); // Use current time as final fallback
    }
    
    // Format the time
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  } catch (error) {
    console.error('Error formatting time:', error, 'Input:', timeInput);
    // Return current time as fallback
    const now = new Date();
    return now.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  }
};

/**
 * Format date for conversation list
 */
export const formatConversationDate = (dateInput: any): string => {
  if (!dateInput) return "";
  
  try {
    let date: Date;
    
    if (dateInput instanceof Date) {
      date = dateInput;
    } else if (typeof dateInput === 'string') {
      date = new Date(dateInput);
      if (isNaN(date.getTime())) {
        const timestamp = parseInt(dateInput);
        if (!isNaN(timestamp)) {
          date = new Date(timestamp);
        } else {
          return String(dateInput); // Return original if can't parse
        }
      }
    } else if (typeof dateInput === 'number') {
      date = new Date(dateInput);
    } else {
      return String(dateInput);
    }
    
    if (isNaN(date.getTime())) {
      return String(dateInput);
    }
    
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    }
    
    if (diffInDays === 1) {
      return 'Yesterday';
    }
    
    if (diffInDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    }
    
    return date.toLocaleDateString([], {
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting conversation date:', error);
    return String(dateInput);
  }
};
