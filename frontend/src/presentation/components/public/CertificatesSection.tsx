import { ExternalLink } from 'lucide-react';
import type { Certificate } from '../../../domain/entities';
import { formatFriendlyDate } from '../../utils/dateUtils';
import { publicHttpUrl } from '../../utils/publicHttpUrl';
import { SectionReveal } from './SectionReveal';
import { TechnologyIcon } from './TechnologyIcon';
import styles from './CertificatesSection.module.css';

export const CertificatesSection = ({ certificates }: { certificates: Certificate[] }) => (
  <section id="certificados" className="portfolio-section" aria-labelledby="certificates-title" tabIndex={-1}>
    <div className="portfolio-shell portfolio-section-inner">
      <h2 id="certificates-title" className="portfolio-heading">Certificados</h2>
      <ul className={styles.entries} role="list">
        {certificates.map((certificate) => {
          const credentialUrl = publicHttpUrl(certificate.credentialUrl);
          const issueDate = certificate.issueDate instanceof Date ? certificate.issueDate.toJSON() : certificate.issueDate;

          return (
            <li key={certificate.id} className={styles.row}>
              <SectionReveal className={styles.entry}>
                <div className={styles.symbol}>
                  <TechnologyIcon
                    name={certificate.name}
                    context={certificate.issuingOrganization}
                    matchWithinText
                    size={22}
                  />
                </div>
                <div className={styles.identity}>
                  <h3 className={styles.title}>{certificate.name}</h3>
                  <p className={styles.issuer}>{certificate.issuingOrganization}</p>
                </div>
                {issueDate && (
                  <time className={styles.date} dateTime={issueDate}>
                    {formatFriendlyDate(issueDate, 'UTC')}
                  </time>
                )}
                {credentialUrl && (
                  <a
                    className={styles.credential}
                    href={credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Ver credencial de ${certificate.name} (abre en otra pestaña)`}
                  >
                    Ver credencial <ExternalLink size={15} aria-hidden="true" />
                  </a>
                )}
              </SectionReveal>
            </li>
          );
        })}
      </ul>
    </div>
  </section>
);
