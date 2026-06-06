// CSS
import s from "./AboutPage.module.css";

const AboutPage = () => {
  return (
    <div className={s.pageContainer}>
      <section className={s.section}>
        <h2 className={s.sectionHeader}>About the project</h2>
        <p className={s.description}>
          Exploding CATs (also known as ft_transcendence) is the final project
          of the{" "}
          <a href="https://www.codam.nl/en/curriculum/" target="_blank">
            42 curriculum
          </a>
          . This project gives students the ability to choose what they want to
          build and is designed to challenge all the skills acquired throughout
          the program. We went with a web based "
          <a
            href="https://www.explodingkittens.com/products/exploding-kittens-original-edition"
            target="_blank"
          >
            Exploding kittens
          </a>
          " game clone. It was fun to plan and build it, while applying
          principles of collaboration, problem-solving, project management, and
          software development that we learned through the intensive,
          peer-driven learning experience that is{" "}
          <a href="https://www.42network.org/" target="_blank">
            42
          </a>
          .
        </p>
      </section>
      <section className={s.section}></section>
    </div>
  );
};

export default AboutPage;
