import { QRCodeSVG } from "qrcode.react";
import { Mail, Github, Linkedin, MapPin } from "lucide-react";
import { contact, services } from "../data/resume";
import "./Contact.css";

export default function Contact() {
  const items = [
    { icon: Mail, label: contact.email, href: `mailto:${contact.email}` },
    { icon: Github, label: contact.github.replace("https://", ""), href: contact.github },
    { icon: Linkedin, label: "LinkedIn profile", href: contact.linkedin },
    { icon: MapPin, label: contact.location },
  ];

  return (
    <section className="ct-section" id="contact">
      <div className="ct-inner">
        <div className="ct-top">
          <h2 className="ct-title">
            Let’s <span>work</span> together
          </h2>
          <figure className="ct-qr">
            <div className="ct-qr-box">
              <QRCodeSVG value={contact.qrTarget} size={96} bgColor="#ffffff" fgColor="#08080a" />
            </div>
            <figcaption>Scan me</figcaption>
          </figure>
        </div>

        <div className="ct-contacts">
          <h3>Contacts</h3>
          <ul>
            {items.map(({ icon: Icon, label, href }) => (
              <li key={label}>
                <span className="ct-icon" aria-hidden="true">
                  <Icon size={16} />
                </span>
                {href ? (
                  <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
                    {label}
                  </a>
                ) : (
                  <span>{label}</span>
                )}
              </li>
            ))}
          </ul>
        </div>

        <h2 className="ct-services-title">Services</h2>
      </div>

      <div className="ct-strip">
        <ul>
          {services.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </div>

      <div className="ct-home">
        <a href="#home">Home</a>
      </div>
    </section>
  );
}