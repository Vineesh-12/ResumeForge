import React from 'react'
import { Document, Page, Text, View, Link, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9.5,
    paddingTop: 28,
    paddingBottom: 28,
    paddingLeft: 32,
    paddingRight: 32,
    color: '#111827',
    lineHeight: 1.3
  },
  header: {
    marginBottom: 10,
    borderBottomWidth: 1.5,
    borderBottomColor: '#1f2937',
    borderBottomStyle: 'solid',
    paddingBottom: 8
  },
  name: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 19,
    letterSpacing: 0.5,
    color: '#030712',
    marginBottom: 3
  },
  contactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    fontSize: 8.5,
    color: '#374151'
  },
  linkText: {
    color: '#2563eb',
    textDecoration: 'none'
  },
  section: {
    marginTop: 8,
    marginBottom: 2
  },
  sectionHeader: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    letterSpacing: 0.8,
    color: '#1f2937',
    textTransform: 'uppercase',
    borderBottomWidth: 0.8,
    borderBottomColor: '#d1d5db',
    borderBottomStyle: 'solid',
    paddingBottom: 2,
    marginBottom: 4
  },
  summaryText: {
    fontSize: 9,
    color: '#374151',
    lineHeight: 1.35
  },
  skillRow: {
    fontSize: 8.8,
    marginBottom: 2,
    lineHeight: 1.25
  },
  skillCat: {
    fontFamily: 'Helvetica-Bold',
    color: '#111827'
  },
  entry: {
    marginBottom: 6
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline'
  },
  entryRole: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9.5,
    color: '#111827'
  },
  entryDate: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: '#4b5563'
  },
  entrySub: {
    fontSize: 8.8,
    color: '#4b5563',
    marginBottom: 2
  },
  bulletList: {
    paddingLeft: 4
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 2,
    alignItems: 'flex-start'
  },
  bulletDot: {
    width: 10,
    fontSize: 8.5,
    color: '#6b7280'
  },
  bulletText: {
    flex: 1,
    fontSize: 8.8,
    color: '#374151',
    lineHeight: 1.3
  },
  linkTag: {
    fontSize: 8,
    color: '#2563eb',
    textDecoration: 'none'
  }
})

export default function TechLeadMinimalistTemplate({ data }) {
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
                {(idx < nonLinkContact.length - 1 || rawContactLinks.length > 0) ? ' | ' : ''}
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
                  {!isLast ? ' | ' : ''}
                </Text>
              )
            })}
          </Text>
        </View>

        {/* SUMMARY */}
        {data.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Professional Summary</Text>
            <Text style={styles.summaryText}>{data.summary}</Text>
          </View>
        )}

        {/* TECHNICAL SKILLS */}
        {skills && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Technical Competencies</Text>
            {skills.languages?.length > 0 && (
              <Text style={styles.skillRow}>
                <Text style={styles.skillCat}>Languages: </Text>
                {skills.languages.join(' • ')}
              </Text>
            )}
            {skills.frameworks?.length > 0 && (
              <Text style={styles.skillRow}>
                <Text style={styles.skillCat}>Frameworks &amp; Libraries: </Text>
                {skills.frameworks.join(' • ')}
              </Text>
            )}
            {skills.tools?.length > 0 && (
              <Text style={styles.skillRow}>
                <Text style={styles.skillCat}>Cloud &amp; DevOps: </Text>
                {skills.tools.join(' • ')}
              </Text>
            )}
            {skills.databases?.length > 0 && (
              <Text style={styles.skillRow}>
                <Text style={styles.skillCat}>Databases: </Text>
                {skills.databases.join(' • ')}
              </Text>
            )}
            {skills.concepts?.length > 0 && (
              <Text style={styles.skillRow}>
                <Text style={styles.skillCat}>Architecture &amp; Methods: </Text>
                {skills.concepts.join(' • ')}
              </Text>
            )}
          </View>
        )}

        {/* EXPERIENCE */}
        {experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Work Experience</Text>
            {experience.map((exp, idx) => {
              const expLinks = Array.isArray(exp.links) ? exp.links.filter(l => l && l.url) : []
              return (
                <View key={idx} style={styles.entry}>
                  <View style={styles.entryHeader}>
                    <Text style={styles.entryRole}>
                      {exp.title}
                      {expLinks.map((l, lIdx) => {
                        const fullUrl = l.url.startsWith('http') ? l.url : `https://${l.url}`
                        return (
                          <Text key={lIdx}>
                            {' '}<Link src={fullUrl} style={styles.linkTag}>[{l.label || 'Proof'}]</Link>
                          </Text>
                        )
                      })}
                    </Text>
                    <Text style={styles.entryDate}>{exp.startDate} – {exp.endDate}</Text>
                  </View>
                  <Text style={styles.entrySub}>{exp.company}{exp.location ? ` | ${exp.location}` : ''}</Text>
                  <View style={styles.bulletList}>
                    {(exp.bullets || []).map((b, bIdx) => (
                      <View key={bIdx} style={styles.bulletRow}>
                        <Text style={styles.bulletDot}>▸</Text>
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
            <Text style={styles.sectionHeader}>Technical Projects</Text>
            {projects.map((proj, idx) => {
              const pLinks = Array.isArray(proj.links) ? proj.links.filter(l => l && l.url) : []
              return (
                <View key={idx} style={styles.entry}>
                  <View style={styles.entryHeader}>
                    <Text style={styles.entryRole}>
                      {proj.name}
                      {pLinks.map((l, lIdx) => {
                        const fullUrl = l.url.startsWith('http') ? l.url : `https://${l.url}`
                        return (
                          <Text key={lIdx}>
                            {' '}<Link src={fullUrl} style={styles.linkTag}>[{l.label || 'Link'}]</Link>
                          </Text>
                        )
                      })}
                      {proj.technologies?.length > 0 ? ` (${proj.technologies.join(', ')})` : ''}
                    </Text>
                    <Text style={styles.entryDate}>{proj.date}</Text>
                  </View>
                  <View style={styles.bulletList}>
                    {(proj.bullets || []).map((b, bIdx) => (
                      <View key={bIdx} style={styles.bulletRow}>
                        <Text style={styles.bulletDot}>▸</Text>
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
            <Text style={styles.sectionHeader}>Education</Text>
            {education.map((edu, idx) => (
              <View key={idx} style={styles.entry}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryRole}>{edu.degree} — {edu.major}</Text>
                  <Text style={styles.entryDate}>{edu.startDate ? `${edu.startDate} – ${edu.endDate}` : edu.endDate}</Text>
                </View>
                <Text style={styles.entrySub}>
                  {edu.institution}{edu.location ? ` | ${edu.location}` : ''}
                  {edu.gpa ? ` • CGPA: ${edu.gpa}` : ''}
                </Text>
              </View>
            ))}
          </View>
        )}

        {certifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Certifications</Text>
            {certifications.map((cert, idx) => {
              const fullUrl = cert.url ? (cert.url.startsWith('http') ? cert.url : `https://${cert.url}`) : null
              return (
                <View key={idx} style={styles.bulletRow}>
                  <Text style={styles.bulletDot}>▸</Text>
                  <Text style={styles.bulletText}>
                    <Text style={{ fontFamily: 'Helvetica-Bold' }}>{cert.name}</Text>
                    {' — '}{cert.issuer} {cert.year ? `(${cert.year})` : ''}
                    {fullUrl ? <Text>{' '}<Link src={fullUrl} style={styles.linkTag}>[{cert.label || 'Credential'}]</Link></Text> : null}
                  </Text>
                </View>
              )
            })}
          </View>
        )}
      </Page>
    </Document>
  )
}
