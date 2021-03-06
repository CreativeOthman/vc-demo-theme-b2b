angular.module('storefront.account')
    .component('vcAccountOrders', {
        templateUrl: "themes/assets/js/account/account-orders.tpl.liquid",
        controller: [function () {
            var $ctrl = this;
        }]
    })
    .component('vcAccountOrdersList', {
        templateUrl: "account-orders-list.tpl",
        controller: ['accountApi', 'loadingIndicatorService', '$window', 'sortAscending', 'sortDescending', 'orderStatuses', '$stateParams', function (accountApi, loader, $window, sortAscending, sortDescending, orderStatuses, $stateParams) {
            var $ctrl = this;
            $ctrl.sortDescending = sortDescending;
            $ctrl.sortAscending = sortAscending;
            $ctrl.orderStatuses = orderStatuses;
            $ctrl.selectedStatuses = [];
            $ctrl.loader = loader;
            $ctrl.filterDropdownSettings = { template: '{{option}}', smartButtonTextConverter(skip, option) { return option; }, };
            $ctrl.dropdownEvents = { onSelectionChanged: filtersChanged };
            $ctrl.pageSettings = { currentPage: $stateParams.pageNumber || 1, itemsPerPageCount: 10, numPages: 10 };

            $ctrl.pageSettings.pageChanged = function () {
                loadData();
            };

            $ctrl.getInvoicePdf = function (orderNumber) {
                var url = $window.BASE_URL + 'storefrontapi/orders/' + orderNumber + '/invoice';
                $window.open(url, '_blank');
            }

            $ctrl.sortInfos = {
                sortBy: 'number',
                sortDirection: sortDescending
            }

            $ctrl.sortChanged = function (sortBy) {
                $ctrl.sortInfos.sortDirection = ($ctrl.sortInfos.sortBy === sortBy) ?
                invertSortDirection($ctrl.sortInfos.sortDirection)
                : sortAscending;
                $ctrl.sortInfos.sortBy = sortBy;
                loadData();
            }

            function filtersChanged() {
                $ctrl.pageSettings.currentPage = 1;
                loadData();
            }

            $ctrl.getSortDirection = function (fieldName) {
                return $ctrl.sortInfos.sortBy === fieldName ? $ctrl.sortInfos.sortDirection : '';
            }

            function loadData() {
                return loader.wrapLoading(function () {
                    return accountApi.searchUserOrders({
                        pageNumber: $ctrl.pageSettings.currentPage,
                        pageSize: $ctrl.pageSettings.itemsPerPageCount,
                        sort: `${$ctrl.sortInfos.sortBy}:${$ctrl.sortInfos.sortDirection}`,
                        statuses: $ctrl.selectedStatuses
                    }).then(function (response) {
                        $ctrl.entries = response.data.results;
                        $ctrl.pageSettings.totalItems = response.data.totalCount;
                    });
                });
            }

            function invertSortDirection(sortDirection) {
                return sortDirection == sortAscending ? sortDescending : sortAscending;
            }

            loadData();
        }]
    })
    .component('vcAccountOrderDetail', {
        templateUrl: "account-order-detail.tpl",
        require: {
            accountManager: '^vcAccountManager'
        },
        controller: ['$rootScope', '$window', 'loadingIndicatorService', 'confirmService', 'accountApi', 'inventoryApi', 'orderService', '$stateParams', '$scope', 'catalogService', 'dialogService', 'cartService', function($rootScope, $window, loader, confirmService, accountApi, inventoryApi, orderService, $stateParams, $scope, catalogService, dialogService, cartService ) {
            var $ctrl = this;
            $ctrl.loader = loader;
            $ctrl.hasPhysicalProducts = true;

            $ctrl.pageNumber = $stateParams.pageNumber || 1;
            $ctrl.orderNumber = $stateParams.number;

            refresh();

            function refresh() {
                loader.wrapLoading(function () {
                    return accountApi.getUserOrder($ctrl.orderNumber).then(function (result) {
                        $ctrl.order = result.data;
                        $ctrl.paymentNumber = $ctrl.order.inPayments[0].number;
                        return $ctrl.order;
                    }).then(function (order) {
                        var lastPayment = _.last(_.sortBy(order.inPayments, 'createdDate'));
                        $ctrl.billingAddress = (lastPayment && lastPayment.billingAddress) ||
                            _.findWhere(order.addresses, { type: 'billing' }) ||
                            _.first(order.addresses);

                        accountApi.getUserOrderNewPaymentData(order.number).then(function (response) {
                            $ctrl.paymentMethods = response.data.paymentMethods;
                            _.each($ctrl.order.inPayments, function (x) {
                                $ctrl.selectedPaymentMethod = _.find($ctrl.paymentMethods, function (pm) { return pm.code == x.gatewayCode; });
                                if ($ctrl.selectedPaymentMethod) {
                                    x.paymentMethod = $ctrl.selectedPaymentMethod;
                                    $ctrl.selectedPaymentMethodCode = $ctrl.selectedPaymentMethod.code;
                                }
                            });
                        });

                        //Workaround because order doesn't have any properties for pickup delivery method
                        $ctrl.deliveryMethod = { type: 'shipping' };
                        inventoryApi.searchFulfillmentCenters({}).then(function(response) {
                            $ctrl.deliveryMethod.fulfillmentCenter = _.find(response.data.results, function(x) { return x.address.line1 == order.shipments[0].deliveryAddress.line1; });
                            if ($ctrl.deliveryMethod.fulfillmentCenter) {
                                $ctrl.deliveryMethod.type ='pickup';
                            }
                        });
                    });
                });
            }

            $ctrl.getInvoicePdf = function () {
                var url = $window.BASE_URL + 'storefrontapi/orders/' + $ctrl.orderNumber + '/invoice';
                $window.open(url, '_blank');
            }

            // $ctrl.reorder = function() {
            //     var productIdsQuery = $ctrl.order.items.map(item => {
            //         return 'productIds=' + item.productId;
            //     }).join("&");

            //     catalogService.getProducts(productIdsQuery).then(response => {
            //         if (response.data && response.data.length) {
            //             var configurationProducts = response.data.map(item => {
            //                 return angular.extend(item, { quantity: _.findWhere($ctrl.order.items, {productId: item.id}).quantity });
            //             });
            //             var inventoryError = configurationProducts.some(product => {
            //                 return product.availableQuantity < product.quantity;
            //             });
            //             var dialogData = toDialogDataModel(configurationProducts, null, inventoryError, null);
            //             dialogService.showDialog(dialogData, 'recentlyAddedCartItemDialogController', 'storefront.recently-added-cart-item-dialog.tpl', 'lg');
            //             if (!inventoryError) {
            //                 var items = configurationProducts.map(product => {
            //                     return { id: product.id, quantity: product.quantity };
            //                 });
            //                 cartService.addLineItems(items).then(res => {
            //                     var result = res.data;
            //                     if (result.isSuccess) {
            //                         $rootScope.$broadcast('cartItemsChanged');
            //                     }
            //                 });
            //             }
            //         }
            //     });
            // }

            $ctrl.paymentMethodChanged = function () {
                loader.wrapLoading(function() {
                    $ctrl.selectedPaymentMethod = _.find($ctrl.paymentMethods, function (pm) { return pm.code == $ctrl.selectedPaymentMethodCode; });
                    $ctrl.order.inPayments[0].gatewayCode = $ctrl.selectedPaymentMethod.code;
                    $ctrl.order.inPayments[0].paymentMethodType = $ctrl.selectedPaymentMethod.paymentMethodType;
                    return orderService.addOrUpdatePayment($ctrl.orderNumber, $ctrl.order.inPayments[0]).then(function(response) {
                        refresh();
                    });
                });
            }

            $ctrl.payInvoice = function () {
                if ($ctrl.selectedPaymentMethod.paymentMethodType && $ctrl.selectedPaymentMethod.paymentMethodType.toLowerCase() == 'preparedform') {
                    outerRedirect($window.BASE_URL + 'cart/checkout/paymentform?orderNumber=' + $ctrl.orderNumber);
                } else {
                    loader.wrapLoading(function() {
                        return orderService.processOrderPayment($ctrl.orderNumber, $ctrl.paymentNumber, null).then(function(response) {
                            var orderProcessingResult = response.data.orderProcessingResult;
                            if (orderProcessingResult.isSuccess) {
                                $ctrl.order.inPayments[0].status = "Paid";
                                $rootScope.$broadcast('successOperation', {
                                    type: 'success',
                                    message: 'Invoice ' + $ctrl.orderNumber + ' has been successfully paid',
                                });
                                orderService.addOrUpdatePayment($ctrl.orderNumber, $ctrl.order.inPayments[0]).then(function(response) {
                                    refresh();
                                });
                            } else {
                                handleBadPaymentResult(orderProcessingResult);
                            }
                        });
                    });
                }
            }

            $scope.$on('lineItemAdded', function (event, data) {
                const {productId, quantity} = data;
                addProductToCartById(productId, quantity);
            });

            $scope.$on('configurationAdded', function (event, data) {
                const {configuration} = data;
                addConfigurationToCart(configuration);
            });

            var components = [];
            $ctrl.addComponent = function (component) {
                components.push(component);
            };
            $ctrl.removeComponent = function (component) {
                components = _.without(components, component);
            };

            function outerRedirect(absUrl) {
                $window.location.href = absUrl;
            };

            function handleBadPaymentResult(orderProcessingResult) {
                loader.isLoading = false;
                $rootScope.$broadcast('storefrontError', {
                    type: 'error',
                    title: ['Error in new order processing: ', orderProcessingResult.error, 'New Payment status: ' + orderProcessingResult.newPaymentStatus].join(' '),
                    message: orderProcessingResult.error,
                });
                return;
            };

            function addProductToCartById(productId, quantity) {
                catalogService.getProduct([productId]).then(response => {
                    if (response.data && response.data.length) {
                        var product = response.data[0];
                        addProductToCart(product, quantity);
                    }
                });
            }

            function addConfigurationToCart(configuration) {
                let productIdsQuery = configuration.items.map(item => {
                    return 'productIds=' + item.productId;
                }).join("&");

                catalogService.getProducts(productIdsQuery).then(response => {
                    if (response.data && response.data.length) {
                        let configurationProducts = response.data.map(item => {
                            return angular.extend(item, { quantity: _.findWhere(configuration.items, {productId: item.id}).quantity });
                        });
                        let inventoryError = configurationProducts.some(product => {
                            return product.availableQuantity < product.quantity;
                        });
                        let dialogData = toDialogDataModel(configurationProducts, configuration.quantity, inventoryError, configuration.productId);
                        dialogService.showDialog(dialogData, 'recentlyAddedCartItemDialogController', 'storefront.recently-added-cart-item-dialog.tpl', 'lg');
                        if (!inventoryError) {
                            let items = configurationProducts.map(product => {
                                return { id: product.id, quantity: product.quantity, configuredProductId: configuration.productId };
                            });
                            cartService.addLineItems(items).then(res => {
                                let result = res.data;
                                if (result.isSuccess) {
                                    $rootScope.$broadcast('cartItemsChanged');
                                }
                            });
                        }
                    }
                });
            }

            function addProductToCart(product, quantity) {
                var inventoryError = product.availableQuantity < quantity;
                angular.extend(product, { quantity });
                var dialogData = toDialogDataModel([product], null, inventoryError, null);
                dialogService.showDialog(dialogData, 'recentlyAddedCartItemDialogController', 'storefront.recently-added-cart-item-dialog.tpl', 'lg');
                if (!inventoryError) {
                    cartService.addLineItem(product.id, quantity).then(() => {
                        $rootScope.$broadcast('cartItemsChanged');
                    });
                }
            }

            function toDialogDataModel(products, configurationQty, inventoryError, configuredProductId) {
                let productIds = products.map(product => {
                    return product.productId;
                });
                let items = products.map(product => {
                    return angular.extend({ }, product, { inventoryError: product.availableQuantity < product.quantity, configuredProductId: configuredProductId })
                });
                return { productIds, items, inventoryError, configuredProductId, configurationQty };
            }

        }]
    })
    .filter('orderToSummarizedStatusLabel', [function () {
        return function (order) {
            if (!order)
                return false;

            var retVal = order.status || 'New';

            return retVal;
        };
    }]);
