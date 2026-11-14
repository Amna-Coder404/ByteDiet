// Round any value to a whole number (safe for null/undefined/strings)
export const number = (value) => Math.round(Number(value) || 0);

// "2026-11-14" from any date value (uses local time)
export const getDateKey = (value) => {
    const date = new Date(value);

    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, '0'),
        String(date.getDate()).padStart(2, '0'),
    ].join('-');
};

// "Today", "Yesterday", or "Friday, 13 Nov 2026"
export const getDateLabel = (dateKey) => {
    const today = getDateKey(new Date());
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);

    if (dateKey === today) return 'Today';
    if (dateKey === getDateKey(yesterdayDate)) return 'Yesterday';

    const date = new Date(`${dateKey}T00:00:00`);

    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
};

// "09:45 PM"
export const getTime = (value) => {
    if (!value) return '';

    return new Date(value).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
    });
};