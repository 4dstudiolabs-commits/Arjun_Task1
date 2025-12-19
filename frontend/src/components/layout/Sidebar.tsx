import { NavLink } from 'react-router-dom';
import { API_BASE_URL, apiUrl } from '../../config/api';
import { useToast } from '../common/ToastProvider';

type NavItem = {
  label: string;
  to: string;
  icon: React.ReactNode;
};

function classNames(...xs: Array<string | false | undefined | null>) {
  return xs.filter(Boolean).join(' ');
}

function IconWeather() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M7.5 18a4.5 4.5 0 1 1 1.1-8.86A6 6 0 0 1 20 11.5a3.5 3.5 0 0 1-1.5 6.5H7.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconMeter() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M4 20V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M7 20v-3a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M8 9h8M8 12h8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconList() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconUpload() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        points="17 8 12 3 7 8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="12"
        y1="3"
        x2="12"
        y2="15"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconDownload() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M12 3v10m0 0 4-4m-4 4-4-4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 17v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconPulse() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M3 12h4l2-6 4 12 2-6h6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Sidebar() {
  const { pushToast } = useToast();

  const weatherNav: NavItem[] = [
    { label: 'Upload Excel', to: '/weather/upload', icon: <IconUpload /> },
    { label: 'View Records', to: '/weather/list', icon: <IconList /> },
  ];

  const meterNav: NavItem[] = [
    { label: 'Upload Excel', to: '/meter/upload', icon: <IconUpload /> },
    { label: 'View Records', to: '/meter/list', icon: <IconList /> },
  ];

  const downloadWeatherTemplate = () => {
    window.open(apiUrl('/weather/template'), '_blank');
  };

  const downloadMeterTemplate = () => {
    window.open(apiUrl('/meter/template'), '_blank');
  };

  const checkApiHealth = async () => {
    try {
      const candidates = [apiUrl('/health'), apiUrl('/weather/template')];

      let ok = false;
      for (const u of candidates) {
        const res = await fetch(u, { method: 'HEAD' });
        if (res.ok || res.status === 405) {
          ok = true;
          break;
        }
      }

      if (ok) {
        pushToast({
          type: 'success',
          title: 'API reachable',
          message: `Connected to ${API_BASE_URL}`,
        });
      } else {
        pushToast({
          type: 'error',
          title: 'API not reachable',
          message: `Could not reach ${API_BASE_URL}`,
        });
      }
    } catch {
      pushToast({
        type: 'error',
        title: 'API not reachable',
        message: `Could not reach ${API_BASE_URL}`,
      });
    }
  };

  const renderNavItems = (items: NavItem[]) =>
    items.map((item) => (
      <NavLink
        key={item.to}
        to={item.to}
        className={({ isActive }) =>
          classNames(
            'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
            'text-slate-700 hover:bg-slate-100 hover:text-slate-900',
            'dark:text-slate-200 dark:hover:bg-slate-900/60 dark:hover:text-slate-50',
            isActive &&
              'bg-slate-100 text-slate-900 dark:bg-slate-900/70 dark:text-slate-50',
          )
        }
      >
        <span className="opacity-90">{item.icon}</span>
        <span>{item.label}</span>
      </NavLink>
    ));

  return (
    <aside className="w-[280px] shrink-0 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      {/* Brand */}
      <div className="px-5 py-5">
        <div className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
          WeatherMeter
        </div>
        <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Data Management Console
        </div>
      </div>

      {/* Nav */}
      <nav className="px-3">
        {/* Weather Section */}
        <div className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <IconWeather />
          Weather
        </div>
        <div className="flex flex-col gap-1 mb-4">
          {renderNavItems(weatherNav)}
        </div>

        {/* Meter Section */}
        <div className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <IconMeter />
          Meter
        </div>
        <div className="flex flex-col gap-1 mb-4">
          {renderNavItems(meterNav)}
        </div>

        {/* Templates */}
        <div className="mt-6 px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Templates
        </div>

        <div className="flex flex-col gap-2 px-2 pb-4">
          <button
            onClick={downloadWeatherTemplate}
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900/40 dark:hover:text-slate-50"
          >
            <IconDownload />
            <span>Weather Template</span>
          </button>

          <button
            onClick={downloadMeterTemplate}
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900/40 dark:hover:text-slate-50"
          >
            <IconDownload />
            <span>Meter Template</span>
          </button>
        </div>

        {/* Connection */}
        <div className="mt-6 px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Connection
        </div>

        <div className="px-2 pb-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-200">
            <div className="font-semibold text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
              API Base URL
            </div>
            <div className="mt-1 break-all">{API_BASE_URL}</div>
          </div>

          <button
            onClick={checkApiHealth}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900/40 dark:hover:text-slate-50"
          >
            <IconPulse />
            <span>Check API</span>
          </button>
        </div>
      </nav>

      {/* Footer */}
      <div className="mt-auto px-5 py-4 text-xs text-slate-400 dark:text-slate-500">
        v1.0 · Internal Tool
      </div>
    </aside>
  );
}