import React from 'react'
import { Document, Page, Text, View, Link } from '@react-pdf/renderer'
import { atsStyles } from './templateStyles'

export default function HarvardJakeTemplate({ data }) {
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
      <Page size="A4" style={atsStyles.page}>
        {/* HEADER: Candidate Name & Contact */}
        <View style={atsStyles.header}>
          <Text style={atsStyles.name}>{data.name || 'CANDIDATE NAME'}</Text>
          <Text style={atsStyles.contactLine}>
            {nonLinkContact.map((item, idx) => (
              <Text key={`contact-${idx}`}>
                {item}
                {(idx < nonLinkContact.length - 1 || rawContactLinks.length > 0) ? ' • ' : ''}
              </Text>
            ))}
            {rawContactLinks.map((lnk, lIdx) => {
              if (!lnk || !lnk.url) return null
              const isLast = lIdx === rawContactLinks.length - 1
              const fullUrl = lnk.url.startsWith('http') ? lnk.url : `https://${lnk.url}`
              const displayLabel = lnk.label || lnk.url.replace(/^https?:\/\//, '').replace(/^www\./, '')

              return (
                <Text key={`link-${lIdx}`}>
                  <Link src={fullUrl} style={atsStyles.linkText}>
                    {displayLabel}
                  </Link>
                  {!isLast ? ' • ' : ''}
                </Text>
              )
            })}
          </Text>
        </View>

        {/* PROFESSIONAL SUMMARY */}
        {data.summary && (
          <View style={atsStyles.section}>
            <Text style={atsStyles.sectionTitle}>PROFESSIONAL SUMMARY</Text>
            <Text style={atsStyles.bodyText}>{data.summary}</Text>
          </View>
        )}

        {/* TECHNICAL SKILLS */}
        {skills && (
          <View style={atsStyles.section}>
            <Text style={atsStyles.sectionTitle}>TECHNICAL SKILLS</Text>
            {skills.languages?.length > 0 && (
              <Text style={atsStyles.skillsLine}>
                <Text style={atsStyles.skillsLabel}>Languages: </Text>
                {skills.languages.join(', ')}
              </Text>
            )}
            {skills.frameworks?.length > 0 && (
              <Text style={atsStyles.skillsLine}>
                <Text style={atsStyles.skillsLabel}>Frameworks &amp; Libraries: </Text>
                {skills.frameworks.join(', ')}
              </Text>
            )}
            {skills.tools?.length > 0 && (
              <Text style={atsStyles.skillsLine}>
                <Text style={atsStyles.skillsLabel}>Developer Tools &amp; Cloud: </Text>
                {skills.tools.join(', ')}
              </Text>
            )}
            {skills.databases?.length > 0 && (
              <Text style={atsStyles.skillsLine}>
                <Text style={atsStyles.skillsLabel}>Databases: </Text>
                {skills.databases.join(', ')}
              </Text>
            )}
            {skills.concepts?.length > 0 && (
              <Text style={atsStyles.skillsLine}>
                <Text style={atsStyles.skillsLabel}>Concepts: </Text>
                {skills.concepts.join(', ')}
              </Text>
            )}
          </View>
        )}

        {/* WORK EXPERIENCE */}
        {experience.length > 0 && (
          <View style={atsStyles.section}>
            <Text style={atsStyles.sectionTitle}>EXPERIENCE</Text>
            {experience.map((exp, idx) => {
              const expLinks = Array.isArray(exp.links)
                ? exp.links.filter(l => l && l.url)
                : (exp.link ? [{ label: 'Proof', url: exp.link }] : [])

              return (
                <View key={idx} style={atsStyles.entry}>
                  <View style={atsStyles.entryHeaderRow}>
                    <Text style={atsStyles.entryTitle}>
                      {exp.title}
                      {expLinks.map((l, lIdx) => {
                        const fullUrl = l.url.startsWith('http') ? l.url : `https://${l.url}`
                        return (
                          <Text key={lIdx}>
                            {' '}<Link src={fullUrl} style={atsStyles.linkTag}>{l.label || 'Proof'}</Link>
                          </Text>
                        )
                      })}
                    </Text>
                    <Text style={atsStyles.entryDate}>{exp.startDate} – {exp.endDate}</Text>
                  </View>
                  <Text style={atsStyles.entrySubRow}>
                    {exp.company}{exp.location ? ` • ${exp.location}` : ''}
                  </Text>
                  <View style={atsStyles.bulletList}>
                    {(exp.bullets || []).map((bullet, bIdx) => (
                      <View key={bIdx} style={atsStyles.bulletRow}>
                        <Text style={atsStyles.bulletDot}>•</Text>
                        <Text style={atsStyles.bulletText}>{bullet}</Text>
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
          <View style={atsStyles.section}>
            <Text style={atsStyles.sectionTitle}>PROJECTS</Text>
            {projects.map((proj, idx) => {
              const projectLinks = Array.isArray(proj.links)
                ? proj.links.filter(l => l && l.url)
                : proj.link
                ? [{ label: proj.linkLabel || 'Link', url: proj.link }]
                : []

              return (
                <View key={idx} style={atsStyles.entry}>
                  <View style={atsStyles.entryHeaderRow}>
                    <Text style={atsStyles.entryTitle}>
                      {proj.name}
                      {projectLinks.map((l, lIdx) => {
                        const fullUrl = l.url.startsWith('http') ? l.url : `https://${l.url}`
                        return (
                          <Text key={lIdx}>
                            {' '}<Link src={fullUrl} style={atsStyles.linkTag}>{l.label || 'Link'}</Link>
                          </Text>
                        )
                      })}
                      {proj.technologies?.length > 0 ? ` | ${proj.technologies.join(', ')}` : ''}
                    </Text>
                    <Text style={atsStyles.entryDate}>{proj.date}</Text>
                  </View>
                  <View style={atsStyles.bulletList}>
                    {(proj.bullets || []).map((b, bIdx) => (
                      <View key={bIdx} style={atsStyles.bulletRow}>
                        <Text style={atsStyles.bulletDot}>•</Text>
                        <Text style={atsStyles.bulletText}>{b}</Text>
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
          <View style={atsStyles.section}>
            <Text style={atsStyles.sectionTitle}>EDUCATION</Text>
            {education.map((edu, idx) => (
              <View key={idx} style={atsStyles.entry}>
                <View style={atsStyles.entryHeaderRow}>
                  <Text style={atsStyles.entryTitle}>{edu.degree} — {edu.major}</Text>
                  <Text style={atsStyles.entryDate}>
                    {edu.startDate ? `${edu.startDate} – ${edu.endDate}` : edu.endDate}
                  </Text>
                </View>
                <Text style={atsStyles.entrySubRow}>
                  {edu.institution}{edu.location ? `, ${edu.location}` : ''}
                  {edu.gpa ? ` • CGPA: ${edu.gpa}` : ''}
                </Text>
                {edu.coursework?.length > 0 && (
                  <Text style={atsStyles.skillsLine}>
                    <Text style={atsStyles.skillsLabel}>Relevant Coursework: </Text>
                    {edu.coursework.join(', ')}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* CERTIFICATIONS */}
        {certifications.length > 0 && (
          <View style={atsStyles.section}>
            <Text style={atsStyles.sectionTitle}>CERTIFICATIONS</Text>
            <View style={atsStyles.bulletList}>
              {certifications.map((cert, idx) => {
                const fullUrl = cert.url ? (cert.url.startsWith('http') ? cert.url : `https://${cert.url}`) : null

                return (
                  <View key={idx} style={atsStyles.bulletRow}>
                    <Text style={atsStyles.bulletDot}>•</Text>
                    <Text style={atsStyles.bulletText}>
                      <Text style={{ fontFamily: 'Helvetica-Bold' }}>{cert.name}</Text>
                      {' — '}{cert.issuer} {cert.year ? `(${cert.year})` : ''}
                      {fullUrl ? (
                        <Text>
                          {' '}<Link src={fullUrl} style={atsStyles.linkTag}>{cert.label || 'Credential'}</Link>
                        </Text>
                      ) : null}
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
