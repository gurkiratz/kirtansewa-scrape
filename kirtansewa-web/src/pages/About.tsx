export function About() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-lg mx-auto px-5 py-10">
        <h1 className="text-text-primary text-xl font-semibold mb-4">About Kirtan Sewa</h1>
        <div className="text-text-secondary text-sm leading-relaxed space-y-3">
          <p>
            Kirtan Sewa is a free, open-source web player for Sikh devotional music
            (kirtan). Browse artists, listen to recordings, and build your own queue —
            all without an account or subscription.
          </p>
          <p>
            Audio content is sourced from{' '}
            <a
              href="https://kirtansewa.com"
              target="_blank"
              rel="noreferrer"
              className="text-gold hover:underline"
            >
              kirtansewa.com
            </a>
            . This project does not host any audio files; it links directly to the
            original source.
          </p>
        </div>
      </div>
    </div>
  );
}
