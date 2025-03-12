"use client"
import CompetitionsSection from "@/components/CompetetionsSection"
import LoginButton from "@/components/LoginButton"
import {useOCAuth } from "@opencampus/ocid-connect-js"


const page = () => {
    const {isInitialized, authState,ocAuth} = useOCAuth()
  return (
    <section>
        <CompetitionsSection />
      {/* {isInitialized && authState.isAuthenticated ? (
        <p>You are logged in {JSON.stringify(ocAuth.getAuthState())}</p>
      ) : (
        <LoginButton />
      )} */}
    </section>
  );}


export default page