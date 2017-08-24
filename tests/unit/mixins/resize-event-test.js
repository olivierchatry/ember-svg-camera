import Ember from 'ember';
import ResizeEventMixin from 'ember-svg-camera/mixins/resize-event';
import { module, test } from 'qunit';

module('Unit | Mixin | resize event');

// Replace this with your real tests.
test('it works', function(assert) {
  let ResizeEventObject = Ember.Object.extend(ResizeEventMixin);
  let subject = ResizeEventObject.create();
  assert.ok(subject);
});
