
var d3 = require('d3');
var topojson = require('topojson');
var React = require('react');
var console = require("console-browserify");
var Promise = require("bluebird");

var RefugeeCountsModel = require('../model/refugee-counts-model.js');
var MapModel = require('../model/map-model.js');

var assets = require('lucify-commons/src/js/lucify-assets.js');

Promise.promisifyAll(d3);

// Bind refugee and map data to given map component
//
// This is a React higher-order component as described here:
//   http://jamesknelson.com/structuring-react-applications-higher-order-components/
//   http://stackoverflow.com/questions/30845561/how-to-solve-this-using-composition-instead-of-mixins-in-react


var bindToRefugeeMapContext = function(Component) {

   return React.createClass({


      getInitialState: function() {
         return {
            loaded: false,
            loadProgress: null,
            mapModel: null,
            refugeeCountsModel: null
         };
      },


      componentDidMount: function() {

         console.time("load json");

         var promises = [];

         promises.push(d3.jsonAsync(assets.data('topomap.json')).then(function(data) {
            this.topomap = data;
         }.bind(this)));

         promises.push(d3.jsonAsync(assets.data('asylum.json')).then(function(data) {
            this.asylumData = data;
         }.bind(this)));

         promises.push(d3.jsonAsync(assets.data('country-figures.json')).then(function(data) {
            this.countryFigures = data;
         }.bind(this)));

         Promise.all(promises).then(function() {
            console.timeEnd('load json');
            this.dataLoaded();
         }.bind(this), function(error){
            throw error;
         });
      },


      progress: function(percent) {
         this.setState({loadProgress: percent});
      },


      initFeatures: function() {
         this.features = topojson.feature(this.topomap, this.topomap.objects.map);
         this.progress(10);
         window.setTimeout(this.initMapModel, 15);
      },


      initMapModel: function() {
         console.time("init map model");
         this.mapModel = new MapModel(this.features);
         this.progress(40);
         console.timeEnd("init map model");
         window.setTimeout(this.initModels, 15);
      },


      initModels: function() {
         this.refugeeCountsModel = new RefugeeCountsModel(this.asylumData);
         this.progress(95);
         window.setTimeout(this.finishLoading, 15);
      },


      finishLoading: function() {
         this.setState({
            asylumData: this.asylumData,
            mapModel: this.mapModel,
            refugeeCountsModel: this.refugeeCountsModel,
            countryFigures: this.countryFigures,
            loaded: true,
            loadProgress: 100
         });
      },


      dataLoaded: function() {
         // This will trigger also the other inits
         //
         // We need to use setTimeout to allow for the
         // UI to update between parts of the loading
         // progress.
         //
         // For optimal results we would have to allow
         // this also during individual steps in createPointList,
         // which is taking most of the load time.
         //
         this.initFeatures();
      },


      render: function() {
         return (
           <Component
            {...this.state}
            {...this.props} />
        );
      }


   });

};


module.exports = bindToRefugeeMapContext;
