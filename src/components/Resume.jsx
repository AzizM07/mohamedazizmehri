import { education, experience, activities } from "../data/resume";
import "./Resume.css";

function Entry({ role, company, details, dates }) {
  return (
    <li className="rs-entry">
      <div className="rs-row">
        <h4 className="rs-role">{role}</h4>
        <span className="rs-dates">{dates}</span>
      </div>
      <p className="rs-sub">
        {company}
        {details ? ` · ${details}` : ""}
      </p>
    </li>
  );
}

export default function Resume() {
  return (
    <section className="rs-section" id="work">
      <div className="rs-frame">
        <h2 className="rs-legend">Education</h2>

        <ul className="rs-list">
          {education.map((e) => (
            <li key={e.title} className="rs-entry">
              <div className="rs-row">
                <div>
                  <h3 className="rs-degree">{e.title}</h3>
                  <p className="rs-sub">{e.place}</p>
                </div>
                <span className="rs-dates">{e.dates}</span>
              </div>
            </li>
          ))}
        </ul>

        <h2 className="rs-heading">Experience</h2>
        <ul className="rs-list">
          {experience.map((e) => (
            <Entry key={e.company} {...e} />
          ))}
        </ul>

        <h2 className="rs-heading">Activities</h2>
        <ul className="rs-list">
          {activities.map((e) => (
            <Entry key={e.role} {...e} />
          ))}
        </ul>
      </div>
    </section>
  );
}