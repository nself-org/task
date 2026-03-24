import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Download ɳTask',
  description: 'Download ɳTask for macOS, Windows, Linux, iOS, and Android.',
};

interface DownloadPlatform {
  name: string;
  icon: string;
  description: string;
  primary?: {
    label: string;
    href: string;
    note?: string;
  };
  secondary?: {
    label: string;
    href: string;
  }[];
  comingSoon?: boolean;
}

const platforms: DownloadPlatform[] = [
  {
    name: 'iOS',
    icon: '📱',
    description: 'iPhone and iPad. iOS 16+.',
    primary: {
      label: 'App Store',
      href: 'https://apps.apple.com/app/ntasks/id000000000',
      note: 'Coming soon',
    },
    comingSoon: true,
  },
  {
    name: 'Android',
    icon: '🤖',
    description: 'Android phones, tablets, and TV. Android 7+.',
    primary: {
      label: 'Play Store',
      href: 'https://play.google.com/store/apps/details?id=org.nself.tasks',
      note: 'Coming soon',
    },
    comingSoon: true,
  },
  {
    name: 'macOS',
    icon: '🍎',
    description: 'macOS 10.13+. Apple Silicon + Intel.',
    primary: {
      label: 'Download for Apple Silicon',
      href: 'https://github.com/nself-org/tasks/releases/latest/download/ntasks_aarch64.dmg',
    },
    secondary: [
      {
        label: 'Intel Mac',
        href: 'https://github.com/nself-org/tasks/releases/latest/download/ntasks_x86_64.dmg',
      },
    ],
  },
  {
    name: 'Windows',
    icon: '🪟',
    description: 'Windows 10+. x64.',
    primary: {
      label: 'Download .msi installer',
      href: 'https://github.com/nself-org/tasks/releases/latest/download/ntasks_x64-setup.msi',
    },
    secondary: [
      {
        label: 'NSIS installer (.exe)',
        href: 'https://github.com/nself-org/tasks/releases/latest/download/ntasks_x64-setup.exe',
      },
    ],
  },
  {
    name: 'Linux',
    icon: '🐧',
    description: 'Ubuntu, Debian, Fedora, and more. x64.',
    primary: {
      label: 'Download .AppImage',
      href: 'https://github.com/nself-org/tasks/releases/latest/download/ntasks_amd64.AppImage',
    },
    secondary: [
      {
        label: '.deb package',
        href: 'https://github.com/nself-org/tasks/releases/latest/download/ntasks_amd64.deb',
      },
      {
        label: '.rpm package',
        href: 'https://github.com/nself-org/tasks/releases/latest/download/ntasks_x86_64.rpm',
      },
    ],
  },
  {
    name: 'Web',
    icon: '🌐',
    description: 'Any browser. No install needed.',
    primary: {
      label: 'Open ɳTask',
      href: '/',
    },
  },
];

export default function DownloadPage() {
  return (
    <div className="min-h-screen bg-[#0F0F1A] text-white">
      <div className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <div className="text-6xl font-bold text-indigo-400 mb-4">ɳ</div>
          <h1 className="text-4xl font-bold mb-4">Download ɳTask</h1>
          <p className="text-lg text-white/60 max-w-xl mx-auto">
            Available on every platform. Your tasks, everywhere.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {platforms.map((platform) => (
            <PlatformCard key={platform.name} platform={platform} />
          ))}
        </div>

        <div className="mt-20 text-center">
          <h2 className="text-2xl font-bold mb-4">Self-hosted</h2>
          <p className="text-white/60 mb-6 max-w-lg mx-auto">
            ɳTask connects to any nself backend you control. No cloud account needed.
          </p>
          <a
            href="https://docs.nself.org/tasks/setup"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
          >
            Read the setup guide →
          </a>
        </div>
      </div>
    </div>
  );
}

function PlatformCard({ platform }: { platform: DownloadPlatform }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="text-3xl">{platform.icon}</span>
        <div>
          <h3 className="font-bold text-lg">{platform.name}</h3>
          <p className="text-sm text-white/50">{platform.description}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2 mt-auto">
        {platform.primary && (
          <a
            href={platform.primary.href}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium text-center transition-colors ${
              platform.comingSoon
                ? 'bg-white/5 text-white/40 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            }`}
            aria-disabled={platform.comingSoon}
          >
            {platform.primary.label}
            {platform.primary.note && (
              <span className="ml-2 text-xs opacity-60">({platform.primary.note})</span>
            )}
          </a>
        )}
        {platform.secondary?.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="px-4 py-2 rounded-xl text-sm text-white/60 hover:text-white text-center transition-colors border border-white/10 hover:border-white/20"
          >
            {link.label}
          </a>
        ))}
      </div>
    </div>
  );
}
