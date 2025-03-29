"use client";
import { useOCAuth } from "@opencampus/ocid-connect-js"


const page = () => {
    const {isInitialized , authState , ocAuth} = useOCAuth();
  return (
    authState.isAuthenticated ? (
      <div>{JSON.stringify(ocAuth.getAuthState())}</div>
    ) : (
      <div>No Details</div>
    )
  )
}

export default page