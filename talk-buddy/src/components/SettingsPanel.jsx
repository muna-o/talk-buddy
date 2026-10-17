export default function SettingsPanel({ preferences: p, update, voices = [] }) {
  const select = (label, key, options) => (
    <label>
      {label}
      <select
        value={p[key]}
        onChange={(e) => update({ [key]: e.target.value })}
      >
        {options.map(([value, text]) => (
          <option key={value} value={value}>
            {text}
          </option>
        ))}
      </select>
    </label>
  );
  const toggle = (label, key, detail) => (
    <label className="toggle">
      <span>
        {label}
        {detail && <small>{detail}</small>}
      </span>
      <input
        type="checkbox"
        checked={p[key]}
        onChange={(e) => update({ [key]: e.target.checked })}
      />
    </label>
  );
  return (
    <div className="settings-grid">
      <section className="panel">
        <h2>Make yourself comfortable</h2>
        <p>You can change any of these at any time.</p>
        {select("Color theme", "theme", [
          ["sage", "Soft Sage"],
          ["peach", "Warm Peach"],
          ["blue", "Calm Blue"],
          ["dark", "Dark"],
          ["contrast", "High Contrast"],
        ])}
        {select("Font", "font", [
          ["system", "Everyday readable"],
          ["readable", "Verdana — wider letter shapes"],
        ])}
        <label>
          Text size: {p.fontSize}px
          <input
            type="range"
            min="16"
            max="24"
            value={p.fontSize}
            onChange={(e) => update({ fontSize: +e.target.value })}
          />
        </label>
        <label>
          Line spacing: {p.lineSpacing}
          <input
            type="range"
            min="1.4"
            max="2.2"
            step="0.1"
            value={p.lineSpacing}
            onChange={(e) => update({ lineSpacing: +e.target.value })}
          />
        </label>
        <label>
          Letter spacing: {p.letterSpacing}px
          <input
            type="range"
            min="0"
            max="2"
            step="0.25"
            value={p.letterSpacing}
            onChange={(e) => update({ letterSpacing: +e.target.value })}
          />
        </label>
      </section>
      <section className="panel">
        <h2>Communication & sensory preferences</h2>
        {select("Start conversations with", "communication", [
          ["typing", "Typing"],
          ["cards", "Communication cards"],
          ["speech", "Speech input (optional)"],
        ])}
        {toggle("Reduce motion", "reducedMotion")}
        {toggle("Simplify decorative elements", "clutter")}
        {toggle(
          "Enable character audio",
          "audioEnabled",
          "Audio is off by default.",
        )}
        {p.audioEnabled && (
          <>
            {select("Character voice", "voice", [
              ["", "Default approved voice"],
              ...voices.map((v) => [v.id, v.name]),
            ])}
            {voices.length > 0 && (
              <small>
                {
                  (voices.find((v) => v.id === p.voice) || voices[0])
                    .description
                }
              </small>
            )}
            <small>
              Choose a voice for character replies. Playback needs the connected
              voice service.
            </small>
            {!voices.length && (
              <small>
                Voice choices appear after ElevenLabs is configured.
              </small>
            )}
            {toggle(
              "Automatically play new replies",
              "autoSpeech",
              "Only enable if you want sound without pressing Play.",
            )}
          </>
        )}
      </section>
    </div>
  );
}
