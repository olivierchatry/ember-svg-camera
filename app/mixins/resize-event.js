import Ember from 'ember';

export default Ember.Mixin.create({
	_onInsertElementResizeEventMixin: Ember.on("didInsertElement", function() {
    this._resizeHandler = (width, height) => {
			this.setProperties({
				width:this.$().innerWidth(),
				height:this.$().innerHeight()
			});
    }
    Ember.$(window).on('resize', this._resizeHandler);
		this._resizeHandler();
		this._super(...arguments);
  }),
  _onWillDestroyElementResizeEventMixin: Ember.on("willDestroyElement", function() {
		Ember.$(window).off('resize', this._resizeHandler);
		this._super(...arguments);
  }),
});
