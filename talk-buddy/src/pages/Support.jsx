export default function Support() {
  return (
    <div className="narrow">
      <div className="eyebrow">YOU DON’T HAVE TO FIGURE IT OUT ALONE</div>
      <h1>Find support</h1>
      <p className="lead">
        Different needs call for different kinds of support. You choose what
        fits.
      </p>
      <section className="panel">
        <h2>Need immediate support?</h2>
        <p>
          TalkBuddy is an educational prototype, not emergency or crisis care.
          If you are in immediate danger, contact local emergency services or
          someone nearby you trust.
        </p>
        <h3>United States · 988 Suicide & Crisis Lifeline</h3>
        <p>For suicidal crisis or emotional distress.</p>
        <div className="button-row">
          <a
            className="button primary"
            href="tel:988?oai_link_source=model_response_hotline"
          >
            Call 988
          </a>
          <a
            className="button"
            href="sms:988?oai_link_source=model_response_hotline"
          >
            Text 988
          </a>
          <a
            href="https://988lifeline.org/chat/?oai_link_source=model_response_hotline"
            target="_blank"
            rel="noreferrer"
          >
            Online chat ↗
          </a>
        </div>
        <p>
          Outside the United States? Use a local crisis service or emergency
          service in your country.
        </p>
      </section>
      <section className="panel">
        <h2>Autistic-led advocacy</h2>
        <p>
          The Autistic Self Advocacy Network shares information about rights,
          community, and self-advocacy.
        </p>
        <a
          href="https://autisticadvocacy.org/"
          target="_blank"
          rel="noreferrer"
        >
          Visit ASAN ↗
        </a>
      </section>
      <section className="panel">
        <h2>Communication support</h2>
        <p>
          A speech-language pathologist can help with communication goals you
          choose. ASHA ProFind is a directory of professionals, not a crisis
          service.
        </p>
        <a
          href="https://www.asha.org/profind/"
          target="_blank"
          rel="noreferrer"
        >
          Explore ASHA ProFind ↗
        </a>
      </section>
      <section className="panel">
        <h2>Distress, pressure, or harm from someone else</h2>
        <p>
          A trusted person, school counselor, qualified mental health
          professional, or local abuse support service may help. You are not
          responsible for someone else’s abusive behavior. You do not need to
          solve it through better wording.
        </p>
      </section>
    </div>
  );
}
