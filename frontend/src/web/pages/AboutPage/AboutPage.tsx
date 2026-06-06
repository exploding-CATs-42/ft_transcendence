// CSS
import s from "./AboutPage.module.css";

const AboutPage = () => {
  return (
    <div className={s.pageContainer}>
      <section className={s.section}>
        <h2 className={s.sectionHeader}>About the project</h2>
        <p className={s.description}>
          Exploding CATs (also known as ft_transcendence) is the final project
          of the 42 curriculum. This project gives students the ability to
          choose what they want to build and is designed to challenge all the
          skills acquired throughout the program. We went with a web based "
          Exploding kittens " game clone. It was fun to plan and build it, while
          applying principles of collaboration, problem-solving, project
          management, and software development that we learned through the
          intensive, peer-driven learning experience that is 42.
        </p>
      </section>
    </div>
  );
};

export default AboutPage;
