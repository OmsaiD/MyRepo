import { LightningElement, track, api } from 'lwc';
import { OmniscriptBaseMixin } from 'vlocity_cmt/omniscriptBaseMixin';
import template from './vpsTFContactLWC.html';
import pubsub from 'vlocity_cmt/pubsub';
import * as _ from 'vlocity_cmt/lodash';

export default class VpsTFContactLWC extends OmniscriptBaseMixin(LightningElement) {
    @track layout;
    @track showInput=false;
    @track orderNameTF;
    @track sectionOneClasses = "nds-accordion__section order-no-padding order-no-outline";
    @track sectionTwoClasses = "nds-accordion__section order-no-padding order-no-outline";
    @track sectionThreeClasses = "nds-accordion__section order-no-padding order-no-outline";
    @track sectionFourClasses = "nds-accordion__section nds-is-open order-no-padding order-no-outline";
    @track sectionOneopen = false;
    @track sectionTwoopen = false;
    @track sectionThreeopen = false;
    @track sectionFouropen = true;
    @track requesterContactDetails;
    @api requesterContactName;
    @api requesterContactPhone;
    @api requesterContactEmail;
    @api implementationContactName;
    @api implementationContactPhone;
    @api implementationContactEmail;
    @api designContactName;
    @api designContactPhone;
    @api designContactEmail;
    @api localContactName;
    @api localContactPhone;
    @api localContactEmail;
    @api alternativeContactName;
    @api alternativeContactPhone;
    @api alternativeContactEmail;
    @track tempImplementationContactPhone;
    @track tempDesignContactPhone;
    @track tempLocalContactPhone;
    @track tempAlternativeLocalContactPhone;
    errorsList = new Set(["Alternative Local Contact Name required", "Alternative Local Contact Phone required", "Alternative Local Contact Email required"]);
    //Typeahead variables Started
    @track callGetRequesterDetails = false;
    @track getRequesterInputMap;
    @track callGetResults = false;
    @track getResultsInputMap;
    @api implementationSelectRecordId = '';
    @api designSelectRecordId = '';
    @api localSelectRecordId = '';
    @api alternativeSelectRecordId = '';
    @api implementationearchRecords = [];
    @api designearchRecords = [];
    @api localsearchRecords = [];
    @api alternativesearchRecords = [];
    @api implementationLoadingText = false;
    @api designLoadingText = false;
    @api localLoadingText = false;
    @api alternativeLoadingText = false;
    @track implementationtxtclassname = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click';
    @track designtxtclassname = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click';
    @track localtxtclassname = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click';
    @track alternativetxtclassname = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click';
    //Typeahead variables ended
    @track myOrdername;
    @track myProductInfo;
    @track orderId;
    @track requesterContactName;
    @track tablevalueCSVcheck =false;
    @track tablevalueCSV;
    @track csvid;
    @track csvObj =  {
        result: this.lookupcsvdata.bind(this),
        error : this.lookupcsvdataError.bind(this)
    };

