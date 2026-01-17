import React from 'react';
import './AboutUs.scss';

const AboutUs: React.FC = () => {
  return (
    <section className="team">
      <div className="team-container">
        <div className="team-members">
          <div className="member">
            <img
              src="/dream-helper/about-us/M.webp"
              alt="Marharyta Zazulia"
              className="member-photo"
            />
            <h3 className="member-name">Marharyta Zazulia</h3>
            <p className="member-role">Backend Developer</p>
            <img
              src="/dream-helper/about-us/star.svg"
              alt="star image"
              className="member-star"
            />
            <p className="member-description">
              Created a Restful API using Python, Django RFW, technologies:
              MailHog (working with mail notifications), MinIO storage (storing
              Dreams photos and users avatars), Stripe payment (allows
              donations). For project was used Token authorization to control
              the display and actions of users on the project pages. Served as
              the Team Leader.
            </p>
            <a
              href="https://www.linkedin.com/in/marharyta-zazulia-708825358/"
              target="_blank"
              rel="noreferrer"
              className="member-linkedin"
            >
              <img
                src="/dream-helper/about-us/linkedin.png"
                alt="linkedin icon"
                className="linkedin-icon"
              />
              LinkedIn
            </a>
          </div>

          <div className="member">
            <img
              src="/dream-helper/about-us/N.jpg"
              alt="Nataliia Strohush"
              className="member-photo"
            />
            <h3 className="member-name">Strohush Nataliia</h3>
            <p className="member-role">Frontend Developer</p>
            <img
              src="/dream-helper/about-us/star.svg"
              alt="star image"
              className="member-star"
            />
            <p className="member-description">
              Built the user interface using React, SCSS, and TypeScript,
              implementing responsive layouts based on the design mockup.
              Focused on creating an intuitive and accessible user experience
              across all pages of the website. Ensured consistent and correct UI
              behavior across different devices and browsers.
            </p>
            <a
              href="https://www.linkedin.com/in/nataliia-strohush/"
              target="_blank"
              rel="noreferrer"
              className="member-linkedin"
            >
              <img
                src="/dream-helper/about-us/linkedin.png"
                alt="linkedin icon"
                className="linkedin-icon"
              />
              LinkedIn
            </a>
          </div>

          <div className="member">
            <img
              src="/dream-helper/about-us/S.jpg"
              alt="Sofia Pustova"
              className="member-photo"
            />
            <h3 className="member-name">Sofia Pustova</h3>
            <p className="member-role">UI/UX Designer</p>
            <img
              src="/dream-helper/about-us/star.svg"
              alt="star image"
              className="member-star"
            />
            <p className="member-description">
              Designed the user interface and created design mockups for the
              project. Focused on delivering a clean, modern, and user-friendly
              visual experience consistent across all layouts. Ensured alignment
              with project requirements and usability best practices.
            </p>
            <a
              href="https://www.linkedin.com/in/sofiia-pustova/"
              target="_blank"
              rel="noreferrer"
              className="member-linkedin"
            >
              <img
                src="/dream-helper/about-us/linkedin.png"
                alt="linkedin icon"
                className="linkedin-icon"
              />
              LinkedIn
            </a>
          </div>

          <div className="member">
            <img
              src="/dream-helper/about-us/Y.jpg"
              alt="Yurii Ivancha"
              className="member-photo"
            />
            <h3 className="member-name">Yurii Ivancha</h3>
            <p className="member-role">Data Analytics</p>
            <img
              src="/dream-helper/about-us/star.svg"
              alt="star image"
              className="member-star"
            />
            <p className="member-description">
              In charge of creating the database, filling out with quality data
              (Google Sheets), following analysis (SQL) and results
              visualization (Tableau). At the end present actionable insights to
              the team in order to take strategic decisions for our project
              improving.
            </p>
            <a
              href="https://www.linkedin.com/in/yurii-ivancha-53a2b7ba/"
              target="_blank"
              rel="noreferrer"
              className="member-linkedin"
            >
              <img
                src="/dream-helper/about-us/linkedin.png"
                alt="linkedin icon"
                className="linkedin-icon"
              />
              LinkedIn
            </a>
          </div>

          <div className="member">
            <img
              src="/dream-helper/about-us/A.webp"
              alt="Anna Krukovets"
              className="member-photo"
            />
            <h3 className="member-name">Anna Krukovets</h3>
            <p className="member-role">Digital Marketer</p>
            <img
              src="/dream-helper/about-us/star.svg"
              alt="star image"
              className="member-star"
            />
            <p className="member-description">
              Developed the marketing strategy for this project, including
              target, competitor, and SWOT analyses to identify strengths,
              weaknesses, opportunities, and threats. Defined short-term goals,
              highlighted unique features, and created advertising campaigns for
              Meta and Google. Focused on maximizing visibility and promoting
              the website.
            </p>
            <a
              href="https://www.linkedin.com/in/dm-anna-krukovets/"
              target="_blank"
              rel="noreferrer"
              className="member-linkedin"
            >
              <img
                src="/dream-helper/about-us/linkedin.png"
                alt="linkedin icon"
                className="linkedin-icon"
              />
              LinkedIn
            </a>
          </div>

          <div className="member">
            <img
              src="/dream-helper/about-us/R.png"
              alt="Roman Rasenko"
              className="member-photo"
            />
            <h3 className="member-name">Roman Rasenko</h3>
            <p className="member-role">QA Engineer</p>
            <img
              src="/dream-helper/about-us/star.svg"
              alt="star image"
              className="member-star"
            />
            <p className="member-description">
              Created and executed test plans, cases, and automated scripts to
              ensure software quality. Identified, documented, and tracked bugs,
              collaborating with developers to resolve issues. Focused on
              maintaining high standards of functionality, performance, and user
              experience.
            </p>
            <a
              href="https://www.linkedin.com/in/marharyta-zazulia-708825358/"
              target="_blank"
              rel="noreferrer"
              className="member-linkedin"
            >
              <img
                src="/dream-helper/about-us/linkedin.png"
                alt="linkedin icon"
                className="linkedin-icon"
              />
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
