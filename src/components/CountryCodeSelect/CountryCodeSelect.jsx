import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import './CountryCodeSelect.css'

export const COUNTRIES = [
  { code: '+91', iso: 'in', country: 'IND', name: 'India' },
  { code: '+1', iso: 'us', country: 'USA', name: 'United States' },
  { code: '+1', iso: 'ca', country: 'CAN', name: 'Canada' },
  { code: '+44', iso: 'gb', country: 'GBR', name: 'United Kingdom' },
  { code: '+61', iso: 'au', country: 'AUS', name: 'Australia' },
  { code: '+49', iso: 'de', country: 'DEU', name: 'Germany' },
  { code: '+33', iso: 'fr', country: 'FRA', name: 'France' },
  { code: '+65', iso: 'sg', country: 'SGP', name: 'Singapore' },
  { code: '+971', iso: 'ae', country: 'UAE', name: 'United Arab Emirates' },
  { code: '+41', iso: 'ch', country: 'CHE', name: 'Switzerland' },
  { code: '+31', iso: 'nl', country: 'NLD', name: 'Netherlands' },
  { code: '+81', iso: 'jp', country: 'JPN', name: 'Japan' },
  { code: '+82', iso: 'kr', country: 'KOR', name: 'South Korea' },
  { code: '+86', iso: 'cn', country: 'CHN', name: 'China' },
  { code: '+55', iso: 'br', country: 'BRA', name: 'Brazil' },
  { code: '+27', iso: 'za', country: 'ZAF', name: 'South Africa' },
  { code: '+60', iso: 'my', country: 'MYS', name: 'Malaysia' },
  { code: '+63', iso: 'ph', country: 'PHL', name: 'Philippines' },
  { code: '+62', iso: 'id', country: 'IDN', name: 'Indonesia' },
  { code: '+84', iso: 'vn', country: 'VNM', name: 'Vietnam' },
  { code: '+92', iso: 'pk', country: 'PAK', name: 'Pakistan' },
  { code: '+880', iso: 'bd', country: 'BGD', name: 'Bangladesh' },
  { code: '+94', iso: 'lk', country: 'LKA', name: 'Sri Lanka' },
  { code: '+977', iso: 'np', country: 'NPL', name: 'Nepal' },
  { code: '+353', iso: 'ie', country: 'IRL', name: 'Ireland' },
  { code: '+46', iso: 'se', country: 'SWE', name: 'Sweden' },
  { code: '+47', iso: 'no', country: 'NOR', name: 'Norway' },
  { code: '+45', iso: 'dk', country: 'DNK', name: 'Denmark' },
  { code: '+358', iso: 'fi', country: 'FIN', name: 'Finland' },
  { code: '+34', iso: 'es', country: 'ESP', name: 'Spain' },
  { code: '+39', iso: 'it', country: 'ITA', name: 'Italy' },
  { code: '+48', iso: 'pl', country: 'POL', name: 'Poland' },
  { code: '+64', iso: 'nz', country: 'NZL', name: 'New Zealand' },
  { code: '+52', iso: 'mx', country: 'MEX', name: 'Mexico' },
  { code: '+54', iso: 'ar', country: 'ARG', name: 'Argentina' },
  { code: '+56', iso: 'cl', country: 'CHL', name: 'Chile' },
  { code: '+57', iso: 'co', country: 'COL', name: 'Colombia' },
  { code: '+234', iso: 'ng', country: 'NGA', name: 'Nigeria' },
  { code: '+254', iso: 'ke', country: 'KEN', name: 'Kenya' },
  { code: '+20', iso: 'eg', country: 'EGY', name: 'Egypt' },
  { code: '+966', iso: 'sa', country: 'SAU', name: 'Saudi Arabia' },
  { code: '+974', iso: 'qa', country: 'QAT', name: 'Qatar' },
  { code: '+965', iso: 'kw', country: 'KWT', name: 'Kuwait' },
  { code: '+968', iso: 'om', country: 'OMN', name: 'Oman' },
  { code: '+973', iso: 'bh', country: 'BHR', name: 'Bahrain' },
  { code: '+972', iso: 'il', country: 'ISR', name: 'Israel' },
  { code: '+90', iso: 'tr', country: 'TUR', name: 'Turkey' },
  { code: '+380', iso: 'ua', country: 'UKR', name: 'Ukraine' },
  { code: '+420', iso: 'cz', country: 'CZE', name: 'Czech Republic' },
  { code: '+36', iso: 'hu', country: 'HUN', name: 'Hungary' },
  { code: '+40', iso: 'ro', country: 'ROU', name: 'Romania' },
  { code: '+30', iso: 'gr', country: 'GRC', name: 'Greece' },
  { code: '+351', iso: 'pt', country: 'PRT', name: 'Portugal' },
  { code: '+43', iso: 'at', country: 'AUT', name: 'Austria' },
  { code: '+32', iso: 'be', country: 'BEL', name: 'Belgium' }
]

export default function CountryCodeSelect({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef(null)

  const selectedCountry = COUNTRIES.find(c => c.code === value) || COUNTRIES[0]

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  const filteredCountries = COUNTRIES.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.country.toLowerCase().includes(search.toLowerCase()) ||
    c.code.includes(search)
  )

  const handleSelect = (c) => {
    onChange(c.code)
    setIsOpen(false)
    setSearch('')
  }

  return (
    <div className="custom-country-select-wrap" ref={containerRef}>
      <button
        type="button"
        className={`country-select-trigger ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <img
          src={`https://flagcdn.com/w40/${selectedCountry.iso}.png`}
          alt={selectedCountry.country}
          className="country-flag-img"
          loading="lazy"
        />
        <span className="country-trigger-text">
          {selectedCountry.country} ({selectedCountry.code})
        </span>
        <ChevronDown size={13} className={`trigger-chevron ${isOpen ? 'chevron-open' : ''}`} />
      </button>

      {isOpen && (
        <div className="country-dropdown-popover animate-fade-in">
          <div className="country-search-bar">
            <Search size={14} className="search-icon" />
            <input
              type="text"
              autoFocus
              placeholder="Search country or code..."
              className="country-search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="country-list-scroll">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((c, idx) => {
                const isSelected = c.code === value && c.country === selectedCountry.country
                return (
                  <button
                    key={`${c.iso}-${c.code}-${idx}`}
                    type="button"
                    className={`country-option-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSelect(c)}
                  >
                    <img
                      src={`https://flagcdn.com/w40/${c.iso}.png`}
                      alt={c.country}
                      className="country-flag-img-sm"
                      loading="lazy"
                    />
                    <span className="country-name-text">
                      {c.name} <strong className="country-iso-tag">({c.country})</strong>
                    </span>
                    <span className="country-dial-code">{c.code}</span>
                  </button>
                )
              })
            ) : (
              <div className="country-no-results">No countries found</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
