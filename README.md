1. After deploying the addressValidationTool lwc and UspsService apex class, you still need to create a Named Credential, External Credential, Principal for External Credential
2. To create the credentials, go to https://developers.usps.com/getting-started and follow the instructions.
3. Get your Usps Client Id and Client Secreet.
4. Setup your External Credential using "Client Credentials with Client Secret flow" for Authentication Flow Type.
5. Use your Cliend Id and Client Secret to create the Principal for the External Credential.
6. Create the Named Credential and name it "UspsNamedCredential"  (or change the reference in the apex class UspsService.cls)

