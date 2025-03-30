"use client"
import CompetitionsSection from "@/components/CompetetionsSection"
import LoginButton from "@/components/LoginButton"
import Navbar from "@/components/Navbar"
import {useOCAuth } from "@opencampus/ocid-connect-js"


const page = () => {
    const {isInitialized, authState,ocAuth} = useOCAuth()
  return (
    <section className="relative">
      
      <Navbar />
      <CompetitionsSection />
    </section>
  );}


export default page