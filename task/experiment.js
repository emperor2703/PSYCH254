function showSlide(id) {
	$(".slide").hide();
	$("#"+id).show();
}

showSlide("instructions");

// Get random integers.
// When called with no arguments, it returns either 0 or 1. When called with one argument, *a*, it returns a number in [*0*,*a-1*]. When called with two arguments, *a* and *b*, returns a random value in [*a*,*b*].
function random(a,b) {
	if (typeof b == "undefined") {
		a = a || 2;
		return Math.floor(Math.random()*a);
	} else {
		return Math.floor(Math.random()*(b-a+1)) + a;
	}
}

// Randomly return an element from an array. Useful for condition randomization.
Array.prototype.random = function() {
  return this[random(this.length)];
}

// ## Configuration settings
var allKeyBindings = [
  {"p": "odd", "q": "even"},
  {"p": "even", "q": "odd"}
];

var allTrialOrders = [
  [1,3,2,5,4,9,8,7,6],
  [8,4,3,7,5,6,2,1,9]
];

var myKeyBindings = allKeyBindings.random(),
    myTrialOrder = allTrialOrders.random();
    
// Fill in the instructions template. In particular,
// let the subject know which keys correspond to even/odd.
var pOdd = (myKeyBindings["p"] == "odd");
$("#odd-key").html(pOdd ? "P" : "Q");
$("#even-key").html(pOdd ? "Q" : "P");


// ## The main event
var experiment = {
  trials: myTrialOrder,
  completed: [],
  keyBindings: myKeyBindings,
  data: [],

  vignette: function(){
  showSlide("immoral");
  },

  survey: function(){
  showSlide("survey");
  },


  // The function that gets called when the stream is finished
 submit: function() {
    showSlide("finished");
    // wait 1.5 seconds and then submit to Mechanical Turk
    turk.submit(experiment);
  },

  next: function() {
    // Get the current trial - <code>shift()</code> removes the first element of the array and returns it.
    


    var n = experiment.trials.shift();
    // If the current trial is undefined, it means the trials array was empty, which means that we're done, so call the end function.
    if (typeof n == "undefined") {
      return experiment.end();
    }
    
    experiment.completed.push(n);
    
    // Compute the correct answer. I'm using the so-called **ternary operator**, which is a shorthand for <code>if (...) { ... } else { ... }</code>
    var realParity = (n % 2 == 0) ? "even" : "odd";
    
    showSlide("stage");
    // Display the number stimulus.
    $("#vignette");
    
    // Get the current time so we can compute reaction time later.
    var startTime = (new Date()).getTime();
    
    // Use something like [Keymaster][keymaster], or [zen][zen] (my library, and a work in progress) but for present purposes we'll use jQuery and type out the keyCodes.
    // [keymaster]: http://github.com/madrobby/keymaster
    // [zen]: http://github.com/longouyang/zenjs
    $(document).keydown(function(event) {
      var keyCode = event.which;
      if (keyCode == 81 || keyCode == 80 ) {
        // TODO: This is important
        $(document).unbind("keydown");
        
        var endTime = (new Date()).getTime();
            key = (keyCode == 80) ? "p" : "q",
            userParity = experiment.keyBindings[key];
            
        var data = {
          stimulus: n,
          accuracy: realParity == userParity ? 1 : 0,
          rt: endTime - startTime
        };
        
        experiment.data.push(data);
        // Temporarily clear the number
        $("#number").html("");
        // Wait 500 milliseconds before starting the next trial
        setTimeout(experiment.next, 500);
      }
    });
  }
}
//Second try