    //Search method for typeahead
    searchField(event) {
        var currentText = event.target.value;
        if(currentText.length>2){
            switch (event.target.getAttribute('data-id')) {
            case 'implementationContactName':
                this.implementationLoadingText = true;
                break;
            case 'designContactName':
                this.designLoadingText = true;
                break;
            case 'localContactName':
                this.localLoadingText = true;
                break;
            case 'alternativeContactName':
                this.alternativeLoadingText = true;
                break;
            default:
                break;
            }
            this.getResultsInputMap = JSON.stringify({
                "value": event.target.value,
                "contactType": event.target.getAttribute('data-id')
            });
            console.log(this.getResultsInputMap);
            if(this.getResultsInputMap)
                this.callGetResults = true;
        }
    }
    ongetResultsSuccess(res) {
        var result = JSON.parse(res).contactList;
        var checkContactType = JSON.parse(res).contactType;
        console.log();
        if(checkContactType.includes('implementationContact')){
            this.implementationsearchRecords = JSON.parse(res).contactList;
            this.implementationLoadingText = false;
            this.implementationtxtclassname =  result.length > 0 ? 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-is-open' : 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click';
        }else if(checkContactType.includes('designContact')){
            this.designsearchRecords = JSON.parse(res).contactList;
            this.designLoadingText = false;
            this.designtxtclassname =  result.length > 0 ? 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-is-open' : 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click';
        }else if(checkContactType.includes('localContact')){
            this.localsearchRecords = JSON.parse(res).contactList;
            this.localLoadingText = false;
            this.localtxtclassname =  result.length > 0 ? 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-is-open' : 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click';
        }else if(checkContactType.includes('alternative')){
            this.alternativesearchRecords = JSON.parse(res).contactList;
            this.alternativeLoadingText = false;
            this.alternativetxtclassname =  result.length > 0 ? 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-is-open' : 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click';
        }
        this.callGetResults = false;
    }
    ongetResultsFailure(res) {
        console.log("Pop-up Failure Data : ", JSON.parse(res));
        this.callGetResults = false;
    }
    ongetRequestorDetailsSuccess(res){
        console.log('------------------------');
        console.log(res);
        let jsonD = JSON.parse(JSON.stringify(this.omniJsonData));
        var result = JSON.parse(res).requesterContact;
        this.requesterContactName = result.Name;
        this.requesterContactPhone = result.Phone;
        this.requesterContactEmail = result.Email;
        let checkif=jsonD.ContactPage && jsonD.ContactPage.ContactDetails && (this.alternativeContactEmail === undefined || this.alternativeContactName === undefined || this.alternativeContactPhone === undefined);
        if(jsonD.ContactPage && jsonD.ContactPage.ContactDetails && (this.alternativeContactEmail === undefined || this.alternativeContactName === undefined || this.alternativeContactPhone === undefined))
       {
            this.omniUpdateDataJson({
            requesterContactName : this.requesterContactName,
            requesterContactEmail : this.requesterContactEmail,
            requesterContactPhone : this.requesterContactPhone
        });
        this.omniSaveState({
            requesterContactName : this.requesterContactName,
            requesterContactEmail : this.requesterContactEmail,
            requesterContactPhone : this.requesterContactPhone
        });}
        else
        {   
            this.omniUpdateDataJson({
                requesterContactName : this.requesterContactName,
                requesterContactEmail : this.requesterContactEmail,
                requesterContactPhone : this.requesterContactPhone,
                alternativeContactEmail :this.alternativeContactEmail,
                alternativeContactName :this.alternativeContactName,
                alternativeContactPhone :this.alternativeContactPhone
               
            });
            this.omniSaveState({
                requesterContactName : this.requesterContactName,
                requesterContactEmail : this.requesterContactEmail,
                requesterContactPhone : this.requesterContactPhone,
                alternativeContactEmail :this.alternativeContactEmail,
                alternativeContactName :this.alternativeContactName,
                alternativeContactPhone :this.alternativeContactPhone
            });
            
        }
        if(this.requesterContactName !=null && this.requesterContactName!=undefined){
            this.requesterContactDetails = this.requesterContactName;
        }
        if(this.requesterContactEmail != null && this.requesterContactEmail!=undefined){
            this.requesterContactDetails = this.requesterContactDetails+' , '+this.requesterContactEmail;
        }
        if(this.requesterContactPhone!=null && this.requesterContactPhone!=undefined){
            this.requesterContactDetails = this.requesterContactDetails+' , '+this.requesterContactPhone;
        }
        this.callGetRequesterDetails = false;
    }
    ongetRequestorDetailsFailure(res){
        console.log('Error in Order status Update', JSON.stringify(res));
        this.callGetRequesterDetails = false;
    }
    setSelectedRecord(event) {
        var currentRecId = event.currentTarget.dataset.id;
        var formattedPhone;
        var tempPhone = event.currentTarget.dataset.phone;
        if(tempPhone!=undefined){
            for(var i=0;i<tempPhone.length;i++){
                if(formattedPhone==undefined){
                    formattedPhone = '(';
                }else if(formattedPhone.length==4){
                    formattedPhone = formattedPhone+') ';
                }else if(formattedPhone.length==9){
                    formattedPhone = formattedPhone+'-';
                }
                if(tempPhone.charCodeAt(i)>=48 && tempPhone.charCodeAt(i)<=57){
                    formattedPhone = formattedPhone+tempPhone.charAt(i);
                }
            }
        }
        console.log('-------------------------'+formattedPhone);
        if(formattedPhone!=undefined && formattedPhone!='' && formattedPhone.length>=0){
            let regex = /[(]{1}[0-9]{3}[)]{1} [0-9]{3}-[0-9]{4}/;
            if(formattedPhone.match(regex) || formattedPhone.length===0){
                this.errorsList.delete("Please enter valid Phone Number");
            }
            else{
                this.errorsList.add("Please enter valid Phone Number"); 
            }
            this.omniUpdateDataJson({
                errorsList: [...this.errorsList]
            });
            this.omniSaveState({
                errorsList: [...this.errorsList]
            });
        }
        if(event.currentTarget.dataset.email!=undefined && event.currentTarget.dataset.email!=''){
			var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
            if(event.currentTarget.dataset.email.length>=0){
                if(event.currentTarget.dataset.email.match(reg) || event.currentTarget.dataset.email.length==0){
                    this.errorsList.delete("Please enter valid Email");
                }
                else{
                    this.errorsList.add("Please enter valid Email"); 
                }
                this.omniUpdateDataJson({
                    errorsList: [...this.errorsList]
                });
                this.omniSaveState({
                    errorsList: [...this.errorsList]
                });
            }
        }
        if(event.currentTarget.dataset.origincon.includes('implementation')){
            this.implementationSelectRecordId = currentRecId;
            this.implementationContactName = event.currentTarget.dataset.name;
            this.implementationContactEmail = event.currentTarget.dataset.email;
            this.implementationContactPhone = formattedPhone;
            this.implementationtxtclassname =  'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click';
            this.omniUpdateDataJson({
                implementationSelectRecordId : this.implementationSelectRecordId,
                implementationContactName : event.currentTarget.dataset.name,
                implementationContactEmail : event.currentTarget.dataset.email,
                implementationContactPhone : formattedPhone
            });
            this.omniSaveState({
                implementationSelectRecordId : this.implementationSelectRecordId,
                implementationContactName : event.currentTarget.dataset.name,
                implementationContactEmail : event.currentTarget.dataset.email,
                implementationContactPhone : formattedPhone
            });
        }else if(event.currentTarget.dataset.origincon.includes('design')){
            this.designSelectRecordId = currentRecId;
            this.designContactName = event.currentTarget.dataset.name;
            this.designContactEmail = event.currentTarget.dataset.email;
            this.designContactPhone = formattedPhone;
            this.designtxtclassname =  'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click';
            this.omniUpdateDataJson({
                designSelectRecordId : this.designSelectRecordId,
                designContactName : event.currentTarget.dataset.name,
                designContactEmail : event.currentTarget.dataset.email,
                designContactPhone : formattedPhone
            });
            this.omniSaveState({
                designSelectRecordId : this.designSelectRecordId,
                designContactName : event.currentTarget.dataset.name,
                designContactEmail : event.currentTarget.dataset.email,
                designContactPhone : formattedPhone
            });
        }else if(event.currentTarget.dataset.origincon.includes('local')){
            this.localSelectRecordId = currentRecId;
            this.localContactName = event.currentTarget.dataset.name;
            this.localContactEmail = event.currentTarget.dataset.email;
            this.localContactPhone = formattedPhone;
            this.localtxtclassname =  'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click';
            this.omniUpdateDataJson({
                localSelectRecordId : this.localSelectRecordId,
                localContactName : event.currentTarget.dataset.name,
                localContactEmail : event.currentTarget.dataset.email,
                localContactPhone : formattedPhone
            });
            this.omniSaveState({
                localSelectRecordId : this.localSelectRecordId,
                localContactName : event.currentTarget.dataset.name,
                localContactEmail : event.currentTarget.dataset.email,
                localContactPhone : formattedPhone
            });
        }else if(event.currentTarget.dataset.origincon.includes('alternative')){
            this.alternativeSelectRecordId = currentRecId;
            this.alternativeContactName = event.currentTarget.dataset.name;
            this.alternativeContactEmail = event.currentTarget.dataset.email;
            this.alternativeContactPhone = formattedPhone;
            this.alternativetxtclassname =  'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click';
            if(this.alternativeContactName.length>0){
                this.errorsList.delete("Alternative Local Contact Name required");
            }else{
                this.errorsList.add("Alternative Local Contact Name required");
            }
            if(this.alternativeContactEmail!=undefined){ // Changed for require fields validation need to deploy
                this.errorsList.delete("Alternative Local Contact Email required");
            }else{
                this.errorsList.add("Alternative Local Contact Email required");
            }
            if(this.alternativeContactPhone!=undefined){ // Changed for require fields validation need to deploy
                this.errorsList.delete("Alternative Local Contact Phone required");
            }else{
                this.errorsList.add("Alternative Local Contact Phone required");
            }
            this.omniUpdateDataJson({
                alternativeSelectRecordId : this.alternativeSelectRecordId,
                alternativeContactName : event.currentTarget.dataset.name,
                alternativeContactEmail : event.currentTarget.dataset.email,
                alternativeContactPhone : formattedPhone,
                errorsList: [...this.errorsList]
            });
            this.omniSaveState({
                alternativeSelectRecordId : this.alternativeSelectRecordId,
                alternativeContactName : event.currentTarget.dataset.name,
                alternativeContactEmail : event.currentTarget.dataset.email,
                alternativeContactPhone : formattedPhone,
                errorsList: [...this.errorsList]
            });
        }
        this.omniUpdateDataJson({
            requesterContactName : this.requesterContactName,
            requesterContactEmail : this.requesterContactEmail,
            requesterContactPhone : this.requesterContactPhone
        });
        this.omniSaveState({
            requesterContactName : this.requesterContactName,
            requesterContactEmail : this.requesterContactEmail,
            requesterContactPhone : this.requesterContactPhone
        });
        let jsonD = JSON.parse(JSON.stringify(this.omniJsonData));
        console.log(jsonD);
    }
    onSectionOneClick() {
        if (this.sectionOneClasses.includes("nds-is-open")) {
            this.sectionOneClasses = "nds-accordion__section  nds-is-closed order-no-padding order-no-outline";
            this.sectionOneopen = false;
        } else {
            this.sectionOneClasses = "nds-accordion__section nds-is-open order-no-padding order-no-outline";
            this.sectionOneopen = true;
        }
    }
    onSectionTwoClick() {
        if (this.sectionTwoClasses.includes("nds-is-open")) {
            this.sectionTwoClasses = "nds-accordion__section  nds-is-closed order-no-padding order-no-outline";
            this.sectionTwoopen = false;
        } else {
            this.sectionTwoClasses = "nds-accordion__section nds-is-open order-no-padding order-no-outline";
            this.sectionTwoopen = true;
        }
    }
    onSectionThreeClick() {
        if (this.sectionThreeClasses.includes("nds-is-open")) {
            this.sectionThreeClasses = "nds-accordion__section  nds-is-closed order-no-padding order-no-outline";
            this.sectionThreeopen = false;
        } else {
            this.sectionThreeClasses = "nds-accordion__section nds-is-open order-no-padding order-no-outline";
            this.sectionThreeopen = true;
        }
    }
    onSectionFourClick() {
        if (this.sectionFourClasses.includes("nds-is-open")) {
            this.sectionFourClasses = "nds-accordion__section  nds-is-closed order-no-padding order-no-outline";
            this.sectionFouropen = false;
        } else {
            this.sectionFourClasses = "nds-accordion__section nds-is-open order-no-padding order-no-outline";
            this.sectionFouropen = true;
        }
    }
    handleOrderName(event) {
        try {
            console.log('JSON data:', JSON.parse(JSON.stringify(this.omniJsonData)));
            let jsonD = JSON.parse(JSON.stringify(this.omniJsonData));
            this.omniUpdateDataJson({ errorsList: [...this.errorsList] });
            this.omniSaveState({ errorsList: [...this.errorsList] });

            console.log('JSON data:', [...this.errorsList]);
        }
        catch(e){
            console.log(e);
        }
    }
    render() {
        return template;
    }
    disconnectedCallback(){
        pubsub.unregister("myapexremote_lookupcsvdata",this.csvObj);

    }
    connectedCallback() {

        this.contactResponse = JSON.parse(JSON.stringify(this.omniJsonData));
    //     console.log('this.contactResponse.ContactPage',this.contactResponse.ContactPage);
    //     if(this.contactResponse.ContactPage === undefined)

    //    { pubsub.register("myapexremote_lookupcsvdata", {
    //         result: this.lookupcsvdata.bind(this),
    //         error : this.lookupcsvdataError.bind(this)
    //     });}
    pubsub.register("myapexremote_lookupcsvdata",this.csvObj);

        console.log('vpsTFContactLWC - connectedCallback()');
        this.orderNameTF = {
            "type": "Text",
            "name": "OrderNameTF",
            "propSetMap": {
                "label": "",
                "controlWidth": 5,
                // "required": true,
                //"pattern":"^[0-9a-zA-Z\.\-\s]+$",
                //"ptrnErrText":"Please check the format.",
                "maxLength": 16
            }
        };
        this.omniUpdateDataJson({
            errorsList: [...this.errorsList]
        });
        this.omniSaveState({
            errorsList: [...this.errorsList]
        });

        
        this.contactResponse = JSON.parse(JSON.stringify(this.omniJsonData));
        this.tableCSVChanged=this.contactResponse.ContactPage.ContactDetails.tableCSVChanged;
        this.CSVFileID=this.contactResponse.ContactPage.ContactDetails.CSVFileID;
        pubsub.fire("stepSummarySubmit", "hide", true);
        pubsub.fire("stepContact", "show", true);
        pubsub.fire("stepSummary", "hide", true);
        pubsub.register("myapexremote_getresults", {
            result: this.ongetResultsSuccess.bind(this),
            error : this.ongetResultsFailure.bind(this)
        });
        pubsub.register("myapexremote_getRequesterDetails", {
            result: this.ongetRequestorDetailsSuccess.bind(this),
            error: this.ongetRequestorDetailsFailure.bind(this)
        });

        this.contactResponse = JSON.parse(JSON.stringify(this.omniJsonData));
        
        let jsonD = JSON.parse(JSON.stringify(this.omniJsonData));
        //let jsonD = JSON.parse(JSON.stringify(this.omniJsonData));
        this.myProductInfo=jsonD.DRProduct_Order;
        this.myOrderName = jsonD.TFOrderDetail.OrderNameTF;
        this.orderId=jsonD.DRId_Order;
        this.requesterContactName = jsonD.ReqContName;
        console.log('requester Id'+jsonD.ReqContNameId);
        this.requesterContactId = jsonD.ReqContNameId;
        if(this.requesterContactId!=null && this.requesterContactId!=undefined){
            this.getRequesterInputMap = JSON.stringify({
                "reqConId": this.requesterContactId
            });
            this.callGetRequesterDetails = true;
        }
        this.omniUpdateDataJson({
            errorsList: [...this.errorsList]
        });
        this.omniSaveState({
            errorsList: [...this.errorsList]
        });
        if(this.contactResponse.TFOrderDetail.TypeofTFFile && this.contactResponse.TFOrderDetail.TFDetails.tableData)
        {
            //this.tablevalueCSVcheck=true;
            this.tablevalueCSV=this.contactResponse.TFOrderDetail.TFDetails.tableData;
        
        
       this.orderId=this.contactResponse.DRId_Order;
        console.log('tablevalueCSV in summary:',this.tablevalueCSV);
        
        let jsonD = JSON.parse(JSON.stringify(this.omniJsonData));
        this.inputMap = JSON.stringify({
            "tableData": JSON.stringify(this.tablevalueCSV),
            "orderId": this.orderId
        });
        this.tablevalueCSVcheck=true;
        let tableCSVChanged=JSON.stringify(this.tablevalueCSV);
        console.log('table changed value:',tableCSVChanged);        
        this.omniUpdateDataJson(tableCSVChanged, 'tableDataChanged');
        this.omniSaveState(tableCSVChanged, 'tableDataChanged');
    }
        /*this.tablevalueCSV=this.contactResponse.TFOrderDetail.TFDetails.tableData;
        this.orderId=this.contactResponse.DRId_Order;
        console.log('tablevalueCSV in summary:',this.tablevalueCSV);
        this.inputMap = JSON.stringify({
            "tableData": JSON.stringify(this.tablevalueCSV),
            "orderId": this.orderId
        });*/
        
        this.alternativeContactEmail=jsonD.ContactPage.ContactDetails.alternativeContactEmail;
        this.alternativeContactName=jsonD.ContactPage.ContactDetails.alternativeContactName;
        this.alternativeContactPhone=jsonD.ContactPage.ContactDetails.alternativeContactPhone;

        let path = this.omniJsonDef.JSONPath.split(':').join('.');
        console.log('path',path);
        let obj = _.get(jsonD, path)
        console.log('obj',obj);
        let fields = [
            'requesterContactName',
            'requesterContactPhone',
            'requesterContactEmail',
            'implementationContactName',
            'implementationContactPhone',
            'implementationContactEmail',
            'designContactName',
            'designContactPhone',
            'designContactEmail',
            'localContactName',
            'localContactPhone',
            'localContactEmail',
            'alternativeContactName',
            'alternativeContactPhone',
            'alternativeContactEmail',
            'tableCSVChanged',
            'CSVFileID'
        ];
        if (obj) {
            console.log('Path: ', path, JSON.parse(JSON.stringify(obj)));
            for (let key of fields) {
                console.log(`Searching for: ${key}`, obj[key], path);
                if (obj[key]) {
                    this[key] = obj[key];
                    this.onBlurHandler(null, key, obj[key]);
                }
            }
        }
        

    }

