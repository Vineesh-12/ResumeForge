import React from 'react'
import { Document, Page, Text, View, Link, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9.2,
    paddingTop: 26,
    paddingBottom: 26,
    paddingLeft: 30,
    paddingRight: 30,
    color: '#0f172a',
    lineHeight: 1.28
  },
  header: {
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2563eb',
    paddingBottom: 6
  },
  name: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 18,
    color: '#0f172a',
    marginBottom: 2
  },
  contactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    fontSize: 8.5,
    color: '#475569'
  },
  linkText: {
    color: '#2563eb',
    textDecoration: 'none'
  },
  section: {
    marginTop: 7,
    marginBottom: 2
  },
  sectionTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9.8,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: '#2563eb',
    borderBottomWidth: 0.6,
    borderBottomColor: '#cbd5e1',
    paddingBottom: 1.5,
    marginBottom: 4
  },
  bodyText: {
    fontSize: 8.8,
    color: '#334155',
    lineHeight: 1.32
  },
  skillsLine: {
    fontSize: 8.8,
    marginBottom: 1.5
  },
  skillsLabel: {
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a'
  },
  entry: {
    marginBottom: 5
  },
  entryHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline'
  },
  entryTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9.2,
    color: '#0f172a'
  },
  entryDate: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8.5,
    color: '#64748b'
  },
  entrySubRow: {
    fontSize: 8.6,
    color: '#475569',
    marginBottom: 1.5
  },
  bulletList: {
    paddingLeft: 4
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 1.8,
    alignItems: 'flex-start'
  },
  bulletDot: {
    width: 9,
    fontSize: 8.5,
    color: '#2563eb'
  },
  bulletText: {
    flex: 1,
    fontSize: 8.8,
    color: '#334155',
    lineHeight: 1.3
  }
})

