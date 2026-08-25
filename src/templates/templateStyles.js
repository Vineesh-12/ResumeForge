import { StyleSheet } from '@react-pdf/renderer'

/**
 * Harvard-Jake ATS Standard StyleSheet for @react-pdf/renderer
 * Conforms to strict single-column, text-selectable, universal typography criteria.
 */
export const atsStyles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9.5,
    lineHeight: 1.35,
    paddingTop: 36,     // 0.5 in
    paddingBottom: 36,  // 0.5 in
    paddingLeft: 43.2,  // 0.6 in
    paddingRight: 43.2, // 0.6 in
    color: '#111827',
    backgroundColor: '#FFFFFF'
  },
  // Header: Name & Contact
  header: {
    textAlign: 'center',
    marginBottom: 8
  },
  name: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 18,
    color: '#000000',
    marginBottom: 3,
    letterSpacing: 0.5
  },
  contactLine: {
    fontSize: 8.5,
    color: '#374151'
  },
  // Section Structure
  section: {
    marginBottom: 8
  },
  sectionTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10.5,
    color: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: '#9CA3AF',
    borderBottomStyle: 'solid',
    paddingBottom: 2,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  bodyText: {
    fontSize: 9,
    lineHeight: 1.35,
    color: '#1F2937',
    textAlign: 'justify'
  },
  // Technical Skills Layout
  skillsLine: {
    fontSize: 9,
    lineHeight: 1.35,
    color: '#1F2937',
    marginBottom: 1.5
  },
  skillsLabel: {
    fontFamily: 'Helvetica-Bold',
    color: '#111827'
  },
  // Experience & Projects Entries
  entry: {
    marginBottom: 4
  },
  entryHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 1
  },
  entryTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9.5,
    color: '#000000'
  },
  entryDate: {
    fontSize: 8.5,
    color: '#4B5563'
  },
  entrySubRow: {
    fontSize: 8.5,
    color: '#4B5563',
    fontStyle: 'italic',
    marginBottom: 2
  },
  // Links
  linkText: {
    fontSize: 8.5,
    color: '#2563EB',
    textDecoration: 'underline',
    marginLeft: 3
  },
  linkTag: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#1D4ED8',
    textDecoration: 'underline'
  },
  // Bullets
  bulletList: {
    paddingLeft: 8
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 1.5
  },
  bulletDot: {
    width: 8,
    fontSize: 9,
    color: '#111827'
  },
  bulletText: {
    flex: 1,
    fontSize: 9,
    lineHeight: 1.3,
    color: '#1F2937'
  }
})
