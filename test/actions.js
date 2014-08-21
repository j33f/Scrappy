var actions = require('../routes/libs/actions');

describe('Actions', function() {
	describe ('#pagination', function(){
		it('should be present', function(){
			actions.should.have.property('pagination');
		});
		it('should belong to tag <a>', function(){
			actions.pagination.should.have.property('tags',['a']);
		});
		it('should have a label (string)', function(){
			actions.pagination.should.have.property('label').with.type('string');
		});
	});
	for (var action in actions) {
		describe('#action "' + action + '"', function(){
			it('should belong to some tags (array of strings)', function(){
				actions[action].should.have.property('tags');
				actions[action].tags[0].should.be.type('string');
			});
			it('should have a label (string)', function(){
				actions[action].should.have.property('label').with.type('string');
			});
			it('should have a "do"  method', function(){
				actions[action].should.have.property('do').with.type('function');
			});
			describe('#do callback', function(){
				it('should return an array', function(){
					actions[action].do('', 'div').should.be.type('object').with.lengthOf(0);
				});
			});
		});
	}
});