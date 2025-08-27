import { LightningElement, api, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import BILLING_STREET from "@salesforce/schema/Account.BillingStreet";
import BILLING_CITY from "@salesforce/schema/Account.BillingCity";
import BILLING_STATE from "@salesforce/schema/Account.BillingState";
import BILLING_POSTAL_CODE from "@salesforce/schema/Account.BillingPostalCode";
import BILLING_COUNTRY from "@salesforce/schema/Account.BillingCountry";

import verifyAddress from "@salesforce/apex/UspsService.verifyAddress";

export default class AddressVerificationTool extends LightningElement {
    @api recordId;

    account;
    billingStreet;
    billingCity;
    billingState;
    billingPostalCode;
    billingCountry;

    isLoading = false;

    message = '';

    _iconName = 'question';

    @wire(getRecord, {
        recordId: '$recordId',
        fields: [BILLING_STREET, BILLING_CITY, BILLING_STATE, BILLING_POSTAL_CODE, BILLING_COUNTRY]
    })
    getAccountRecord({ error, data }) {
        if (data) {
            this.account = data;
            this.billingStreet = getFieldValue(data, BILLING_STREET);
            this.billingCity = getFieldValue(data, BILLING_CITY);
            this.billingState = getFieldValue(data, BILLING_STATE);
            this.billingPostalCode = getFieldValue(data, BILLING_POSTAL_CODE);
            this.billingCountry = getFieldValue(data, BILLING_COUNTRY);
        } else if (error) {
            console.error(error);
        }
    }

    get iconName() {
        return `utility:${this._iconName}`;
    }

    get iconVariant() {
        if(this._iconName === 'check') {
            return 'success';
        } else if(this._iconName === 'warning') {
            return 'warning';
        } else if(this._iconName === 'error') {
            return 'error';
        } 
        return '';
    }

    get color() {
        if(this._iconName === 'check') {
            return 'success';
        } else if(this._iconName === 'warning') {
            return 'warning';
        } else if(this._iconName === 'error') {
            return 'error';
        } 
        return 'defaultColor';
    }

    get showError() {
        return this.message !== '';
    }

    async verifyAddressFn() {

        this.message = '';

        // validate input
        if(this.isEmpty(this.billingStreet)) {
            this.message = 'Billing Street is required';
        }
        if(this.isEmpty(this.billingState)) {
            this.message = 'Billing State is required';
        }
        if(this.isEmpty(this.billingPostalCode)) {
            this.message = 'Billing Postal Code is required';
        }
        if(this.billingState.length !== 2) {
            this.message = 'Billing State must be 2 characters';
        }

        if(this.message) {
            this._iconName = 'question';
            return;
        }

        this.isLoading = true;
        try {

            let address = {
                street: this.billingStreet,
                city: this.billingCity,
                state: this.billingState,
                postalCode: this.billingPostalCode,
                country: this.billingCountry
            };

            let response = await verifyAddress(address);
            let data = JSON.parse(response);
            data.body = JSON.parse(data.body);

            if(data.status === 200) {
                this.verifiedAddress = data.body.address;
                this.showVerifiedAddress = true;

                let isCorrectionPresent = !!data.body.corrections[0].text;

                if(data.body.matches[0].code === "31") {
                    this._iconName = 'check';
                    this.message = 'Address is valid';
                }

                if(isCorrectionPresent) {
                    this._iconName = 'warning';
                    this.message = data.body.corrections[0].text;
                }

            } else {
                console.log('status not 200');
                this._iconName = 'error';
                this.message = data.body.error.message;
            }
        } catch (error) {
            console.error('Error verifying address:', error);
            this._iconName = 'question';
            this.message = 'Failed to verify address. Please try again.';
        } finally {
            this.isLoading = false;
        }
    }

    isEmpty(text) {
        return text === null || text === undefined || text?.trim().length === 0;
    }
}