import Ember from 'ember';

export default Ember.Component.extend({
	tagName:"g",
	attributeBindings:["transform"],
	onInit:Ember.on("init", function() {
		this.set("view", {
			x1:-100, y1:-100, x2:100, y2: 100
		})

		let previous = performance.now()
		let angle = 0, angleZoom = 0

		const fct = (timestamp) => {
			const delta = (previous - timestamp) / 1000.0
			previous = timestamp
			angle = angle + (Math.PI / 2) * delta
			angleZoom = angleZoom + (Math.PI / 4) * delta
			const zoom = 200;1100 + Math.cos(angleZoom) * 1000
			const center = {
				x:Math.cos(angle) * zoom * 0.25 + 1000,
				y:Math.sin(angle) * zoom * 0.25 + 1000
			}

			this.set("view", {
				x1:-zoom + center.x,
				y1:-zoom + center.y,
				x2: zoom + center.x,
				y2: zoom + center.y
			})
			window.requestAnimationFrame(fct.bind(this));
		}
		window.requestAnimationFrame(fct.bind(this));
	}),
	viewWithRatio:Ember.computed("view.{x1,y1,x2,y2}", "viewWidth", "viewHeight", function() {
		const {x1, x2, y1, y2} = this.view
		const ratio = this.viewHeight / this.viewWidth
		const targetHeight = Math.abs(x2 - x1) * ratio

		const height 	= Math.abs(y2 - y1)
		const delta 	= (height - targetHeight) * 0.5

		const y1a = y1 + delta
		const y2a = y2 - delta

		return {
			x1, x2, y1:y1a, y2:y2a
		}
	}),
	transform:Ember.computed("viewWithRatio.{x1,y1,x2,y2}", function() {
		const {x1, x2, y1, y2} = this.get("viewWithRatio")
		return `matrix(${2 / (x2 - x1)} 0 0 ${2 / (y2 - y1)} ${- (x2 + x1) / (x2 - x1)} ${- (y2 + y1) / (y2 - y1)})`
	})

});
