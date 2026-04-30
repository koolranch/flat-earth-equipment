const PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.flateartheequipment.forkliftcertified&utm_source=website&utm_medium=badge&utm_campaign=app_launch';

const PLAY_BADGE_SRC =
  'https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png';

interface GooglePlayBadgeProps {
  className?: string;
  labelClassName?: string;
}

export default function GooglePlayBadge({
  className = '',
  labelClassName = 'text-sm font-semibold text-slate-700',
}: GooglePlayBadgeProps) {
  return (
    <div className={`min-[1025px]:hidden ${className}`}>
      <p className={labelClassName}>Also available on Android</p>
      <a
        href={PLAY_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Download Forklift Certified on Google Play"
        className="inline-flex"
      >
        <img
          src={PLAY_BADGE_SRC}
          alt="Get it on Google Play"
          width={180}
          className="h-auto w-[180px]"
          loading="lazy"
        />
      </a>
    </div>
  );
}
