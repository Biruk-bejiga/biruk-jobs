import PropTypes from 'prop-types'

const Card = ({ children, bg, className = '' }) => {
  const backgroundClasses = bg ?? 'bg-white dark:bg-slate-900/50';
  return (
    <div
      className={`rounded-xl border border-slate-200 p-6 shadow-sm transition dark:border-slate-700 ${backgroundClasses} ${className}`}
    >
      {children}
    </div>
  )
}

export default Card

Card.propTypes = {
  children: PropTypes.node.isRequired,
  bg: PropTypes.string,
  className: PropTypes.string,
}