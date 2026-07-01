function dec(value, context) { console.log('decorator', context.kind, context.name); context.addInitializer(function(){ console.log('initializer', this.constructor.name); }); }
class A { @dec x = 1 }
new A();
