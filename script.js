var app = angular.module('app', []);

app.controller(
    'AppCtrl', 
    [ 
    '$scope', 
    '$http',
    '$interval',  
    'magnitudeAsRGB', 
    'historicalService',
    function ($scope, $http, $interval, magnitudeAsRGB, historicalService) {
    
    var urlBase = 'https://crossorigin.me/http://finance.yahoo.com/d/quotes.csv?';

    $scope.symbol = 'AAPL';

    $scope.format = ['c1']
    //$scope.format = "ac1c"; //ask, bid, open

    $scope.rqURL = urlBase + "s=" + $scope.symbol + "&f=" + $scope.format;

    $scope.symbolArr = $scope.symbol.split(',')
    
    $scope.fetchStock = function(){
        $http.get($scope.rqURL).success(function(response){
                $scope.indexResult = response.split("\n");
            }).error(function(err){ console.log(err)})
    }
    $scope.fetchStock()
    //live update, refresh data every 1 second

    //pass function from service
    $scope.RGB = magnitudeAsRGB.calculateColor
    //turn off when markets closed
    $interval($scope.fetchStock,1000 )
  
    var ctx = $("#trends")
    var data = { 
            labels : [ "12:00","1:00","2:00","3:00" ],
            datasets : [ 
                { 
                    label: "company",
                    fill: false,
                    lineTension: 0.1,
                    backgroundColor: "rgba(75,192,192,0.4)",
                    borderColor: "rgba(75,192,192,1)",
                    borderCapStyle: 'butt',
                    borderDash: [],
                    borderDashOffset: 0.0,
                    borderJoinStyle: 'miter',
                    pointBorderColor: "rgba(75,192,192,1)",
                    pointBackgroundColor: "#fff",
                    pointBorderWidth: 1,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: "rgba(75,192,192,1)",
                    pointHoverBorderColor: "rgba(220,220,220,1)",
                    pointHoverBorderWidth: 2,
                    pointRadius: 1,
                    pointHitRadius: 10,
                    data: [6, 3, -2, 0 ],
                    spanGaps: false,
                      //  {  },
                      // {  },
                }
            ] 
        }
    var options = { showLines: true }
    var myLineChart  = new Chart(ctx, {
        type: 'line',
        data: data,
        options: options
    })
    
    //$scope.symbol = "GOOG";
    $scope.items = [];
    $scope.startDate = '2012-12-05';
    $scope.endDate = '2012-12-06';

    $scope.getData = function() {
        $scope.items = [];

        var promise = historicalService.getHistoricalData($scope.symbol, $scope.startDate, $scope.endDate);

        promise.then(function(data) {
            $scope.items = data;
        });
    };
    $scope.getData();
}])

app.service("magnitudeAsRGB", [ function() {
     return {
        calculateColor: function(item) {
            //todo check type
            change = Math.round(parseFloat(item) + 1) * 35
            var rgbString
            if (item > 0) {
                var green = Math.max(Math.min(change, 255), 0)
                return'rgb(225,'+green+',225)'
            } else {
                var red = Math.max(Math.min(change, 255), 0)
                return 'rgb('+red+',225,225)'
            }
        }
    }
}])

app.factory('historicalService', function($q, $http) {

    return {
        getHistoricalData: function(symbol, start, end) {
            var deferred = $q.defer();
            var format = '&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=JSON_CALLBACK';
            var query = 'select * from yahoo.finance.historicaldata where symbol = "' + symbol + '" and startDate = "' + start + '" and endDate = "' + end + '"';
            var url = 'http://query.yahooapis.com/v1/public/yql?q=' + encodeURIComponent(query) + format;

            $http.jsonp(url).success(function(json) {
                var quotes = json.query.results.quote;
                // filter + format quotes here if you want
                deferred.resolve(quotes);
            });
            return deferred.promise;
        }
    };
});