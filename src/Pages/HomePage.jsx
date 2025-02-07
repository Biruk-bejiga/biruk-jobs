import React from 'react'
import Hero from '../Comonent/Hero'
import HomeCard from '../Comonent/HomeCard'
import JobListings from '../Comonent/JobListings'
import ViewAllJobs from '../Comonent/ViewAllJobs'

const HomePage = () => {
  return (
    <>
    <Hero/>
    <HomeCard/>
    <JobListings isHome={true}/>
    <ViewAllJobs/>
    
    </>
  )
}

export default HomePage