export interface ClientSessionInfo {
  browser: string;
  os: string;
  deviceType: 'Desktop' | 'Mobile' | 'Tablet';
  screenResolution: string;
  viewport: string;
  language: string;
  timeZone: string;
  loginTime: string;
  loginFormatted: string;
  userAgent: string;
  online: boolean;
}

export function getClientSessionInfo(): ClientSessionInfo {
  if (typeof window === 'undefined') {
    return {
      browser: 'Unknown Browser',
      os: 'Unknown OS',
      deviceType: 'Desktop',
      screenResolution: 'N/A',
      viewport: 'N/A',
      language: 'en-US',
      timeZone: 'UTC',
      loginTime: new Date().toISOString(),
      loginFormatted: new Date().toLocaleString(),
      userAgent: 'Server Environment',
      online: true,
    };
  }

  const ua = navigator.userAgent || '';
  let browser = 'Unknown Browser';
  let os = 'Unknown OS';

  // Detect OS
  if (ua.includes('Win')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'macOS';
  else if (ua.includes('Linux') && !ua.includes('Android')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad') || ua.includes('iPod')) os = 'iOS';

  // Detect Browser
  if (ua.includes('Edg/')) {
    const match = ua.match(/Edg\/([\d.]+)/);
    browser = `Edge ${match ? match[1].split('.')[0] : ''}`;
  } else if (ua.includes('Chrome/')) {
    const match = ua.match(/Chrome\/([\d.]+)/);
    browser = `Chrome ${match ? match[1].split('.')[0] : ''}`;
  } else if (ua.includes('Firefox/')) {
    const match = ua.match(/Firefox\/([\d.]+)/);
    browser = `Firefox ${match ? match[1].split('.')[0] : ''}`;
  } else if (ua.includes('Safari/') && !ua.includes('Chrome/')) {
    const match = ua.match(/Version\/([\d.]+)/);
    browser = `Safari ${match ? match[1].split('.')[0] : ''}`;
  }

  // Device Type
  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(ua);
  const isTablet = /Tablet|iPad/i.test(ua);
  const deviceType: 'Desktop' | 'Mobile' | 'Tablet' = isTablet ? 'Tablet' : isMobile ? 'Mobile' : 'Desktop';

  // Timezone & Language
  let timeZone = 'UTC';
  try {
    timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    timeZone = 'UTC';
  }

  const screenResolution = `${window.screen.width}x${window.screen.height}`;
  const viewport = `${window.innerWidth}x${window.innerHeight}`;
  const now = new Date();

  return {
    browser,
    os,
    deviceType,
    screenResolution,
    viewport,
    language: navigator.language || 'en-US',
    timeZone,
    loginTime: now.toISOString(),
    loginFormatted: now.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
    userAgent: ua,
    online: navigator.onLine,
  };
}
