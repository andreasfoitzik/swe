'use strict';

angular
    .module('applicaApp', ['ngRoute', 'ngDialog', 'ngTable', 'googlechart', 'tc.chartjs','ui.bootstrap'])
    .config(function($routeProvider) {
        $routeProvider.
            when("/",
            {
                templateUrl: "login.html",
                controller: "LoginCtrl"
            }).
            when("/dashboard",
            {
                templateUrl: "dashboard.html",
                controller: "DashboardCtrl"
            }).
            when("/statistiken",
            {
                templateUrl: "statistiken.html",
                controller: "StatistikenCtrl"
            }).
            when("/data",
            {
                templateUrl: "data.html",
                controller: "DataCtrl"
            }).
            when("/sales",
            {
                templateUrl: "sales.html",
                controller: "SaleCtrl"
            }).
            when("/settings",
            {
                templateUrl: "settings.html",
                controller: "SettingCtrl"
            }).
            when("/logout",
            {
                templateUrl: "login.html",
                controller: "LoginCtrl"
            }).
            otherwise( { redirectTo: "/" });
    })
    .controller('LoginCtrl', ['$scope','$http', '$location','ngDialog', function($scope,$http,$location,ngDialog) {

        $scope.login = function () {
            $http.post('/login', $scope.user).success(function(response) {
                if(response == 'work') { // login successful
                    $location.path("/dashboard");
                } else { // login denied
                    $scope.user.name = "";
                    $scope.user.password = "";
                    ngDialog.open({ template: 'wrongLogin' });
                }
            });
        };
    }])
    .controller('DashboardCtrl', ['$scope','$http','$location','ngTableParams','ngDialog','$filter', function($scope,$http,$location,ngTableParams,ngDialog,$filter) {

        var refresh = function() {
            $http.get('/data/status/'+ 'open').success(function(response) {
                if(response == 'no') {
                    $location.path("/");
                } else {

                    $http.get('/data/from/' + $scope.zeitraum).success(function(response) {
                        $scope.kpi =  response;
                    });
                    $http.get('/sale/from/' + $scope.zeitraum).success(function(response) {
                        $scope.saleKPI =  response;
                    });

                    $scope.application_status_open = response.length;

                    $scope.tableParams = new ngTableParams({
                        page: 1,            // show first page
                        count: response.length,           // count per page
                        sorting: {
                            eingangsdatum: 'asc'     // initial sorting
                        }
                    }, {
                        counts: [],
                        total: response.length, // length of data
                        getData: function($defer, params) {

                            var orderedData = params.sorting() ?
                                $filter('orderBy')(response, params.orderBy()) :
                                response;

                            $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                        }
                    });

                    $scope.$watch('tableParams', function(params) {
                        $scope.application = data.slice((params.page() - 1) * params.count(), params.page() * params.count());
                    }, true);
                }
            });

            $http.get('/data/status/'+ 'follow').success(function(response) {

                if(response == 'no') {
                    $location.path("/");
                } else {
                    $scope.application_status_follow = response.length;
                    $scope.application = "";

                    $scope.tableParamsAPP = new ngTableParams({
                        page: 1,            // show first page
                        count: response.length,           // count per page
                        sorting: {
                            eingangsdatum: 'asc'     // initial sorting
                        }
                    }, {
                        counts: [],
                        total: response.length, // length of data
                        getData: function($defer, params) {

                            var orderedData = params.sorting() ?
                                $filter('orderBy')(response, params.orderBy()) :
                                response;

                            $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                        }
                    });

                    $scope.$watch('tableParamsAPP', function(params) {
                        $scope.application = data.slice((params.page() - 1) * params.count(), params.page() * params.count());
                    }, true);

                }
            });

            $http.get('/calls/status/open').success(function(response) {

                $scope.calls = response;
                $scope.callAmount = response.length;
            });
        };

        refresh();

        var reload_follow = function() {

            $http.get('/data/status/' + 'follow').success(function (response) {

                if (response == 'no') {
                    $location.path("/");
                } else {
                    $scope.application_status_follow = response.length;
                    $scope.application = "";

                    $scope.tableParamsAPP = new ngTableParams({
                        page: 1,            // show first page
                        count: response.length,           // count per page
                        sorting: {
                            eingangsdatum: 'asc'     // initial sorting
                        }
                    }, {
                        counts: [],
                        total: response.length, // length of data
                        getData: function ($defer, params) {

                            var orderedData = params.sorting() ?
                                $filter('orderBy')(response, params.orderBy()) :
                                response;

                            $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                        }
                    });

                    $scope.$watch('tableParamsAPP', function (params) {
                        $scope.application = data.slice((params.page() - 1) * params.count(), params.page() * params.count());
                    }, true);

                }
            });
        }

        $scope.check = function() {

            $http.get('/data/search/' + $scope.search).success(function(response) {
                $scope.searchResult = response;
            });
        };

        $scope.addSale = function(id){

            if($scope.sale.containerTyp && $scope.sale.containerAmount && $scope.sale.return && $scope.sale.profitCB && $scope.sale.containerTransport) {
                $http.post('/data/sale/' + id, $scope.sale).success(function (response) {
                    $scope.searchResult = response;
                    $scope.sale = "";
                });
            } else {
                ngDialog.open({ template: 'wrongSale' });
            }
        };

        $scope.showKPI = function() {

            $http.get('/data/from/' + $scope.zeitraum).success(function(response) {
                $scope.kpi =  response;
            });

            $http.get('/sale/from/' + $scope.zeitraum).success(function(response) {
                $scope.saleKPI =  response;
            });
        };

        $scope.enterAngebot = function() {
            ngDialog.open({ template: 'enterAngebot1' });
        };

        $scope.remove = function(id) {
            $http.delete('/data/' + id).success(function(response) {
                refresh();
            });
        };

        $scope.situation = function(id,situation) {
            $http.put('/data/' + id + '/situation/'+ situation).success(function(response) {
                refresh();
            });
        };

        $scope.situation_fol = function(id,situation) {
            $http.put('/data/' + id + '/situation/'+ situation).success(function(response) {
                $scope.tableParamsAPP.count(100);
                refresh();
            });
        };

        $scope.edit = function(id) {
            $http.get('/data/' + id).success(function(response) {
                $scope.application =  response;
            });
        };

        $scope.update = function() {
            $http.put('/data/' + $scope.application._id, $scope.application).success(function(response) {
                $scope.tableParams.count(111);
                refresh();

                $scope.tableParamsAPP.count(111);
                reload_follow();
            })
        };

        $scope.status = function(id,status) {
            $http.put('/data/' + id + '/status/'+ status).success(function(response) {
                refresh();
            });
        };

        $scope.logout = function () {
            $http.get('/logout').success(function(response) { });
        };
    }])
    .controller('DataCtrl', ['$scope','$http','$location', '$filter', 'ngTableParams', function($scope,$http,$location,$filter,ngTableParams) {

       var refresh = function() {
            $http.get('/data').success(function(response) {
                 if(response == 'no') {
                     $location.path("/");
                 } else {

                     $http.get('/calls/status/open').success(function(response) {
                         $scope.calls = response;
                         $scope.callAmount = response.length;
                     });

                     $http.get('/data').success(function(response) {
                         if(response == 'no') {
                             $location.path("/");
                         } else {

                             $scope.application_status_open = response.length;
                             $scope.anfrage = "";

                             $scope.tableParams = new ngTableParams({
                                 page: 1,            // show first page
                                 count: 10,           // count per page
                                 sorting: {
                                     eingangsdatum: 'desc'     // initial sorting
                                 }
                             }, {
                                 counts: [],
                                 total: response.length, // length of data
                                 getData: function($defer, params) {

                                     var orderedData = params.sorting() ?
                                         $filter('orderBy')(response, params.orderBy()) :
                                         response;

                                     $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                                 }
                             });

                             $scope.$watch('tableParams', function(params) {
                                 $scope.application = data.slice((params.page() - 1) * params.count(), params.page() * params.count());
                             }, true);
                         }
                     });
                 }
            });
        };

        refresh();

        $scope.check = function() {
            $http.get('/data/search/' + $scope.search).success(function(response) {
                $scope.searchResult = response;
            });
        };

        $scope.addSale = function(id){
            $http.post('/data/sale/' + id, $scope.sale).success(function(response) {
                $scope.searchResult = response;
                $scope.sale = "";
            });
        };

        $scope.addContact = function() {
            $http.post('/data/', $scope.anfrage).success(function(response) {
                $scope.tableParams.count(11);
                refresh();
            });
        };

        $scope.remove = function(id) {
            $http.delete('/data/' + id).success(function(response) {
                $scope.tableParams.count(11);
                refresh();
            });
        };

        $scope.edit = function(id) {
            $http.get('/data/' + id).success(function(response) {
                 $scope.application =  response;
            });
        };

        $scope.update = function() {
            $http.put('/data/' + $scope.application._id, $scope.application).success(function(response) {
                $scope.tableParams.count(11);
                refresh();
            })
        };

        $scope.deselect = function() {
            $scope.anfrage = "";
        };

        $scope.situation = function(id,situation) {
            $http.put('/data/' + id + '/situation/'+ situation).success(function(response) {

            });
        };

        $scope.export = function(){
            $http.get('/csv/data/').success(function(response) {

                var element = angular.element('<a/>');
                element.attr({
                    href: 'data:attachment/csv;charset=utf-8,' + encodeURI(response),
                    target: '_blank',
                    download: 'anfragen.csv'
                })[0].click();

                refresh();

            });
        };

        $scope.logout = function () {
            $http.get('/logout').success(function(response) { });
        };
    }])
    .controller('SettingCtrl', ['$scope','$http', 'ngDialog', function($scope,$http,ngDialog) {

        var refresh = function(){

            $http.get('/user').success(function(response) {
                $scope.user = response;
            });

            $http.get('/calls/status/open').success(function(response) {
                $scope.calls = response;
                $scope.callAmount = response.length;
            });
        };

        refresh();

        $scope.addUser = function(){

            if(!angular.isUndefined($scope.newuser) && $scope.newuser != null ) {
                if($scope.newuser.name && $scope.newuser.password) {
                    $http.post('/user', $scope.newuser).success(function (response) {

                        if (response == 'no') {
                            $scope.newuser = "";
                            ngDialog.open({template: 'mistakeUser'});
                        } else if (response == "OK") {
                            $scope.newuser = "";
                            ngDialog.open({template: 'successUser'});
                        }
                    });
                } else {
                    ngDialog.open({ template: 'wrongUser' });
                }
            } else {
                ngDialog.open({ template: 'wrongUser' });
            }
        };

        $scope.changePassword = function(){

            if($scope.user.name && $scope.user.newpassword) {
                $http.put('/user', $scope.user).success(function(response) {
                    refresh();
                });
            } else {
                ngDialog.open({ template: 'noPassword' });
            }
        };

        $scope.situation = function(id,situation) {
            $http.put('/data/' + id + '/situation/'+ situation).success(function(response) {
                refresh();
            });
        };

        $scope.addSale = function(id){
            $http.post('/data/sale/' + id, $scope.sale).success(function(response) {
                $scope.searchResult = response;
                $scope.sale = "";
            });
        };

        $scope.logout = function () {
            $http.get('/logout').success(function(response) { });
        };
    }])
    .controller('SaleCtrl', ['$scope','$http','$location', '$filter', 'ngTableParams', function($scope,$http,$location,$filter,ngTableParams) {

        var refresh = function() {
            $http.get('/sales/').success(function(response) {
                if(response == 'no') {
                    $location.path("/");
                } else {
                    $http.get('/calls/status/open').success(function(response) {
                        $scope.calls = response;
                        $scope.callAmount = response.length;
                    });

                    $scope.searchResult = response;
                    $scope.sale = "";

                    $scope.tableParams = new ngTableParams({
                        page: 1,            // show first page
                        count: 10,           // count per page
                        sorting: {
                            eingangsdatum: 'desc'     // initial sorting
                        }
                    }, {
                        counts: [],
                        total: response.length, // length of data
                        getData: function($defer, params) {

                            var orderedData = params.sorting() ?
                                $filter('orderBy')(response, params.orderBy()) :
                                response;

                            $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                        }
                    });

                    $scope.$watch('tableParams', function(params) {
                        $scope.sale = data.slice((params.page() - 1) * params.count(), params.page() * params.count());
                    }, true);

                }
            });
        };

        refresh();

        $scope.addSale = function(id){
            $http.post('/data/sale/' + id, $scope.sale).success(function(response) {
                $scope.search = "";
                $scope.searchResult = response;
                $scope.sale = "";
                $scope.tableParams.count(11);
                refresh();
            });
        };

        $scope.export = function(){
            $http.get('/sales/csv').success(function(response) {

                var element = angular.element('<a/>');
                element.attr({
                    href: 'data:attachment/csv;charset=utf-8,' + encodeURI(response),
                    target: '_blank',
                    download: 'sales.csv'
                })[0].click();

                refresh();

            });
        };

        $scope.check = function() {
            $http.get('/data/search/' + $scope.search).success(function(response) {
                $scope.searchResult = response;
            });
        };

        $scope.remove = function(id) {
            $http.delete('/sale/' + id).success(function(response) {
                $scope.tableParams.count(11);
                refresh();
            });
        };
        $scope.edit = function(id) {
            $http.get('/sale/' + id).success(function(response) {
                $scope.sale =  response;
            });
        };
        $scope.update = function() {
            $http.put('/sale/' + $scope.sale._id, $scope.sale).success(function(response) {
                $scope.tableParams.count(11);
                refresh();
            })
        };
        $scope.deselect = function() {
            $scope.sale = "";
        };

        $scope.removeCall = function(id) {
            $http.delete('/data/' + id).success(function(response) {
                refresh();
            });
        };

        $scope.situation = function(id,situation) {
            $http.put('/data/' + id + '/situation/'+ situation).success(function(response) {
                refresh();
            });
        };

        $scope.logout = function () {
            $http.get('/logout').success(function(response) { });
        };
    }])
    .controller('StatistikenCtrl', ['$scope','$http', function($scope,$http) {

        $http.get('/calls/status/open').success(function(response) {
            $scope.calls = response;
            $scope.callAmount = response.length;
        });

        $scope.remove = function(id) {
            $http.delete('/data/' + id).success(function(response) {
                refresh();
            });
        };

        $scope.situation = function(id,situation) {
            $http.put('/data/' + id + '/situation/'+ situation).success(function(response) {
                refresh();
            });
        };

        var refresh = function() {
            $http.get('/sales/umsatz').success(function(response) {

                // Line Graph
                // Chart.js Data
                $scope.linedataReturn = {
                    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
                    datasets: [
                        {
                            label: 'Umsatz in &euro;',
                            fillColor: 'rgba(220,220,220,0.2)',
                            strokeColor: 'rgba(220,220,220,1)',
                            pointColor: 'rgba(220,220,220,1)',
                            pointStrokeColor: '#fff',
                            pointHighlightFill: '#fff',
                            pointHighlightStroke: 'rgba(220,220,220,1)',
                            data: [response.januar,
                                    response.februar,
                                    response.maerz,
                                    response.april,
                                    response.mai,
                                    response.juni,
                                    response.juli,
                                    response.august,
                                    response.september,
                                    response.oktober,
                                    response.november,
                                    response.dezember]
                        }
                    ]
                };
            });

            $http.get('/sales/gewinn').success(function(response) {

                // Line Graph
                // Chart.js Data
                $scope.linedataProfit = {
                    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
                    datasets: [
                        {
                            label: 'Gewinn in &euro;',
                            fillColor: 'rgba(220,220,220,0.2)',
                            strokeColor: 'rgba(220,220,220,1)',
                            pointColor: 'rgba(220,220,220,1)',
                            pointStrokeColor: '#fff',
                            pointHighlightFill: '#fff',
                            pointHighlightStroke: 'rgba(220,220,220,1)',
                            data: [response.januar,
                                response.februar,
                                response.maerz,
                                response.april,
                                response.mai,
                                response.juni,
                                response.juli,
                                response.august,
                                response.september,
                                response.oktober,
                                response.november,
                                response.dezember]
                        }
                    ]
                };
            });

            $http.get('/sales/conversionrate').success(function(response) {

                // Line Graph
                // Chart.js Data
                $scope.linedataConversionRate = {
                    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
                    datasets: [
                        {
                            label: 'Conversion Rate in % (Anzahl Verk&auml;ufe / Anzahl Anfragen)',
                            fillColor: 'rgba(220,220,220,0.2)',
                            strokeColor: 'rgba(220,220,220,1)',
                            pointColor: 'rgba(220,220,220,1)',
                            pointStrokeColor: '#fff',
                            pointHighlightFill: '#fff',
                            pointHighlightStroke: 'rgba(220,220,220,1)',
                            data: [response.januar,
                                response.februar,
                                response.maerz,
                                response.april,
                                response.mai,
                                response.juni,
                                response.juli,
                                response.august,
                                response.september,
                                response.oktober,
                                response.november,
                                response.dezember]
                        }
                    ]
                };
            });

            $http.get('/applications').success(function(response) {

                // Line Graph
                // Chart.js Data
                $scope.linedataAmountApplication = {
                    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
                    datasets: [
                        {
                            label: 'Anzahl Anfragen',
                            fillColor: 'rgba(220,220,220,0.2)',
                            strokeColor: 'rgba(220,220,220,1)',
                            pointColor: 'rgba(220,220,220,1)',
                            pointStrokeColor: '#fff',
                            pointHighlightFill: '#fff',
                            pointHighlightStroke: 'rgba(220,220,220,1)',
                            data: [response.januar,
                                response.februar,
                                response.maerz,
                                response.april,
                                response.mai,
                                response.juni,
                                response.juli,
                                response.august,
                                response.september,
                                response.oktober,
                                response.november,
                                response.dezember]
                        }
                    ]
                };
            });

            $http.get('/data/status/'+ 'open').success(function(response) {

                if(response == 'no') {
                    $location.path("/");
                } else {

                    $scope.options = [
                        {   name: 'heute'   },
                        {   name: '7 T'   },
                        {   name: '30 T'   },
                        {   name: '365 T'   },
                        {   name: 'alle'   }
                    ];

                    $scope.anz_open = response.length;
                    $scope.applicationlist = response;
                    $scope.application = "";

                    $scope.tableParams = new ngTableParams({
                        page: 1,            // show first page
                        count: 10,           // count per page
                        sorting: {
                            eingangsdatum: 'asc'     // initial sorting
                        }
                    }, {
                        total: response.length, // length of data
                        getData: function($defer, params) {

                            var orderedData = params.sorting() ?
                                $filter('orderBy')(response, params.orderBy()) :
                                response;

                            $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                        }
                    });
                }
            });

            $http.get('/data/status/'+ 'follow').success(function(response) {

                if(response == 'no') {
                    $location.path("/");
                } else {
                    $scope.anz_follow = response.length;
                    $scope.application = "";


                    $scope.tableParamsAPP = new ngTableParams({
                        page: 1,            // show first page
                        count: 10,           // count per page
                        sorting: {
                            eingangsdatum: 'desc'     // initial sorting
                        }
                    }, {
                        total: response.length, // length of data
                        getData: function($defer, params) {

                            var orderedData = params.sorting() ?
                                $filter('orderBy')(response, params.orderBy()) :
                                response;

                            $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                        }
                    });

                }
            });
        };

        refresh();

        $scope.check = function() {

            $http.get('/data/search/' + $scope.search).success(function(response) {
                $scope.searchResult = response;
            });
        };

        $scope.addSale = function(id){
            $http.post('/data/sale/' + id, $scope.sale).success(function(response) {
                $scope.searchResult = response;
                $scope.sale = "";
            });
        };

        $scope.showKPI = function() {

            $http.get('/data/from/' + $scope.zeitraum).success(function(response) {
                $scope.kpi =  response;
            });

            $http.get('/sale/from/' + $scope.zeitraum).success(function(response) {
                $scope.saleKPI =  response;
            });
        };

        $scope.enterAngebot = function() {
            ngDialog.open({ template: 'enterAngebot1' });
        };

        $scope.addContact = function() {
            $http.post('/data', $scope.application).success(function(response) {
                refresh();
            });
        };
        $scope.remove = function(id) {
            $http.delete('/data/' + id).success(function(response) {
                refresh();
            });
        };
        $scope.edit = function(id) {
            $http.get('/data/' + id).success(function(response) {
                $scope.application =  response;
            });
        };
        $scope.update = function() {
            $http.put('/data/' + $scope.application._id, $scope.application).success(function(response) {
                refresh();
            })
        };
        $scope.deselect = function() {
            $scope.application = "";
        };

        $scope.situation = function(id,situation) {
            $http.put('/data/' + id + '/situation/'+ situation).success(function(response) {
                refresh();
            });
        };

        $scope.status = function(id,status) {
            $http.put('/data/' + id + '/status/'+ status).success(function(response) {
                refresh();
            });
        };

        $scope.logout = function () {
            $http.get('/logout').success(function(response) { });
        };

    }]);
