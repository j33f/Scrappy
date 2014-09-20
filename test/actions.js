var actions = require('../routes/libs/actions');

var pagination = function() {
	describe ('#pagination', function(){
		it('should be present', function(){
			actions.should.have.property('pagination');
		});
		it('should be an array)', function(){
			actions.pagination.tags.should.be.an.instanceOf(Array);
		});
		it('should belong to tag <a>', function(){
			actions.pagination.should.have.property('tags',['a']);
		});
		it('should have a label (string)', function(){
			actions.pagination.should.have.property('label').with.type('string');
		});
	});	
}

var otherActions = function(currentAction, action) {
	describe('#action "' + action + '"', function(){
		it('should have a "tags" property', function(){
			currentAction.should.have.property('tags');
		});
		it('should have a "tags" property of type array', function(){
			currentAction.tags.should.be.an.instanceOf(Array);
		});
		it('should have a "tags" property with at least one string in it', function(){
			currentAction.tags[0].should.be.type('string');
		});
		it('should have a label (string)', function(){
			currentAction.should.have.property('label').with.type('string');
		});
		it('should have a "do"  method', function(){
			currentAction.should.have.property('do').with.type('function');
		});
		it('"do" callback should return an array', function(){
			currentAction.do('', 'div').should.be.type('object').with.lengthOf(0);
		});
	});
}

/*********************************************************************************/
// tests

describe('Actions', function() {
	pagination();
	describe('#Other actions', function() {
		for (var action in actions) {
			if (action != 'pagination') {	
				otherActions(actions[action], action);
			}
		}
	});
});