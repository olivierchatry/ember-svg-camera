import Ember from 'ember';

export default Ember.Mixin.create({
	_onInsertElementResizeEventMixin: Ember.on("didInsertElement", function() {
    this._resizeHandler = () => {
			this.trigger("resize", this.$().innerWidth(), this.$().innerHeight())
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
