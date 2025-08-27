public without sharing class UspsService {

    @AuraEnabled
    public static String verifyAddress(String street, String city, String state, String postalCode ) {

        Http http = new Http();
        HttpRequest request = new HttpRequest();

        String endpoint = 'callout:UspsNamedCredential' +
                          '/address?streetAddress=' + urlEncodedString(street) +
                          '&state=' + urlEncodedString(state) +
                          '&ZIPCode=' + urlEncodedString(postalCode);

        if(String.isNotBlank(city)) {
            endpoint += '&city=' + urlEncodedString(city);
        }

        request.setEndpoint(endpoint);
        request.setMethod('GET');
        request.setHeader('accept', 'application/json');

        try {
            HttpResponse response = http.send(request);

            // whatever the response from the API, return it to the LWC.
            UspsResponse uspsResp = new UspsResponse();
            uspsResp.status = response.getStatusCode();
            uspsResp.message = response.getStatus();
            uspsResp.body = response.getBody();

            return JSON.serialize(uspsResp);

        } catch(System.CalloutException e) {
            System.debug('Callout Error: ' + e.getMessage());
            throw new AuraHandledException(e.getMessage());
        }
    }

    public static String urlEncodedString(String input) {
        return EncodingUtil.urlEncode(input, 'UTF-8');
    }

    public class UspsResponse {
        public Integer status;
        public String message;
        public String body;
    }
}