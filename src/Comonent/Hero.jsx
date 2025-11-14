import PropTypes from 'prop-types'
import heroBackground from '../assets/image/background-image.jpg'

const Hero = ({ title = 'Connecting clients in need to freelancers who deliver', subtitle = 'Find your next hire for a short task or long-term growth' }) => {
  return (
    <section className="relative mb-4 py-20">
      <div className="absolute inset-0">
        <img src={heroBackground} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-emerald-900/75" aria-hidden="true" />
      </div>
      <div className="relative mx-auto flex max-w-7xl flex-col items-center px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl md:text-6xl">
            {title}
          </h1>
          <p className="my-4 text-xl text-white">{subtitle}</p>
        </div>
      </div>
    </section>
  )
}

export default Hero

Hero.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
}