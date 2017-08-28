import Ember from 'ember';

export default Ember.Component.extend({
	tagName:"g",
	attributeBindings:["transform"],
	onDidInsertElement:Ember.on("didInsertElement", function() {
		let previous = performance.now()
		let angle = 0, angleZoom = 0

		const fct = (timestamp) => {
			const delta = (previous - timestamp) / 1000.0
			previous = timestamp
			angle = angle + (Math.PI / 8) * delta
			angleZoom = angleZoom + (Math.PI / 4) * delta
			const zoom =1100 + Math.cos(angleZoom) * 1000
			const center = {
				x:Math.cos(angle) * zoom * 0.25,
				y:Math.sin(angle) * zoom * 0.25
			}

			this.camera.setProperties({
				x1:-zoom + center.x,
				y1:-zoom + center.y,
				x2: zoom + center.x,
				y2: zoom + center.y
			})
			window.requestAnimationFrame(fct.bind(this));
		}
		window.requestAnimationFrame(fct.bind(this));
	}),
	transformObserver:Ember.observer("camera.viewWithRatio.{x1,y1,x2,y2}", function() {
		let {x1, x2, y1, y2} = this.get("camera.viewWithRatio");
		const transform = `matrix(${2 / (x2 - x1)} 0 0 ${2 / (y2 - y1)} ${- (x2 + x1) / (x2 - x1)} ${-(y2 + y1) / (y2 - y1)})`
		this.element.setAttributeNS(null,"transform", transform)
	})

});
