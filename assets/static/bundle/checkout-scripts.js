var storefrontApp=angular.module("storefrontApp");storefrontApp.service("dialogService",["$uibModal",function($uibModal){return{showDialog:function(dialogData,controller,templateUrl){return $uibModal.open({controller:controller,templateUrl:templateUrl,resolve:{dialogData:function(){return dialogData}}})}}}]),storefrontApp.service("mailingService",["$http","apiBaseUrl",function($http,apiBaseUrl){return{sendProduct:function(id,data){return $http.post(apiBaseUrl+"api/b2b/send/product/"+id,data)}}}]),storefrontApp.service("feedbackService",["$http",function($http){return{postFeedback:function(data){return $http.post("storefrontapi/feedback",{model:data})}}}]),storefrontApp.service("customerService",["$http",function($http){return{getCurrentCustomer:function(){return $http.get("storefrontapi/account?t="+(new Date).getTime())}}}]),storefrontApp.service("marketingService",["$http",function($http){return{getDynamicContent:function(placeName){return $http.get("storefrontapi/marketing/dynamiccontent/"+placeName+"?t="+(new Date).getTime())}}}]),storefrontApp.service("pricingService",["$http",function($http){return{getActualProductPrices:function(products){return $http.post("storefrontapi/pricing/actualprices",{products:products})}}}]),storefrontApp.service("catalogService",["$http",function($http){return{getProduct:function(productIds){return $http.get("storefrontapi/products?productIds="+productIds+"&t="+(new Date).getTime())},search:function(criteria){return $http.post("storefrontapi/catalog/search",criteria)},searchCategories:function(criteria){return $http.post("storefrontapi/categories/search",criteria)}}}]),storefrontApp.service("cartService",["$http",function($http){return{getCart:function(){return $http.get("storefrontapi/cart?t="+(new Date).getTime())},getCartItemsCount:function(){return $http.get("storefrontapi/cart/itemscount?t="+(new Date).getTime())},addLineItem:function(productId,quantity){return $http.post("storefrontapi/cart/items",{id:productId,quantity:quantity})},changeLineItemQuantity:function(lineItemId,quantity){return $http.put("storefrontapi/cart/items",{lineItemId:lineItemId,quantity:quantity})},removeLineItem:function(lineItemId){return $http.delete("storefrontapi/cart/items?lineItemId="+lineItemId)},changeLineItemPrice:function(lineItemId,newPrice){return $http.put("storefrontapi/cart/items/price",{lineItemId:lineItemId,newPrice:newPrice})},clearCart:function(){return $http.post("storefrontapi/cart/clear")},getCountries:function(){return $http.get("storefrontapi/countries?t="+(new Date).getTime())},getCountryRegions:function(countryCode){return $http.get("storefrontapi/countries/"+countryCode+"/regions?t="+(new Date).getTime())},addCoupon:function(couponCode){return $http.post("storefrontapi/cart/coupons/"+couponCode)},removeCoupon:function(){return $http.delete("storefrontapi/cart/coupons")},addOrUpdateShipment:function(shipment){return $http.post("storefrontapi/cart/shipments",shipment)},addOrUpdatePayment:function(payment){return $http.post("storefrontapi/cart/payments",payment)},getAvailableShippingMethods:function(shipmentId){return $http.get("storefrontapi/cart/shipments/"+shipmentId+"/shippingmethods?t="+(new Date).getTime())},getAvailablePaymentMethods:function(){return $http.get("storefrontapi/cart/paymentmethods?t="+(new Date).getTime())},addOrUpdatePaymentPlan:function(plan){return $http.post("storefrontapi/cart/paymentPlan",plan)},removePaymentPlan:function(){return $http.delete("storefrontapi/cart/paymentPlan")},createOrder:function(bankCardInfo){return $http.post("storefrontapi/cart/createorder",{bankCardInfo:bankCardInfo})}}}]),storefrontApp.service("listService",["$q","$http","$localStorage","customerService",function($q,$http,$localStorage,customerService){return{getOrCreateMyLists:function(userName,lists){return $localStorage.lists||($localStorage.lists={},$localStorage.lists[userName]=[],$localStorage.sharedListsIds={},$localStorage.sharedListsIds[userName]=[],_.each(lists,function(list){list.author=userName,list.id=Math.floor(0x3345bd31e7f4940*Math.random()+1).toString()}),_.extend($localStorage.lists[userName],lists)),$q(function(resolve,reject){resolve($localStorage.lists[userName])})},getSharedLists:function(userName){var lists=$localStorage.lists,sharedLists=[];return $localStorage.sharedListsIds&&_.each($localStorage.sharedListsIds[userName],function(cartId){_.each(lists,function(list){angular.isDefined(_.find(list,{id:cartId.toString()}))&&sharedLists.push(_.find(list,{id:cartId}))})}),$q(function(resolve,reject){resolve(sharedLists)})},getWishlist:function(listName,permission,id,userName){return _.contains($localStorage.lists[userName],_.find($localStorage.lists[userName],{name:listName}))&&angular.isDefined(userName)?$localStorage.lists[userName].push({name:listName+1,permission:permission,id:id,items:[],author:userName}):$localStorage.lists[userName].push({name:listName,permission:permission,id:id,items:[],author:userName}),_.find($localStorage.lists[userName],{name:listName})},addItemToList:function(listId,product){_.each($localStorage.lists,function(list){if(angular.isDefined(_.find(list,{id:listId}))){_.find(list,{id:listId}).items.push(product)}})},containsInList:function(productId,cartId){var contains,lists=angular.copy($localStorage.lists);return _.each(lists,function(list){if(angular.isDefined(_.find(list,{id:cartId}))){var currentList=_.find(list,{id:cartId});contains=!!angular.isDefined(_.find(currentList.items,{productId:productId}))}}),$q(function(resolve,reject){resolve({contains:contains})})},addSharedList:function(userName,myLists,sharedCartId){return _.some($localStorage.sharedListsIds[userName],function(x){return x===sharedCartId})||_.find(myLists,{id:sharedCartId})?$q(function(resolve,reject){resolve()}):($localStorage.sharedListsIds[userName].push(sharedCartId),$q(function(resolve,reject){resolve()}))},contains:function(productId,listName){return $http.get("storefrontapi/lists/"+listName+"/items/"+productId+"/contains?t="+(new Date).getTime())},addLineItem:function(productId,listName){return $http.post("storefrontapi/lists/"+listName+"/items",{productId:productId})},removeLineItem:function(lineItemId,listId,userName){var searchedList=_.find($localStorage.lists[userName],{id:listId});return searchedList.items=_.filter(searchedList.items,function(item){return item.id!=lineItemId}),$q(function(resolve,reject){resolve(searchedList)})},clearList:function(cartId,userName){$localStorage.lists[userName]=_.filter($localStorage.lists[userName],function(x){return x.id!=cartId})},removeFromFriendsLists:function(currentId,userName){$localStorage.sharedListsIds[userName]=_.filter($localStorage.sharedListsIds[userName],function(cartId){return $q(function(resolve,reject){resolve(cartId!==currentId)})})}}}]),storefrontApp.service("quoteRequestService",["$http",function($http){return{getCurrentQuoteRequest:function(){return $http.get("storefrontapi/quoterequest/current?t="+(new Date).getTime())},getQuoteRequest:function(number){return $http.get("storefrontapi/quoterequests/"+number+"?t="+(new Date).getTime())},getQuoteRequestItemsCount:function(number){return $http.get("storefrontapi/quoterequests/"+number+"/itemscount?t="+(new Date).getTime())},addProductToQuoteRequest:function(productId,quantity){return $http.post("storefrontapi/quoterequests/current/items",{productId:productId,quantity:quantity})},removeProductFromQuoteRequest:function(quoteRequestNumber,quoteItemId){return $http.delete("storefrontapi/quoterequests/"+quoteRequestNumber+"/items/"+quoteItemId)},submitQuoteRequest:function(quoteRequestNumber,quoteRequest){return $http.post("storefrontapi/quoterequests/"+quoteRequestNumber+"/submit",{quoteForm:quoteRequest})},rejectQuoteRequest:function(quoteRequestNumber){return $http.post("storefrontapi/quoterequests/"+quoteRequestNumber+"/reject")},updateQuoteRequest:function(quoteRequestNumber,quoteRequest){return $http.put("storefrontapi/quoterequests/"+quoteRequestNumber+"/update",{quoteRequest:quoteRequest})},getTotals:function(quoteRequestNumber,quoteRequest){return $http.post("storefrontapi/quoterequests/"+quoteRequestNumber+"/totals",{quoteRequest:quoteRequest})},confirmQuoteRequest:function(quoteRequestNumber,quoteRequest){return $http.post("storefrontapi/quoterequests/"+quoteRequestNumber+"/confirm",{quoteRequest:quoteRequest})}}}]),storefrontApp.service("recommendationService",["$http",function($http){return{getRecommendedProducts:function(requestData){return $http.post("storefrontapi/recommendations",requestData)}}}]),storefrontApp.service("orderService",["$http",function($http){return{getOrder:function(orderNumber){return $http.get("storefrontapi/orders/"+orderNumber+"?t="+(new Date).getTime())}}}]);var storefrontApp=angular.module("storefrontApp");storefrontApp.directive("vcContentPlace",["$compile","marketingService",function($compile,marketingService){return{restrict:"E",link:function(scope,element,attrs){marketingService.getDynamicContent(attrs.id).then(function(response){element.html($compile(response.data)(scope))})},replace:!0}}]),storefrontApp.directive("vcEnterSource",["$timeout",function($timeout){return{restrict:"A",controller:function(){},link:function(scope,element,attrs,ctrl){var onKeyPress=function(event){13===event.keyCode&&ctrl.element[0].click()};element.on("keypress",onKeyPress),scope.$on("$destroy",function(){element.off("keypress",onKeyPress)})}}}]),storefrontApp.directive("vcEnterTarget",[function(){return{restrict:"A",require:"^vcEnterSource",link:function(scope,element,attrs,ctrl){ctrl.element=element}}}]),storefrontApp.directive("fallbackSrc",function(){return{link:function(scope,element,attrs){function errorHandler(event){element.attr("src")!==attrs.fallbackSrc?element.attr("src",attrs.fallbackSrc):element.off(event)}element.on("error",errorHandler),scope.$on("$destroy",function(){element.off("error",errorHandler)})}}});var storefrontApp=angular.module("storefrontApp");storefrontApp.controller("mainController",["$rootScope","$scope","$location","$window","customerService","storefrontApp.mainContext",function($rootScope,$scope,$location,$window,customerService,mainContext){$scope.baseUrl={},$rootScope.$on("$locationChangeSuccess",function(){var path=$location.path();path&&($scope.currentPath=path.replace("/",""))}),$rootScope.$on("storefrontError",function(event,data){$rootScope.storefrontNotification=data,$rootScope.storefrontNotification.detailsVisible=!1}),$rootScope.toggleNotificationDetails=function(){$rootScope.storefrontNotification.detailsVisible=!$rootScope.storefrontNotification.detailsVisible},$rootScope.closeNotification=function(){$rootScope.storefrontNotification=null},$scope.outerRedirect=function(absUrl){$window.location.href=absUrl},$scope.innerRedirect=function(path){$location.path(path),$scope.currentPath=$location.$$path.replace("/","")},$scope.stringifyAddress=function(address){var stringifiedAddress=address.firstName+" "+address.lastName+", ";return stringifiedAddress+=address.organization?address.organization+", ":"",stringifiedAddress+=address.countryName+", ",stringifiedAddress+=address.regionName?address.regionName+", ":"",stringifiedAddress+=address.city+" ",stringifiedAddress+=address.line1+", ",stringifiedAddress+=address.line2?address.line2:"",stringifiedAddress+=address.postalCode},$scope.getObjectSize=function(obj){var key,size=0;for(key in obj)obj.hasOwnProperty(key)&&size++;return size},mainContext.getCustomer=$scope.getCustomer=function(){customerService.getCurrentCustomer().then(function(response){var addressId=1;_.each(response.data.addresses,function(address){address.id=addressId,addressId++}),response.data.isContact="Contact"===response.data.memberType,mainContext.customer=$scope.customer=response.data})},$scope.getCustomer()}]).factory("storefrontApp.mainContext",function(){return{}});var storefrontApp=angular.module("storefrontApp");storefrontApp.component("vcAddress",{templateUrl:"themes/assets/address.tpl.html",bindings:{address:"=",addresses:"<",countries:"=",validationContainer:"=",getCountryRegions:"&",editMode:"<",onUpdate:"&"},require:{checkoutStep:"?^vcCheckoutWizardStep"},transclude:{header:"?addressHeader",footer:"?addressFooter"},controller:["$scope",function($scope){function populateRegionalDataForAddress(address){address&&(address.country=_.findWhere(ctrl.countries,{code3:address.countryCode}),null!=address.country&&(ctrl.address.countryName=ctrl.address.country.name,ctrl.address.countryCode=ctrl.address.country.code3),address.country&&(address.country.regions?setAddressRegion(address,address.country.regions):ctrl.getCountryRegions({country:address.country}).then(function(regions){address.country.regions=regions,setAddressRegion(address,regions)})))}function setAddressRegion(address,regions){address.region=_.findWhere(regions,{code:address.regionId}),address.region?(ctrl.address.regionId=ctrl.address.region.code,ctrl.address.regionName=ctrl.address.region.name):(ctrl.address.regionId=void 0,ctrl.address.regionName=void 0)}function stringifyAddress(address){var addressType="",type=_.find(ctrl.types,function(i){return i.id==ctrl.address.addressType});type&&(addressType="["+type.name+"] ");var stringifiedAddress=addressType;return stringifiedAddress+=address.firstName+" "+address.lastName+", ",stringifiedAddress+=address.organization?address.organization+", ":"",stringifiedAddress+=address.countryName+", ",stringifiedAddress+=address.regionName?address.regionName+", ":"",stringifiedAddress+=address.city+" ",stringifiedAddress+=address.line1+", ",stringifiedAddress+=address.line2?address.line2:"",stringifiedAddress+=address.postalCode}var ctrl=this;ctrl.types=[{id:"Billing",name:"Billing"},{id:"Shipping",name:"Shipping"},{id:"BillingAndShipping",name:"Billing and Shipping"}],this.$onInit=function(){ctrl.validationContainer&&ctrl.validationContainer.addComponent(this),ctrl.checkoutStep&&ctrl.checkoutStep.addComponent(this)},this.$onDestroy=function(){ctrl.validationContainer&&ctrl.validationContainer.removeComponent(this),ctrl.checkoutStep&&ctrl.checkoutStep.removeComponent(this)},ctrl.setForm=function(frm){ctrl.form=frm},ctrl.validate=function(){return!ctrl.form||(ctrl.form.$setSubmitted(),ctrl.form.$valid)},$scope.$watch("$ctrl.address",function(){ctrl.address&&(populateRegionalDataForAddress(ctrl.address),ctrl.address.name=stringifyAddress(ctrl.address)),ctrl.onUpdate({address:ctrl.address})},!0)}]});var storefrontApp=angular.module("storefrontApp");storefrontApp.component("vcCreditCard",{templateUrl:"themes/assets/js/common-components/creditCard.tpl.html",require:{checkoutStep:"?^vcCheckoutWizardStep"},bindings:{card:"=",validationContainer:"="},controller:["$scope","$filter",function($scope,$filter){var ctrl=this;this.$onInit=function(){ctrl.validationContainer&&ctrl.validationContainer.addComponent(this),ctrl.checkoutStep&&ctrl.checkoutStep.addComponent(this)},this.$onDestroy=function(){ctrl.validationContainer&&ctrl.validationContainer.removeComponent(this),ctrl.checkoutStep&&ctrl.checkoutStep.removeComponent(this)},$scope.$watch("$ctrl.card.bankCardHolderName",function(val){ctrl.card&&(ctrl.card.bankCardHolderName=$filter("uppercase")(val))},!0),ctrl.validate=function(){return ctrl.form.$setSubmitted(),!ctrl.form.$invalid}}]});var storefrontApp=angular.module("storefrontApp");storefrontApp.component("vcErrors",{templateUrl:"themes/assets/errors.tpl.html",bindings:{level:"<",message:"<",errors:"<"},controller:[function(){var $ctrl=this;$ctrl.level=$ctrl.level||"danger"}]}),angular.module("storefrontApp").component("vcLabeledInput",{templateUrl:"themes/assets/labeled-input.tpl.html",bindings:{value:"=",form:"=",name:"@",inputClass:"<",placeholder:"@",type:"@?",required:"<",requiredError:"@?",autofocus:"<",pattern:"@",disabled:"<"},controller:[function(){var $ctrl=this;$ctrl.validate=function(){return $ctrl.form.$setSubmitted(),$ctrl.form.$valid}}]}),angular.module("storefrontApp").component("vcLabeledSelect",{templateUrl:"themes/assets/labeled-select.tpl.html",require:{ngModel:"?ngModel"},bindings:{options:"<",select:"&",form:"=",name:"@",placeholder:"<",required:"<",requiredError:"@?",autofocus:"<",disabled:"<"},controller:["$scope",function($scope){var $ctrl=this;$ctrl.$onInit=function(){$ctrl.required&&$ctrl.ngModel.$setValidity("required",!1),$ctrl.ngModel.$render=function(){$ctrl.value=$ctrl.ngModel.$viewValue}},$ctrl.validate=function(){return $ctrl.form.$setSubmitted(),$ctrl.form.$valid};var select=$ctrl.select;$ctrl.select=function(option){select(option),$ctrl.value=option,$ctrl.required&&$ctrl.ngModel.$setValidity("required",!1),$ctrl.ngModel.$setViewValue($ctrl.value)}}]}),angular.module("storefrontApp").component("vcLabeledTextArea",{templateUrl:"themes/assets/labeled-textarea.tpl.html",bindings:{value:"=",form:"=",name:"@",label:"@",required:"<",requiredError:"@?",pattern:"<?",autofocus:"<"},controller:[function(){var $ctrl=this;$ctrl.validate=function(){return $ctrl.form.$setSubmitted(),$ctrl.form.$valid}}]});var storefrontApp=angular.module("storefrontApp");storefrontApp.component("vcLineItems",{templateUrl:"themes/assets/js/common-components/lineItems.tpl.liquid",bindings:{items:"="}});var storefrontApp=angular.module("storefrontApp");storefrontApp.component("vcMember",{templateUrl:"themes/assets/member.tpl.html",bindings:{member:"=",memberComponent:"="},controller:["$scope",function($scope){var $ctrl=this;this.$onInit=function(){$ctrl.memberComponent=this},this.$onDestroy=function(){$ctrl.memberComponent=null},$ctrl.setForm=function(frm){$ctrl.form=frm},$ctrl.validate=function(){return!$ctrl.form||($ctrl.form.$setSubmitted(),$ctrl.form.$valid)}}]});var storefrontApp=angular.module("storefrontApp");storefrontApp.component("vcMemberDetail",{templateUrl:"themes/assets/memberDetail.tpl.html",bindings:{member:"=",memberComponent:"=",fieldsConfig:"<"},controller:["$scope",function($scope){function getFieldConfig(field){return _.first(_.filter($ctrl.config,function(configItem){return configItem.field===field}))}var $ctrl=this;$ctrl.config=[{field:"CompanyName",disabled:!1,visible:!0,required:!0},{field:"Email",disabled:!1,visible:!0,required:!0},{field:"UserName",disabled:!1,visible:!0},{field:"Password",disabled:!1,visible:!0},{field:"Roles",disabled:!1,visible:!1}],$ctrl.fieldsConfig&&angular.extend($ctrl.config,$ctrl.fieldsConfig),$ctrl.rolesComponent=null,this.$onInit=function(){$ctrl.memberComponent=this},this.$onDestroy=function(){$ctrl.memberComponent=null},$ctrl.setForm=function(frm){$ctrl.form=frm},$ctrl.validate=function(){return!$ctrl.form||($ctrl.form.$setSubmitted(),$ctrl.form.$valid)},$ctrl.showField=function(field){return 1==getFieldConfig(field).visible},$ctrl.disableField=function(field){return 1==getFieldConfig(field).disabled},$ctrl.requiredField=function(field){return 1==getFieldConfig(field).required}}]}),storefrontApp.directive("confirmPasswordValidation",function(){return{require:"ngModel",link:function(scope,elem,attr,ngModel){ngModel.$parsers.unshift(function(value,scope){var isValid=!0,password=ngModel.$$parentForm.Password.$viewValue;return password&&(isValid=password===value),ngModel.$setValidity("confirmPasswordValidation",isValid),value})}}});var storefrontApp=angular.module("storefrontApp");storefrontApp.component("vcPaymentMethods",{templateUrl:"themes/assets/js/common-components/paymentMethods.tpl.html",require:{checkoutStep:"?^vcCheckoutWizardStep"},bindings:{getAvailPaymentMethods:"&",onSelectMethod:"&",paymentMethod:"=",validationContainer:"="},controller:["$scope",function($scope){var ctrl=this;this.$onInit=function(){ctrl.getAvailPaymentMethods().then(function(methods){ctrl.availPaymentMethods=_.sortBy(methods,function(x){return x.priority}),ctrl.paymentMethod&&(ctrl.paymentMethod=_.findWhere(ctrl.availPaymentMethods,{code:ctrl.paymentMethod.code})),!ctrl.paymentMethod&&ctrl.availPaymentMethods.length>0&&ctrl.selectMethod(ctrl.availPaymentMethods[0])}),ctrl.validationContainer&&ctrl.validationContainer.addComponent(this),ctrl.checkoutStep&&ctrl.checkoutStep.addComponent(this)},this.$onDestroy=function(){ctrl.validationContainer&&ctrl.validationContainer.removeComponent(this),ctrl.checkoutStep&&ctrl.checkoutStep.removeComponent(this)},ctrl.validate=function(){return ctrl.paymentMethod},ctrl.selectMethod=function(method){ctrl.paymentMethod=method,ctrl.onSelectMethod({paymentMethod:method})}}]});var storefrontApp=angular.module("storefrontApp");storefrontApp.component("vcSearchBar",{templateUrl:"themes/assets/js/common-components/searchBar.tpl.html",bindings:{placeholder:"<",searching:"<",noResults:"<",query:"@",categoriesLabel:"<",productsLabel:"<",submitLabel:"<",categoryLimit:"@",productLimit:"@"},controller:["$scope","$q","catalogService",function($scope,$q,catalogService){var $ctrl=this;$ctrl.hasHint=!1,$scope.$watch("$ctrl.isOpen",function(isOpen){$ctrl.hasHint=!!$ctrl.query&&!isOpen}),$scope.$watch("$ctrl.query",function(query){$ctrl.hasHint=!!query&&!$ctrl.isOpen}),$ctrl.getSuggestions=function(){var searchCriteria={keyword:$ctrl.query,start:0};return $q.all([catalogService.searchCategories(angular.extend({},searchCriteria,{pageSize:$ctrl.categoryLimit})),catalogService.search(angular.extend({},searchCriteria,{pageSize:$ctrl.productLimit}))]).then(function(results){var process=function(within){return(results[0].data[within]||results[1].data[within]).map(function(suggestion){return suggestion.within=within,suggestion})};return process("categories").concat(process("products")).map(function(suggestion,index){return suggestion.index=index,suggestion})})}}]});var storefrontApp=angular.module("storefrontApp");storefrontApp.component("vcCheckoutCoupon",{templateUrl:"themes/assets/js/checkout/checkout-coupon.tpl.liquid",bindings:{coupon:"=",onApplyCoupon:"&",onRemoveCoupon:"&"},controller:[function(){}]});var storefrontApp=angular.module("storefrontApp");storefrontApp.component("vcCheckoutEmail",{templateUrl:"themes/assets/js/checkout/checkout-email.tpl.html",require:{checkoutStep:"^vcCheckoutWizardStep"},bindings:{email:"="},controller:[function(){var ctrl=this;this.$onInit=function(){ctrl.checkoutStep.addComponent(this)},this.$onDestroy=function(){ctrl.checkoutStep.removeComponent(this)},ctrl.validate=function(){return ctrl.form.$setSubmitted(),!ctrl.form.$invalid}}]});var storefrontApp=angular.module("storefrontApp");storefrontApp.component("vcCheckoutShippingMethods",{templateUrl:"themes/assets/js/checkout/checkout-shippingMethods.tpl.liquid",require:{checkoutStep:"^vcCheckoutWizardStep"},bindings:{shipment:"=",getAvailShippingMethods:"&",onSelectShippingMethod:"&"},controller:[function(){function getMethodId(method){var retVal=method.shipmentMethodCode;return method.optionName&&(retVal+=":"+method.optionName),retVal}var ctrl=this;ctrl.availShippingMethods=[],ctrl.selectedMethod={},this.$onInit=function(){ctrl.checkoutStep.addComponent(this),ctrl.loading=!0,ctrl.getAvailShippingMethods(ctrl.shipment).then(function(availMethods){ctrl.availShippingMethods=availMethods,_.each(ctrl.availShippingMethods,function(x){x.id=getMethodId(x)}),ctrl.selectedMethod=_.find(ctrl.availShippingMethods,function(x){return ctrl.shipment.shipmentMethodCode==x.shipmentMethodCode&&ctrl.shipment.shipmentMethodOption==x.optionName}),ctrl.loading=!1})},this.$onDestroy=function(){ctrl.checkoutStep.removeComponent(this)},ctrl.selectMethod=function(method){ctrl.selectedMethod=method,ctrl.onSelectShippingMethod({shippingMethod:method})},ctrl.validate=function(){return ctrl.form.$setSubmitted(),!ctrl.form.$invalid}}]});var storefrontApp=angular.module("storefrontApp");storefrontApp.component("vcCheckoutWizardStep",{templateUrl:"themes/assets/js/checkout/checkout-wizard-step.tpl.html",transclude:!0,require:{wizard:"^vcCheckoutWizard"},bindings:{name:"@",title:"@",stepDisabled:"=?",onNextStep:"&?",canEnter:"=?",final:"<?"},controller:[function(){var ctrl=this;ctrl.components=[],ctrl.canEnter=!0,this.$onInit=function(){ctrl.wizard.addStep(this)},ctrl.addComponent=function(component){ctrl.components.push(component)},ctrl.removeComponent=function(component){ctrl.components=_.without(ctrl.components,component)},ctrl.validate=function(){return _.every(ctrl.components,function(x){return"function"!=typeof x.validate||x.validate()})}}]});var storefrontApp=angular.module("storefrontApp");storefrontApp.component("vcCheckoutWizard",{transclude:!0,templateUrl:"themes/assets/js/checkout/checkout-wizard.tpl.html",bindings:{wizard:"=",loading:"=",onFinish:"&?",onInitialized:"&?"},controller:["$scope",function($scope){function rebuildStepsLinkedList(steps){for(var nextStep=void 0,i=steps.length;i-- >0;)steps[i].prevStep=void 0,steps[i].nextStep=void 0,nextStep&&!steps[i].disabled&&(nextStep.prevStep=steps[i]),steps[i].disabled||(steps[i].nextStep=nextStep,nextStep=steps[i])}var ctrl=this;ctrl.wizard=ctrl,ctrl.steps=[],ctrl.goToStep=function(step){angular.isString(step)&&(step=_.find(ctrl.steps,function(x){return x.name==step})),step&&ctrl.currentStep!=step&&step.canEnter&&(step.final?ctrl.onFinish&&ctrl.onFinish():(step.isActive=!0,ctrl.currentStep&&(ctrl.currentStep.isActive=!1),ctrl.currentStep=step))},ctrl.nextStep=function(){if((!ctrl.currentStep.validate||ctrl.currentStep.validate())&&ctrl.currentStep.nextStep)if(ctrl.currentStep.onNextStep){var promise=ctrl.currentStep.onNextStep();promise&&angular.isFunction(promise.then)?promise.then(function(){ctrl.goToStep(ctrl.currentStep.nextStep)}):ctrl.goToStep(ctrl.currentStep.nextStep)}else ctrl.goToStep(ctrl.currentStep.nextStep)},ctrl.prevStep=function(){ctrl.goToStep(ctrl.currentStep.prevStep)},ctrl.addStep=function(step){ctrl.steps.push(step),$scope.$watch(function(){return step.disabled},function(){rebuildStepsLinkedList(ctrl.steps)}),rebuildStepsLinkedList(ctrl.steps),ctrl.currentStep||ctrl.goToStep(step),step.final&&ctrl.onInitialized&&ctrl.onInitialized()}}]});var moduleName="storefront.checkout";void 0!=storefrontAppDependencies&&storefrontAppDependencies.push(moduleName),angular.module(moduleName,["credit-cards","angular.filter"]).controller("checkoutController",["$rootScope","$scope","$window","cartService",function($rootScope,$scope,$window,cartService){function updatePayment(payment){return $scope.checkout.billingAddressEqualsShipping&&(payment.billingAddress=void 0),payment.billingAddress&&(payment.billingAddress.type="Billing"),wrapLoading(function(){return cartService.addOrUpdatePayment(payment).then($scope.reloadCart)})}function handlePostPaymentResult(order,orderProcessingResult,paymentMethod){if(!orderProcessingResult.isSuccess)return $scope.checkout.loading=!1,void $rootScope.$broadcast("storefrontError",{type:"error",title:["Error in new order processing: ",orderProcessingResult.error,"New Payment status: "+orderProcessingResult.newPaymentStatus].join(" "),message:orderProcessingResult.error});paymentMethod.paymentMethodType&&"preparedform"==paymentMethod.paymentMethodType.toLowerCase()&&orderProcessingResult.htmlForm?$scope.outerRedirect($scope.baseUrl+"cart/checkout/paymentform?orderNumber="+order.number):paymentMethod.paymentMethodType&&"redirection"==paymentMethod.paymentMethodType.toLowerCase()&&orderProcessingResult.redirectUrl?$window.location.href=orderProcessingResult.redirectUrl:$scope.customer.isRegisteredUser?$scope.outerRedirect($scope.baseUrl+"account#/orders/"+order.number):$scope.outerRedirect($scope.baseUrl+"cart/thanks/"+order.number)}function wrapLoading(func){return $scope.checkout.loading=!0,func().then(function(result){return $scope.checkout.loading=!1,result},function(){$scope.checkout.loading=!1})}$scope.checkout={wizard:{},paymentMethod:{},shipment:{},payment:{},coupon:{},availCountries:[],loading:!1,isValid:!1},$scope.validateCheckout=function(checkout){checkout.isValid=checkout.payment&&checkout.payment.paymentGatewayCode,checkout.isValid&&!checkout.billingAddressEqualsShipping&&(checkout.isValid=angular.isObject(checkout.payment.billingAddress)),checkout.isValid&&checkout.cart&&checkout.cart.hasPhysicalProducts&&(checkout.isValid=angular.isObject(checkout.shipment)&&checkout.shipment.shipmentMethodCode&&angular.isObject(checkout.shipment.deliveryAddress))},$scope.reloadCart=function(){return cartService.getCart().then(function(response){var cart=response.data;return cart&&cart.id?($scope.checkout.cart=cart,$scope.checkout.coupon=cart.coupon||$scope.checkout.coupon,$scope.checkout.coupon.code&&!$scope.checkout.coupon.appliedSuccessfully&&($scope.checkout.coupon.errorCode="InvalidCouponCode"),cart.payments.length&&($scope.checkout.payment=cart.payments[0],$scope.checkout.paymentMethod.code=$scope.checkout.payment.paymentGatewayCode),cart.shipments.length&&($scope.checkout.shipment=cart.shipments[0]),$scope.checkout.billingAddressEqualsShipping=cart.hasPhysicalProducts&&!angular.isObject($scope.checkout.payment.billingAddress),$scope.checkout.canCartBeRecurring=$scope.customer.isRegisteredUser&&_.all(cart.items,function(x){return!x.isReccuring}),$scope.checkout.paymentPlan=cart.paymentPlan&&_.findWhere($scope.checkout.availablePaymentPlans,{intervalCount:cart.paymentPlan.intervalCount,interval:cart.paymentPlan.interval})||_.findWhere($scope.checkout.availablePaymentPlans,{intervalCount:1,interval:"months"})):$scope.outerRedirect($scope.baseUrl+"cart"),$scope.validateCheckout($scope.checkout),cart})},$scope.applyCoupon=function(coupon){coupon.processing=!0,cartService.addCoupon(coupon.code).then(function(){coupon.processing=!1,$scope.reloadCart()},function(response){coupon.processing=!1})},$scope.removeCoupon=function(coupon){coupon.processing=!0,cartService.removeCoupon().then(function(response){coupon.processing=!1,$scope.checkout.coupon={},$scope.reloadCart()},function(response){coupon.processing=!1})},$scope.selectPaymentMethod=function(paymentMethod){angular.extend($scope.checkout.payment,paymentMethod),$scope.checkout.payment.paymentGatewayCode=paymentMethod.code,$scope.checkout.payment.amount=angular.copy($scope.checkout.cart.total),$scope.checkout.payment.amount.amount+=paymentMethod.totalWithTax.amount,updatePayment($scope.checkout.payment)},$scope.getCountryRegions=function(country){return cartService.getCountryRegions(country.code3).then(function(response){return response.data})},$scope.getAvailShippingMethods=function(shipment){return wrapLoading(function(){return cartService.getAvailableShippingMethods(shipment.id).then(function(response){return response.data})})},$scope.getAvailPaymentMethods=function(){return wrapLoading(function(){return cartService.getAvailablePaymentMethods().then(function(response){return response.data})})},$scope.selectShippingMethod=function(shippingMethod){shippingMethod?($scope.checkout.shipment.shipmentMethodCode=shippingMethod.shipmentMethodCode,$scope.checkout.shipment.shipmentMethodOption=shippingMethod.optionName):($scope.checkout.shipment.shipmentMethodCode=void 0,$scope.checkout.shipment.shipmentMethodOption=void 0),$scope.updateShipment($scope.checkout.shipment)},$scope.updateShipment=function(shipment){return shipment.deliveryAddress&&($scope.checkout.shipment.deliveryAddress.type="Shipping"),shipment.validationErrors=void 0,wrapLoading(function(){return cartService.addOrUpdateShipment(shipment).then($scope.reloadCart)})},$scope.createOrder=function(){updatePayment($scope.checkout.payment).then(function(){$scope.checkout.loading=!0,cartService.createOrder($scope.checkout.paymentMethod.card).then(function(response){handlePostPaymentResult(response.data.order,response.data.orderProcessingResult,response.data.paymentMethod)})})},$scope.savePaymentPlan=function(){wrapLoading(function(){return cartService.addOrUpdatePaymentPlan($scope.checkout.paymentPlan).then(function(){$scope.checkout.cart.paymentPlan=$scope.checkout.paymentPlan})})},$scope.isRecurringChanged=function(isRecurring){$scope.checkout.paymentPlan&&(isRecurring?$scope.savePaymentPlan():wrapLoading(function(){return cartService.removePaymentPlan().then(function(){$scope.checkout.cart.paymentPlan=void 0})}))},$scope.initialize=function(){
$scope.reloadCart().then(function(cart){$scope.checkout.wizard.goToStep(cart.hasPhysicalProducts?"shipping-address":"payment-method")})},function(){return cartService.getCountries().then(function(response){return response.data})}().then(function(countries){$scope.checkout.availCountries=countries})}]),angular.module("storefrontApp").directive("vaPermission",["authService",function(authService){return{link:function(scope,element,attrs){function toggleVisibilityBasedOnPermission(securityScopes){authService.checkPermission(permissionValue,securityScopes)?angular.element(element).show():angular.element(element).hide()}if(attrs.vaPermission){var permissionValue=attrs.vaPermission.trim();scope.$watch(attrs.securityScopes,function(value){value&&toggleVisibilityBasedOnPermission(value)}),toggleVisibilityBasedOnPermission(),scope.$on("loginStatusChanged",toggleVisibilityBasedOnPermission)}}}}]);
//# sourceMappingURL=checkout-scripts.js.map
