/*
 *  Cards - A really simple deck of cards
 *
 *  Instructions: make a HTML file containing
 *  - a <div id="canvas"> and styles for it
 *  - a <div id="cards"> containing the cards as individual elements
 *  - styles for the cards.
 *  - include this script
 *
 *  This will display all cards or the selected card, fitted into the
 *  #canvas. Click/touch a card to select it or to return to the
 *  selection.
 *
 *  Cards are scaled to fit the screen size by adjusting the font
 *  size. Therefore, styles for cards should be relative to the font
 *  size (=specified in em); pixel dimensions will not work. Cards
 *  will be placed within a container that has class "card-container".
 *  In addition, the container will have "card-selection" or
 *  "card-current", depending on whether all cards or just the current
 *  card are shown.
 *
 *  (c) 2017 Stefan Reuther <streu@gmx.de>
 */

window.addEventListener('load', function() {
    // Shortcut
    var floor = Math.floor;
    var delta = 5;

    // Given a DOM node, find its children.
    function findChildren(ele) {
        var result = [];
        for (var i = ele && ele.firstChild; i; i = i.nextSibling) {
            if (i.nodeType === 1) {
                result.push(i);
            }
        }
        return result;
    }

    // Given a scale factor, compute how many cards cw*ch fit onto canvas w*h
    function howManyCards(scale, w, h, cw, ch) {
        var x = floor(w / floor(cw*scale+delta));
        var y = floor(h / floor(ch*scale+delta));
        return x*y;
    }

    // Render
    function render() {
        // Find canvas size
        var n = 0;
        var canvasWidth = canvas.clientWidth, canvasHeight = canvas.clientHeight;

        // Clear canvas
        while (canvas.firstChild) {
            canvas.removeChild(canvas.firstChild);
        }

        // Render
        if (state < 0) {
            // Increase scale factor until too large
            var scale = 1;
            while (howManyCards(scale, canvasWidth, canvasHeight, cardWidth, cardHeight) >= cards.length) {
                scale *= 2;
                if (++n > 100) break; // safety net
            }

            // Reduce until in range again
            while (howManyCards(scale, canvasWidth, canvasHeight, cardWidth, cardHeight) < cards.length) {
                scale /= 2;
                if (++n > 100) break; // safety net
            }

            // Now, interpolate. 10 iterations means a precision of 0.1% (1/1024).
            var scaleHi = 2*scale;
            for (var i = 0; i < 10; ++i) {
                var scaleMid = (scale + scaleHi)/2;
                if (howManyCards(scaleMid, canvasWidth, canvasHeight, cardWidth, cardHeight) >= cards.length) {
                    scale = scaleMid;
                } else {
                    scaleHi = scaleMid;
                }
            }

            // Compute grid size
            var cw = floor(cardWidth*scale+delta), ch = floor(cardHeight*scale+delta);
            var w = floor(canvasWidth / cw), h = floor(canvasHeight / ch);

            // Make it more square, i.e. given 4 cards and 2x3 space, prefer a 2+2 layout instead of 3+1.
            while ((w-1)*h >= cards.length) {
                --w;
            }

            // Render
            var x = 0, y = 0;
            var x0 = floor((canvasWidth - cw*w) / 2), y0 = floor((canvasHeight - ch*h) / 2);
            for (i = 0; i < cards.length; ++i) {
                var ele = document.createElement('DIV');
                ele.style.position = 'absolute';
                ele.style.left = (x0 + x*cw) + 'px';
                ele.style.top = (y0 + y*ch) + 'px';
                ele.style.fontSize = (100*scale) + '%';
                ele.className = 'card-container card-selection';
                ele.appendChild(cards[i]);
                canvas.appendChild(ele);

                if (++x >= w) {
                    ++y; x = 0;
                }
            }
        } else {
            // Render single card
            scale = Math.min(canvasWidth / cardWidth, canvasHeight / cardHeight);
            cw = floor(cardWidth*scale), ch = floor(cardHeight*scale);
            x0 = floor((canvasWidth-cw) / 2), y0 = floor((canvasHeight-ch) / 2);

            ele = document.createElement('DIV');
            ele.style.position = 'absolute';
            ele.style.left = x0 + 'px';
            ele.style.top = y0 + 'px';
            ele.style.fontSize = (100*scale) + '%';
            ele.className = 'card-container card-current';
            ele.appendChild(cards[state]);
            canvas.appendChild(ele);
        }
        canvas.style.overflow = 'hidden';
    }

    function click(i) {
        if (state < 0) {
            state = i;
        } else {
            state = -1;
        }
        render();
    }

    function clicker(i) {
        return function() {
            return click(i);
        };
    }

    // Initialize
    var cardContainer = document.getElementById('cards');
    var cards = findChildren(cardContainer);
    var canvas = document.getElementById('canvas');
    var cardDimensions = [];
    var cardWidth = 1, cardHeight = 1;
    if (!canvas) {
        alert("Invoking document does not fulfill preconditions: no #canvas element");
        return;
    }
    if (!cards.length) {
        alert("Invoking document does not fulfill preconditions: no cards in #cards element");
        return;
    }

    // State: -1=selection, >=0: index into cards
    var state = -1;

    // Preprocess cards
    cardContainer.className += ' card-container';
    for (var i = 0; i < cards.length; ++i) {
        // Attach event listeners
        var ele = cards[i];
        ele.addEventListener('click', clicker(i));  /* Blackberry 9900 does not have 'bind' */

        // Find dimensions
        var w = ele.offsetWidth, h = ele.offsetHeight;
        if (w > cardWidth) {
            cardWidth = w;
        }
        if (h > cardHeight) {
            cardHeight = h;
        }
        cardDimensions.push({
            w: w,
            h: h
        });
    }

    // Remove cards from DOM.
    cardContainer.parentNode.removeChild(cardContainer);

    // Get going.
    render();

    // Redraw on resize.
    window.addEventListener('resize', render);
});
