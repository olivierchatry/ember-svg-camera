import Ember from 'ember'

let BoundingBox = Ember.Object.extend({
	x1: -100,
	x2: 100,
	y1: -100,
	y2: 100,
	viewHeight:1,
	viewWidth:1,
	x: Ember.computed.alias('x1'),
	y: Ember.computed.alias('y1'),
	width: Ember.computed('x1', 'x2', {
		get() {
			return this.get('x2') - this.get('x1');
		},

		set(key, value) {
			this.set('x2', this.get('x1') + value)
			return this.get('x2') - this.get('x1')
		}
	}),
	height: Ember.computed('y1', 'y2', {
		get() {
			return this.get('y2') - this.get('y1')
		},

		set(key, value) {
			this.set('y2', this.get('y1') + value)
			return this.get('y2') - this.get('y1')
		}
	}),
	viewWithRatio:Ember.computed("x1","y1","x2","y2","viewHeight","viewWidth", function() {
		const x1 = this.x1, x2 = this.x2, y1 = this.y1, y2 = this.y2
		const ratio = this.viewHeight / this.viewWidth
		const targetHeight = Math.abs(x2 - x1) * ratio

		const height 	= Math.abs(y2 - y1)
		const delta 	= (height - targetHeight) * 0.5

		const y1a = y1 + delta
		const y2a = y2 - delta

		return {
			x1, x2, y1:y1a, y2:y2a,
			viewHeight:this.viewHeight, viewWidth:this.viewWidth,
			width:x2-x1, height:y2a-y1a
		}
	}),
	center: Ember.computed('x1', 'width', 'y1', 'height', {
		get() {
			return {
				x: this.get('x1') + this.get('width') * 0.5,
				y: this.get('y1') + this.get('height') * 0.5
			}
		},
		set(key, value) {
			const w = this.get("width") * 0.5
			const h = this.get("height") * 0.5
			this.setProperties({
				x1: value.x - w,
				x2: value.x + w,
				y1: value.y - h,
				y2: value.y + h,
			})
			return value
		}
	}),
	aspectRatio: Ember.computed('width', 'height', function() {
		return this.get('width') / this.get('height')
	}),
	add(point) {
		let properties = {
			x1: Math.min(this.get('x1'), point.x),
			x2: Math.max(this.get('x2'), point.x),
			y1: Math.min(this.get('y1'), point.y),
			y2: Math.max(this.get('y2'), point.y),
		}
		this.setProperties(properties)
	},
	addPadding(left, top=left, right=left, bottom=top) {
		this.decrementProperty('x1', left)
		this.decrementProperty('y1', top)
		this.incrementProperty('x2', right)
		this.incrementProperty('y2', bottom)
		return this
	},

	scale(ratio, xPos = 0.5, yPos = 0.5) {
		const scaleValue = ratio > 0 ? ratio : 1 / Math.abs(ratio)

		const newWidth = scaleValue * this.get('width')
		const newHeight = scaleValue * this.get('height')

		if (!isNaN(newWidth) && newWidth > 0 && !isNaN(newHeight) && newHeight > 0) {
			const translateX = (newWidth - this.get('width')) * -xPos
			const translateY = (newHeight - this.get('height')) * -yPos
			this.setProperties({ width: newWidth, height: newHeight })
			if (translateX !== 0 && translateY !== 0 && !isNaN(translateX) && !isNaN(translateY)) {
				return this.translate(translateX, translateY)
			}
		}
		return this
	},

	expandToAspectRatio(newAspectRatio) {
		// debugger
		if (newAspectRatio < this.get('aspectRatio')) {
			let newHeight = this.get('width') / newAspectRatio
			this.translate(0, (this.get('height') - newHeight) / 2)
			this.set('height', newHeight)
		} else {
			let newWidth = this.get('height') * newAspectRatio
			this.translate((this.get('width') - newWidth) / 2)
			this.set('width', newWidth)
		}

		return this
	},

	translate(x=0, y=0) {
		let properties = {
			x1: this.get('x1') + x,
			x2: this.get('x2') + x,
			y1: this.get('y1') + y,
			y2: this.get('y2') + y,
		}
		this.setProperties(properties)

		return this
	},

	vectorIntersection(point, angleDeg, margin = 0) {
		let radians = angleDeg * Math.PI / 180

		let vx = Math.cos(radians)
		let vy = Math.sin(radians)

		// Find correct (smallest positive) solution for t
		let tCandidates = [
			(this.x1 - point.x) / vx,
			(this.x2 - point.x) / vx,
			(this.y1 - point.y) / vy,
			(this.y2 - point.y) / vy
		].filter(v => v > 0)

		let t = Math.min(...tCandidates)

		return {
			t,
			x: point.x + (t - margin) * vx,
			y: point.y + (t - margin) * vy
		}
	},


	extendWith({x1, x2, y1, y2}) {
		this.setProperties({
			x1: Math.min(x1, x2, this.get('x1')),
			x2: Math.max(x1, x2, this.get('x2')),
			y1: Math.min(y1, y2, this.get('y1')),
			y2: Math.max(y1, y2, this.get('y2'))
		})
		return this
	},
	copy(other) {
		this.setProperties(
			other.getProperties(
				'x1', 'x2', 'y1', 'y2'
			)
		)
	},
	clone() {
		return BoundingBox.create(
			this.getProperties('x1', 'x2', 'y1', 'y2')
		)
	}

})

export default BoundingBox
