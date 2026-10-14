import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd(),true,{info(){},error(){}});
async function main() {
 const origin="http://localhost:3000";
 const cookies=new Map<string,string>();
 const request=async(path:string,init:RequestInit={})=>{
  const response=await fetch(origin+path,{...init,redirect:"manual",headers:{...init.headers,Cookie:[...cookies].map(([k,v])=>k+"="+v).join("; ")}});
  for(const header of response.headers.getSetCookie()){const pair=header.split(";")[0],i=pair.indexOf("=");cookies.set(pair.slice(0,i),pair.slice(i+1));}
  return response;
 };
 const csrf=await (await request("/api/auth/csrf")).json();
 const response=await request("/api/auth/signin/google",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({csrfToken:csrf.csrfToken,callbackUrl:origin+"/warga",json:"true"})});
 const data=await response.json();const redirect=new URL(data.url);
 const checks={
  googleAuthorizationHost:redirect.hostname==="accounts.google.com",
  exactCallbackUri:redirect.searchParams.get("redirect_uri")===origin+"/api/auth/callback/google",
  codeFlow:redirect.searchParams.get("response_type")==="code",
  clientMatchesConfiguredId:redirect.searchParams.get("client_id")===process.env.AUTH_GOOGLE_ID,
  statePresent:Boolean(redirect.searchParams.get("state")),
  pkceS256:redirect.searchParams.get("code_challenge_method")==="S256",
  stateCookiePresent:[...cookies.keys()].some(key=>key.includes(".state")),
  pkceCookiePresent:[...cookies.keys()].some(key=>key.includes(".pkce.")),
 };
 console.log(JSON.stringify({checks,consentAndCodeExchangeTested:false}));
 if(Object.values(checks).some(value=>!value)) process.exitCode=1;
}
main().catch(()=>{console.error("OAuth initialization check failed; secrets withheld.");process.exitCode=1;});
