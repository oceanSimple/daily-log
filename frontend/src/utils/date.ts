export function formatDateLabel(date: string, locale = 'zh-CN') {
  return new Intl.DateTimeFormat(locale, {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(new Date(`${date}T00:00:00`));
}

export function formatDateTimeLabel(dateTime: string, locale = 'zh-CN') {
  return new Intl.DateTimeFormat(locale, {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(dateTime));
}

export function formatTimeRange(startAt: string, endAt: string, locale = 'zh-CN') {
  const formatter = new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return `${formatter.format(new Date(startAt))} - ${formatter.format(new Date(endAt))}`;
}

export function formatTimeLabel(dateTime: string, locale = 'zh-CN') {
  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(dateTime));
}

export function startOfWeek(date: string) {
  const current = new Date(`${date}T00:00:00`);
  const day = current.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  current.setDate(current.getDate() + diff);

  return current;
}

export function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
