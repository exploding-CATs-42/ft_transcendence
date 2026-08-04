// CSS
import s from "../../styles/legal.module.css";

const CONTACT_EMAIL = "contact@student.codam.nl";

const TermsPage = () => {
  return (
    <div className={s.pageContainer}>
      <h1 className={s.pageHeader}>Terms of Service</h1>
      <p className={s.updated}>Last updated: 4 August 2026</p>

      <section className={s.section}>
        <h2 className={s.sectionHeader}>1. Acceptance of these terms</h2>
        <p className={s.text}>
          These terms are an agreement between you and the Exploding CATs team.
          By creating an account or using the application, you agree to them. If
          you do not agree, please do not use the application. Please also read
          our <a href="/privacy">Privacy Policy</a>, which explains how we
          handle your data.
        </p>
      </section>

      <section className={s.section}>
        <h2 className={s.sectionHeader}>2. What the service is</h2>
        <p className={s.text}>
          Exploding CATs is a free, non-commercial, browser-based multiplayer
          card game. It was built by five students of Codam Coding College in
          Amsterdam as the final project of the 42 curriculum. It exists for
          educational purposes. There is no subscription, no payment, and no
          advertising.
        </p>
      </section>

      <section className={s.section}>
        <h2 className={s.sectionHeader}>3. Who may use it</h2>
        <p className={s.text}>
          You must be at least 16 years old to create an account. If you are
          younger, you may use the application only with the consent of a parent
          or guardian.
        </p>
      </section>

      <section className={s.section}>
        <h2 className={s.sectionHeader}>4. Your account</h2>
        <ul className={s.list}>
          <li>Provide a valid email address when you register.</li>
          <li>
            Keep your password secret. You are responsible for everything that
            happens through your account.
          </li>
          <li>
            Use one account per person. Do not share your account with others.
          </li>
          <li>
            Tell us at <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>{" "}
            if you think someone else has gained access to your account.
          </li>
        </ul>
      </section>

      <section className={s.section}>
        <h2 className={s.sectionHeader}>5. Acceptable use</h2>
        <p className={s.text}>While using the application, you agree not to:</p>
        <ul className={s.list}>
          <li>
            Cheat, use bots or scripts to play automatically, or deliberately
            exploit bugs to gain an advantage.
          </li>
          <li>
            Attack the service, for example through denial of service attempts,
            load testing, scraping, or trying to gain unauthorised access to
            other accounts, the API, or the database.
          </li>
          <li>
            Harass, threaten, or abuse other players, or choose a username or
            avatar that is offensive, hateful, sexual, or infringes someone
            else&apos;s rights.
          </li>
          <li>
            Impersonate another player, one of the developers, or any other
            person.
          </li>
          <li>
            Upload an avatar image that you do not have the right to use, or
            that contains illegal content.
          </li>
          <li>Use the application for any unlawful purpose.</li>
        </ul>
        <p className={s.text}>
          If you find a security problem, we would genuinely like to hear about
          it. Please report it to{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> instead of
          exploiting it or making it public.
        </p>
      </section>

      <section className={s.section}>
        <h2 className={s.sectionHeader}>6. Content you provide</h2>
        <p className={s.text}>
          You keep all rights to the username and avatar you upload. By
          uploading them you give us permission to store them and display them
          to other players inside the application, for as long as your account
          exists. You confirm that you have the right to use any image you
          upload. We may remove a username or avatar that breaks the rules in
          section 5.
        </p>
      </section>

      <section className={s.section}>
        <h2 className={s.sectionHeader}>7. Intellectual property</h2>
        <p className={s.text}>
          Exploding Kittens is a registered trademark of Exploding Kittens Inc.
          This project is an unofficial, non-commercial fan implementation
          created for education. It is not affiliated with, sponsored by, or
          endorsed by Exploding Kittens Inc., and no ownership of their game,
          artwork, or trademarks is claimed. All rights in the original game
          remain with its owners. If a rights holder objects to this project, we
          will take it offline on request.
        </p>
        <p className={s.text}>
          The source code written by our team remains the property of its
          authors.
        </p>
      </section>

      <section className={s.section}>
        <h2 className={s.sectionHeader}>8. Availability</h2>
        <p className={s.text}>
          The application is provided as a student project, so we cannot promise
          that it will be available, uninterrupted, or free of bugs. We may
          change it, take it offline for maintenance, reset game data, or shut
          it down permanently at any time and without notice. Please do not rely
          on it for anything important, and do not treat your match history as
          permanent.
        </p>
      </section>

      <section className={s.section}>
        <h2 className={s.sectionHeader}>9. Suspension and deletion</h2>
        <p className={s.text}>
          You may stop using the application at any time, and you may ask us to
          delete your account by writing to{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. We may
          suspend or delete an account that breaks these terms, in particular
          the acceptable use rules in section 5.
        </p>
      </section>

      <section className={s.section}>
        <h2 className={s.sectionHeader}>10. Disclaimer and liability</h2>
        <p className={s.text}>
          The application is provided &quot;as is&quot; and &quot;as
          available&quot;, without any warranty of any kind, whether express or
          implied. To the fullest extent permitted by law, we are not liable for
          any damage or loss arising from your use of the application, including
          lost game progress or lost data. Nothing in these terms limits
          liability that cannot be limited by law, such as liability for
          intentional misconduct.
        </p>
      </section>

      <section className={s.section}>
        <h2 className={s.sectionHeader}>11. Governing law</h2>
        <p className={s.text}>
          These terms are governed by the law of the Netherlands. Any dispute
          will be brought before the competent courts of Amsterdam, unless
          mandatory consumer law gives you the right to go elsewhere.
        </p>
      </section>

      <section className={s.section}>
        <h2 className={s.sectionHeader}>12. Changes to these terms</h2>
        <p className={s.text}>
          We may update these terms as the application develops. The date at the
          top of the page shows when they were last changed. If you keep using
          the application after a change, you accept the updated terms.
        </p>
      </section>

      <section className={s.section}>
        <h2 className={s.sectionHeader}>13. Contact</h2>
        <p className={s.text}>
          Questions about these terms can be sent to{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. The team is
          listed on our <a href="/about">About</a> page.
        </p>
      </section>
    </div>
  );
};

export default TermsPage;
