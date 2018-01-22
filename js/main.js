(function() {

  window.App = {
    Models: {},
    Collections: {},
    Views: {}
  };

  window.template = function(id) {
    return _.template( $('#' + id).html() );  
  }

  App.Models.Names = Backbone.Model.extend({
    arr: ['John Lennon', 'Gary Moore', 'Steve Vai', 'Ronnie James Dio'],
    
    generateArrWithNames: function (array)  {
      let result = [];
          
      array.forEach(function(elem) {
        result.push({name: elem});
      })
          
      return result
    },
      
    getNames: function() {
      return this.generateArrWithNames(this.arr)
    }
  });

  App.Models.Artist = Backbone.Model.extend({});

  App.Models.General = Backbone.Model.extend({
    defaults: {
      selected: null,
      prev: null
    }
  });

  App.Collections.Artists = Backbone.Collection.extend({
    model: App.Models.Artist
  });

  App.Views.General = Backbone.View.extend({
    el: 'body',

    ui: {
      container: '#container'
    },

    initialize: function() {
      this.render();
      appModel.on("change:selected", this.listSelectionChanged);
    },

    render: function() {
      $(this.ui.container).append(artistsView.el);
    },
    
    listSelectionChanged: function(model) {
      formView.updateDeleteButtonState(model.get('selected'));
    }
  });

  App.Views.Form = Backbone.View.extend({
    el: '#form',

    ui: {
      addBtn: '#add',
      deleteBtn: '#delete',
      input: '#input'
    },

    events: {
      'click #add': 'submit',
      'click #delete': 'delete',
      'input #input': 'updateAddButtonState'
    },

    submit: function(e) {
      e.preventDefault();
      if ($(this.ui.input).val().trim()) {
        let text = $(this.ui.input).val();        
        let artist = new App.Models.Artist({ name: text });
        
        this.collection.add(artist);
        $(this.ui.input).val('');
        this.updateAddButtonState();
      }
    },

    delete: function(e) {
      e.preventDefault();

      if (confirm('Selected element will be deleted. Are you sure?')) {
        let number = $(artistView.tagName).index($("." + artistsView.style.highlightClass));
        
        $("." + artistsView.style.highlightClass).remove();
        
        this.collection.models[number].destroy();

        artistsView.selectLastChild();
      };
    },

    updateAddButtonState: function() {
      let flag = !$(this.ui.input).val().trim();

      $(this.ui.addBtn).attr('disabled', flag);
    },

    updateDeleteButtonState: function (selected) {
      $(this.ui.deleteBtn).attr('disabled', !selected);
    }
  });  

  App.Views.Artists = Backbone.View.extend({
    tagName: 'ul',

    events: {
      'click li': 'highlight'
    },

    style: {
      highlightClass: 'highlight'
    },

    initialize: function() {
      this.render();
      this.collection.on('add', this.addOne, this);
    },

    render: function() {
      this.collection.each(this.addOne, this);
      return this
    },

    highlight: function(e) {
      if (appModel.get('selected')) {
        this.setPrevious();
      }
      
      this.setSelected(e);

      if (appModel.prev && appModel.prev !== appModel.get('selected')) {
        this.clearPrevious();
      }

      if ($(appModel.get('selected')).hasClass(this.style.highlightClass)) {
        this.clearSelected();
      } else {
        $(appModel.get('selected')).addClass(this.style.highlightClass);
      }
    },
    
    addOne: function (artist) {
      let artistView = new App.Views.Artist({model: artist});

      this.$el.append(artistView.render().el);
    },

    setPrevious:() => {
      appModel.prev = appModel.get('selected');
    },

    setSelected: (e) => {
      appModel.set({selected: e.target});
    },

    clearPrevious: function () {
      $(appModel.prev).removeClass(this.style.highlightClass);
      appModel.prev = null;
    },

    clearSelected: function () {
      $(appModel.get('selected')).removeClass(this.style.highlightClass);
      appModel.set({selected: null});
      appModel.prev = null;
    },
    
    selectLastChild: function() {
      if ($(artistView.tagName).length) {
        let lastChild = document.body.children[1].firstChild.lastChild;

        appModel.set({selected: lastChild});

        $(appModel.get('selected')).addClass(artistsView.style.highlightClass);
      } else {
        artistsView.clearSelected();
      }
    }  
  });

  App.Views.Artist = Backbone.View.extend({
    tagName: 'li',

    template: template('artist-template'),

    render: function() {
      this.$el.html( this.template(this.model.toJSON()) ); 
      return this 
    }        
  });

  let appModel = new App.Models.General;
  let namesModel = new App.Models.Names;
  let artistView = new App.Views.Artist;
  let artistsCollection = new App.Collections.Artists(namesModel.getNames());
  let artistsView = new App.Views.Artists({collection: artistsCollection});
  let formView = new App.Views.Form({collection: artistsCollection});
  let appView = new App.Views.General;

  })();