// CSS
import s from "../../styles/legal.module.css";

const CONTACT_EMAIL = "contact@student.codam.nl";

const PrivacyPage = () => {
  return (
    <div className={s.pageContainer}>
      <h1 className={s.pageHeader}>Privacy Policy</h1>
      <p className={s.updated}>Last updated: 4 August 2026</p>

      <section className={s.section}>
        <h2 className={s.sectionHeader}>1. Who we are</h2>
        <p className={s.text}>
          Exploding CATs is a non-commercial student project built by five
          students of Codam Coding College (part of the 42 network) in
          Amsterdam, the Netherlands, as the final assignment of the 42
          curriculum. We are not a company, we sell nothing, and we run no
          advertising. This policy explains what personal data the application
          collects, why we collect it, and what you can do about it. You can
          reach us at any time at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </section>

      <section className={s.section}>
        <h2 className={s.sectionHeader}>2. What data we collect</h2>
        <p className={s.text}>Data you give us when you create an account:</p>
        <ul className={s.list}>
          <li>
            <strong>Email address</strong> — used as your login and as the only
            way for us to contact you about your account.
          </li>
          <li>
            <strong>Username</strong> — shown to other players in lobbies,
            games, and friend lists.
          </li>
          <li>
            <strong>Password</strong> — we never store your password. We store
            only a bcrypt hash of it, which cannot be turned back into your
            password.
          </li>
          <li>
            <strong>Avatar image</strong> — optional. If you upload one, it is
            stored by Cloudinary (see section 5) and shown to other players.
          </li>
        </ul>

        <p className={s.text}>Data created while you use the application:</p>
        <ul className={s.list}>
          <li>
            <strong>Login sessions</strong> — a hashed refresh token and its
            expiry date, so that you stay logged in.
          </li>
          <li>
            <strong>Friendships</strong> — who sent a friend request to whom,
            and whether it is pending, accepted, or rejected.
          </li>
          <li>
            <strong>Game history</strong> — the games you took part in, the game
            name, who won, and when the game was created, started, and ended.
          </li>
        </ul>

        <p className={s.text}>
          We do not collect your real name, address, phone number, date of
          birth, or payment details, because the application does not need them.
        </p>
      </section>

      <section className={s.section}>
        <h2 className={s.sectionHeader}>3. Why we use your data</h2>
        <ul className={s.list}>
          <li>To create your account and let you log in and stay logged in.</li>
          <li>
            To show your profile, avatar, and match history to you and to other
            players.
          </li>
          <li>To let you send, accept, and reject friend requests.</li>
          <li>To run multiplayer games and record their results.</li>
          <li>
            To keep the service working and protect it from abuse, for example
            by limiting each visitor to 100 requests every 15 minutes.
          </li>
        </ul>
        <p className={s.text}>
          Under the GDPR, our legal basis is the performance of our agreement
          with you for everything needed to give you an account and a working
          game, and our legitimate interest in keeping the service secure and
          available for the abuse protection described above. Uploading an
          avatar is optional and based on your consent.
        </p>
      </section>

      <section className={s.section}>
        <h2 className={s.sectionHeader}>4. Cookies</h2>
        <p className={s.text}>
          We use exactly one cookie, named <code>refreshToken</code>. It keeps
          you logged in between visits. It is an HTTP-only cookie, which means
          scripts running in your browser cannot read it, it is sent only to our
          own authentication endpoints, and it is transmitted over HTTPS in
          production.
        </p>
        <p className={s.text}>
          This cookie is strictly necessary for the application to work. We use
          no analytics cookies, no advertising cookies, and no third-party
          tracking of any kind. We do not track you across other websites, and
          we do not build a profile of your behaviour.
        </p>
      </section>

      <section className={s.section}>
        <h2 className={s.sectionHeader}>5. Who else can see your data</h2>
        <p className={s.text}>
          <strong>Other players.</strong> Your username, avatar, friends list,
          and game history are visible to other registered users of the
          application. Please keep this in mind when choosing a username or an
          avatar image, and do not put personal information in them.
        </p>
        <p className={s.text}>
          <strong>Cloudinary.</strong> If you upload an avatar, the image file
          is stored on the servers of Cloudinary, an image hosting provider, and
          we keep a link to it. Their handling of that file is described in the{" "}
          <a
            href="https://cloudinary.com/privacy"
            target="_blank"
            rel="noreferrer"
          >
            Cloudinary Privacy Policy
          </a>
          .
        </p>
        <p className={s.text}>
          <strong>Our hosting provider.</strong> The application and its
          database run on infrastructure operated by our hosting provider, which
          necessarily processes the data stored there on our behalf.
        </p>
        <p className={s.text}>
          We never sell your data, and we never share it with anyone else,
          except where we are legally required to do so.
        </p>
      </section>

      <section className={s.section}>
        <h2 className={s.sectionHeader}>6. Monitoring and server logs</h2>
        <p className={s.text}>
          We collect technical statistics to check that the service is healthy,
          such as how many requests each API route received, how long they took,
          and which status codes they returned. These statistics are aggregated
          and contain no user identifiers, no email addresses, and no IP
          addresses, so they cannot be traced back to you. Our web server has
          access logging switched off.
        </p>
      </section>

      <section className={s.section}>
        <h2 className={s.sectionHeader}>7. How long we keep your data</h2>
        <ul className={s.list}>
          <li>
            <strong>Account data</strong> — kept for as long as your account
            exists, and deleted when you ask us to delete your account.
          </li>
          <li>
            <strong>Login sessions</strong> — expire automatically and are
            removed when you log out.
          </li>
          <li>
            <strong>Game history</strong> — kept so that you and the other
            players can see past results. When an account is deleted, its games
            are anonymised rather than removed, so that the match history of the
            other players in that game stays intact.
          </li>
        </ul>
        <p className={s.text}>
          Because this is a student project, the whole database may also be
          deleted when the project is evaluated or taken offline.
        </p>
      </section>

      <section className={s.section}>
        <h2 className={s.sectionHeader}>8. Your rights</h2>
        <p className={s.text}>
          Under the GDPR you have the right to access your data, to correct it,
          to have it deleted, to receive a copy of it in a portable format, to
          restrict or object to how we use it, and to complain to a supervisory
          authority (in the Netherlands, the Autoriteit Persoonsgegevens).
        </p>
        <ul className={s.list}>
          <li>
            You can view and correct your username, email, and avatar yourself
            at any time on your profile page.
          </li>
          <li>
            To delete your account, or to request a copy of your data, email us
            at <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> from the
            address registered to your account. We will act on your request
            within 30 days.
          </li>
        </ul>
      </section>

      <section className={s.section}>
        <h2 className={s.sectionHeader}>9. How we protect your data</h2>
        <ul className={s.list}>
          <li>
            Passwords are hashed with bcrypt and are never readable by us.
          </li>
          <li>
            Session tokens are stored only as hashes, and the session cookie is
            HTTP-only and restricted to our authentication endpoints.
          </li>
          <li>Traffic is served over HTTPS in production.</li>
          <li>Requests are rate limited to reduce abuse and brute forcing.</li>
        </ul>
        <p className={s.text}>
          No system can be completely secure. This is a student project and it
          has not been through a professional security audit, so please do not
          reuse a password here that you use anywhere else.
        </p>
      </section>

      <section className={s.section}>
        <h2 className={s.sectionHeader}>10. Children</h2>
        <p className={s.text}>
          The application is not intended for children under 16. We do not
          knowingly collect data from children under 16. If you believe a child
          has created an account, contact us and we will delete it.
        </p>
      </section>

      <section className={s.section}>
        <h2 className={s.sectionHeader}>11. Changes to this policy</h2>
        <p className={s.text}>
          We may update this policy if the application changes. The date at the
          top of the page always shows when it was last updated. If we make a
          significant change, we will show a notice in the application.
        </p>
      </section>

      <section className={s.section}>
        <h2 className={s.sectionHeader}>12. Contact</h2>
        <p className={s.text}>
          For any question about this policy or about your data, write to{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. You can also
          find the whole team on our <a href="/about">About</a> page.
        </p>
      </section>
    </div>
  );
};

export default PrivacyPage;
