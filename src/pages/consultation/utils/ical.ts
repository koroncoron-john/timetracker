
export function generateICalFile(
  title: string,
  description: string,
  startDate: Date,
  durationMinutes: number = 30
): string {
  const pad = (n: number) => String(n).padStart(2, '0');

  const formatDate = (d: Date) => {
    return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
  };

  const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);
  const now = new Date();
  const uid = `consultation-${now.getTime()}@freelancetracker.app`;

  const escapedTitle = title.replace(/[,;\\]/g, (m) => `\\${m}`);
  const escapedDesc = description.replace(/[,;\\]/g, (m) => `\\${m}`).replace(/\n/g, '\\n');

  const ical = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//FreelanceTracker//Consultation//JP',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${formatDate(now)}`,
    `DTSTART:${formatDate(startDate)}`,
    `DTEND:${formatDate(endDate)}`,
    `SUMMARY:${escapedTitle}`,
    `DESCRIPTION:${escapedDesc}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT30M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  return ical;
}

export function downloadICalFile(
  title: string,
  description: string,
  startDate: Date,
  durationMinutes: number = 30
) {
  const icalContent = generateICalFile(title, description, startDate, durationMinutes);
  const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'consultation.ics';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function getGoogleCalendarUrl(
  title: string,
  description: string,
  startDate: Date,
  durationMinutes: number = 30
): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const formatDate = (d: Date) => {
    return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
  };
  const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    details: description,
    dates: `${formatDate(startDate)}/${formatDate(endDate)}`,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
