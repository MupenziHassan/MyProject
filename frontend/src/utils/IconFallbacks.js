/**
 * Fallback icons when react-icons is not available
 * Uses emoji and text characters as icon alternatives
 */

// Map of icon names to emoji/character fallbacks
export const IconFallbacks = {
  // Patient/General Icons
  FaHeartbeat: '❤️',
  FaCalendarCheck: '📅',
  FaFileMedical: '📄',
  FaBell: '🔔',
  FaChartLine: '📈',
  FaUser: '👤',
  FaClock: '🕒',
  
  // Doctor Icons
  FaUserInjured: '🤕',
  FaCalendarAlt: '📆', 
  FaClipboardCheck: '✅',
  
  // Admin Icons
  FaUserMd: '👨‍⚕️',
  FaUsers: '👥',
  FaClipboardList: '📋',
  FaExclamationTriangle: '⚠️',
  FaUserCheck: '✓',
  FaServer: '🖥️',
  FaChartArea: '📊',
  FaDatabase: '💾',
  FaCog: '⚙️',
  FaEnvelope: '✉️',
  FaPhone: '📞'
};

/**
 * Simple icon component to render a fallback emoji/character
 * @param {string} name - Icon name (without the Fa prefix)
 * @param {number} size - Size in pixels (approximate)
 * @returns {JSX.Element} - Rendered icon
 */
export const Icon = ({ name, size = 16 }) => {
  const iconName = name.startsWith('Fa') ? name : `Fa${name}`;
  const fallback = IconFallbacks[iconName] || '•';
  
  const fontSize = size ? `${Math.round(size * 0.8)}px` : 'inherit';
  
  return (
    <span 
      className="icon-fallback" 
      style={{ 
        fontSize, 
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: `${size}px`,
        height: `${size}px`
      }}
      role="img"
      aria-label={name}
    >
      {fallback}
    </span>
  );
};

export default Icon;
