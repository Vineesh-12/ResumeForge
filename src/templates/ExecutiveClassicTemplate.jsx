import React from 'react'
import { Document, Page, Text, View, Link, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Times-Roman',
    fontSize: 10,
    paddingTop: 32,
    paddingBottom: 32,
    paddingLeft: 36,
    paddingRight: 36,
    color: '#000000',
    lineHeight: 1.3
  },
  header: {
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    paddingBottom: 8
  },
  name: {
    fontFamily: 'Times-Bold',
    fontSize: 22,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4
  },
  contactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    fontSize: 9,
    color: '#222222'
  },
  linkText: {
    color: '#0000ee',
    textDecoration: 'underline'
  },
  section: {
    marginTop: 10,
    marginBottom: 2
  },
  sectionTitle: {
    fontFamily: 'Times-Bold',
    fontSize: 10.5,
    letterSpacing: 1,
    textTransform: 'uppercase',
    borderBottomWidth: 0.5,
    borderBottomColor: '#000000',
    paddingBottom: 1,
    marginBottom: 5
  },
  bodyText: {
    fontSize: 9.5,
    lineHeight: 1.4,
    color: '#111111'
  },
  skillsLine: {
    fontSize: 9.5,
    marginBottom: 2
  },
  skillsLabel: {
    fontFamily: 'Times-Bold'
  },
  entry: {
    marginBottom: 6
  },
  entryHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline'
  },
  entryTitle: {
    fontFamily: 'Times-Bold',
    fontSize: 10
  },
  entryDate: {
    fontFamily: 'Times-Italic',
    fontSize: 9.5
  },
  entrySubRow: {
    fontFamily: 'Times-Italic',
    fontSize: 9.5,
    marginBottom: 2
  },
  bulletList: {
    paddingLeft: 6
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 2.5,
    alignItems: 'flex-start'
  },
  bulletDot: {
    width: 12,
    fontSize: 9
  },
  bulletText: {
    flex: 1,
    fontSize: 9.5,
    lineHeight: 1.35
  }
})

export default function ExecutiveClassicTemplate({ data }) {
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
                {(idx < nonLinkContact.length - 1 || rawContactLinks.length > 0) ? '  •  ' : ''}
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
                  {!isLast ? '  •  ' : ''}
                </Text>
              )
            })}
          </Text>
        </View>

        {/* SUMMARY */}
        {data.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Executive Summary</Text>
            <Text style={styles.bodyText}>{data.summary}</Text>
          </View>
        )}

        {/* SKILLS */}
        {skills && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Areas of Expertise</Text>
            {skills.languages?.length > 0 && (
              <Text style={styles.skillsLine}>
                <Text style={styles.skillsLabel}>Programming Languages: </Text>
                {skills.languages.join(', ')}
              </Text>
            )}
            {skills.frameworks?.length > 0 && (
              <Text style={styles.skillsLine}>
                <Text style={styles.skillsLabel}>Frameworks &amp; Systems: </Text>
                {skills.frameworks.join(', ')}
              </Text>
            )}
            {skills.tools?.length > 0 && (
              <Text style={styles.skillsLine}>
                <Text style={styles.skillsLabel}>Developer Tools &amp; Cloud: </Text>
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
                <Text style={styles.skillsLabel}>Methodologies: </Text>
                {skills.concepts.join(', ')}
              </Text>
            )}
          </View>
        )}

        {/* EXPERIENCE */}
        {experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Experience</Text>
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
                            {' '}<Link src={fullUrl} style={styles.linkText}>({l.label || 'Link'})</Link>
                          </Text>
                        )
                      })}
                    </Text>
                    <Text style={styles.entryDate}>{exp.startDate} – {exp.endDate}</Text>
                  </View>
                  <Text style={styles.entrySubRow}>{exp.company}{exp.location ? `, ${exp.location}` : ''}</Text>
                  <View style={styles.bulletList}>
                    {(exp.bullets || []).map((b, bIdx) => (
                      <View key={bIdx} style={styles.bulletRow}>
                        <Text style={styles.bulletDot}>•</Text>
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
            <Text style={styles.sectionTitle}>Key Projects</Text>
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
                            {' '}<Link src={fullUrl} style={styles.linkText}>({l.label || 'Link'})</Link>
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
                        <Text style={styles.bulletDot}>•</Text>
                        <Text style={styles.bulletText}>{b}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )
            })}
          </View>
        )}

        {/* EDUCATION */}
        {education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {education.map((edu, idx) => (
              <View key={idx} style={styles.entry}>
                <View style={styles.entryHeaderRow}>
                  <Text style={styles.entryTitle}>{edu.degree} in {edu.major}</Text>
                  <Text style={styles.entryDate}>{edu.startDate ? `${edu.startDate} – ${edu.endDate}` : edu.endDate}</Text>
                </View>
                <Text style={styles.entrySubRow}>{edu.institution}{edu.location ? `, ${edu.location}` : ''}</Text>
              </View>
            ))}
          </View>
        )}

        {/* CERTIFICATIONS */}
        {certifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Certifications &amp; Credentials</Text>
            <View style={styles.bulletList}>
              {certifications.map((cert, idx) => {
                const fullUrl = cert.url ? (cert.url.startsWith('http') ? cert.url : `https://${cert.url}`) : null
                return (
                  <View key={idx} style={styles.bulletRow}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.bulletText}>
                      <Text style={{ fontFamily: 'Times-Bold' }}>{cert.name}</Text>
                      {' — '}{cert.issuer} {cert.year ? `(${cert.year})` : ''}
                      {fullUrl ? <Text>{' '}<Link src={fullUrl} style={styles.linkText}>({cert.label || 'Credential'})</Link></Text> : null}
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
