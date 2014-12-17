//various useful JS functions

//http://stackoverflow.com/questions/7624920/number-sign-in-javascript
function sign(x) { return x ? x < 0 ? -1 : 1 : 0; }

function last(array) {return array[array.length-1];}

function dist(a,b) {
    var dx=a.x-b.x,
        dy=a.y-b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function find(arr, test, ctx) {
    // http://stackoverflow.com/questions/10457264/how-to-find-first-element-of-array-matching-a-boolean-condition-in-javascript
    var result = null;
    arr.some(function(el, i) {
        return test.call(ctx, el, i, arr) ? ((result = el), true) : false;
    });
    return result;
}