export default function ModernCompactTemplate({ data }) {
  if (!data) return null

  const contact = data.contact || {}
  const rawContactLinks = Array.isArray(contact.customLinks)
    ? contact.customLinks
    : [
        contact.linkedin ? { label: 'LinkedIn', url: contact.linkedin } : null,
        contact.github ? { label: 'GitHub', url: contact.github } : null
      ].filter(Boolean)

  const nonLinkContact = [contact.location, contact.phone, contact.email].filter(Boolean)
  const skills = data.skills || {}
  const experience = data.experience || []
  const projects = data.projects || []
  const education = data.education || []
  const certifications = data.certifications || []

  return (
    <Document title={`Resume_${data.name || 'Candidate'}`}>
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.name}>{data.name || 'CANDIDATE NAME'}</Text>
          <Text style={styles.contactRow}>
            {nonLinkContact.map((item, idx) => (
              <Text key={`c-${idx}`}>
                {item}
                {(idx < nonLinkContact.length - 1 || rawContactLinks.length > 0) ? ' • ' : ''}
              </Text>
            ))}
            {rawContactLinks.map((lnk, lIdx) => {
              if (!lnk || !lnk.url) return null
              const isLast = lIdx === rawContactLinks.length - 1
              const fullUrl = lnk.url.startsWith('http') ? lnk.url : `https://${lnk.url}`
              const label = lnk.label || lnk.url.replace(/^https?:\/\//, '').replace(/^www\./, '')
              return (
                <Text key={`l-${lIdx}`}>
                  <Link src={fullUrl} style={styles.linkText}>{label}</Link>
                  {!isLast ? ' • ' : ''}
                </Text>
              )
            })}
          </Text>
        </View>

        {/* SUMMARY */}
        {data.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Summary</Text>
            <Text style={styles.bodyText}>{data.summary}</Text>
          </View>
        )}

        {/* TECHNICAL SKILLS */}
        {skills && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            {skills.languages?.length > 0 && (
              <Text style={styles.skillsLine}>
                <Text style={styles.skillsLabel}>Languages: </Text>
                {skills.languages.join(', ')}
              </Text>
            )}
            {skills.frameworks?.length > 0 && (
              <Text style={styles.skillsLine}>
                <Text style={styles.skillsLabel}>Frameworks: </Text>
                {skills.frameworks.join(', ')}
              </Text>
            )}
            {skills.tools?.length > 0 && (
              <Text style={styles.skillsLine}>
                <Text style={styles.skillsLabel}>Tools &amp; Cloud: </Text>
                {skills.tools.join(', ')}
              </Text>
            )}
            {skills.databases?.length > 0 && (
              <Text style={styles.skillsLine}>
                <Text style={styles.skillsLabel}>Databases: </Text>
                {skills.databases.join(', ')}
              </Text>
            )}
            {skills.concepts?.length > 0 && (
              <Text style={styles.skillsLine}>
                <Text style={styles.skillsLabel}>Concepts: </Text>
                {skills.concepts.join(', ')}
              </Text>
            )}
          </View>
        )}

        {/* WORK EXPERIENCE */}
        {experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
            {experience.map((exp, idx) => {
              const expLinks = Array.isArray(exp.links) ? exp.links.filter(l => l && l.url) : []
              return (
                <View key={idx} style={styles.entry}>
                  <View style={styles.entryHeaderRow}>
                    <Text style={styles.entryTitle}>
                      {exp.title}
                      {expLinks.map((l, lIdx) => {
                        const fullUrl = l.url.startsWith('http') ? l.url : `https://${l.url}`
                        return (
                          <Text key={lIdx}>
                            {' '}<Link src={fullUrl} style={styles.linkText}>[{l.label || 'Link'}]</Link>
                          </Text>
                        )
                      })}
                    </Text>
                    <Text style={styles.entryDate}>{exp.startDate} – {exp.endDate}</Text>
                  </View>
                  <Text style={styles.entrySubRow}>{exp.company}{exp.location ? ` | ${exp.location}` : ''}</Text>
                  <View style={styles.bulletList}>
                    {(exp.bullets || []).map((b, bIdx) => (
                      <View key={bIdx} style={styles.bulletRow}>
                        <Text style={styles.bulletDot}>▪</Text>
                        <Text style={styles.bulletText}>{b}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )
            })}
          </View>
        )}

        {/* PROJECTS */}
        {projects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Projects</Text>
            {projects.map((proj, idx) => {
              const pLinks = Array.isArray(proj.links) ? proj.links.filter(l => l && l.url) : []
              return (
                <View key={idx} style={styles.entry}>
                  <View style={styles.entryHeaderRow}>
                    <Text style={styles.entryTitle}>
                      {proj.name}
                      {pLinks.map((l, lIdx) => {
                        const fullUrl = l.url.startsWith('http') ? l.url : `https://${l.url}`
                        return (
                          <Text key={lIdx}>
                            {' '}<Link src={fullUrl} style={styles.linkText}>[{l.label || 'Link'}]</Link>
                          </Text>
                        )
                      })}
                      {proj.technologies?.length > 0 ? ` | ${proj.technologies.join(', ')}` : ''}
                    </Text>
                    <Text style={styles.entryDate}>{proj.date}</Text>
                  </View>
                  <View style={styles.bulletList}>
                    {(proj.bullets || []).map((b, bIdx) => (
                      <View key={bIdx} style={styles.bulletRow}>
                        <Text style={styles.bulletDot}>▪</Text>
                        <Text style={styles.bulletText}>{b}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )
            })}
          </View>
        )}

        {/* EDUCATION & CERTIFICATIONS */}
        {education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {education.map((edu, idx) => (
              <View key={idx} style={styles.entry}>
                <View style={styles.entryHeaderRow}>
                  <Text style={styles.entryTitle}>{edu.degree} — {edu.major}</Text>
                  <Text style={styles.entryDate}>{edu.startDate ? `${edu.startDate} – ${edu.endDate}` : edu.endDate}</Text>
                </View>
                <Text style={styles.entrySubRow}>{edu.institution}{edu.location ? ` | ${edu.location}` : ''}</Text>
              </View>
            ))}
          </View>
        )}

        {certifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Certifications</Text>
            <View style={styles.bulletList}>
              {certifications.map((cert, idx) => {
                const fullUrl = cert.url ? (cert.url.startsWith('http') ? cert.url : `https://${cert.url}`) : null
                return (
                  <View key={idx} style={styles.bulletRow}>
                    <Text style={styles.bulletDot}>▪</Text>
                    <Text style={styles.bulletText}>
                      <Text style={{ fontFamily: 'Helvetica-Bold' }}>{cert.name}</Text>
                      {' — '}{cert.issuer} {cert.year ? `(${cert.year})` : ''}
                      {fullUrl ? <Text>{' '}<Link src={fullUrl} style={styles.linkText}>[{cert.label || 'Credential'}]</Link></Text> : null}
                    </Text>
                  </View>
                )
              })}
            </View>
          </View>
        )}
      </Page>
    </Document>
  )
}