    onBlurHandler(event, optional_id, optional_value) {
        // if `optional_id` is passed, `event` is completely ignored
        let id = optional_id || event.target.getAttribute('data-id');
        let value = optional_value || event.target.value;
        this.implementationLoadingText = false;
        this.designLoadingText = false;
        this.localLoadingText = false;
        this.alternativeLoadingText = false;
        // console.log('++++++++'+event.target.id);
        // console.log('++++++++'+event.target.value);
        let requiredFields = [
            {
                'name': 'alternativeContactName',
                'message': 'Alternative Local Contact Name required'
            },
            {
                'name': 'alternativeContactPhone',
                'message': 'Alternative Local Contact Phone required'
            },
            {
                'name': 'alternativeContactEmail',
                'message': 'Alternative Local Contact Email required'
            },
        ];
        console.log(`Setting "${id}" to "${value}" in DATA Json`);
        let field = requiredFields.find(x => x.name === id);
        if (field) {
            var space_Count = 0;
            for (var position = 0; position < value.length; position++) 
            {
                if (value.charAt(position) == ' ') 
                {
                    space_Count += 1;
                }
            }
            if (value.length && value.length != space_Count)
                this.errorsList.delete(field.message)
            else
                this.errorsList.add(field.message);
        }
        let obj = {};
        obj[id] = value;
        obj['errorsList'] = [...this.errorsList];
        this.omniUpdateDataJson(obj);
        console.log('DATA Json:', JSON.parse(JSON.stringify(this.omniJsonData)));
    }
    returnToOrderPage() {
        var urlVal;
        var pathElements = window.location.pathname.split("/");
        if (pathElements.indexOf("Partner") !== -1) {
            urlVal = window.location.origin + '/' + pathElements[1] + '/s/';
        } else {
            urlVal = window.location.origin + '/s/';
        }
        urlVal = urlVal + 'myshop';
        window.open(urlVal, '_self');
    }
    onPhoneNumberChange(event){
        var tempPhone = event.target.value;
        var changeTrack = event.target.getAttribute('data-id');
        console.log(changeTrack);
        if(tempPhone.length==1 && !tempPhone.includes('(')){
            if(changeTrack.includes('implementationContactPhone')){
                this.implementationContactPhone = '('+event.target.value;
            }else if(changeTrack.includes('designContactPhone')){
                this.designContactPhone = '('+event.target.value;
            }else if(changeTrack.includes('localContactPhone')){
                this.localContactPhone = '('+event.target.value;
            }else if(changeTrack.includes('alternativeContactPhone')){
                this.alternativeContactPhone = '('+event.target.value;
            }
        }else if(tempPhone.length==4 && !tempPhone.includes(') ')){
            if(changeTrack.includes('implementation')){
                this.implementationContactPhone = event.target.value+') ';
            }else if(changeTrack.includes('designContactPhone')){
                this.designContactPhone = event.target.value+') ';
            }else if(changeTrack.includes('localContactPhone')){
                this.localContactPhone = event.target.value+') ';
            }else if(changeTrack.includes('alternativeContactPhone')){
                this.alternativeContactPhone = event.target.value+') ';
            }
        }else if(tempPhone.length==9 && !tempPhone.includes('-')){
            if(changeTrack.includes('implementation')){
                this.implementationContactPhone = event.target.value+'-';
            }else if(changeTrack.includes('designContactPhone')){
                this.designContactPhone = event.target.value+'-';
            }else if(changeTrack.includes('localContactPhone')){
                this.localContactPhone = event.target.value+'-';
            }else if(changeTrack.includes('alternativeContactPhone')){
                this.alternativeContactPhone = event.target.value+'-';
            }
        }
        if(tempPhone.length>4 && !tempPhone.includes(')')){
            if(changeTrack.includes('implementation')){
                this.implementationContactPhone = event.target.value.substr(0,4)+')'+event.target.value.substr(4,tempPhone.length);
            }else if(changeTrack.includes('designContactPhone')){
                this.designContactPhone = event.target.value.substr(0,4)+')'+event.target.value.substr(4,tempPhone.length);
            }else if(changeTrack.includes('localContactPhone')){
                this.localContactPhone = event.target.value.substr(0,4)+')'+event.target.value.substr(4,tempPhone.length);
            }else if(changeTrack.includes('alternativeContactPhone')){
                this.alternativeContactPhone = event.target.value.substr(0,4)+')'+event.target.value.substr(4,tempPhone.length);
            }
        }
        if(tempPhone.length>5 && !tempPhone.includes(' ')){
            if(changeTrack.includes('implementation')){
                this.implementationContactPhone = event.target.value.substr(0,5)+' '+event.target.value.substr(5,tempPhone.length);
            }else if(changeTrack.includes('designContactPhone')){
                this.designContactPhone = event.target.value.substr(0,5)+' '+event.target.value.substr(5,tempPhone.length);
            }else if(changeTrack.includes('localContactPhone')){
                this.localContactPhone = event.target.value.substr(0,5)+' '+event.target.value.substr(5,tempPhone.length);
            }else if(changeTrack.includes('alternativeContactPhone')){
                this.alternativeContactPhone = event.target.value.substr(0,5)+' '+event.target.value.substr(5,tempPhone.length);
            }
        }
        if(tempPhone.length>9 && !tempPhone.includes('-')){
            if(changeTrack.includes('implementation')){
                this.implementationContactPhone = event.target.value.substr(0,9)+'-'+event.target.value.substr(9,tempPhone.length);
            }else if(changeTrack.includes('designContactPhone')){
                this.designContactPhone = event.target.value.substr(0,9)+'-'+event.target.value.substr(9,tempPhone.length);
            }else if(changeTrack.includes('localContactPhone')){
                this.localContactPhone = event.target.value.substr(0,9)+'-'+event.target.value.substr(9,tempPhone.length);
            }else if(changeTrack.includes('alternativeContactPhone')){
                this.alternativeContactPhone = event.target.value.substr(0,9)+'-'+event.target.value.substr(9,tempPhone.length);
            }
        }
        //Phone number Validation started need to deploy
        console.log('tempPhone.length', tempPhone.length);
        console.log('tempPhone', tempPhone);
        if(tempPhone!=undefined && tempPhone!='' && tempPhone.length>=0){
            let regex = /[(]{1}[0-9]{3}[)]{1} [0-9]{3}-[0-9]{4}/;
            if(tempPhone.match(regex) || tempPhone.length===0){
                this.errorsList.delete("Please enter valid Phone Number");
            }
            else{
                this.errorsList.add("Please enter valid Phone Number"); 
            }
            this.omniUpdateDataJson({
                errorsList: [...this.errorsList]
            });
            this.omniSaveState({
                errorsList: [...this.errorsList]
            });
        }
        //Phone number Validation Ended
    }
    onPencilClick() {
        this.showInput = true;
    }
    onBlurEvent(event) {
        console.log("onBlurEvent");
        console.log(event);
        console.log(event.target.value);
        this.showInput = false;
        if (event.target.value) {
            this.myOrderName = event.target.value;
            console.log(this.orderNameTF);
            this.orderNameTF.value = event.target.value;
        }

    }
    lookupcsvdata(res)
    {
        console.log('CSV File response:',res);
        console.log('CSV File response:',JSON.parse(res));
        this.csvid=JSON.parse(res).contentDocumentId ;
        this.omniUpdateDataJson(this.csvid, 'CSVFileID');
       this.omniSaveState(this.csvid, 'CSVFileID');
        let jsonD = JSON.parse(JSON.stringify(this.omniJsonData));
        let tableCSVChanged=jsonD.TFOrderDetail.TFDetails.tableData;
        console.log('table changed value:',tableCSVChanged);
        
        /*this.omniUpdateDataJson(tableCSVChanged, 'tableDataChanged');
        this.omniSaveState(tableCSVChanged, 'tableDataChanged');*/
        /*let mycsvFile = {
            CSVFileID:this.csvid,
        }
        this.omniSaveState(mycsvFile, 'CSVFileID');*/
        let jsonData = {
            CSVFileID: this.csvid
        };
        this.omniUpdateDataJson({
            CSVFileID: this.csvid});

        this.omniSaveState(this.csvid, 'CSVFileID');
        let jsonData2 = {
            tableCSVChanged: tableCSVChanged
        };
        this.omniUpdateDataJson({
            tableCSVChanged: tableCSVChanged});
            this.omniSaveState(jsonData2);
        this.summaryResponse = JSON.parse(JSON.stringify(this.omniJsonData));
        if(this.alternativeContactName==undefined){
            this.errorsList.add("Alternative Local Contact Name required");
        }else{
            this.errorsList.delete("Alternative Local Contact Name required");
        }
        if(this.alternativeContactEmail==undefined){
            this.errorsList.add("Alternative Local Contact Email required");
        }else{
            this.errorsList.delete("Alternative Local Contact Email required");
        }
        if(this.alternativeContactPhone==undefined){
            this.errorsList.add("Alternative Local Contact Phone required");
        }else{
            this.errorsList.delete("Alternative Local Contact Phone required");
        }
        this.omniUpdateDataJson({
            errorsList: [...this.errorsList]
        });
        this.omniSaveState({
            errorsList: [...this.errorsList]
        });
        this.omniUpdateDataJson({
            alternativeContactName : this.alternativeContactName,
            alternativeContactEmail : this.alternativeContactEmail,
            alternativeContactPhone : this.alternativeContactPhone
        });
        this.omniSaveState({
            alternativeContactName : this.alternativeContactName,
            alternativeContactEmail : this.alternativeContactEmail,
            alternativeContactPhone : this.alternativeContactPhone
        });
    }
    lookupcsvdataError(res)
        {

            this.error = JSON.stringify(res);
            this.userInfo = undefined;
            console.log('Error From CSV File Method : ',JSON.stringify(res));
        }
    //validation for Email and Phone number starts need to deploy
    validateEmail(evt){
        var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
        if(evt.target.value!=undefined && evt.target.value!=''){
            console.log('evt.target.value.length', evt.target.value.length);
            console.log('evt.target.value', evt.target.value);
            if(evt.target.value.length>=0){
                if(evt.target.value.match(reg) || evt.target.value.length==0){
                    this.errorsList.delete("Please enter valid Email");
                }
                else{
                    this.errorsList.add("Please enter valid Email"); 
                }
                this.omniUpdateDataJson({
                    errorsList: [...this.errorsList]
                });
                this.omniSaveState({
                    errorsList: [...this.errorsList]
                });
            }
        }
    }
    //validation for Email and Phone number Ends
}